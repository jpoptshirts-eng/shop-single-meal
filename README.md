# Shop Single Meal

Prototype for a single-meal shopping experience, duplicated from Waitrose **Shop by Meals**.

Customers organise meals into folders, create **one meal at a time**, then edit that meal’s ingredients on a dedicated draft page.

## Architecture

```text
Shop Single Meal (folder index)
      ↓
Folder / meal-list page
      ↓
Single meal draft
```

## Develop

```bash
npm install
npm run dev
```

Dev server: `http://localhost:5181`

## Environment

Copy `.env.example` / `.env.local` values for Supabase POPMAS catalog access:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

These are the same Supabase POPMAS catalog credentials used by Shop by Meals. Never commit secrets.
