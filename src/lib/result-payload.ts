import type { WrappedResult } from "./metro/engine";

export type SharedResult = {
  v: 1;
  archetype: WrappedResult["archetype"];
  favoriteLineId: string;
  lineIds: string[];
  annualTrips: number;
  annualDistanceKm: number;
  annualSpend: number;
  annualHours: number;
  oneWayDistanceKm: number;
  oneWayMinutes: number;
  stops: number;
  interchanges: number;
};

export function toSharedResult(result: WrappedResult): SharedResult {
  return {
    v: 1,
    archetype: result.archetype,
    favoriteLineId: result.route.favoriteLineId,
    lineIds: result.route.lineIds,
    annualTrips: result.annualTrips,
    annualDistanceKm: result.annualDistanceKm,
    annualSpend: result.annualSpend,
    annualHours: result.annualHours,
    oneWayDistanceKm: result.route.distanceKm,
    oneWayMinutes: result.route.estimatedMinutes,
    stops: result.route.stops,
    interchanges: result.route.interchanges,
  };
}

export function encodeResult(result: SharedResult) {
  const bytes = new TextEncoder().encode(JSON.stringify(result));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeResult(payload: string): SharedResult | null {
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const binary = typeof atob === "function" ? atob(padded) : Buffer.from(padded, "base64").toString("binary");
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    const value = JSON.parse(new TextDecoder().decode(bytes)) as Partial<SharedResult>;

    if (
      value.v !== 1 ||
      typeof value.favoriteLineId !== "string" ||
      !Array.isArray(value.lineIds) ||
      typeof value.archetype?.name !== "string" ||
      typeof value.archetype?.description !== "string"
    ) {
      return null;
    }

    const numericFields = [
      "annualTrips",
      "annualDistanceKm",
      "annualSpend",
      "annualHours",
      "oneWayDistanceKm",
      "oneWayMinutes",
      "stops",
      "interchanges",
    ] as const;
    if (numericFields.some((field) => !Number.isFinite(value[field]) || Number(value[field]) < 0)) return null;

    return value as SharedResult;
  } catch {
    return null;
  }
}
