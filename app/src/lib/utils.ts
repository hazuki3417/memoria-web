export type Unit = "k" | "m" | "g" | "t";

export const formatSize = (
  bytes: number,
  unit: Unit,
): { value: number; unit: Unit } => {
  const unitMap: Record<Unit, number> = {
    k: 1e3, // kilobyte
    m: 1e6, // megabyte
    g: 1e9, // gigabyte
    t: 1e12, // terabyte
  };

  if (bytes < 0) throw new Error("Input must be a non-negative integer.");
  if (!(unit in unitMap)) throw new Error("Invalid unit provided.");

  const divisor = unitMap[unit];
  const value = bytes / divisor;

  return { value, unit: unit };
};
