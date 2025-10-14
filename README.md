# 🧪 FHIR API Tests (Cypress + TypeScript)

Comprehensive end-to-end API tests that validate an open [FHIR R4](https://www.hl7.org/fhir/) server using **Cypress** with **TypeScript**. The suite focuses on high-value Patient and Condition workflows, provides rich Mochawesome HTML/JSON reports, and is ready to drop into continuous integration pipelines.

---

## 🚀 Why this project?

Healthcare APIs that implement the FHIR specification must remain interoperable, predictable, and performant. This repository demonstrates how to:

- Exercise live FHIR endpoints with smoke, validation, and CRUD coverage.
- Enforce schema expectations such as resource types, required demographics, and response metadata.
- Chain requests to verify workflow integrity (e.g., create → read → update → delete).
- Produce developer-friendly test evidence via Mochawesome reports.

Use it as a starter kit for your own FHIR API regression suite or as a learning resource for Cypress-based API testing.

---

## 📁 Project structure

```
├── cypress.config.ts        # Cypress configuration (baseUrl, reporter, spec pattern)
├── cypress
│   ├── e2e
│   │   ├── patient.smoke.cy.ts     # Quick availability check for the /Patient endpoint
│   │   └── api
│   │       ├── patient.basic.cy.ts # Field-level validation for Patient bundles
│   │       ├── patient.crud.cy.ts  # Full CRUD workflow covering POST/GET/PUT/DELETE
│   │       └── condition.crud.cy.ts # Extendable space for Condition tests
│   └── support
│       └── e2e.ts                  # Shared hooks/commands (currently minimal)
├── package.json             # NPM scripts for running tests and generating reports
├── tsconfig.json            # TypeScript compiler options for Cypress
└── README.md
```

> ℹ️ Place additional specs under `cypress/e2e/` and Cypress will automatically pick them up, thanks to the `specPattern` in `cypress.config.ts`.

---

## 🧰 Prerequisites

- **Node.js 18+** (aligns with the Cypress 15 runtime requirements)
- **npm 9+**
- Optional: **VS Code** with the *Cypress* and *ESLint* extensions for a better editing experience

Check your versions:

```bash
node --version
npm --version
```

---

## 🛠️ Installation & setup

1. **Install dependencies** (uses lockfile for reproducibility):
   ```bash
   npm ci
   ```

2. **Configure the target FHIR server** (optional). By default the tests hit the public [HAPI FHIR R4](https://hapi.fhir.org/baseR4) sandbox. Override the base URL with an environment variable:
   ```bash
   export CYPRESS_baseUrl="https://your.fhir.server/baseR4"
   ```
   > On Windows PowerShell use: `setx CYPRESS_baseUrl "https://your.fhir.server/baseR4"`

3. **(Optional) Seed test data** if your environment requires specific fixtures. The existing tests create and clean up their own Patients, but you may need to ensure reference data such as linked Practitioners exist.

---

## ▶️ Running the tests

### Headless execution (CI-friendly)

```bash
npm run cy:run
```

This command uses Electron in headless mode and writes raw Mochawesome JSON reports to `cypress/reports/`.

### Generate human-friendly HTML reports

After running the suite, aggregate and render the results:

```bash
npm run report:merge   # merge all JSON outputs into a single file
npm run report:html    # create the final HTML report in cypress/reports/final
```

To perform the entire cycle in one command:

```bash
npm test
```

Open `cypress/reports/final/mochawesome.html` in your browser to review pass/fail status, screenshots (if enabled), and logs.

### Interactive mode (for local debugging)

While the project is optimized for headless runs, you can still leverage the Cypress GUI:

```bash
npx cypress open
```

Select **E2E Testing**, choose a browser, and run individual specs. Any environment variables (like `CYPRESS_baseUrl`) you export beforehand will still apply.

---

## 🧪 Included test coverage

| Spec file | Focus | Highlights |
|-----------|-------|------------|
| `patient.smoke.cy.ts` | Availability smoke | Ensures `/Patient?_count=1` responds with a Bundle containing at least one entry. |
| `api/patient.basic.cy.ts` | Schema & data validation | Confirms response headers, resourceType, presence of demographic fields, and allowed gender codes for multiple patients. |
| `api/patient.crud.cy.ts` | End-to-end workflow | Demonstrates POST, GET, PUT, DELETE on `/Patient` with state persisted between tests and deletion verification. |
| `api/condition.crud.cy.ts` | (Template) | Scaffold for expanding coverage to Condition resources. |

Extend coverage by following the [Writing new tests](#-writing-new-tests) section below.

---

## 🧾 Configuration reference

- **`cypress.config.ts`**
  - `baseUrl`: defaults to `https://hapi.fhir.org/baseR4`; override via `CYPRESS_baseUrl`.
  - `specPattern`: targets all `cypress/e2e/**/*.cy.ts` files.
  - `reporter`: `mochawesome` with JSON output (merge + HTML generation handled by scripts).
  - `video`: disabled for faster API runs—toggle to `true` if you want request/response videos for debugging.

- **TypeScript support**: `tsconfig.json` configures Cypress types so you get autocompletion and compile-time checks.

---

## ✍️ Writing new tests

1. **Create a new spec** under `cypress/e2e/`. Example: `cypress/e2e/api/observation.smoke.cy.ts`.
2. **Use `cy.request`** for HTTP interactions. It automatically handles cookies, logging, and assertions.
3. **Share data between tests** with `Cypress.env()` if you implement multi-step workflows (see `patient.crud.cy.ts`).
4. **Add domain-specific assertions**—verify both HTTP status codes and FHIR resource fields (e.g., `resourceType`, mandatory elements, coding systems).
5. **Log meaningful steps** using `cy.log()` to enhance report readability.

> Tip: Cypress retries assertions automatically. Combine with `.its()` and `.should()` chains for concise validations.

---

## 🔄 Continuous integration

- **GitHub Actions**: Drop this repo into a workflow that runs `npm ci` followed by `npm test`. Archive `cypress/reports/final` as an artifact or publish it with Pages.
- **Docker**: Use the official `cypress/included:15.4.0` image for consistent CI environments.
- **Parallelization**: Cypress Dashboard or a custom orchestrator can parallelize spec files to reduce total runtime.

Example GitHub Actions job:

```yaml
jobs:
  api-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test
      - uses: actions/upload-artifact@v4
        with:
          name: fhir-api-report
          path: cypress/reports/final
```

---

## 🧰 Troubleshooting

| Symptom | Possible cause | Suggested fix |
|---------|----------------|---------------|
| `CypressError: cy.request() failed... getaddrinfo ENOTFOUND` | Base URL not reachable | Confirm `CYPRESS_baseUrl` is correct and the server is accessible from your network/CI. |
| HTTP 401/403 responses | Authentication required | Inject auth headers via `cy.request({ headers: { Authorization: "Bearer ..." } })` or configure `Cypress.env()` secrets. |
| Mochawesome report is empty | No tests executed or JSON not generated | Ensure `npm run cy:run` completed successfully before running report scripts. |
| `node` binary missing | Node.js not installed in CI | Install Node 18+ using the platform-appropriate installer or CI setup action. |

---

## 📚 Helpful references

- [FHIR R4 Specification](https://www.hl7.org/fhir/)
- [Cypress API Testing Guide](https://docs.cypress.io/guides/testing-strategies/api-testing)
- [Mochawesome Reporter Documentation](https://github.com/adamgruber/mochawesome)

---

## 🤝 Contributing

1. Fork the repository and create a feature branch.
2. Follow the existing code style (TypeScript + Cypress best practices).
3. Add or update tests and documentation as needed.
4. Submit a PR with a clear description, including environment prerequisites if applicable.

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) (add one if your fork requires explicit licensing).

