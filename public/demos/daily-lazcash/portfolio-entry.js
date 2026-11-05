// Preserve the portfolio's supplied dashboard deep link in the offline export.
if (window.location.hash.startsWith("#dashboard")) {
  const observer = new MutationObserver(() => {
    const button = [...document.querySelectorAll("nav button")].find(
      (item) => item.textContent.trim() === "数据看板",
    );
    if (!button) return;
    observer.disconnect();
    button.click();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  window.setTimeout(() => observer.disconnect(), 15000);
}
