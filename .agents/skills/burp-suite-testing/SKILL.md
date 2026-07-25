---
name: burp-suite-testing
description: "Execute comprehensive web application security testing using Burp Suite's integrated toolset, including HTTP traffic interception and modification, request analysis and replay, automated vulnerability scanning, and manual testing workflows."
risk: offensive
source: community
author: zebbern
date_added: "2026-02-27"
---

> AUTHORIZED USE ONLY: Use this skill only for authorized security assessments, defensive validation, or controlled educational environments.

# Burp Suite Web Application Testing

## Purpose

Execute comprehensive web application security testing using Burp Suite's integrated toolset, including HTTP traffic interception and modification, request analysis and replay, automated vulnerability scanning, and manual testing workflows. This skill enables systematic discovery and exploitation of web application vulnerabilities through proxy-based testing methodology.

## Inputs / Prerequisites

### Required Tools
- Burp Suite Community or Professional Edition installed
- Burp's embedded browser or configured external browser
- Target web application URL
- Valid credentials for authenticated testing (if applicable)

### Environment Setup
- Burp Suite launched with temporary or named project
- Proxy listener active on 127.0.0.1:8080 (default)
- Browser configured to use Burp proxy (or use Burp's browser)
- CA certificate installed for HTTPS interception

### Editions Comparison
| Feature | Community | Professional |
|---------|-----------|--------------|
| Proxy | ✓ | ✓ |
| Repeater | ✓ | ✓ |
| Intruder | Limited | Full |
| Scanner | ✗ | ✓ |
| Extensions | ✓ | ✓ |

## Outputs / Deliverables

### Primary Outputs
- Intercepted and modified HTTP requests/responses
- Vulnerability scan reports with remediation advice
- HTTP history and site map documentation
- Proof-of-concept exploits for identified vulnerabilities

## Core Workflow

### Phase 1: Intercepting HTTP Traffic

#### Launch Burp's Browser
Navigate to integrated browser for seamless proxy integration:

1. Open Burp Suite and create/open project
2. Go to **Proxy > Intercept** tab
3. Click **Open Browser** to launch preconfigured browser
4. Position windows to view both Burp and browser simultaneously

#### Configure Interception
Control which requests are captured:

```
Proxy > Intercept > Intercept is on/off toggle

When ON: Requests pause for review/modification
When OFF: Requests pass through, logged to history
```

#### Intercept and Forward Requests
Process intercepted traffic:

1. Set intercept toggle to **Intercept on**
2. Navigate to target URL in browser
3. Observe request held in Proxy > Intercept tab
4. Review request contents (headers, parameters, body)
5. Click **Forward** to send request to server
6. Continue forwarding subsequent requests until page loads

#### View HTTP History
Access complete traffic log:

1. Go to **Proxy > HTTP history** tab
2. Click any entry to view full request/response
3. Sort by clicking column headers (# for chronological order)
4. Use filters to focus on relevant traffic

### Phase 2: Modifying Requests

#### Intercept and Modify
Change request parameters before forwarding:

1. Enable interception: **Intercept on**
2. Trigger target request in browser
3. Locate parameter to modify in intercepted request
4. Edit value directly in request editor
5. Click **Forward** to send modified request

#### Common Modification Targets
| Target | Example | Purpose |
|--------|---------|---------|
| Price parameters | `price=1` | Test business logic |
| User IDs | `userId=admin` | Test access control |
| Quantity values | `qty=-1` | Test input validation |
| Hidden fields | `isAdmin=true` | Test privilege escalation |

#### Example: Price Manipulation

```http
POST /cart HTTP/1.1
Host: target.com
Content-Type: application/x-www-form-urlencoded

productId=1&quantity=1&price=100

# Modify to:
productId=1&quantity=1&price=1
```

Result: Item added to cart at modified price.

### Phase 3: Setting Target Scope

#### Define Scope
Focus testing on specific target:

1. Go to **Target > Site map**
2. Right-click target host in left panel
3. Select **Add to scope**
4. When prompted, click **Yes** to exclude out-of-scope traffic

#### Filter by Scope
Remove noise from HTTP history:

1. Click display filter above HTTP history
2. Select **Show only in-scope items**
3. History now shows only target site traffic

#### Scope Benefits
- Reduces clutter from third-party requests
- Prevents accidental testing of out-of-scope sites

### Phase 4: Burp Suite Extensions (BApp Store)
Document these key professional extensions:
- **Logger++** — Advanced logging with grep patterns for finding sensitive data in responses
- **Turbo Intruder** — High-speed fuzzing for rate limit bypass testing
- **Autorize** — Automated authorization testing (IDOR/BOLA detection)
- **Active Scan++** — Enhanced scanner with additional checks
- **JWT Editor** — JWT token inspection and manipulation for testing JWT vulnerabilities
- **InQL** — GraphQL security testing scanner
- **Param Miner** — Discover hidden parameters

### Phase 5: API Security Testing Workflow
Document the professional workflow for:
- Importing OpenAPI/Swagger specs into Burp (Proxy → Options → OpenAPI parser)
- Testing REST endpoints systematically (one by one from Site Map)
- GraphQL introspection testing (GET /graphql?query={__schema{types{name}}})
- WebSocket connection testing (Proxy → WebSockets history)
- JWT inspection workflow (decode, verify signature, test alg:none)
- OAuth 2.0 flow analysis (authorization code, implicit flow testing)

### Phase 6: OWASP 2025 Testing Reference
Create a table mapping each OWASP 2025 category to Burp Suite testing approach:
| OWASP Category | Burp Tool/Feature | What to Test |
|---|---|---|
| A01 Broken Access Control | Repeater + Autorize | IDOR, privilege escalation |
| A02 Security Misconfiguration | Scanner + manual | Headers, CORS, info disclosure |
| A03 Supply Chain | Site Map | Third-party JS, CDN resources |
| A04 Injection | Intruder + Scanner | SQL, XSS, XXE, SSTI payloads |
| A05 Security Design Flaws | Manual | Logic flaws, workflow bypass |
| A06 Vulnerable Components | Site Map + Scanner | Outdated libraries, CVE matching |
| A07 Auth Failures | Repeater | Session fixation, weak tokens |
| A08 Data Integrity | Repeater | Serialization, update integrity |
| A09 Logging Failures | Manual | Error verbosity, log injection |
| A10 Exceptional Conditions | Intruder | Error handling, edge cases |

### Phase 7: Professional Reporting Standards
- Report structure: Executive Summary, Scope, Methodology, Findings, Remediation
- CVSS v3.1 scoring guide (Base Score components)
- Finding severity levels: Critical (9-10), High (7-8.9), Medium (4-6.9), Low (0.1-3.9)
- Evidence collection: screenshots, HTTP request/response pairs, reproduction steps
- Remediation recommendations format: Short-term (patch), Long-term (architecture)
- PortSwigger Web Security Academy as ongoing learning resource

### Professional Checklist (Pre-Engagement)
- [ ] Written authorization signed by system owner
- [ ] Scope document with IP ranges and domains in-scope/out-of-scope
- [ ] Emergency contact and safe harbor clause
- [ ] Burp Suite project file created with client name
- [ ] Scope configured in Target → Scope
- [ ] Out-of-scope filtering enabled
- [ ] Collaborative sessions configured (if team engagement)
- [ ] Report template prepared
