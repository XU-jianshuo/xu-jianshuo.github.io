document.addEventListener("DOMContentLoaded", () => {
  const progress = document.querySelector("[data-reading-progress]");
  const updateProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
    progress?.style.setProperty("--reading-progress", String(value));
  };
  window.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  const reportNav = document.querySelector("[data-report-nav]");
  const navLinks = [...(reportNav?.querySelectorAll('a[href^="#"]') || [])];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      navLinks.forEach((link) => {
        if (link.getAttribute("href") === `#${visible.target.id}`) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }, { rootMargin: "-15% 0px -65% 0px", threshold: [0, 0.25] });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  const filterBar = document.querySelector("[data-report-filters]");
  const filterCards = [...document.querySelectorAll("[data-category]")];
  filterBar?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    const filter = button.dataset.filter;
    filterBar.querySelectorAll("button[data-filter]").forEach((candidate) => {
      candidate.setAttribute("aria-pressed", String(candidate === button));
    });
    filterCards.forEach((card) => {
      const categories = (card.dataset.category || "").split(/\s+/);
      card.hidden = filter !== "all" && !categories.includes(filter);
    });
  });

  document.querySelectorAll("[data-disclosure-button]").forEach((button) => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    if (!panel) return;
    button.addEventListener("click", () => {
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  });

  const metrics = [...document.querySelectorAll("[data-count-to]")];
  if (!metrics.length) return;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const animateMetric = (element) => {
    const target = Number(element.dataset.countTo);
    if (!Number.isFinite(target) || reducedMotion) {
      element.textContent = element.dataset.countTo;
      return;
    }
    const decimals = String(target).split(".")[1]?.length || 0;
    const start = performance.now();
    const duration = 900;
    const draw = (now) => {
      const progressValue = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = (target * eased).toFixed(decimals);
      if (progressValue < 1) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };
  if (!("IntersectionObserver" in window)) {
    metrics.forEach(animateMetric);
    return;
  }
  const metricObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateMetric(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  metrics.forEach((metric) => metricObserver.observe(metric));
});
