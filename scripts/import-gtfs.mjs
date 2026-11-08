import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const sourceDir = process.argv[2];
const outputFile = process.argv[3] ?? "src/data/delhi/network.generated.json";

if (!sourceDir) {
  throw new Error("Usage: node scripts/import-gtfs.mjs <gtfs-directory> [output-file]");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += character;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  const [headers, ...data] = rows;
  return data.map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])));
}

function slug(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

const renames = new Map([
  ["Huda City Centre", "Millennium City Centre Gurugram"],
  ["Mansrover park", "Mansarovar Park"],
  ["Janak Puri West", "Janakpuri West"],
  ["Dwarka Sector - 21", "Dwarka Sector 21"],
  ["Netaji Subash Place", "Netaji Subhash Place"],
  ["Brigadier Hoshiyar Singh", "Brigadier Hoshiar Singh"],
  ["R K Ashram Marg", "RK Ashram Marg"],
]);

const lineDefinitions = [
  { id: "red", name: "Red Line", color: "#d42b36", textColor: "#ffffff", routeIds: ["Delhi1"] },
  { id: "yellow", name: "Yellow Line", color: "#f0b323", textColor: "#161616", routeIds: ["Delhi2"] },
  { id: "blue", name: "Blue Line", color: "#1769aa", textColor: "#ffffff", routeIds: ["Delhi3", "Delhi4"] },
  { id: "green", name: "Green Line", color: "#16845b", textColor: "#ffffff", routeIds: ["Delhi5"] },
  { id: "violet", name: "Violet Line", color: "#6d3a8a", textColor: "#ffffff", routeIds: ["Delhi6"] },
  { id: "pink", name: "Pink Line", color: "#df6f9f", textColor: "#161616", routeIds: ["Delhi7"] },
  { id: "magenta", name: "Magenta Line", color: "#a82372", textColor: "#ffffff", routeIds: ["Delhi8"] },
  { id: "grey", name: "Grey Line", color: "#6f7475", textColor: "#ffffff", routeIds: ["Delhi9"] },
];

const manualStations = [
  "Krishna Park Extension",
  "Burari",
  "Jharoda Majra",
  "Jagatpur-Wazirabad",
  "Soorghat",
  "Nanaksar-Sonia Vihar",
  "Khajuri Khas",
  "Bhajanpura",
  "Yamuna Vihar",
  "Bhalswa",
  "Haiderpur Village",
  "Uttari Pitampura-Prashant Vihar",
  "Madhuban Chowk",
  "Deepali Chowk",
];

const files = await Promise.all(
  ["stops.txt", "trips.txt", "stop_times.txt"].map((file) => readFile(resolve(sourceDir, file), "utf8")),
);
const [stopsRows, tripsRows, stopTimesRows] = files.map(parseCsv);

const stopByGtfsId = new Map(stopsRows.map((stop) => [stop.stop_id, stop]));
const allowedRoutes = new Set(lineDefinitions.flatMap((line) => line.routeIds));
const routeByTrip = new Map(
  tripsRows.filter((trip) => allowedRoutes.has(trip.route_id)).map((trip) => [trip.trip_id, trip.route_id]),
);

const stopsByTrip = new Map();
for (const stopTime of stopTimesRows) {
  if (!routeByTrip.has(stopTime.trip_id)) continue;
  const values = stopsByTrip.get(stopTime.trip_id) ?? [];
  values.push({ stopId: stopTime.stop_id, sequence: Number(stopTime.stop_sequence) });
  stopsByTrip.set(stopTime.trip_id, values);
}

const sequencesByRoute = new Map();
for (const [tripId, stops] of stopsByTrip) {
  const routeId = routeByTrip.get(tripId);
  const sequence = stops.sort((a, b) => a.sequence - b.sequence).map((entry) => entry.stopId);
  const reverse = [...sequence].reverse();
  const canonical = sequence.join("|") < reverse.join("|") ? sequence : reverse;
  const routeSequences = sequencesByRoute.get(routeId) ?? new Map();
  routeSequences.set(canonical.join("|"), canonical);
  sequencesByRoute.set(routeId, routeSequences);
}

function isContiguousSubsequence(candidate, full) {
  if (candidate.length >= full.length) return false;
  const joinedCandidate = candidate.join("|");
  return full.join("|").includes(joinedCandidate) || [...full].reverse().join("|").includes(joinedCandidate);
}

const stationMap = new Map();

function canonicalName(name) {
  return renames.get(name) ?? name;
}

function ensureStation(name, sourceStop = null) {
  const finalName = canonicalName(name);
  const id = slug(finalName);
  if (!stationMap.has(id)) {
    stationMap.set(id, {
      id,
      name: finalName,
      aliases: finalName === name ? [] : [name],
      latitude: sourceStop ? Number(sourceStop.stop_lat) : null,
      longitude: sourceStop ? Number(sourceStop.stop_lon) : null,
      operator: "dmrc",
      status: "operational",
    });
  }
  return id;
}

for (const name of manualStations) ensureStation(name);

const lines = lineDefinitions.map((definition) => {
  const branches = [];

  for (const routeId of definition.routeIds) {
    const uniqueSequences = [...(sequencesByRoute.get(routeId)?.values() ?? [])];
    const maximalSequences = uniqueSequences.filter(
      (candidate) => !uniqueSequences.some((other) => isContiguousSubsequence(candidate, other)),
    );

    for (const sequence of maximalSequences) {
      branches.push(
        sequence.map((stopId) => {
          const stop = stopByGtfsId.get(stopId);
          return ensureStation(stop.stop_name, stop);
        }),
      );
    }
  }

  return {
    id: definition.id,
    name: definition.name,
    color: definition.color,
    textColor: definition.textColor,
    operator: "dmrc",
    branches,
  };
});

const lineById = new Map(lines.map((line) => [line.id, line]));

function orientBranch(branch, expectedStart) {
  return branch[0] === expectedStart ? branch : [...branch].reverse();
}

const magenta = lineById.get("magenta");
magenta.branches[0] = [slug("Krishna Park Extension"), ...orientBranch(magenta.branches[0], slug("Janakpuri West"))];
magenta.branches.push([
  "majlis_park",
  "bhalswa",
  "haiderpur_badli_mor",
  "haiderpur_village",
  "uttari_pitampura_prashant_vihar",
  "madhuban_chowk",
  "deepali_chowk",
]);

const pink = lineById.get("pink");
pink.branches.push([
  "majlis_park",
  "burari",
  "jharoda_majra",
  "jagatpur_wazirabad",
  "soorghat",
  "nanaksar_sonia_vihar",
  "khajuri_khas",
  "bhajanpura",
  "yamuna_vihar",
  "maujpur_babarpur",
]);

function haversineKm(first, second) {
  if (first.latitude == null || second.latitude == null) return null;
  const radians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const latitudeDelta = radians(second.latitude - first.latitude);
  const longitudeDelta = radians(second.longitude - first.longitude);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(radians(first.latitude)) *
      Math.cos(radians(second.latitude)) *
      Math.sin(longitudeDelta / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const manualBranchLengths = new Map([
  ["pink:majlis_park:maujpur_babarpur", 12.318],
  ["magenta:majlis_park:deepali_chowk", 9.92],
  ["magenta:krishna_park_extension:janakpuri_west", 1.81],
]);

const segmentMap = new Map();
for (const line of lines) {
  for (const branch of line.branches) {
    const branchKey = `${line.id}:${branch[0]}:${branch.at(-1)}`;
    const reverseKey = `${line.id}:${branch.at(-1)}:${branch[0]}`;
    const manualLength = manualBranchLengths.get(branchKey) ?? manualBranchLengths.get(reverseKey);

    for (let index = 0; index < branch.length - 1; index += 1) {
      const fromStationId = branch[index];
      const toStationId = branch[index + 1];
      const segmentKey = `${line.id}:${[fromStationId, toStationId].sort().join(":")}`;
      if (segmentMap.has(segmentKey)) continue;

      const straightDistance = haversineKm(stationMap.get(fromStationId), stationMap.get(toStationId));
      const usableCoordinateDistance = straightDistance != null && straightDistance >= 0.2;
      const distanceKm = manualLength
        ? manualLength / (branch.length - 1)
        : !usableCoordinateDistance
          ? 1.2
          : straightDistance * 1.12;

      segmentMap.set(segmentKey, {
        fromStationId,
        toStationId,
        lineId: line.id,
        distanceKm: Number(distanceKm.toFixed(3)),
        typicalMinutes: Number(Math.max(1.7, 0.75 + distanceKm * 1.55).toFixed(1)),
        bidirectional: true,
        source: manualLength
          ? "official-corridor-estimate"
          : usableCoordinateDistance
            ? "gtfs-coordinate-estimate"
            : "network-average-fallback",
        confidence: usableCoordinateDistance || manualLength ? "medium" : "low",
      });
    }
  }
}

const dataset = {
  city: "delhi",
  verifiedOn: "2026-11-08",
  dataVersion: 1,
  stations: [...stationMap.values()].sort((a, b) => a.name.localeCompare(b.name)),
  lines,
  segments: [...segmentMap.values()],
  fare: {
    verifiedOn: "2026-11-08",
    weekdaySlabs: [
      { upperBoundKm: 2, tokenFare: 11 },
      { upperBoundKm: 5, tokenFare: 21 },
      { upperBoundKm: 12, tokenFare: 32 },
      { upperBoundKm: 21, tokenFare: 43 },
      { upperBoundKm: 32, tokenFare: 54 },
      { upperBoundKm: null, tokenFare: 64 },
    ],
    smartCardBaseDiscount: 0.1,
    smartCardOffPeakExtraDiscount: 0.1,
  },
  provenance: {
    topology: "Delhi Open Transit Data DMRC GTFS via public mirror, supplemented with DMRC 2026 operational openings",
    sourceFeedDate: "2025-11-19",
    officialAuditDate: "2026-11-07",
    distanceMethod: "Haversine station distance × 1.12; official corridor length divided across new extension segments",
    caveat: "Distance, time and fare outputs are estimates. 2026 extension topology requires final audit against the gated official GTFS download.",
  },
};

await writeFile(resolve(outputFile), `${JSON.stringify(dataset, null, 2)}\n`);
console.log(`Wrote ${dataset.stations.length} stations, ${dataset.lines.length} lines and ${dataset.segments.length} segments to ${outputFile}`);
