"use client";

import { useEffect, useRef, useState } from "react";
import { warmUpApi } from "../services/apiClient";

type WarmupState = "idle" | "warming" | "ready" | "failed";

const WARMUP_VISIBILITY_DELAY_MS = 1200;
const PROGRESS_DURATION_MS = 60000;
const PROGRESS_INTERVAL_MS = 500;
const MAX_WARMING_PROGRESS = 92;

export default function ApiWarmupBanner() {
  const [state, setState] = useState<WarmupState>("idle");
  const [showBanner, setShowBanner] = useState(false);
  const [progress, setProgress] = useState(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    let cancelled = false;
    const visibilityTimer = window.setTimeout(() => {
      if (!cancelled) {
        setShowBanner(true);
        setState("warming");
      }
    }, WARMUP_VISIBILITY_DELAY_MS);

    const warm = async () => {
      try {
        await warmUpApi();
        if (cancelled) return;
        window.clearTimeout(visibilityTimer);
        setState("ready");
        window.setTimeout(() => {
          if (!cancelled) setShowBanner(false);
        }, 900);
      } catch (error) {
        console.error("API warm-up failed:", error);
        if (cancelled) return;
        setState("failed");
        setShowBanner(true);
      }
    };

    warm();

    return () => {
      cancelled = true;
      window.clearTimeout(visibilityTimer);
    };
  }, []);

  useEffect(() => {
    if (state !== "warming" || !showBanner) return;

    const startedAt = Date.now();
    setProgress(8);

    const progressTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const nextProgress = Math.min(
        MAX_WARMING_PROGRESS,
        Math.round((elapsed / PROGRESS_DURATION_MS) * 100)
      );
      setProgress(Math.max(8, nextProgress));
    }, PROGRESS_INTERVAL_MS);

    return () => window.clearInterval(progressTimer);
  }, [state, showBanner]);

  useEffect(() => {
    if (state === "ready") {
      setProgress(100);
    } else if (state === "failed") {
      setProgress(MAX_WARMING_PROGRESS);
    } else if (state === "idle") {
      setProgress(0);
    }
  }, [state]);

  if (!showBanner) return null;

  const isReady = state === "ready";
  const isFailed = state === "failed";
  const showProgress = state === "warming" || isReady || isFailed;

  return (
    <div className="fixed left-1/2 top-[7.25rem] z-[80] w-[calc(100%-1.5rem)] max-w-sm -translate-x-1/2 rounded-[22px] border border-[rgba(34,34,34,0.09)] bg-[#faf9f5] px-3 py-2 text-sm text-[#222222] shadow-lg sm:bottom-6 sm:top-auto sm:px-4 sm:py-3">
      <div className="flex items-start gap-3">
        {!isReady && !isFailed && (
          <span className="mt-0.5 h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-[#bd6325] border-r-transparent" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold">
            {isReady
              ? "Bakery is ready"
              : isFailed
              ? "Still warming up"
              : "Warming up the bakery..."}
          </p>
          <p className="text-xs text-[#5d6043]">
            {isFailed
              ? "Please give us a moment and try again."
              : isReady
              ? "Fresh treats are loading now."
              : "This can take up to a minute."}
          </p>
          {showProgress && (
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#b9aca2]/40">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isFailed ? "bg-[#b9aca2]" : "bg-[#bd6325]"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
