import { delhiNetwork } from "@/data/delhi/network";

export type JourneyAnswers = {
  originId: string;
  destinationId: string;
  days: number;
  time: "early" | "peak" | "off-peak" | "late";
  payment: "card" | "token";
  stance: "door" | "middle" | "seat";
  activity: "music" | "reels" | "sleep" | "watching";
  runsForDoors: boolean;
};

export type RouteLeg = {
  fromStationId: string;
  toStationId: string;
  lineId: string;
  distanceKm: number;
  typicalMinutes: number;
};

export type RouteResult = {
  legs: RouteLeg[];
  distanceKm: number;
  estimatedMinutes: number;
  stops: number;
  interchanges: number;
  lineIds: string[];
  favoriteLineId: string;
};

export type Archetype = {
  id: string;
  name: string;
  description: string;
};

export type WrappedResult = {
  route: RouteResult;
  archetype: Archetype;
  annualTrips: number;
  annualDistanceKm: number;
  annualSpend: number;
  annualHours: number;
  farePerRide: number;
};

const segmentsByStation = new Map<string, RouteLeg[]>();
for (const segment of delhiNetwork.segments) {
  const forward: RouteLeg = {
    fromStationId: segment.fromStationId,
    toStationId: segment.toStationId,
    lineId: segment.lineId,
    distanceKm: segment.distanceKm,
    typicalMinutes: segment.typicalMinutes ?? 2,
  };
  const reverse = { ...forward, fromStationId: forward.toStationId, toStationId: forward.fromStationId };
  segmentsByStation.set(forward.fromStationId, [...(segmentsByStation.get(forward.fromStationId) ?? []), forward]);
  segmentsByStation.set(reverse.fromStationId, [...(segmentsByStation.get(reverse.fromStationId) ?? []), reverse]);
}

export function findRoute(originId: string, destinationId: string): RouteResult | null {
  if (!originId || !destinationId || originId === destinationId) return null;

  type QueueItem = { stationId: string; lineId: string | null; cost: number };
  const queue: QueueItem[] = [{ stationId: originId, lineId: null, cost: 0 }];
  const distance = new Map<string, number>([[`${originId}|`, 0]]);
  const previous = new Map<string, { stateKey: string; leg: RouteLeg }>();
  let destinationState: string | null = null;

  while (queue.length) {
    queue.sort((first, second) => first.cost - second.cost);
    const current = queue.shift();
    if (!current) break;
    const currentKey = `${current.stationId}|${current.lineId ?? ""}`;
    if (current.cost !== distance.get(currentKey)) continue;

    if (current.stationId === destinationId) {
      destinationState = currentKey;
      break;
    }

    for (const leg of segmentsByStation.get(current.stationId) ?? []) {
      const isTransfer = current.lineId !== null && current.lineId !== leg.lineId;
      const nextCost = current.cost + leg.typicalMinutes + (isTransfer ? 4.5 : 0);
      const nextKey = `${leg.toStationId}|${leg.lineId}`;
      if (nextCost >= (distance.get(nextKey) ?? Number.POSITIVE_INFINITY)) continue;
      distance.set(nextKey, nextCost);
      previous.set(nextKey, { stateKey: currentKey, leg });
      queue.push({ stationId: leg.toStationId, lineId: leg.lineId, cost: nextCost });
    }
  }

  if (!destinationState) return null;

  const legs: RouteLeg[] = [];
  let stateKey = destinationState;
  while (previous.has(stateKey)) {
    const entry = previous.get(stateKey);
    if (!entry) break;
    legs.unshift(entry.leg);
    stateKey = entry.stateKey;
  }

  const lineDistance = new Map<string, number>();
  const lineIds: string[] = [];
  let interchanges = 0;
  let previousLine: string | null = null;
  for (const leg of legs) {
    lineDistance.set(leg.lineId, (lineDistance.get(leg.lineId) ?? 0) + leg.distanceKm);
    if (!lineIds.includes(leg.lineId)) lineIds.push(leg.lineId);
    if (previousLine && previousLine !== leg.lineId) interchanges += 1;
    previousLine = leg.lineId;
  }

  const favoriteLineId = [...lineDistance.entries()].sort((first, second) => second[1] - first[1])[0]?.[0] ?? "blue";
  const rideMinutes = legs.reduce((total, leg) => total + leg.typicalMinutes, 0) + interchanges * 4.5;

  return {
    legs,
    distanceKm: round(legs.reduce((total, leg) => total + leg.distanceKm, 0), 1),
    estimatedMinutes: Math.round(rideMinutes),
    stops: legs.length,
    interchanges,
    lineIds,
    favoriteLineId,
  };
}

export function createWrappedResult(answers: JourneyAnswers): WrappedResult | null {
  const route = findRoute(answers.originId, answers.destinationId);
  if (!route) return null;

  const farePerRide = calculateFare(route.distanceKm, answers.payment, answers.time);
  const annualTrips = answers.days * 48 * 2;
  const annualDistanceKm = Math.round(route.distanceKm * annualTrips);
  const annualSpend = Math.round(farePerRide * annualTrips);
  const annualHours = Math.round((route.estimatedMinutes * annualTrips) / 60);

  return {
    route,
    archetype: chooseArchetype(answers, route),
    annualTrips,
    annualDistanceKm,
    annualSpend,
    annualHours,
    farePerRide,
  };
}

function calculateFare(
  distanceKm: number,
  payment: JourneyAnswers["payment"],
  time: JourneyAnswers["time"],
) {
  const slab = delhiNetwork.fare.weekdaySlabs.find(
    (candidate) => candidate.upperBoundKm === null || distanceKm <= candidate.upperBoundKm,
  );
  const tokenFare = slab?.tokenFare ?? 64;
  if (payment === "token") return tokenFare;
  const isOffPeak = time === "early" || time === "off-peak" || time === "late";
  const discount =
    delhiNetwork.fare.smartCardBaseDiscount +
    (isOffPeak ? delhiNetwork.fare.smartCardOffPeakExtraDiscount : 0);
  return Math.round(tokenFare * (1 - discount));
}

function chooseArchetype(answers: JourneyAnswers, route: RouteResult): Archetype {
  const candidates: Array<Archetype & { score: number }> = [
    {
      id: "marathoner",
      name: "The Long-Haul Local",
      description: "Your commute crosses enough Delhi to need an interval. Same route, serious stamina.",
      score: route.distanceKm >= 30 ? 12 : route.distanceKm >= 22 ? 5 : 0,
    },
    {
      id: "interchange-warrior",
      name: "The Interchange Strategist",
      description: "You know which staircase, which door and which side before the announcement starts.",
      score: route.interchanges >= 2 ? 11 : route.interchanges === 1 ? 4 : 0,
    },
    {
      id: "last-train-legend",
      name: "The Last-Train Optimist",
      description: "You hear the closing-door beep as a challenge, not information.",
      score: answers.time === "late" ? 9 : 0,
    },
    {
      id: "short-hop-specialist",
      name: "The Two-Stop Technician",
      description: "In, out, perfectly positioned. You use the Metro like a precision instrument.",
      score: route.distanceKm < 5 ? 9 : 0,
    },
    {
      id: "door-side-dweller",
      name: "The Door-Side Diplomat",
      description: "Prime standing real estate, quick exits and just enough room to pretend you are not blocking anyone.",
      score: answers.stance === "door" ? 7 : 0,
    },
    {
      id: "seat-hunter",
      name: "The Seat-Scan Specialist",
      description: "One glance down the coach and you already know who is getting off next.",
      score: answers.stance === "seat" ? 8 : 0,
    },
    {
      id: "earphone-monk",
      name: answers.activity === "sleep" ? "The Moving Meditation" : "The Earphone Bubble",
      description:
        answers.activity === "sleep"
          ? "Crowded coach, bright lights, platform announcements. Somehow, you are still asleep."
          : "The city changes lines around you. Your playlist never breaks character.",
      score: ["music", "reels", "sleep"].includes(answers.activity) ? (answers.activity === "sleep" ? 8 : 6) : 0,
    },
    {
      id: "door-runner",
      name: "The Beep Beater",
      description: "You saw the doors closing and made a decision. Please make a safer one next time.",
      score: answers.runsForDoors ? 8 : 0,
    },
    {
      id: "people-watcher",
      name: "The Coach Chronicler",
      description: "No headphones required. One metro coach gives you a full season of Delhi stories.",
      score: answers.activity === "watching" ? 7 : 0,
    },
  ];

  const winner = candidates.sort((first, second) => second.score - first.score)[0];
  const { score: _score, ...archetype } = winner;
  return archetype;
}

function round(value: number, digits: number) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
