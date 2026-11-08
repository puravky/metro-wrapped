"use client";

import { useMemo, useState } from "react";
import type { MetroLine, Station } from "@/lib/metro/types";

type StationPickerProps = {
  id: string;
  label: string;
  hint: string;
  stations: Station[];
  lines: MetroLine[];
  value: string;
  onChange: (stationId: string) => void;
};

export function StationPicker({ id, label, hint, stations, lines, value, onChange }: StationPickerProps) {
  const selected = stations.find((station) => station.id === value);
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const stationLines = useMemo(() => {
    const map = new Map<string, MetroLine[]>();
    for (const line of lines) {
      for (const branch of line.branches) {
        for (const stationId of branch) {
          const values = map.get(stationId) ?? [];
          if (!values.some((value) => value.id === line.id)) values.push(line);
          map.set(stationId, values);
        }
      }
    }
    return map;
  }, [lines]);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? stations.filter((station) => `${station.name} ${station.aliases.join(" ")}`.toLowerCase().includes(needle))
      : stations;
    return filtered.slice(0, 7);
  }, [query, stations]);

  const choose = (station: Station) => {
    setQuery(station.name);
    onChange(station.id);
    setOpen(false);
    setActiveIndex(0);
  };

  return (
    <div className="station-picker">
      <label htmlFor={id}>{label}</label>
      <div className={`station-input-shell ${open ? "is-open" : ""}`}>
        <span className="station-input-code">{value ? "●" : "○"}</span>
        <input
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-options`}
          aria-activedescendant={open && matches[activeIndex] ? `${id}-option-${matches[activeIndex].id}` : undefined}
          aria-autocomplete="list"
          autoComplete="off"
          placeholder={hint}
          value={query}
          onFocus={() => { setOpen(true); setActiveIndex(0); }}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onChange={(event) => {
            setQuery(event.target.value);
            onChange("");
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && open && matches.length) {
              event.preventDefault();
              setActiveIndex((index) => Math.min(index + 1, matches.length - 1));
            }
            if (event.key === "ArrowUp" && open && matches.length) {
              event.preventDefault();
              setActiveIndex((index) => Math.max(index - 1, 0));
            }
            if (event.key === "Enter" && open && matches[activeIndex]) {
              event.preventDefault();
              choose(matches[activeIndex]);
            }
            if (event.key === "Escape") setOpen(false);
          }}
        />
        {selected && (
          <span className="selected-lines" aria-label={`${stationLines.get(selected.id)?.map((line) => line.name).join(", ")}`}>
            {(stationLines.get(selected.id) ?? []).map((line) => (
              <i key={line.id} style={{ background: line.color }} />
            ))}
          </span>
        )}
      </div>
      {open && (
        <div className="station-options" id={`${id}-options`} role="listbox">
          {matches.length ? (
            matches.map((station, index) => (
              <button id={`${id}-option-${station.id}`} type="button" role="option" aria-selected={station.id === value} data-active={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(station)} key={station.id}>
                <span>{station.name}</span>
                <span className="option-lines">
                  {(stationLines.get(station.id) ?? []).map((line) => (
                    <i key={line.id} style={{ background: line.color }} title={line.name} />
                  ))}
                </span>
              </button>
            ))
          ) : (
            <p>No matching station</p>
          )}
        </div>
      )}
    </div>
  );
}
