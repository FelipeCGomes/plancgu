/* A P4 usa exclusivamente o styles.css principal do app. */
(() => {
  const ids=["p4TrackerStyle","p4EnhanceStyle","p4LayoutFixStyle","p4SummaryFixStyle"];
  function cleanup(){ids.forEach(id=>document.getElementById(id)?.remove());}
  cleanup();
  queueMicrotask(cleanup);
  window.addEventListener("cgu-cloud-ready",cleanup);
  window.CGU_cleanupDiscursiveStyles=cleanup;
})();
