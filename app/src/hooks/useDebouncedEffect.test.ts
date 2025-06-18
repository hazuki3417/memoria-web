import { renderHook } from "@testing-library/react";
import { useDebouncedEffect } from "./useDebouncedEffect"; // パスは調整
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";

describe("useDebouncedEffect", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should delay the execution of the effect", () => {
    const effectFn = vi.fn();

    renderHook(() => useDebouncedEffect(effectFn, ["dependency"], 500));

    // 呼ばれていないはず
    expect(effectFn).not.toHaveBeenCalled();

    // 499ms → まだ呼ばれてない
    vi.advanceTimersByTime(499);
    expect(effectFn).not.toHaveBeenCalled();

    // 500ms → 呼ばれる
    vi.advanceTimersByTime(1);
    expect(effectFn).toHaveBeenCalledTimes(1);
  });

  it("should cancel previous timer if deps change before delay", () => {
    const effectFn = vi.fn();

    const { rerender } = renderHook(
      ({ dep }) => useDebouncedEffect(effectFn, [dep], 300),
      {
        initialProps: { dep: "a" },
      },
    );

    vi.advanceTimersByTime(100); // タイマー途中で依存変化
    rerender({ dep: "b" });

    vi.advanceTimersByTime(100); // ここでもまだ実行されない
    expect(effectFn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(200); // 合計300ms経過 → 実行される
    expect(effectFn).toHaveBeenCalledTimes(1);
  });

  it("should call cleanup function when deps change", () => {
    const cleanupFn = vi.fn();
    const effectFn = vi.fn(() => cleanupFn);

    const { rerender } = renderHook(
      ({ dep }) => useDebouncedEffect(effectFn, [dep], 300),
      {
        initialProps: { dep: "x" },
      },
    );

    // 実行開始
    vi.advanceTimersByTime(300);
    expect(effectFn).toHaveBeenCalledTimes(1);

    // 再実行トリガー
    rerender({ dep: "y" });

    vi.advanceTimersByTime(300);
    expect(effectFn).toHaveBeenCalledTimes(2);

    // cleanupが前回のタイマーで実行されたはず
    expect(cleanupFn).toHaveBeenCalledTimes(1);
  });
});
