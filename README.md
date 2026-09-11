# FormReady

A free, privacy-first web app that gets your photo, signature, and documents ready for Indian government exam and job portals — entirely in your browser.

## What is FormReady?

Government exam and job portals (SSC, IBPS, RRB, UPSC, and dozens of others) each demand a photo and signature in an exact pixel size and file-size range, and reject anything that doesn't match — often with no useful error message. FormReady fixes that in under a minute per document.

Every resize, crop, and compression step happens **on your device**. Nothing you upload is ever sent to a server — there's no backend at all. You can verify this yourself: open your browser's network tab while using the tool and you'll see zero requests carrying image or file data.

### Module A — Photo & Signature Resizer

Pick your exam and get a preset tuned to its exact requirements — pixel dimensions, file-size range, background, and format — sourced from official notifications (with a source link and last-verified date on every preset, so you can double-check before submitting).

Currently covers:

| Exam | Documents |
|---|---|
| SSC CGL | Signature |
| SSC CHSL | Signature |
| IBPS PO | Photo, Signature, Thumb impression, Declaration |
| IBPS Clerk | Photo, Signature, Thumb impression, Declaration |
| RRB NTPC | Signature |
| RRB Group D | Signature |
| UPSC CSE | Photo, Signature |

(SSC and RRB no longer accept a pre-made photo upload for these exams — their application forms capture a live photo via webcam instead, which is why those don't have a photo preset here.)

Can't find your exam? Use **Custom size** to enter the exact requirements yourself, or use **Request an exam** to ask for a preset to be added.

### Module B — PDF Toolkit

- **Compress PDF** to a target size (100KB / 200KB / 500KB / 1MB / custom) — tries re-encoding images first to keep text selectable, and only rasterizes pages as a last resort, with a clear warning if it does
- **Images to PDF** — turn photos of documents into a single PDF, one page per image
- **Merge PDF** — combine 2–20 PDFs in the order you choose
- **ID card on one page** — place the front and back of an ID card on a single A4 page at true card size

## How to use it

1. Open the app and either pick your exam from the list, or open **PDF tools** for the PDF utilities.
2. **Photo/signature flow:** take a photo or choose one from your gallery → crop it to the guided frame → download. The file is already the exact size and format your exam needs.
3. **PDF tools:** upload your file(s), adjust settings if needed (target size, page order, rotation), and download.

Everything runs client-side, so it works on a phone browser as well as desktop, and keeps working after the page has loaded once even if your connection drops.

## Getting started (development)

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local dev server |
| `npm run build` | Production build (static export, output in `out/`) |
| `npm run start` | Serve the production build locally |
| `npm run typecheck` | TypeScript check with no emit |
| `npm run lint` | ESLint |
| `npm run validate-presets` | Validate all preset data against the schema and flag stale ones |

### Environment variables

Copy `.env.example` to `.env.local` and fill in once you have real values — everything has a safe placeholder fallback, so the app builds and runs without any of these set.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Used in `robots.txt` and `sitemap.xml` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Enables Plausible analytics when set; left unset, analytics stays off |
| `NEXT_PUBLIC_PRESET_REQUEST_EMAIL` | Inbox the "request a preset" form mails to |

## Tech stack

- **Next.js** (static export — no server, no backend) + TypeScript + Tailwind CSS
- **Canvas API** + a Web Worker for image resizing/compression (binary-search JPEG quality to hit an exact KB window)
- **pdf-lib** and **pdf.js** (lazy-loaded) for the PDF toolkit
- **react-easy-crop** for the guided crop UI

## Project structure

```
presets/          Exam preset data (JSON) + Zod schema + loader
src/engine/        Image processing engine (crop, resize, encode, signature cleanup)
src/pdf-engine/     PDF processing engine (compress, merge, images-to-PDF, ID card)
src/app/            Next.js App Router pages — one per exam preset and per PDF tool
src/components/     UI components
src/lib/            Shared helpers (analytics, validation, site config)
```

## Disclaimer

FormReady is an independent project and is not affiliated with, endorsed by, or connected to any government body, exam conducting authority, or recruitment board. Preset specifications are provided as a convenience — always confirm dimensions, file size, and format against your exam's official notification before submitting your application.
