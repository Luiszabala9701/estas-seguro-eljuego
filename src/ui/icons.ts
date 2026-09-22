const paths: Record<string, string> = {
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  folder: '<path d="M3 7V4h7l3 3h8v13H3z"/>',
  sound: '<path d="m11 5-6 4H2v6h3l6 4zM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  mute: '<path d="m11 5-6 4H2v6h3l6 4zM16 9l6 6m0-6-6 6"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V6a4 4 0 0 1 8 0v4m-4 5v2"/>',
  play: '<path d="m8 4 13 8-13 8z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  fingerprint: '<path d="M4 14v-3a8 8 0 0 1 16 0v5M7 19v-8a5 5 0 0 1 10 0v9M10 21V11a2 2 0 0 1 4 0v10M4 18v2"/>',
  warning: '<path d="m12 3 10 18H2zM12 9v5m0 3v1"/>',
  save: '<path d="M4 3h13l4 4v14H3V3zM7 3v7h10V3M7 21v-7h10v7"/>',
  quote: '<path d="M3 6h7v7H6v5H3zm11 0h7v7h-4v5h-3z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4m-4 1v4m-4 3h8"/>',
};
export const icon = (name: string, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] ?? paths.folder}</svg>`;
export const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
