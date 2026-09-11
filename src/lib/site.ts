/**
 * Domain isn't finalized yet (PRD open question Q6). Set NEXT_PUBLIC_SITE_URL once it is —
 * everything that needs an absolute URL (robots.txt, sitemap) reads from here.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sarkariformedit.example";

/** Inbox for the preset-request form (A15). Swap once a real support address exists. */
export const PRESET_REQUEST_EMAIL =
  process.env.NEXT_PUBLIC_PRESET_REQUEST_EMAIL ?? "presets@sarkariformedit.example";
