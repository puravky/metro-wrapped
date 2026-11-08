"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

const FEEDBACK_ENDPOINT = "https://formsubmit.co/ajax/puravky7@gmail.com";

export function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    panelRef.current?.querySelector<HTMLElement>("textarea")?.focus();
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  const submitFeedback = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get("website")) return;

    setStatus("sending");
    try {
      const response = await fetch(FEEDBACK_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          x_username: data.get("xUsername") || "Not provided",
          message: data.get("message"),
          page: window.location.href,
          _subject: "New Metro Wrapped feedback",
          _template: "table",
        }),
      });
      if (!response.ok) throw new Error("Feedback delivery failed");
      form.reset();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className={`feedback-widget ${open ? "is-open" : ""}`}>
      {open ? (
        <div className="feedback-panel" ref={panelRef} role="dialog" aria-modal="false" aria-labelledby="feedback-title">
          <div className="feedback-heading">
            <div><small>CONTROL ROOM</small><h2 id="feedback-title">Tell us what missed the stop.</h2></div>
            <button type="button" className="feedback-close" onClick={() => setOpen(false)} aria-label="Close feedback form">×</button>
          </div>

          {status === "sent" ? (
            <div className="feedback-success" role="status"><span>✓</span><b>Feedback sent.</b><p>Thanks for helping make the next ride better.</p><button type="button" onClick={() => { setStatus("idle"); setOpen(false); }}>Done</button></div>
          ) : (
            <form onSubmit={submitFeedback}>
              <input className="feedback-honeypot" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <label htmlFor="feedback-message">Your feedback</label>
              <textarea id="feedback-message" name="message" rows={4} minLength={3} maxLength={1200} placeholder="A thought, bug, station we missed..." required />
              <div className="feedback-inline-fields">
                <div><label htmlFor="feedback-name">Name <span>required</span></label><input id="feedback-name" name="name" autoComplete="name" minLength={2} required /></div>
                <div><label htmlFor="feedback-x">X username <span>optional</span></label><input id="feedback-x" name="xUsername" autoComplete="off" placeholder="@handle" /></div>
              </div>
              <button className="feedback-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send feedback"}<span>→</span></button>
              {status === "error" ? <p className="feedback-error" role="alert">Couldn’t send it. Email <a href="mailto:puravky7@gmail.com?subject=Metro%20Wrapped%20feedback">puravky7@gmail.com</a> instead.</p> : null}
              <p className="feedback-privacy">Delivered to the project inbox. Please don’t include sensitive information.</p>
            </form>
          )}
        </div>
      ) : null}

      <button className="feedback-trigger" type="button" aria-label="Give feedback" aria-expanded={open} onClick={() => { setOpen((value) => !value); setStatus("idle"); }}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5.5h14v10H9l-4 3v-13Z" /><path d="M8.5 9h7M8.5 12h4.5" /></svg>
      </button>
    </div>
  );
}
