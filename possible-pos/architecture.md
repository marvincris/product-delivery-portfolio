# POSSible POS — Architecture Overview

## Problem Statement
Small retailers need fast, reliable checkout with inventory accuracy and clear daily reporting. Existing POS systems are either too expensive, too complex, or brittle when connectivity drops.

## Target Users
- **Cashiers**: fast, low-friction checkout and minimal training
- **Store Managers**: inventory visibility, refunds/voids, and shift reporting
- **Owners**: daily performance, margin visibility, and predictable costs

## Core Features (MVP)
- Product lookup and barcode scan
- Cash and card transactions (card processing is out of scope; card entries are recorded for accurate cash-flow reporting)
- Inventory decrement and low-stock alerts
- End-of-day summary, cash drawer close-out, and basic sales reports
- Offline-first checkout with local queueing and sync on reconnect

## High-Level Architecture
**Text Summary**: A Flutter client uses Hive as the local system of record (offline-first). Firebase Firestore is an optional sync layer for premium tiers, with a queue-based sync engine handling uploads/downloads and conflict resolution. The system supports multi-user, multi-store operations with role-based access.

```mermaid
flowchart LR
  subgraph Client
    App[Flutter POS App]
    Hive[Hive Local DB (SSOT)]
    Queue[Sync Queue]
  end

  subgraph Sync
    Orchestrator[Sync Orchestrator]
    Rules[Per-Collection Sync Rules]
  end

  subgraph Cloud
    Firestore[(Firebase Firestore)]
    Auth[Firebase Auth]
  end

  App --> Hive
  App --> Queue
  Queue --> Orchestrator
  Orchestrator --> Rules
  Orchestrator <--> Firestore
  App --> Auth
```

## Data Model (Simplified)
- **Tenant/Store**: tenant_id, store_id, name, settings
- **Product**: id, sku, name, cost, price, active
- **Inventory**: product_id, quantity, reorder_level, store_id
- **Transaction**: id, timestamp, subtotal, tax, total, payment_method, status
- **TransactionItem**: transaction_id, product_id, quantity, unit_price
- **User**: id, name, role, store_assignments
- **SyncQueueItem**: entity_type, entity_id, operation, status, retry_count

## Offline-First & Sync Strategy
- **Hive is the single source of truth** on-device.
- **Firestore is optional** and enabled for premium tiers (multi-user + multi-store).
- **Queue-based sync** persists operations and survives app restarts.
- **Direction rules** vary by dataset (e.g., sales upload-only; products bidirectional).
- **Conflict resolution** uses timestamp/last-write-wins with audit visibility.

## Cash vs Card Transactions
- **Card processing is out of scope** for the app.
- Card transactions are **recorded as payment type entries** to keep cash flow and reporting accurate.
- Integrations are designed to **avoid PCI scope** while maintaining financial integrity.

## Deployment Flow
1. **Client**: Flutter builds for Android and web.
2. **Firebase**: Auth + Firestore enabled for premium sync.
3. **Local-first operation**: Offline mode remains functional without cloud config.
4. **Sync**: Background sync with scheduled intervals and manual trigger.
5. **Observability**: Error tracking + basic usage metrics.

## Tradeoffs & Constraints
- **Offline-first**: required for uninterrupted sales, but adds sync and conflict-resolution complexity.
- **Premium sync**: cloud features are gated to control cost and complexity.
- **Card payments**: card processing is explicitly out of scope; the system records card transactions to keep cash-flow reporting accurate.
- **Cost ceiling**: keep infra under $50/month for single-location MVP.

## Delivery Management & QA Evidence
- **Plan-driven delivery** with architecture plans, implementation checklists, and acceptance criteria.
- **Release discipline** using deployment checklists, rollback notes, and post-release monitoring steps.
- **Testing posture** includes unit/widget/integration coverage with explicit manual testing checklists.
- **Implementation logs** capture decisions, changes, and validation results for traceability.

## Issues Encountered & Resolutions (Non‑Proprietary)
- **Offline-first violations** in inventory flows → enforced Hive‑first writes with background sync only.
- **Chunked sync cursor errors** → corrected cursor handling and validated with targeted tests.
- **Subscription validation drift** → added offline grace period and reconciling checks on reconnect.
- **Payment accuracy without PCI scope** → record card transactions as payment types only; no processing.
- **Peripheral reliability** (Bluetooth printing) → retry logic + diagnostics + clearer status indicators.

## AI vs Human Decisions
**Human-led**
- Product scope, pricing constraints, and success metrics
- Offline-first requirement and conflict resolution rules
- Data model priorities and reporting definitions

**AI-assisted**
- Drafting diagrams and documentation structure
- Generating boilerplate API and validation patterns (reviewed)

## Reference Repository
- https://github.com/MotoLogic-Systems/POSSible

## Website
- Main app: https://possible-1.web.app
- About: https://possible-1.web.app/about.html
- Privacy: https://possible-1.web.app/privacy.html
- Terms: https://possible-1.web.app/terms.html

---

*This document is a clean-room architecture summary with no proprietary code.*
