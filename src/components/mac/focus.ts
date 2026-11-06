/** Keeps Tab and Shift+Tab cycling inside `root`, for modal panels. Call from its keydown handler. */
export function trapTab(event: React.KeyboardEvent, root: HTMLElement | null) {
  if (event.key !== "Tab" || !root) return;
  const focusable = [...root.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], video[controls], [tabindex='0']")];
  if (!focusable.length) return;
  const at = focusable.indexOf(document.activeElement as HTMLElement);
  event.preventDefault();
  focusable[(at + (event.shiftKey ? -1 : 1) + focusable.length) % focusable.length].focus();
}
