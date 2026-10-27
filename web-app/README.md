# CampusMI Web Application

This directory contains the deployed Next.js application for Campus Maintenance Intelligence.

## Run locally

```bash
npm install
npm run dev
```

## Gemini configuration

Set `GEMINI_API_KEY` in your local environment or deployment provider. The key is used only by the server-side API routes and must not be committed to Git.

The chatbot uses `gemini-flash-lite-latest` by default. Set `GEMINI_MODEL` to use another supported Gemini model.
