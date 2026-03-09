"use client";

import { useEffect } from "react";

export function ScrollRestoration() {
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const savedY = sessionStorage.getItem("scroll-y");
    if (!savedY) return;

    const targetY = Number(savedY);
    let attempts = 0;
    const maxAttempts = 60;

    const restore = () => {
      const maxScrollableY =
        document.documentElement.scrollHeight - window.innerHeight;

      const nextY = Math.min(targetY, Math.max(0, maxScrollableY));

      window.scrollTo(0, nextY);

      const closeEnough = Math.abs(window.scrollY - nextY) < 2;
      const pageReady = maxScrollableY >= targetY || closeEnough;

      attempts += 1;

      if (pageReady || attempts >= maxAttempts) {
        sessionStorage.removeItem("scroll-y");
        return;
      }

      requestAnimationFrame(restore);
    };

    requestAnimationFrame(restore);
  }, []);

  return null;
}