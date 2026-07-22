document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  root.classList.add("js");

  const filterGroup = document.querySelector("[data-project-filters]");
  const cards = [...document.querySelectorAll("[data-category]")];
  const empty = document.querySelector(".filter-empty");
  if (!filterGroup || cards.length === 0) return;

  filterGroup.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;

    const filter = button.dataset.filter;
    let visibleCount = 0;
    filterGroup.querySelectorAll("button[data-filter]").forEach((item) => {
      item.setAttribute("aria-pressed", String(item === button));
    });

    cards.forEach((card) => {
      const categories = (card.dataset.category || "").split(/\s+/);
      const matches = filter === "all" || categories.includes(filter);
      card.hidden = !matches;
      if (matches) visibleCount += 1;
    });

    if (empty) empty.hidden = visibleCount !== 0;
  });
});
