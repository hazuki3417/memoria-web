type SI = "B" | "KB" | "MB" | "GB" | "TB";
type IEC = "B" | "KiB" | "MiB" | "GiB" | "TiB";
type UnitType = "si" | "iec";
type Unit = SI | IEC;

const BASE: { SI: number; IEC: number } = {
  SI: 1000,
  IEC: 1024,
};

const UNIT: { SI: SI[]; IEC: IEC[] } = {
  SI: ["B", "KB", "MB", "GB", "TB"],
  IEC: ["B", "KiB", "MiB", "GiB", "TiB"],
};

interface FormattedSizeOption {
  unit?: UnitType;
  decimals?: number;
}

interface FormattedSize {
  value: number;
  unit: Unit;
}

const formatSize = (
  bytes: number,
  option: FormattedSizeOption = {},
): FormattedSize => {
  if (bytes < 0) throw new Error("File size must be non-negative");
  const { unit = "si", decimals = 2 } = option;

  const base = unit === "iec" ? BASE.IEC : BASE.SI;
  const units = unit === "iec" ? UNIT.IEC : UNIT.SI;

  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1,
  );

  const value = bytes / Math.pow(base, index);
  const rounded = parseFloat(value.toFixed(decimals));

  return {
    value: rounded,
    unit: units[index],
  };
};

export const format = {
  file: {
    size: formatSize,
  },
};
