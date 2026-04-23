# ArchDraw — project-coordinator STATUS

Daily backlog state per `PROJECT_COORDINATOR.md` §9. Most recent day at the top.

---

## 2026-04-23 — Step 0: manual seeded

### Moved to in-progress today
- **T0.1** — Land `PROJECT_COORDINATOR.md` at repo root (companion to `AGENTS.md`). — `project-coordinator`
- **T0.2** — Seed `STATUS.md` per §9 reporting cadence. — `project-coordinator`
- **P0-2** — Snohomish County registry entry. — `site-intel` (dispatching after Step 0 lands)
- **P0-3 Bellevue** — Bellevue WA zoning matrix entry. — `zoning-legal` (dispatching after Step 0 lands)

### Moved to done today
- *(pending first commit)*

### Blockers surfaced
- **P0-1 Hosted-key auth** — fully blocked until the human owner resolves Section 7-A (single-file vs split), 7-C (model routing), and Section 8 Q1 (pricing / trial allowance).
- **P0-6 Reconcile two Vercel projects** — fully blocked until the human owner answers Section 8 Q6 (`archdraw` vs `production` canonical).
- **Branch convention conflict** — manual §5.1 prescribes `agent/<agent-name>/<slug>` feature branches; operator instructions for this session require all work on `claude/project-coordinator-manual-5yfgo`. Operator wins for this session; manual convention resumes after merge.

### Decisions awaiting the human owner
1. §7-A single-file constraint — keep / split data only / migrate to framework (blocks P0-1).
2. §7-B TypeScript migration — defer OK but needed by P1.
3. §7-C model routing — Sonnet-for-all vs per-task-class routing (blocks P0-1 cost model).
4. §8 Q1 pricing — free trial quota + paid tier price (blocks P1-1 Stripe).
5. §8 Q6 Vercel canonical — `archdraw` or `production` (blocks P0-6).
6. §8 Q2–Q5 — branding, geographic expansion order, architect-partnership model, E&O insurance timing. Not blocking P0 data work; flagged for eventual answer.

### Launch checklist (§6) delta
No boxes checked this cycle. First data-coverage checkbox is gated on P0-2 (Snohomish in `county-registry.js`) completing.

---
