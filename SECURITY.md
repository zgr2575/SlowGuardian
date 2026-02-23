# Security Policy

## Supported Versions

The following versions of SlowGuardian currently receive security updates:

| Version  | Supported          |
| -------- | ------------------ |
| >= 9.0.0 | :white_check_mark: |
| >= 7.0.0 | :white_check_mark: |
| >= 6.0.0 | :x:                |
| >= 5.0.0 | :x:                |
| < 5.0.0  | :x:                |

If you are running an unsupported version, please upgrade to v9 before reporting issues.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.** Public disclosure before a fix is available puts all users at risk.

### Private Disclosure

To report a security vulnerability privately:

1. Open a [GitHub Security Advisory](https://github.com/zgr2575/SlowGuardian/security/advisories/new) — this keeps the report private until a patch is released.
2. Alternatively, contact the maintainer directly via the contact details on their GitHub profile.

### What to Include

When reporting a vulnerability, please provide:

- **Description** — A clear summary of the vulnerability
- **Affected versions** — Which versions are impacted
- **Severity** — Your assessment (Critical / High / Medium / Low)
- **Steps to reproduce** — Minimal, numbered steps to trigger the issue
- **Proof of concept** — Code or screenshots demonstrating the exploit (if available)
- **Suggested fix** — If you have one

### Response Timeline

- **Acknowledgment**: within 72 hours of receiving the report
- **Status update**: within 7 days with an assessment and planned timeline
- **Fix release**: depends on severity — critical issues are patched as soon as possible

### Disclosure Policy

We follow coordinated disclosure. Once a fix is released, we will:

1. Publish a GitHub Security Advisory with full details
2. Credit the reporter (unless they prefer anonymity)
3. Release a patched version

We ask that reporters do not publicly disclose the vulnerability until a fix has been released, or until 90 days have passed from the initial report (whichever comes first).
