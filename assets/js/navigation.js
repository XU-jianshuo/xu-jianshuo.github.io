document.addEventListener("DOMContentLoaded", () => {
  const root = document.documentElement;
  root.classList.add("js");

  const themeButton = document.querySelector("[data-theme-toggle]");
  const storedTheme = localStorage.getItem("site-theme");
  if (storedTheme) root.dataset.theme = storedTheme;
  themeButton?.setAttribute("aria-pressed", String(root.dataset.theme === "dark"));
  themeButton?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("site-theme", next);
    themeButton.setAttribute("aria-pressed", String(next === "dark"));
  });

  const toggle = document.querySelector("[data-nav-toggle]");
  const navigation = document.querySelector("[data-navigation]");
  if (!toggle || !navigation) return;

  const closeMenu = () => {
    navigation.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    navigation.classList.toggle("is-open", !isOpen);
    toggle.setAttribute("aria-expanded", String(!isOpen));
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      toggle.focus();
    }
  });
});
