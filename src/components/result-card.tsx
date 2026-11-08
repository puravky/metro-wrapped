import type { CSSProperties } from "react";
import Image from "next/image";
import type { SharedResult } from "@/lib/result-payload";
import { getLineColor } from "@/lib/metro/palette";
import metroImage from "../../metro.png";

export function ResultCard({ result }: { result: SharedResult }) {
  const lineColor = getLineColor(result.favoriteLineId);
  const style = { "--result-line": lineColor } as CSSProperties;
  const days = Math.floor(result.annualHours / 24);
  const hours = result.annualHours % 24;
  const lineName = result.favoriteLineId.replaceAll("-", " ").toUpperCase();

  return (
    <article className="result-card" style={style} aria-label={`Metro Wrapped result: ${result.archetype.name}`}>
      <div className="result-card-topline">
        <span className="result-mono">DELHI METRO WRAPPED</span><span className="result-city">2026</span>
      </div>

      <div className="result-card-main">
        <div className="result-art" aria-hidden="true">
          <span className="result-sun" />
          <div className="result-route-line">
            {result.lineIds.map((lineId, index) => (
              <span key={`${lineId}-${index}`} style={{ background: getLineColor(lineId), color: getLineColor(lineId) }}><i /></span>
            ))}
          </div>
          <Image className="result-metro-image" src={metroImage} alt="" sizes="220px" />
          <div className="result-art-label"><span>{lineName} ENERGY</span><span>{result.stops} STOPS</span></div>
        </div>

        <div className="result-card-copy">
          <div className="result-archetype">
            <p>MY METRO TYPE IS</p>
            <h2>{result.archetype.name}</h2>
            <p className="result-quote">“{result.archetype.description}”</p>
          </div>

          <div className="result-card-numbers">
            <div className="result-flex-line">
              <span>I SPENT</span>
              <strong>{days} DAYS{hours ? ` + ${hours} HRS` : ""}</strong>
              <span>WITH DELHI IN MOTION</span>
            </div>
            <dl className="result-stats">
              <div><dd>{result.annualTrips.toLocaleString("en-IN")}</dd><dt>RIDES</dt></div>
              <div><dd>{result.annualDistanceKm.toLocaleString("en-IN")}</dd><dt>KM</dt></div>
              <div><dd>₹{result.annualSpend.toLocaleString("en-IN")}</dd><dt>SPENT</dt></div>
            </dl>
          </div>
        </div>
      </div>

      <footer className="result-card-footer">
        <span>WHAT’S YOUR METRO TYPE?</span>
        <span>metro-wrapped.vercel.app</span>
      </footer>
    </article>
  );
}
