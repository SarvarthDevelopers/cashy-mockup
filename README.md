# Cashy Hub

A modern deal management and wizard builder platform for Cashy — built with React, TypeScript, and Vite.

## Overview

Cashy Hub is the internal operations interface for the Cashy pawn/deal workflow. It includes:

- **Deal Kanban Board** — Visual pipeline for tracking deals across workflow stages (Inbox → Research → Pricing → Verification → Payout → Storage)
- **Deal Wizard Modal** — Full-screen guided wizard for creating and progressing deals through each operational step
- **Wizard Builder** — Template configuration tool for customising deal workflows per item category (Cars, Watches, Electronics, Luxury Goods)
- **Design System** — Shared component library with design tokens, colour themes, and reusable UI components

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8
- **Routing**: React Router v7
- **Animations**: Motion (Framer Motion)
- **Drag & Drop**: React DnD (HTML5 Backend)
- **Icons**: Lucide React
- **Styling**: Vanilla CSS with design tokens

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Production Build

```bash
npm run build
```

Output is in the `dist/` directory.

### Type Check

```bash
npm run typecheck
```

## Project Structure

```
src/
├── components/
│   ├── Board/              # Kanban board and column components
│   ├── Button/             # Button component
│   ├── Card/               # Deal card components
│   ├── DealWizardModal/    # Deal creation and progression wizard
│   ├── Header/             # Top navigation
│   ├── TaskCard/           # Task card components
│   ├── Tabs/               # Tab navigation components
│   ├── Toast/              # Toast notification system
│   ├── WizardBuilder/      # Field builder components for wizards
│   └── WizardBuilderAdmin/ # Wizard template admin interface
├── data/
│   ├── mockData.ts         # Deal mock data
│   ├── mockCustomers.ts    # Customer mock data
│   ├── wizardData.ts       # Wizard template configuration
│   └── ...
├── pages/
│   ├── LandingPage.tsx     # Main kanban board view
│   └── AdminBuilderPage.tsx # Wizard builder page
├── tokens/
│   └── variables.css       # Design system tokens
└── App.tsx                 # Root application with routing
```

## Environment

No environment variables are required for local development. The app uses local browser storage (`cashy_wizards_v2`) to persist wizard templates.

## Deployment

This project is configured for deployment on **Vercel**. See `vercel.json` for configuration.
