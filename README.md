# FHIR API Automation Tests (Cypress + TypeScript)

![Cypress Tests](https://github.com/jaganatwork/fhir-api-tests-cypress/actions/workflows/cypress.yml/badge.svg)

Automated tests for **HL7 FHIR R4** REST endpoints using **Cypress**.  
Covers CRUD + search flows for core resources against the public **HAPI FHIR R4** server.

---

### ✅ Features

- ✅ **Resources covered:** Patient, Condition (CRUD + search)
- ✅ **Reporting:** Mochawesome merged HTML report
- ✅ **CI/CD:** GitHub Actions (headless Electron)

**Default base URL:** [https://hapi.fhir.org/baseR4](https://hapi.fhir.org/baseR4)  
_(Configured in `cypress.config.ts`)_

---

## 📘 Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Install & Run](#install--run)
- [Run a Specific Spec](#run-a-specific-spec)
- [Reports](#reports)
- [Continuous Integration](#continuous-integration)
- [Configuration](#configuration)
- [Tests Overview](#tests-overview)
  - [Patient](#patient)
  - [Condition](#condition)
- [Roadmap](#roadmap)
- [Notes](#notes)
- [Author](#author)

## 🗂️ Project Structure

```text
fhir-api-tests-cypress/
├── cypress/
│   ├── e2e/
│   │   └── api/
│   │       ├── patient.basic.cy.ts   # Patient search (Bundle) checks
│   │       ├── patient.crud.cy.ts    # Patient CRUD + verify deletion
│   │       └── condition.crud.cy.ts  # Condition CRUD + search
│   ├── reports/      # Mochawesome JSON & HTML (generated)
│   ├── screenshots/  # Failure screenshots (generated)
│   └── videos/       # Videos if enabled (generated)
├── .github/
│   └── workflows/
│       └── cypress.yml   # CI pipeline (GitHub Actions)
├── .gitignore
├── cypress.config.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🧰 Prerequisites

- **Node.js 20+** (Codespaces image already includes it)
- Internet access (tests call the public [HAPI FHIR server](https://hapi.fhir.org/baseR4))

---

## ⚙️ Install & Run

### 🪜 Install dependencies

```bash
npm install
```

### 🏃 Run all specs (headless Electron)

```bash
npm test
# or
npx cypress run --browser electron --headless
```

### ▶️ Run a Specific Spec

**Patient CRUD only:**

```bash
npx cypress run --spec "cypress/e2e/api/patient.crud.cy.ts"
```

**Condition CRUD only:**

```bash
npx cypress run --spec "cypress/e2e/api/condition.crud.cy.ts"
```

You can also use globs, e.g.:

```bash
npx cypress run --spec "cypress/e2e/api/*.cy.ts"
```

---

## 📊 Reports

This project uses Mochawesome. After a run:

- **Merged HTML report:**  
  `cypress/reports/final/merged.html`

To open it locally (Linux example):

```bash
"$BROWSER" cypress/reports/final/merged.html
```

In CI, the HTML report is uploaded as a workflow artifact.

---

## 🔄 Continuous Integration

- GitHub Actions workflow: `.github/workflows/cypress.yml`
- Installs dependencies
- Runs Cypress headless (Electron)
- Merges Mochawesome JSON reports
- Generates and uploads HTML report artifact

---

## ⚙️ Configuration

- **Base URL:** set in `cypress.config.ts` (defaults to `https://hapi.fhir.org/baseR4`)
- **Content-Type:** all requests send `application/fhir+json`
- **Artifacts ignored:** `.gitignore` excludes videos, screenshots, and reports:
  ```
  node_modules/
  cypress/reports/
  cypress/videos/
  cypress/screenshots/
  ```

## 🧪 Tests Overview

### 🏥 Patient

**Files:**

- `cypress/e2e/api/patient.basic.cy.ts`

  - `GET /Patient?_count=1` returns a Bundle with entries

- `cypress/e2e/api/patient.crud.cy.ts`
  - **Create:** `POST /Patient` → 201, capture id
  - **Read:** `GET /Patient/{id}` → 200, resourceType=Patient
  - **Update:** `PUT /Patient/{id}` → 200/201, updated name asserted
  - **Delete:** `DELETE /Patient/{id}` → 200/204
  - **Verify deletion:** `GET /Patient/{id}` → 404 or 410 (Gone)  
    _(HAPI FHIR returns 410 for deleted resources)_

**Example snippet:**

```typescript
cy.request({
  method: "POST",
  url: "/Patient",
  body: {
    resourceType: "Patient",
    name: [{ family: "Naganathan", given: ["Jagan"] }],
    gender: "male",
    birthDate: "1980-12-25",
  },
  headers: { "Content-Type": "application/fhir+json" },
}).then((res) => {
  expect(res.status).to.eq(201);
  const patientId = res.body.id;
  Cypress.env("patientId", patientId);
});
```

---

### 🩺 Condition

**File:**

- `cypress/e2e/api/condition.crud.cy.ts`
  - **Create:** `POST /Condition` (e.g., clinicalStatus active)
  - **Read:** `GET /Condition/{id}`
  - **Update:** `PUT /Condition/{id}` (switch to resolved)
  - **Delete:** `DELETE /Condition/{id}` → 200/204
  - **Verify deletion:** `GET /Condition/{id}` → 404 or 410
  - **Search:** `GET /Condition?_count=5` → Bundle with entries

**Example snippet:**

```typescript
cy.request({
  method: "POST",
  url: "/Condition",
  body: {
    resourceType: "Condition",
    clinicalStatus: {
      coding: [
        {
          system: "http://terminology.hl7.org/CodeSystem/condition-clinical",
          code: "active",
        },
      ],
    },
    code: { text: "Hypertension" },
    subject: { reference: "Patient/example" },
  },
  headers: { "Content-Type": "application/fhir+json" },
}).then((res) => {
  expect(res.status).to.eq(201);
  const conditionId = res.body.id;
  Cypress.env("conditionId", conditionId);
});
```

---

## 🛣️ Roadmap

- Add CRUD + search for:
  - Observation
  - MedicationRequest
  - Encounter
- Add environment config via `cypress.env.json`
- Optional: schema validation (Zod or official FHIR JSON Schemas)
- Optional: data fixtures for broader coverage & repeatability
- Optional: matrix CI (Node 18 & 20)

---

## 📝 Notes

- Public HAPI FHIR server is shared by many users; expect occasional rate limits or variability.
- For delete verification, tests accept 404 or 410:
  - **404 Not Found:** resource not present
  - **410 Gone:** resource existed but is now deleted (typical for HAPI)

---

## 👤 Author

Jagannathan Naganathan  
Senior SDET Lead – FHIR Patient Data Services  
Built with Cypress, TypeScript, and GitHub Actions.
