Production-Grade Ecommerce Admin Dashboard Architecture

Next.js App Router · Tailwind 4 · shadcn/ui · TanStack Table · nuqs · Auth.js · Drizzle · Recharts · UploadThing


1. ORM Recommendation: Drizzle over Prisma
Use Drizzle. Here's why at scale:

Schema lives in TypeScript — no separate .prisma DSL, no codegen step in CI
Queries are SQL-first and composable; you get raw SQL predictability with TS safety
Bundle size is ~7x smaller than Prisma Client (no query engine binary)
Works natively with edge runtimes (Cloudflare Workers, Vercel Edge) — Prisma requires a separate adapter
Drizzle's $inferSelect / $inferInsert types integrate directly with Zod via drizzle-zod, eliminating schema duplication

Prisma is fine for teams that want a higher-level DX and don't need edge. But for this stack, Drizzle wins on control and performance.

2. Folder Architecture
admin/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx                  # Public layout (no sidebar)
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Protected layout — sidebar, topbar
│   │   ├── page.tsx                    # /  → redirect to /dashboard
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Analytics overview (RSC)
│   │   ├── products/
│   │   │   ├── page.tsx                # Products list — TanStack Table
│   │   │   ├── new/
│   │   │   │   └── page.tsx            # Create product form
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Edit product form
│   │   │       └── delete/
│   │   │           └── route.ts        # DELETE endpoint (if not using SA)
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── inventory/
│   │       └── page.tsx
│   │
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts            # Auth.js handler
│
├── components/
│   ├── ui/                             # shadcn/ui copied components
│   ├── layout/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   └── breadcrumb.tsx
│   ├── data-table/
│   │   ├── data-table.tsx              # Generic TanStack Table wrapper
│   │   ├── data-table-toolbar.tsx
│   │   ├── data-table-pagination.tsx
│   │   ├── data-table-column-header.tsx
│   │   └── data-table-faceted-filter.tsx
│   ├── products/
│   │   ├── product-form.tsx
│   │   ├── product-columns.tsx
│   │   └── product-image-upload.tsx
│   ├── orders/
│   │   ├── order-columns.tsx
│   │   └── order-status-badge.tsx
│   └── charts/
│       ├── revenue-chart.tsx
│       ├── orders-chart.tsx
│       └── stats-cards.tsx
│
├── lib/
│   ├── auth.ts                         # Auth.js config
│   ├── db/
│   │   ├── index.ts                    # Drizzle client
│   │   ├── schema/
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   ├── users.ts
│   │   │   └── index.ts                # Re-export all
│   │   └── migrations/
│   ├── validations/                    # Shared Zod schemas
│   │   ├── product.ts
│   │   ├── order.ts
│   │   └── auth.ts
│   └── utils.ts
│
├── actions/                            # Server Actions
│   ├── products.ts
│   ├── orders.ts
│   └── inventory.ts
│
├── hooks/
│   ├── use-data-table.ts               # nuqs + TanStack Table integration
│   └── use-debounce.ts
│
├── store/                              # Zustand (minimal)
│   └── ui-store.ts                     # sidebar state, modals
│
├── types/
│   └── index.ts
│
└── middleware.ts                       # Auth + RBAC route protection

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
