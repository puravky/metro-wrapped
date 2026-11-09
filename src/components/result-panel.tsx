"use client";

import { useMemo, useState } from "react";
import { encodeResult, type SharedResult } from "@/lib/result-payload";
import { ResultCard } from "./result-card";

type ResultPanelProps = {
  result: SharedResult;
  originName?: string;
  destinationName?: string;
  onRestart?: () => void;
};

export function ResultPanel({ result, originName, destinationName, onRestart }: ResultPanelProps) {
  const [notice, setNotice] = useState("");
  const payload = useMemo(() => encodeResult(result), [result]);
  const cardUrl = `/api/card?result=${encodeURIComponent(payload)}&format=card`;

  const shareUrl = () => `${window.location.origin}/r/${payload}`;

  const getCard = async () => {
    const response = await fetch(cardUrl);
    if (!response.ok) throw new Error("Card generation failed");
    return response.blob();
  };

  const saveBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "metro-wrapped-delhi.png";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const download = async () => {
    try {
      saveBlob(await getCard());
      setNotice("Card downloaded");
      return true;
    } catch {
      setNotice("The card could not be downloaded. Try again.");
      return false;
    }
  };

  const shareToInstagram = async () => {
    try {
      const blob = await getCard();
      const file = new File([blob], "metro-wrapped-delhi.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "My Metro Wrapped", text: result.archetype.name });
      } else {
        saveBlob(blob);
        window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
        setNotice("Card downloaded. Add it to your Instagram story.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setNotice("Instagram sharing is unavailable. Try Download instead.");
    }
  };

  const shareToX = () => {
    const text = encodeURIComponent(`Apparently I am “${result.archetype.name}” on the Delhi Metro.`);
    const freshShareUrl = `${shareUrl()}?v=3`;
    window.open(`https://x.com/intent/post?text=${text}%20${encodeURIComponent(freshShareUrl)}`, "_blank", "noopener,noreferrer");
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`My Delhi Metro Wrapped: ${result.archetype.name}\n${shareUrl()}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="result-layout">
      <div className="result-intro">
        <p className="kicker">FINAL STATION · YOUR YEAR</p>
        <h1>This is how<br />you moved<br />through Delhi.</h1>
        {originName && destinationName ? <p className="private-route">{originName} <span>→</span> {destinationName}</p> : null}
        <p className="estimate-note">A playful estimate based on two rides per travel day across 48 active weeks. Your station names stay off the shared card.</p>

        {onRestart ? <button className="text-action" onClick={onRestart}>Start over</button> : <a className="text-action" href="/">Make yours</a>}
      </div>
      <div className="result-card-stack">
        <ResultCard result={result} />
        <div className="share-panel" aria-label="Share your Metro Wrapped card">
          <button className="share-action" onClick={download}><DownloadIcon /><span>Download</span></button>
          <button className="share-action whatsapp" onClick={shareToWhatsApp}><BrandIcon src="https://svgl.app/library/whatsapp-icon.svg" /><span>WhatsApp</span></button>
          <button className="share-action x-social" onClick={shareToX}><BrandIcon src="https://svgl.app/library/x.svg" /><span>X</span></button>
          <button className="share-action instagram" onClick={shareToInstagram}><BrandIcon src="https://svgl.app/library/instagram-icon.svg" /><span>Instagram</span></button>
        </div>
        <p className="share-notice" aria-live="polite">{notice}</p>
      </div>
    </section>
  );
}

function DownloadIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M4 19h16" /></svg>;
}

function BrandIcon({ src }: { src: string }) {
  return <img className="svgl-icon" src={src} alt="" aria-hidden="true" />;
}
