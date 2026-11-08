export type DataConfidence = "high" | "medium" | "low";

export type Station = {
  id: string;
  name: string;
  aliases: string[];
  latitude: number | null;
  longitude: number | null;
  operator: "dmrc";
  status: "operational" | "closed" | "future";
};

export type MetroLine = {
  id: string;
  name: string;
  color: string;
  textColor: string;
  operator: "dmrc";
  branches: string[][];
};

export type Segment = {
  fromStationId: string;
  toStationId: string;
  lineId: string;
  distanceKm: number;
  typicalMinutes: number | null;
  bidirectional: boolean;
  source: "official-corridor-estimate" | "gtfs-coordinate-estimate";
  confidence: DataConfidence;
};

export type NetworkDataset = {
  city: "delhi";
  verifiedOn: string | null;
  dataVersion: number;
  stations: Station[];
  lines: MetroLine[];
  segments: Segment[];
  fare: FarePolicy;
  provenance: {
    topology: string;
    sourceFeedDate: string;
    officialAuditDate: string;
    distanceMethod: string;
    caveat: string;
  };
};

export type FarePolicy = {
  verifiedOn: string;
  weekdaySlabs: { upperBoundKm: number | null; tokenFare: number }[];
  smartCardBaseDiscount: number;
  smartCardOffPeakExtraDiscount: number;
};
