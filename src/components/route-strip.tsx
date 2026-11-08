import Image from "next/image";
import trainMarker from "../../train.png";

const stops = [["00", "TAP IN"], ["01", "ROUTE"], ["02", "ROUTINE"], ["03", "COACH"], ["04", "WRAPPED"]];

export function RouteStrip({ activeStep, moving = false }: { activeStep: number; moving?: boolean }) {
  const trainStop = Math.min(activeStep + (moving ? 1 : 0), stops.length - 1);
  const trainPosition = 10 + trainStop * 20;
  const progress = (trainStop / (stops.length - 1)) * 100;

  return (
    <nav className="route-strip" aria-label={`Journey progress: step ${activeStep + 1} of ${stops.length}`}>
      <div className="route-rail"><span style={{ width: `${progress}%` }} /></div>
      <span className={`route-train ${moving ? "is-travelling" : ""}`} style={{ left: `${trainPosition}%` }} aria-hidden="true">
        <Image src={trainMarker} alt="" sizes="64px" loading="eager" />
      </span>
      {stops.map(([code, label], index) => (
        <div aria-current={index === activeStep ? "step" : undefined} className={`route-stop ${index <= activeStep ? "is-passed" : ""} ${index === activeStep ? "is-current" : ""}`} key={code}>
          <span className="route-dot"><i />{code}</span><span className="route-label">{label}</span>
        </div>
      ))}
    </nav>
  );
}
