import Image from "next/image";
import metroImage from "../../metro.png";

export function MetroScene() {
  return (
    <div className="platform-scene" aria-hidden="true">
      <span className="scene-sun" />
      <span className="scene-building scene-building-one" />
      <span className="scene-building scene-building-two" />
      <div className="metro-photo-frame">
        <div className="metro-photo-label"><span>DELHI · 2026</span><b>ON APPROACH</b></div>
        <Image className="hero-metro-image" src={metroImage} alt="" preload sizes="(max-width: 900px) 86vw, 46vw" />
        <div className="metro-photo-platform"><i /><span>Mind the gap</span><i /></div>
      </div>
      <div className="scene-sticker scene-sticker-year"><small>YOUR</small><b>2026</b><small>IN MOTION</small></div>
      <div className="scene-sticker scene-sticker-route"><b>04</b><span>STOPS TO<br />YOUR TYPE</span></div>
      <div className="scene-track scene-track-one" />
      <div className="scene-track scene-track-two" />
      <div className="platform-caption"><span>PLATFORM 2026</span><b>NEXT STOP: YOUR YEAR</b></div>
    </div>
  );
}
