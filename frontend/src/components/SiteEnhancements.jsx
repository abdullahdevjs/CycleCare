import { useEffect, useState } from "react";

function SiteEnhancements() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const updateScrollState = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = documentHeight > 0 ? (scrollTop / documentHeight) * 100 : 0;

      setScrollProgress(Math.min(100, Math.max(0, progress)));
      setShowTop(scrollTop > 650);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  useEffect(() => {
    const revealTargets = document.querySelectorAll(
      ".section-eyebrow, .hero-eyebrow, .hero h1, .hero-description, .hero-actions, .hero-trust, .why-cyclecare-story, .how-step, .feature-card, .product-showcase-copy, .product-dashboard, .wellness-image-wrapper, .wellness-content, .privacy-panel, .privacy-note, .final-cta-content, .final-cta-side, .footer-brand, .footer-column, .footer-developer"
    );

    revealTargets.forEach((element) => element.classList.add("cc-reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("cc-reveal-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -45px 0px" }
    );

    revealTargets.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handlePointerMove = (event) => {
      document.documentElement.style.setProperty("--cc-mouse-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--cc-mouse-y", `${event.clientY}px`);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const backToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <div
        className="cc-scroll-progress"
        aria-hidden="true"
        style={{ width: `${scrollProgress}%` }}
      />

      {showTop && (
        <button
          type="button"
          className="cc-back-to-top"
          onClick={backToTop}
          aria-label="Back to top"
        >
          <span aria-hidden="true">↑</span>
        </button>
      )}
    </>
  );
}

export default SiteEnhancements;
