When a user or employee initiates a standard deal, the createDeal method executes the following steps in order. If the deal’s durationInDays &gt; 0, it defaults to PAWN, else PURCHASE.

---

## 1 - Summary (One Line)

Create Deal is a single modal/slide-over that collects customer, deal metadata, items, transport & payout info, runs the calculation, validates category-specific rules (cars, electronics, luxury), and then creates a Deal (PAWN or PURCHASE) by calling the legacy-compatible createDeal pipeline.

---

## 2 - Entry Points and Visibility

**Entry points:**

- Top-bar Create Deal CTA
- Kanban "+" in column header (admin/staff)
- Deals list "New Deal"

**Who sees it:**

- Admins and staff (internal users)
- Partner users do not create deals in Phase-1

**Modes:**

- Quick Create (minimal fields, for fast in-store intake)
- Full Create (default; all fields and validations)
- Custom Deal (appraisal mode — creates Custom Deal entity instead)

---

## 3 - Overall UX Pattern

**Desktop:**

- Slide-over modal with two panes 
  - Left: form (accordion/sections)
  - Right: live summary & calculation results

**Mobile:**

- Stepper flow (Customer → Items → Terms → Review → Create)

**Autosave:**

- Draft saved on every change

**Final action:**

- Create Deal button triggers server validation and final create

---

## 4 - Form Sections and Exact Fields

### A. Header / Top Controls

- Title: Create Deal
- Deal Mode selector: Pawn / Purchase / Custom Deal (auto-computed from Duration but editable)
- Save Draft
- Cancel

### B. Customer Block (Required)

**Customer Mode:**

- Registered / Guest / Create New

**Registered:**

- Typeahead search → customerId
- Show masked contact
- Click to reveal

**Guest:**

- Email (required)
- Phone (optional)

**Create New:**

- First name
- Last name
- Email
- Phone

**Customer flags:**

- VIP (read-only)
- Blacklist (read-only)

### C. Deal Metadata (Required)

- Company (dropdown) — required
- Branch / Shop (dropdown) — required
- Business Area (auto from item categories; editable) — required
- Deal Source (In-store / Web / App / Custom)
- Booking Number — placeholder until server generates
- Creation Date — auto now (editable only by admin)
- Duration (days) — numeric 
  - If &gt;0 → Pawn
  - If 0/blank → Purchase
- Pawn Due Date — computed live from Duration and Creation Date
- Payout Type — Cash / Bank Transfer / PayPal 
  - If Bank → IBAN field shown

### D. Items (Repeatable; At Least One Required)

**For each item card:**

- Category (cascading selector) — required
- Variant (catalog lookup) — optional
- Item Title — editable (Jewellery override)
- Quantity — default 1

**Condition questions:**

- Dynamic per category (electronics, cars, luxury)

**Identifiers:**

- VIN (cars)
- EAN / IMEI (electronics)

**Uploads:**

- Photos
- Documents (categorized)

**Cars:**

- Require: 
  - purchase_contract
  - registration_certificate_1
  - registration_certificate_2
  - assessment_57_a flags (as applicable)

**Electronics:**

- Picea diagnostic upload link allowed

**Luxury:**

- Weight / karat fields

- Material metrics

- Requested payout (optional) — numeric

- Estimated market value — prefilled from calculators where available

### E. Transport & Payment

- Pickup method:

  - Shop Dropoff
  - Standard Shipment
  - Storebox

- Payout method:

  - Cash
  - IBAN
  - PayPal

- IBAN validated

### F. Workflow & Flags

- Initial Column / Stage (dropdown) — default by Business Area
- Priority — Low / Medium / High
- Partner visibility toggle (if applicable)
- Internal notes (free text)

### G. Right Pane: Live Calculation & Warnings

**Deal Calculation:**

- Call `getDealCalculation`
- Shows: 
  - Total market value
  - Max LTV
  - Suggested payout
  - Fees

**Validation warnings:**

- Missing mandatory uploads
- Minimum value violations
- VIN mismatch
- Company switch warnings

**Actions:**

- "Fix issues" anchors to offending fields

---

## 5 - Exact Create Flow (Step Sequence)

 1. User opens Create Deal (modal)
 2. User fills Customer + Deal metadata (autosave)
 3. User adds one or more Items (each item validated client-side)
 4. Client calls pre-flight calculation (`GET /calc?payload=...`)
 5. If calculation fails → show error and block create
 6. Client runs category-specific validations: 
    - Cars: required docs
    - Electronics: Picea parse
    - Luxury: material metrics
 7. User reviews right-pane calculation and warnings
 8. User clicks Create Deal → client sends final payload to `POST /deals`
 9. Server validates again (atomic checks): 
    - Minimum values
    - VIN checks
    - IBAN format
    - Required uploads
10. Server creates deal in DB inside transaction: 
    - Generates bookingNumber
    - Creates items
    - Moves uploads to permanent storage
    - Sets storage labels
11. Server publishes `DEAL_ADDED` event and returns created dealId
12. Client navigates to Deal Wizard
13. Timeline shows "Deal Created" event

---

## 6 - API Payload Mapping (Key Fields)

```json
{
  "customerId": "cust_123" | null,
  "guestCustomerData": { "email": "", "phone": "" } | null,
  "company": "CASHY_AUT",
  "branch": "Vienna",
  "businessArea": "Automotive",
  "durationInDays": 90,
  "payoutData": { "method": "IBAN", "iban": "AT..." },
  "pickupData": { "type": "SHOP" },
  "requestedItems": [
    {
      "categoryId": "cat_456",
      "variantId": "var_789",
      "title": "Rolex Submariner",
      "quantity": 1,
      "conditionAnswers": {},
      "identifiers": { "vin": "", "imei": "" },
      "uploads": [
        { "tempFileId": "tmp_1", "type": "registration_certificate_1" }
      ],
      "requestedPayout": 1200
    }
  ],
  "initialColumn": "Research",
  "priority": "Medium",
  "notes": "..."
}
```

**Response:**

- 201 Created

- { dealId, bookingNumber, createdAt }

## 7 - Validations (Client + Server)

### Client Validations (Preventive)

- Customer present (registered or guest email)
- At least one item with category
- Duration numeric
- If &gt;0 → Pawn flows shown
- IBAN format when selected
- Required uploads present for cars/luxury

### Server Validations (Authoritative)

- `getDealCalculation` must succeed
- `getMinimumItemValueRecursively` must pass (or require manager override)
- VIN uniqueness/format checks for cars
- Company/branch allowed for item
- No company switch if item continues to be used
- Atomic transaction for `bookingNumber` generation

---

## 8 - Category-Specific Rules

### Cars

- Route through `createCarDeal` wrapper
- Require `vehicleData` and mandatory docs
- Block company switch if "continue using item" flag set

### Electronics

- Call Picea parse if diagnostic uploaded
- Use EAN/IMEI for variant matching

### Luxury

- Allow title override
- Material metrics required
- Compute isInvestmentGold flag

---

## 9 - Timeline / Audit Events

- Deal Created (actor, source, initial payload)
- Deal Calculation Run (calculationId, inputs/outputs)
- Item Created per item (itemId, category)
- Uploads Attached events for each file
- BookingNumber Assigned (`bookingNumber`)
- `DEAL_ADDED` pubsub event published

---

## 10 - Notifications

- Phase-1: 
  - Internal Slack/email to responsible channel (if column mapping requires it)
- Do not send customer notifications in Phase-1

---

## 11 - Edge Cases & Error Handling

- **Calculation fails:**

  - Show error
  - Block create
  - Allow Save Draft

- **Missing mandatory car docs:**

  - Block create
  - Show clear list

- **Minimum value violation:**

  - Block create or require manager override

- **Concurrent bookingNumber race:**

  - Use atomic counter/transaction

- **Upload move failure:**

  - Rollback DB transaction
  - Surface error

- **Partial network failure (mobile):**

  - Autosave locally
  - Retry on reconnect

---

## 12 - Mobile Specifics

- Stepper UI with camera capture for uploads
- Compact summary replaces right pane
- Large file uploads use resumable upload
- Show progress
- Validation per step

---

## 13 - Permissions & Roles

- Create Deal:

  - Allowed for staff and admin

- Partner users:

  - Cannot create deals in Phase-1

- Manager override:

  - Required for minimum value exceptions
  - UI shows "Request override" flow

---

## 14 - Test Cases (Must Pass)

- Create Pawn deal with one electronics item → calculation returns suggested payout → deal created
- Create Purchase deal (duration 0) → `dealType = PURCHASE`
- Create Car pawn without required docs → blocked with clear errors
- Create deal with guest email → `guestCustomerData` saved and deal created
- Concurrent creates → `bookingNumber` uniqueness preserved
- Create with additional payout requested → blocked (only via Extension flow)
- Create Custom Deal mode → creates `CustomDeal` entity, not Deal

---

## 15 - Data Model Notes (Backend)

- Map durationInDays → dealType server-side
- Store businessArea on deal (derived from item categories)
- Persist calculationId and snapshot in deal metadata
- Link uploaded files to media/items/{itemId} after create

---

## 16 - Handoff Artifacts to Produce Next

- JSON schema for the Create Deal payload
- UI wireframes for Desktop and Mobile stepper
- API contract for `POST/deals` and `GET/calc`
- Acceptance test scripts for the test cases above