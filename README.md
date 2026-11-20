# Student Portal

A React/Vite student administration portal. It starts directly on the dashboard and uses in-memory browser state only; it has no login, API server, or MongoDB connection.

## Run locally

1. Install dependencies with `npm install`.
2. Start the app with `npm run dev`.

Student, attendance, fee, document, and notification changes are kept only for the current browser session and reset when the page reloads. Use the local JSON backup screen to download a copy of the current session data.

## Features

- Dashboard, student registration and management, profiles, ID cards, and reports.
- In-session attendance, fees, documents, and notifications.
- Download and restore a JSON backup for the current browser session.
