import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { decodeResult } from "@/lib/result-payload";
import { getLineColor } from "@/lib/metro/palette";

const metroDataUrl = readFile(join(process.cwd(), "metro.png")).then(
  (buffer) => `data:image/png;base64,${buffer.toString("base64")}`,
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const result = decodeResult(url.searchParams.get("result") ?? "");
  if (!result) return new Response("Invalid result", { status: 400 });

  const isOg = url.searchParams.get("format") === "og";
  const width = isOg ? 1200 : 900;
  const height = isOg ? 630 : 1000;
  const lineColor = getLineColor(result.favoriteLineId);
  const metroUrl = await metroDataUrl;
  const days = Math.floor(result.annualHours / 24);
  const hours = result.annualHours % 24;
  const lineName = result.favoriteLineId.replaceAll("-", " ").toUpperCase();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#bd4150", color: "#161716", padding: isOg ? 24 : 38, fontFamily: "sans-serif" }}>
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#fff7e3", border: "4px solid #161716", borderRadius: isOg ? 34 : 50, overflow: "hidden", boxShadow: "12px 14px 0 #6e2130", padding: isOg ? "26px 31px 22px" : "38px 43px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: isOg ? 18 : 24, fontSize: isOg ? 15 : 18, fontWeight: 800, letterSpacing: "0.14em" }}>
            <span>DELHI METRO WRAPPED</span><span>2026</span>
          </div>

          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: isOg ? "row" : "column", gap: isOg ? 26 : 26 }}>
            <div style={{ width: isOg ? "39%" : "100%", height: isOg ? "100%" : "47%", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", background: "#9ee6d3", border: "3px solid #161716", borderRadius: isOg ? 23 : 27 }}>
              <span style={{ position: "absolute", right: 27, top: 58, width: isOg ? 72 : 76, height: isOg ? 72 : 76, borderRadius: 99, background: "#f4b83f", display: "flex" }} />
              <img src={metroUrl} alt="" width={750} height={750} style={{ position: "absolute", width: isOg ? "116%" : "100%", height: isOg ? "116%" : "100%", left: isOg ? "-25%" : 0, bottom: isOg ? "-20%" : 0, objectFit: "cover", objectPosition: isOg ? "center" : "center 68%", mixBlendMode: "multiply" }} />
              <div style={{ display: "flex", position: "absolute", left: 22, right: 22, top: 22, height: isOg ? 9 : 11 }}>
                {result.lineIds.map((lineId, index) => (
                  <div key={`${lineId}-${index}`} style={{ flex: 1, height: "100%", background: getLineColor(lineId), display: "flex", position: "relative" }}>
                    <span style={{ position: "absolute", left: -4, top: isOg ? -4 : -5, width: isOg ? 17 : 21, height: isOg ? 17 : 21, borderRadius: 99, border: `${isOg ? 4 : 5}px solid ${getLineColor(lineId)}`, background: "#fff7e3", display: "flex" }} />
                  </div>
                ))}
              </div>
              <div style={{ position: "absolute", left: 18, right: 18, bottom: 16, display: "flex", justifyContent: "space-between", fontSize: isOg ? 9 : 10, fontWeight: 900, letterSpacing: "0.1em" }}>
                <span>{lineName} ENERGY</span><span>{result.stops} STOPS</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", padding: isOg ? 0 : "0 7px" }}>
              <span style={{ color: lineColor, fontSize: isOg ? 12 : 13, fontWeight: 900, letterSpacing: "0.15em" }}>MY METRO TYPE IS</span>
              <div style={{ fontSize: isOg ? 53 : 52, lineHeight: .9, fontWeight: 900, letterSpacing: "-0.055em", marginTop: isOg ? 9 : 10 }}>{result.archetype.name}</div>
              <div style={{ display: "flex", color: "#4c473e", fontSize: isOg ? 14 : 15, lineHeight: 1.25, fontWeight: 650, marginTop: isOg ? 12 : 13, maxWidth: 660 }}>“{result.archetype.description}”</div>

              <div style={{ marginTop: "auto", display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", flexDirection: "column", border: "3px solid #161716", borderRadius: isOg ? 15 : 19, background: "#f4b83f", padding: isOg ? "11px 15px" : "15px 18px 13px" }}>
                  <span style={{ fontSize: isOg ? 9 : 10, fontWeight: 900, letterSpacing: "0.11em" }}>I SPENT</span>
                  <span style={{ fontSize: isOg ? 35 : 42, lineHeight: .9, fontWeight: 900, letterSpacing: "-0.045em", marginTop: 3 }}>{days} DAYS{hours ? ` + ${hours} HRS` : ""}</span>
                  <span style={{ fontSize: isOg ? 9 : 10, fontWeight: 900, letterSpacing: "0.11em", marginTop: 5 }}>WITH DELHI IN MOTION</span>
                </div>

                <div style={{ display: "flex", gap: isOg ? 13 : 18, marginTop: isOg ? 14 : 16 }}>
                  {[
                    [result.annualTrips.toLocaleString("en-IN"), "RIDES"],
                    [result.annualDistanceKm.toLocaleString("en-IN"), "KM"],
                    [`₹${result.annualSpend.toLocaleString("en-IN")}`, "SPENT"],
                  ].map(([value, label]) => (
                    <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", borderTop: "2px solid #161716", paddingTop: isOg ? 7 : 9 }}>
                      <span style={{ fontSize: isOg ? 18 : 22, fontWeight: 900 }}>{value}</span>
                      <span style={{ fontSize: isOg ? 7 : 9, letterSpacing: "0.1em", marginTop: 3 }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #a89f8b", paddingTop: isOg ? 9 : 11, marginTop: isOg ? 15 : 16, fontSize: isOg ? 8 : 9, fontWeight: 800, letterSpacing: "0.08em" }}>
            <span>WHAT’S YOUR METRO TYPE?</span><span>METRO-WRAPPED.VERCEL.APP</span>
          </div>
        </div>
      </div>
    ),
    { width, height, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } },
  );
}
