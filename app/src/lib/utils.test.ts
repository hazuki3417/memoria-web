import { describe, expect, it } from "vitest";
import { formatSize } from "./utils";

describe("formatSize", () => {
  it("converts bytes to kilobytes", () => {
    const result = formatSize(1500, "k");
    expect(result).toEqual({ value: 1.5, unit: "k" });
  });

  it("converts bytes to megabytes", () => {
    const result = formatSize(1048576, "m");
    expect(result.value).toBeCloseTo(1.048576);
    expect(result.unit).toBe("m");
  });

  it("converts bytes to gigabytes", () => {
    const result = formatSize(3e9, "g");
    expect(result).toEqual({ value: 3, unit: "g" });
  });

  it("converts bytes to terabytes", () => {
    const result = formatSize(2.5e12, "t");
    expect(result).toEqual({ value: 2.5, unit: "t" });
  });

  it("throws error on negative input", () => {
    expect(() => formatSize(-100, "k")).toThrow(
      "Input must be a non-negative integer.",
    );
  });

  it("throws error on invalid unit", () => {
    // @ts-expect-error intentional invalid unit
    expect(() => formatSize(1000, "x")).toThrow("Invalid unit provided.");
  });
});
