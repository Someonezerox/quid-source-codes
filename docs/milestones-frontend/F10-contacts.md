# F10 — Contacts (Customer Profiles & Memory)

**Status:** TODO
**Port from:** `frontend/prototype/QUID Contacts.dc.html`. Backend name is **Customer**; UI label is **Contacts** (keep the prototype's wording).

## Objective
Port the Contacts page and expose the M11 memory system: who the customer is, history, AI-extracted preferences.

## Prototype layout
"Contacts" title, 4 stat tiles (`3,420`, `842`, `318`, `64`), searchable table of contacts.

## Design → API adaptation
| Prototype | DTO source |
|---|---|
| stat tiles | total customers / active / resolved / new (period) |
| table rows | `Customer` — name, telegramId, status (ACTIVE/RESOLVED), lastSeenAt, conversation count |

**Detail view** (`/contacts/:id`) — surface M11:
- Header: name, telegramId, status, last seen.
- **Notes** — editable, auto-save on blur (debounced `PUT /api/customers/{id}`, "Saved" indicator).
- **Preferences** — `CustomerPreference` key/value table; AI-extracted **and** manually editable (`POST`/`DELETE /api/customers/{id}/preferences`).
- **History** — past conversations with `ConversationSummary` snippet (read-only blockquote), status, date; click → opens thread.

**Inbox integration:** also open this as a **right-side drawer** over the thread (`/inbox/:id?contact=true`) so agents get context without leaving the conversation.

## Code structure
- `types/customers.ts`, `features/contacts/adapters.ts` (status→color, time formatting), `hooks.ts`, `components/` (`ContactTable`, `ContactDetail`, `PreferencesTable`, `NotesField`, `HistoryList`, `ContactDrawer`).

## API contract
- `GET /api/customers?search=&page=&size=`, `GET /api/customers/{id}`, `PUT /api/customers/{id}`
- `GET/POST/DELETE /api/customers/{id}/preferences`
- conversation history via inbox API filtered by customer.

## Definition of Done
- Table searchable by name or telegramId; visual match to prototype.
- Notes auto-save; preferences add/delete; history links to thread.
- Contact drawer opens from inside the inbox thread.
