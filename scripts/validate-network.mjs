import { readFile } from "node:fs/promises";

const source = new URL("../src/data/delhi/network.generated.json", import.meta.url);
const network = JSON.parse(await readFile(source, "utf8"));
const errors = [];
const stationIds = new Set(network.stations.map((station) => station.id));
const lineIds = new Set(network.lines.map((line) => line.id));

if (stationIds.size !== network.stations.length) errors.push("Station IDs are not unique.");
if (lineIds.size !== network.lines.length) errors.push("Line IDs are not unique.");

for (const station of network.stations) {
  if (!station.name?.trim()) errors.push(`Station ${station.id} has no display name.`);
}

for (const segment of network.segments) {
  if (!stationIds.has(segment.fromStationId) || !stationIds.has(segment.toStationId)) {
    errors.push(`Segment ${segment.fromStationId} -> ${segment.toStationId} references an unknown station.`);
  }
  if (!lineIds.has(segment.lineId)) errors.push(`Segment references unknown line ${segment.lineId}.`);
  if (!(segment.distanceKm > 0) || !(segment.typicalMinutes > 0)) {
    errors.push(`Segment ${segment.fromStationId} -> ${segment.toStationId} has invalid travel data.`);
  }
}

const adjacency = new Map(network.stations.map((station) => [station.id, []]));
for (const segment of network.segments) {
  adjacency.get(segment.fromStationId)?.push(segment.toStationId);
  adjacency.get(segment.toStationId)?.push(segment.fromStationId);
}

const firstStation = network.stations[0]?.id;
const visited = new Set(firstStation ? [firstStation] : []);
const queue = firstStation ? [firstStation] : [];
while (queue.length) {
  const stationId = queue.shift();
  for (const neighbor of adjacency.get(stationId) ?? []) {
    if (visited.has(neighbor)) continue;
    visited.add(neighbor);
    queue.push(neighbor);
  }
}
if (visited.size !== network.stations.length) {
  const missing = network.stations.filter((station) => !visited.has(station.id)).map((station) => station.name);
  errors.push(`Network is disconnected: ${missing.join(", ")}.`);
}

for (const line of network.lines) {
  for (const branch of line.branches) {
    for (let index = 0; index < branch.length - 1; index += 1) {
      const from = branch[index];
      const to = branch[index + 1];
      const exists = network.segments.some(
        (segment) =>
          segment.lineId === line.id &&
          ((segment.fromStationId === from && segment.toStationId === to) ||
            (segment.fromStationId === to && segment.toStationId === from)),
      );
      if (!exists) errors.push(`${line.name} is missing ${from} -> ${to}.`);
    }
  }
}

const excludedNames = ["airport", "aqua", "rapid metro"];
for (const line of network.lines) {
  if (excludedNames.some((name) => line.name.toLowerCase().includes(name))) {
    errors.push(`Excluded service found: ${line.name}.`);
  }
}

const requiredCurrentStations = [
  "krishna_park_extension",
  "burari",
  "maujpur_babarpur",
  "deepali_chowk",
];
for (const stationId of requiredCurrentStations) {
  if (!stationIds.has(stationId)) errors.push(`Current-network station missing: ${stationId}.`);
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exitCode = 1;
} else {
  console.log(
    `Validated ${network.stations.length} stations, ${network.lines.length} lines and ${network.segments.length} segments.`,
  );
}
