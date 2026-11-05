# Book Tracker

A personal, browser-local reading library built with React, TypeScript, Vite, Tailwind CSS, Zustand, and Dexie.

## Features

- Search Google Books and Open Library for titles, covers, descriptions, and catalogue ratings when available.
- Keep a device-local Want to Read list and mark books as read.
- Rate read books from S through D, or choose Dislike and save a reason.
- Add personal notes and trope tags; use the complete library as context for Gemini recommendations.
- Browse and filter the library, arrange books on a tier board, and add recommendations to Want to Read.

## Run Locally

Requires Node.js 22 or later.

```powershell
npm ci
npm run dev
```

Run production checks with `npm run build` and `npm run lint`.

## Gemini

Add a Google Gemini API key in Settings. The key is stored in this browser's local storage and sent directly from the browser to Google. When generating recommendations, the app sends book titles, reading statuses, ratings, dislike reasons, tropes, and all non-empty personal notes to Gemini. No app server or intermediary receives them.

Create and manage keys in [Google AI Studio](https://aistudio.google.com/app/apikey). The model ID can be changed in Settings if the default is unavailable to your key.

## Local Data

The book library is stored in this browser's IndexedDB. Gemini settings use local storage. There are no accounts, cloud backups, exports, or device synchronization. Clearing browser data or switching browsers/devices will not carry the library over.

Catalogue ratings are shown with their source when supplied by Google Books or Open Library. Goodreads is not scraped.

## Install as an App

Book Tracker is a progressive web app. On a supported browser, use its install option to add the app to your device. The service worker keeps the app shell and previously loaded static assets available offline; catalogue search and Gemini recommendations still require an internet connection.

## GitHub Pages

The `pages.yml` workflow builds and publishes the app to GitHub Pages whenever changes are pushed to `main`. In repository settings, set **Pages > Build and deployment > Source** to **GitHub Actions**. Hash-based routes and relative asset paths support project-site URLs.
