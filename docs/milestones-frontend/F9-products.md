# F9 — Products

**Status:** TODO
**Port from:** `frontend/prototype/QUID Products.dc.html` — build the page as designed.

## Objective
A product catalog the AI can answer about. Each product carries an **AI status** (whether the agent's knowledge base can confidently field questions about it), tying the catalog to the RAG layer.

## ⚠️ Backend dependency (does not exist yet)
There is currently **no `Product` entity** in the backend. This milestone needs a backend companion (track as **M13 — Product catalog**):
- `Product` entity scoped to `Workspace`: `name`, `category`, `price`, `stock`, `aiStatus`.
- CRUD at `/api/products` (Page, workspace-scoped, no N+1).
- `aiStatus` is derived/maintained from whether the product is represented in an agent's `KnowledgeBase` (links Products → RAG). Exact derivation TBD with backend.

## Prototype layout
"Products" title + 4 stat tiles (`Total products` 128, `In stock` 112, `Low stock` 11, `Out of stock` 5), searchable/filterable table with columns **Product · Category · Price · Stock · AI status**, footer "Showing 8 of 128 products".

## Design → API adaptation
| Prototype | DTO source (`ProductResponse`) |
|---|---|
| stat tiles | counts by stock bucket (total / inStock / lowStock / outOfStock) |
| Product | `name` (+ thumbnail/initials) |
| Category | `category` |
| Price | `price` → currency format |
| Stock | `stock` → in/low/out badge by threshold |
| AI status | `aiStatus` enum → badge (e.g. "AI ready" / "No data") |

- Stock badge tiers and AI-status colors live in `products/adapters.ts` (no logic in components).
- Search by name/category via query param; pagination via the table footer count.

## Code structure
- `types/products.ts` (`ProductResponse`), `features/products/adapters.ts`, `hooks.ts`, `components/` (`ProductTable`, `ProductRow`, `ProductStats`). Reuse `StatCard` from F1.

## Definition of Done
- Page matches the Products prototype, both themes.
- Stat tiles + table show real catalog data once M13 backend lands.
- Stock and AI-status badges render per tier; search + pagination work.
