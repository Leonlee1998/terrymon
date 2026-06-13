# TerryMon

Monorepo for the TerryMon pet membership, grooming POS, vet POS, and future API services.

## Apps

- `terrymon-webapp`: customer-facing Next.js app
- `terrymon-grooming`: grooming POS app
- `terrymon-vet`: veterinary POS app
- `terrymon-api`: reserved for the future API service

## Webapp

```bash
cd terrymon-webapp
npm install
npm run dev
```

Production build:

```bash
cd terrymon-webapp
npm run build
```

## Render

Use the root `render.yaml` Blueprint.

Current webapp service:

- Root Directory: `terrymon-webapp`
- Build Command: `npm ci && npm run build`
- Start Command: `npm start`
- Node Version: `22`

Next.js 16 requires Node `>=20.9.0`, so Node 18 is not supported for this app.

## GitHub

This repository is intended to be pushed as one monorepo:

```bash
git remote add origin https://github.com/Leonlee1998/terrymon.git
git push -u origin main
```
