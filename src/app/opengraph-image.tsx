import { ImageResponse } from "next/og";

export const alt = "Metro Wrapped, your Delhi Metro year between the lines";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f3edde", color: "#171717", padding: "54px 64px", fontFamily: "sans-serif" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", border: "3px solid #171717", background: "#fffdf7", padding: "50px 56px", boxShadow: "12px 12px 0 #171717" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 17, fontWeight: 800, letterSpacing: "0.13em" }}>
            <span>METRO WRAPPED</span>
            <span style={{ color: "#ba2930" }}>DELHI / 2026</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 40 }}>
            <div style={{ width: 38, height: 38, borderRadius: 40, border: "9px solid #ba2930", background: "#fffdf7", display: "flex" }} />
            <div style={{ flex: 1, height: 12, background: "#ba2930", display: "flex" }} />
            <div style={{ width: 38, height: 38, borderRadius: 40, border: "9px solid #f1bd21", background: "#fffdf7", display: "flex" }} />
            <div style={{ flex: 1, height: 12, background: "#f1bd21", display: "flex" }} />
            <div style={{ width: 38, height: 38, borderRadius: 40, border: "9px solid #173d78", background: "#fffdf7", display: "flex" }} />
          </div>
          <div style={{ display: "flex", marginTop: 42, fontSize: 76, lineHeight: 0.95, fontWeight: 900, letterSpacing: "-0.06em", maxWidth: 840 }}>
            Your year, between the lines.
          </div>
          <div style={{ display: "flex", marginTop: "auto", fontSize: 24 }}>
            Turn your everyday Delhi Metro ride into a playful, shareable year in review.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
