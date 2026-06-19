# 📦 Automated Inventory, Warehouse Logistics & Order Fulfillment System

Welcome to my mini-ERP and Warehouse Management System (WMS)! I built this project to challenge myself and level up my backend engineering skills. Instead of building a basic CRUD app, I focused on high-performance database design, data integrity, background automation, and asynchronous events using **NestJS**, **TypeORM**, **PostgreSQL**, and **React**.

---

## 🚀 The Core Mission: Beyond Basic CRUD

When I first started learning backend development, inventory tracking seemed simple: just add a `quantity` column to a `products` table and change it whenever an item sells. 

However, I learned that real-world enterprise applications (like NetSuite or SAP) **never do this**. If two customers buy an item at the exact same millisecond, a basic `UPDATE` query creates a race condition, leading to broken data or negative stock.

To solve this, I designed this platform around a **financial-grade double-entry ledger system**.

### The Ledger Flow
Every single stock activity—whether receiving items, shipping orders, or transferring goods across aisles—is stored as an immutable row inside an `inventory_movements` table. 



* **Receiving Stock:** Inserts a positive entry (`+50`)
* **Shipping Goods:** Inserts a negative entry (`-5`)
* **Current Balances:** Calculated on the fly using SQL aggregation (`SUM(quantity)`).

---

## 🛠️ The Tech Stack

* **Backend Framework:** NestJS (TypeScript)
* **Database Layer:** PostgreSQL + TypeORM
* **Automation Engines:** `@nestjs/schedule` (Cron Jobs) & `@nestjs/event-emitter`
* **Frontend UI:** React (TypeScript) + Tailwind CSS
* **Data Grid Engine:** TanStack Table (`@tanstack/react-table`)

---

## 📁 System Architecture & File Structure

I chose a modular directory structure. Each domain area (Products, Inventory, Replenishment) acts as its own self-contained module package, ensuring code remains highly decoupled and clean.

```text
warehouse-system/
├── backend/                  # NestJS Application
│   ├── src/
│   │   ├── common/           # Shared modules (Database setups, Seed controllers)
│   │   ├── products/         # Product structures & catalog configuration
│   │   ├── inventory/        # The Ledger Engine (Movement logs, manual transfer transactions)
│   │   └── replenishment/    # CRON evaluations & automated Purchase Order generations
└── frontend/                 # React Dashboard Client
    └── src/
        ├── features/         # Feature-focused modules (Inventory grids, statistics boards)
        └── components/       # Shared UI nodes