# Cynbit Backend Technical Audit

Passive, authorized-style assessment of the publicly observable backend behaviour of https://www.cynbit.in:
architecture, API/Server Action behaviour, security headers, email/DNS, data handling and performance.

> Only passive techniques were used. No exploitation, fuzzing, load, or access to non-public areas.

## Deliverables
| Deliverable | Location |
|---|---|
| Backend technical audit report (architecture, payloads) | [`docs/AUDIT_REPORT.md`](docs/AUDIT_REPORT.md) |
| Security and performance findings (categorized, with IDs) | Sections 3.1 to 3.4 of the report |
| Recommended improvements + code | [`recommendations/`](recommendations) |
| Reproducible passive checks | [`scripts/passive_audit.sh`](scripts/passive_audit.sh) |

## Top findings
1. **EML-01 (High):** SPF authorizes GoDaddy only, but mail is hosted on Microsoft 365, with `-all` hard-fail.
2. **PERF-01 (High impact):** a 1.1 MB render-blocking icon font drives FCP 8.2 s / LCP 9.0 s (score 57).
3. **SEC-01 (Medium):** no CSP, framing protection, COOP or nosniff headers.
4. **EML-02 (Medium):** DMARC `p=none` without reporting.
5. **API-01..03 (Medium, verify):** forms are Next.js Server Actions; abuse controls and validation need confirming.

## Run the checks
```bash
./scripts/passive_audit.sh cynbit.in
```
