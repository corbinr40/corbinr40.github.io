# Availability Badge → Contact Link — Design

**Date:** 2026-08-08
**Branch:** dynamic-overhaul
**Status:** Approved

## Goal

Make the "Available for freelance projects" badge on the Home page a link to
`/contact`, with a slight hover effect signalling clickability.

## Design

- `src/pages/Home.tsx`: the badge `<span>` (inline-styled pill) becomes a
  react-router `<Link to="/contact">` with
  `aria-label="Contact me about freelance work"` and
  `className="availability-badge"`. Inline styles are removed; the
  commented-out pulse-dot markup stays untouched.
- `src/styles/_utilities.scss`: new `.availability-badge` class (placed by the
  existing pulse-dot section) carrying the pill's former inline styles plus:
  - `transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out,
    border-color 0.2s ease-in-out` (matches `.card-hover` timing)
  - `:hover`: `transform: translateY(-2px)`; background
    `rgba(34,197,94,0.15)` → `rgba(34,197,94,0.25)`; border color
    `rgba(34,197,94,0.4)` → `rgba(34,197,94,0.6)`
  - `text-decoration: none` and `color: #22c55e` on base and hover (defends
    against global link styling).

## Verification

`npm run build` passes; in `npm run dev`, hovering the badge lifts/deepens it
and clicking navigates to `/contact` client-side.
