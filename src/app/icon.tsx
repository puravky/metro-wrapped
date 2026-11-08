import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3edde",
          borderRadius: 32,
          border: "7px solid #ba2930",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", left: -4, right: -4, height: 15, background: "#f3edde", borderTop: "5px solid #ba2930", borderBottom: "5px solid #ba2930", display: "flex" }} />
        <div style={{ width: 15, height: 15, borderRadius: 20, background: "#173d78", display: "flex" }} />
      </div>
    ),
    size,
  );
}
