"use client";

import { useEffect, useMemo, useReducer, useState } from "react";
import { delhiNetwork } from "@/data/delhi/network";
import { createWrappedResult, type JourneyAnswers } from "@/lib/metro/engine";
import { toSharedResult } from "@/lib/result-payload";
import { ArrowIcon, BackIcon } from "./icons";
import { MetroScene } from "./metro-scene";
import { ResultPanel } from "./result-panel";
import { RouteStrip } from "./route-strip";
import { StationPicker } from "./station-picker";

type JourneyState = { step: number; answers: JourneyAnswers };
type JourneyAction =
  | { type: "next" }
  | { type: "back" }
  | { type: "restart" }
  | { type: "answer"; field: keyof JourneyAnswers; value: JourneyAnswers[keyof JourneyAnswers] };

const initialAnswers: JourneyAnswers = {
  originId: "",
  destinationId: "",
  days: 5,
  time: "peak",
  payment: "card",
  stance: "middle",
  activity: "music",
  runsForDoors: false,
};

function journeyReducer(state: JourneyState, action: JourneyAction): JourneyState {
  switch (action.type) {
    case "next": return { ...state, step: Math.min(state.step + 1, 4) };
    case "back": return { ...state, step: Math.max(state.step - 1, 0) };
    case "restart": return { step: 0, answers: initialAnswers };
    case "answer": return { ...state, answers: { ...state.answers, [action.field]: action.value } };
  }
}

const timeOptions = [
  ["early", "Before 8 AM", "first trains, quiet coaches"],
  ["peak", "Peak hours", "the full Delhi experience"],
  ["off-peak", "Off-peak", "room to breathe"],
  ["late", "After 9 PM", "last-train calculations"],
];

export function MetroExperience() {
  const [state, dispatch] = useReducer(journeyReducer, { step: 0, answers: initialAnswers });
  const [moving, setMoving] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [routeError, setRouteError] = useState("");
  const wrapped = useMemo(() => state.answers.originId && state.answers.destinationId ? createWrappedResult(state.answers) : null, [state.answers]);
  const origin = delhiNetwork.stations.find((station) => station.id === state.answers.originId);
  const destination = delhiNetwork.stations.find((station) => station.id === state.answers.destinationId);

  useEffect(() => {
    const welcomeTimer = window.setTimeout(() => setShowWelcome(false), 2800);
    return () => window.clearTimeout(welcomeTimer);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "auto" }); }, [state.step]);

  const moveToNext = () => {
    if (moving) return;
    setMoving(true);
    window.setTimeout(() => { dispatch({ type: "next" }); setMoving(false); }, 680);
  };

  const submitRoute = () => {
    setRouteError("");
    if (!state.answers.originId || !state.answers.destinationId) return setRouteError("Choose both stations from the list.");
    if (state.answers.originId === state.answers.destinationId) return setRouteError("Your destination needs to be a different station.");
    if (!wrapped) return setRouteError("That route is not connected in the current network snapshot.");
    moveToNext();
  };

  return (<>
    {showWelcome ? (
      <div className="welcome-screen" aria-label="दिल्ली मेट्रो में आपका स्वागत है. Welcome to Delhi Metro.">
        <span className="welcome-line" />
        <p>
          <strong className="welcome-hindi" lang="hi">दिल्ली मेट्रो में आपका स्वागत है</strong>
          <span className="welcome-english">Welcome to Delhi Metro</span>
        </p>
      </div>
    ) : null}
    <main className="app-shell">
      <header className="site-header">
        <button className="wordmark" onClick={() => dispatch({ type: "restart" })} aria-label="Return to the platform">
          <span className="wordmark-roundel"><i /></span>
          <span>Metro<br /><b>Wrapped</b></span>
        </button>
        <div className="header-meta"><span>DELHI</span><span>2026</span><span className="header-unofficial">UNOFFICIAL</span></div>
      </header>

      <section className={`experience step-${state.step} ${moving ? "is-departing" : ""}`} aria-busy={moving}>
        <RouteStrip activeStep={state.step} moving={moving} />

        {state.step === 0 && (
          <div className="landing-panel step-content">
            <div className="intro-copy">
              <p className="kicker">THE 2026 COMMUTE REPORT</p>
              <h1>Your year,<br /><span>between stations.</span></h1>
              <p className="hindi-line">दिल्ली मेट्रो में आपका साल</p>
              <p className="lede">Four quick stops. One very Delhi answer to the question: what kind of commuter were you this year?</p>
              <button className="primary-button" onClick={moveToNext} disabled={moving}>Board the train <ArrowIcon /></button>
              <p className="privacy-line">NO LOGIN · NO LIVE LOCATION · 30 SECONDS</p>
            </div>
            <MetroScene />
          </div>
        )}

        {state.step === 1 && (
          <QuestionFrame number="01" label="THE ROUTE" aside="The station pair stays on this device. Shared cards never reveal it.">
            <h2>Where do you tap in?</h2>
            <p className="question-deck">Your usual run, not the one-off airport trip.</p>
            <div className="station-pair">
              <StationPicker id="origin" label="From" hint="Search 240 stations" stations={delhiNetwork.stations} lines={delhiNetwork.lines} value={state.answers.originId} onChange={(value) => dispatch({ type: "answer", field: "originId", value })} />
              <div className="station-connector" aria-hidden="true"><i /><span>TO</span><i /></div>
              <StationPicker id="destination" label="To" hint="Where do you get off?" stations={delhiNetwork.stations} lines={delhiNetwork.lines} value={state.answers.destinationId} onChange={(value) => dispatch({ type: "answer", field: "destinationId", value })} />
            </div>
            {routeError ? <p className="form-error" role="alert">{routeError}</p> : null}
            <JourneyActions onBack={() => dispatch({ type: "back" })} onNext={submitRoute} disabled={moving} />
          </QuestionFrame>
        )}

        {state.step === 2 && (
          <QuestionFrame number="02" label="THE ROUTINE" aside={wrapped ? `${wrapped.route.stops} stops each way. About ${wrapped.route.estimatedMinutes} minutes, before platform waiting.` : "Two rides per travel day. Four weeks off across the year."}>
            <h2>How often do you make this run?</h2>
            <p className="question-deck">We use 48 active weeks and two one-way rides per travel day.</p>
            <div className="field-group routine-days">
              <span className="field-label">Days per week</span>
              <div className="day-picker">
                {[1, 2, 3, 4, 5, 6, 7].map((day) => <button type="button" className={state.answers.days === day ? "selected" : ""} onClick={() => dispatch({ type: "answer", field: "days", value: day })} key={day} aria-pressed={state.answers.days === day}>{day}</button>)}
              </div>
            </div>
            <ChoiceGrid className="routine-time" label="Usual time" options={timeOptions} value={state.answers.time} onChange={(value) => dispatch({ type: "answer", field: "time", value })} />
            <ChoiceGrid className="routine-payment" label="How do you pay?" options={[["card", "Smart card", "discount applied"], ["token", "Token / QR", "full fare"]]} value={state.answers.payment} onChange={(value) => dispatch({ type: "answer", field: "payment", value })} />
            <JourneyActions onBack={() => dispatch({ type: "back" })} onNext={moveToNext} disabled={moving} />
          </QuestionFrame>
        )}

        {state.step === 3 && (
          <QuestionFrame number="03" label="THE COACH" aside="There are no wrong answers here. There are, however, unsafe ones.">
            <h2>Coach behaviour. Honestly.</h2>
            <p className="question-deck">The tiny decisions that make a Delhi Metro personality.</p>
            <ChoiceGrid className="coach-stance" label="Where do you end up?" options={[["door", "By the door", "quick exit territory"], ["middle", "Coach middle", "civilised, in theory"], ["seat", "Seat hunting", "eyes always scanning"]]} value={state.answers.stance} onChange={(value) => dispatch({ type: "answer", field: "stance", value })} />
            <ChoiceGrid className="coach-activity" label="What are you doing?" options={[["music", "Music", "commute soundtrack"], ["reels", "Reels", "one more, somehow"], ["sleep", "Sleeping", "elite-level skill"], ["watching", "People-watching", "Delhi in episodes"]]} value={state.answers.activity} onChange={(value) => dispatch({ type: "answer", field: "activity", value })} />
            <ChoiceGrid className="coach-doors" label="Doors are closing" options={[["yes", "I run", "please do not"], ["no", "Next train", "correct answer"]]} value={state.answers.runsForDoors ? "yes" : "no"} onChange={(value) => dispatch({ type: "answer", field: "runsForDoors", value: value === "yes" })} />
            <JourneyActions onBack={() => dispatch({ type: "back" })} onNext={moveToNext} nextLabel="See my year" disabled={moving} />
          </QuestionFrame>
        )}

        {state.step === 4 && wrapped && <ResultPanel result={toSharedResult(wrapped)} originName={origin?.name} destinationName={destination?.name} onRestart={() => dispatch({ type: "restart" })} />}
      </section>

      <footer className="site-footer"><span>Made for Delhi commuters</span><span>Independent project · Not affiliated with DMRC</span><span>metrowrapped.vercel.app</span></footer>
    </main>
  </>);
}

function QuestionFrame({ number, label, aside, children }: { number: string; label: string; aside: string; children: React.ReactNode }) {
  return <div className="question-frame step-content"><section className="question-card"><div className="question-index"><span>{number}</span><div><small>CURRENT STATION</small><b>{label}</b></div></div>{children}</section><aside className="coach-note"><span>ON THE PLATFORM</span><p>{aside}</p><i>→</i></aside></div>;
}

function ChoiceGrid({ label, options, value, onChange, className = "" }: { label: string; options: string[][]; value: string; onChange: (value: string) => void; className?: string }) {
  return <div className={`field-group ${className}`}><span className="field-label">{label}</span><div className="choice-grid">{options.map(([optionValue, optionLabel, optionHint]) => <button type="button" className={value === optionValue ? "selected" : ""} aria-pressed={value === optionValue} onClick={() => onChange(optionValue)} key={optionValue}><span className="choice-radio" /><span><b>{optionLabel}</b><small>{optionHint}</small></span></button>)}</div></div>;
}

function JourneyActions({ onBack, onNext, nextLabel = "Next stop", disabled = false }: { onBack: () => void; onNext: () => void; nextLabel?: string; disabled?: boolean }) {
  return <div className="journey-actions"><button className="back-button" type="button" onClick={onBack} disabled={disabled}><BackIcon /> Back</button><button className="primary-button compact" type="button" onClick={onNext} disabled={disabled}>{nextLabel} <ArrowIcon /></button></div>;
}
