# CampusFound — LPU Lost & Found prototype

A responsive React + TypeScript campus lost-and-found prototype.

## Run locally
1. Install Node.js (LTS).
2. Extract this folder.
3. Open a terminal in the project folder.
4. Run `npm install`
5. Run `npm run dev`
6. Open the local URL printed by Vite (usually http://localhost:5173).

## Included
- Responsive homepage, browse board, report form, item details, how-it-works, login and dashboard.
- Search, status/category filters and sorting.
- New reports are saved in browser localStorage.
- Demo login is local-only; it is not secure authentication.
- Claim requests are demo interactions and are not yet stored centrally.

## Important prototype limitations
This is a frontend prototype. Data is stored only in the current browser/device. To make it a real multi-user campus service, connect Supabase:
- Authentication with university email verification.
- Database tables for profiles, items, claims and report status.
- Storage bucket for item photos with upload size/type validation.
- Row-level security policies so private claim information is not public.
- Admin/moderator review and report abuse handling.

The site is a student-built prototype and is not an official LPU service.
