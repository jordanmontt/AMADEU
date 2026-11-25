/**
 * Counts every page shown, including after client-side navigation, which GoatCounter's
 * script cannot see on its own (RF-62). The script is told not to count on load
 * (`no_onload`); each `astro:page-load`, first load included, counts once.
 */
interface GoatCounterApi {
  count: (options: { path: string }) => void;
}

function count(): void {
  const api = (window as unknown as { goatcounter?: Partial<GoatCounterApi> }).goatcounter;
  api?.count?.({ path: `${window.location.pathname}${window.location.search}` });
}

document.addEventListener('astro:page-load', () => {
  const loaded = (window as unknown as { goatcounter?: Partial<GoatCounterApi> }).goatcounter
    ?.count;
  if (loaded !== undefined) {
    count();
    return;
  }
  // The counter script loads asynchronously: count once it is there.
  document.querySelector('script[data-goatcounter]')?.addEventListener('load', count, {
    once: true,
  });
});
