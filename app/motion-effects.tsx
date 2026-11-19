"use client";

import { useEffect } from "react";

/**
 * Efeitos de movimento leves, sem dependências externas.
 * Respeita a preferência do sistema por movimento reduzido.
 */
export default function MotionEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (reduceMotion.matches) return;

    root.classList.add("motion-enabled");

    const revealElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]")
    );

    let observer: IntersectionObserver | undefined;

    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.12,
          rootMargin: "0px 0px -48px 0px",
        }
      );

      revealElements.forEach((element) => observer?.observe(element));
    } else {
      revealElements.forEach((element) => element.classList.add("is-visible"));
    }

    const parallaxElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-parallax]")
    );
    let frame = 0;

    const updateScrollEffects = () => {
      frame = 0;
      const viewportHeight = window.innerHeight || 1;
      const scrollableHeight =
        document.documentElement.scrollHeight - viewportHeight;
      const progress =
        scrollableHeight > 0 ? window.scrollY / scrollableHeight : 0;

      root.style.setProperty("--page-progress", String(progress));

      parallaxElements.forEach((element) => {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < -80 || rect.top > viewportHeight + 80) return;

        const distanceFromCenter =
          rect.top + rect.height / 2 - viewportHeight / 2;
        const offset = Math.max(-18, Math.min(18, -distanceFromCenter * 0.035));
        element.style.setProperty("--parallax-offset", `${offset.toFixed(2)}px`);
      });
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScrollEffects);
    };

    updateScrollEffects();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
      root.classList.remove("motion-enabled");
      root.style.removeProperty("--page-progress");
    };
  }, []);

  return <div className="scroll-progress" aria-hidden="true" />;
}
