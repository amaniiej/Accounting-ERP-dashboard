# 📊 Accounting ERP Dashboard (MVP)

Welcome to the **Accounting ERP Dashboard**. This project is a professional-grade, multi-language financial management system designed specifically for the Ethiopian business environment. It handles everything from daily POS transactions to official ERCA-compliant tax reporting.

---

## 🧠 The Architecture: "The Modular Office"
To keep the code clean and prevent the app from "breaking" when we change one button, we use a **Service-Oriented Architecture**. Think of the app like a professional office:

1.  **The Brain (`src/context`)**: Where all files and data are stored in a central safe.
2.  **The Reception (`src/views/marketing`)**: The public face for visitors.
3.  **The Security Gate (`src/views/auth`)**: Where users log in.
4.  **The Main Office (`src/views/dashboard`)**: The private area where work happens.
5.  **The Desk Tools (`src/components/features`)**: Specific tools like the Tax Engine or POS.
6.  **The Building Frame (`src/components/layout`)**: The Sidebar and Header that never move.

---

## 📁 Folder Map: What is where?

### 🌍 `src/views/` (The Big Screens)
*   **`marketing/`**: The Landing Page. This is what a visitor sees first.
*   **`auth/`**: The Login and Sign-up screens.
*   **`dashboard/`**: The "Container" for the ERP. It decides which tool to show on the screen.

### 🧠 `src/context/` (Global Data Store)
*   **`LedgerContext.tsx`**: The most important file. It stores the **Master Ledger** (all transactions), the **User Profile** (Name, TIN, Address), and the **Current Language**. Every other file "plugs in" here to get data.

### 🛠️ `src/components/` (Building Blocks)
*   **`layout/`**: The "Skeleton." Contains the `Sidebar` (navigation), `Header` (titles/search), and `DashboardLayout` (the glassy background and spacing).
*   **`features/`**: The actual ERP tools:
    *   `dashboard/`: General overview cards.
    *   `money-flow/`: POS system and cash-flow analyzer.
    *   `tax/`: Live Ethiopian Tax engine and legal database.
    *   `report/`: Official A4 document generator.
    *   `invoices/`: The professional Invoice creator.

### 🗣️ `src/i18n/` (Translations)
*   **`translations.ts`**: All text in English, Amharic, Oromo, Tigrinya, and Somali live here. UI files have **no hardcoded text**, making typos easy to fix in one place.

### 📋 `src/types/` (The Standards)
*   **`index.ts`**: Defines exactly what a "Transaction" or a "Profile" looks like. This keeps the frontend and the future backend perfectly synced.

---

## 🛠️ Developer "How-To" Guide

### 1. How do I add a new tool to the Sidebar?
1.  Create your new logic file in `src/components/features/new-tool/`.
2.  Add a new ID and Icon to the list in `src/components/layout/Sidebar.tsx`.
3.  Open `src/views/dashboard/DashboardMain.tsx` and add your tool to the "Switch" logic so it knows to display it when clicked.

### 2. How do I change the Company Name or TIN?
You don't need to hunt through pages. Just update the `initialProfile` object in `src/context/LedgerContext.tsx`. The name will automatically update on the **Home Screen**, the **Invoice**, and the **Final Report**.

### 3. Why are we using "Inline Styles" instead of Tailwind CSS?
To ensure the dashboard is **bulletproof**. Inline styles (`style={{...}}`) are standard JavaScript. They won't "explode" or disappear if a CSS library fails to load. This makes our MVP extremely stable and easy to move between different computers.

### 4. How does navigation work?
We use a state called `activeTab` inside the `LedgerContext`. 
*   **Sidebar** changes the `activeTab`.
*   **DashboardMain** watches that state and swaps the content in the middle of the screen.

---

## 🚀 The Backend Roadmap (Phase 3)
We are currently moving from "Fake Data" to a real system:
*   **Supabase Auth**: To handle real user accounts and secure logins.
*   **Supabase Database**: To store transactions permanently so they don't disappear on refresh.
*   **n8n Automation**: To send automated SMS receipts and monthly tax reminders.

---

### ⚠️ Important Rule for Contributors
> **"Never put logic in the Layout."** 
> If you are building a calculator, put it in `features/`. If you are changing how the sidebar slides, put it in `layout/`. Keep the "Tools" and the "Frame" separate!

---