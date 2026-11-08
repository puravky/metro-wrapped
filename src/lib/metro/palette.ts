export const LINE_COLORS: Record<string, string> = {
  red: "#d42b36",
  yellow: "#f0b323",
  blue: "#1769aa",
  green: "#16845b",
  violet: "#6d3a8a",
  pink: "#df6f9f",
  magenta: "#a82372",
  grey: "#6f7475",
};

export function getLineColor(lineId: string) {
  return LINE_COLORS[lineId] ?? LINE_COLORS.blue;
}
