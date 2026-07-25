---
name: ethical-hacking-methodology
description: "Master the complete penetration testing lifecycle from reconnaissance through reporting. This skill covers the five stages of ethical hacking methodology, essential tools, attack techniques, and professional reporting for authorized security assessments."
risk: offensive
source: community
author: zebbern
date_added: "2026-02-27"
---

> AUTHORIZED USE ONLY: Use this skill only for authorized penetration testing engagements, defensive validation, or controlled educational environments.

# Ethical Hacking Methodology

## Purpose

Master the complete penetration testing lifecycle from reconnaissance through reporting. This skill covers the five stages of ethical hacking methodology, essential tools, attack techniques, and professional reporting for authorized security assessments.

## Prerequisites

### Required Environment
- Kali Linux installed (persistent or live)
- Network access to authorized targets
- Written authorization from system owner

### Required Knowledge
- Basic networking concepts
- Linux command-line proficiency
- Understanding of web technologies
- Familiarity with security concepts

## Outputs and Deliverables

1. **Reconnaissance Report** - Target information gathered
2. **Vulnerability Assessment** - Identified weaknesses
3. **Exploitation Evidence** - Proof of concept attacks
4. **Final Report** - Executive and technical findings

## Core Workflow

### Phase 1: Understanding Hacker Types

Classification of security professionals:

**White Hat Hackers (Ethical Hackers)**
- Authorized security professionals
- Conduct penetration testing with permission
- Goal: Identify and fix vulnerabilities
- Also known as: penetration testers, security consultants

**Black Hat Hackers (Malicious)**
- Unauthorized system intrusions
- Motivated by profit, revenge, or notoriety
- Goal: Steal data, cause damage
- Also known as: crackers, criminal hackers

**Grey Hat Hackers (Hybrid)**
- May cross ethical boundaries
- Not malicious but may break rules
- Often disclose vulnerabilities publicly
- Mixed motivations

**Other Classifications**
- **Script Kiddies**: Use pre-made tools without understanding
- **Hacktivists**: Politically or socially motivated
- **Nation State**: Government-sponsored operatives
- **Coders**: Develop tools and exploits

### Phase 2: Reconnaissance

Gather information without direct system interaction:

**Passive Reconnaissance**
```bash
# WHOIS lookup
whois target.com

# DNS enumeration
nslookup target.com
dig target.com ANY
dig target.com MX
dig target.com NS

# Subdomain discovery
dnsrecon -d target.com

# Email harvesting
theHarvester -d target.com -b all
```

**Google Hacking (OSINT)**
```
# Find exposed files
site:target.com filetype:pdf
site:target.com filetype:xls
site:target.com filetype:doc

# Find login pages
site:target.com inurl:login
site:target.com inurl:admin

# Find directory listings
site:target.com intitle:"index of"

# Find configuration files
site:target.com filetype:config
site:target.com filetype:env
```

**Google Hacking Database Categories:**
- Files containing passwords
- Sensitive directories
- Web server detection
- Vulnerable servers
- Error messages
- Login portals

**Social Media Reconnaissance**
- LinkedIn: Organizational charts, technologies used
- Twitter: Company announcements, employee info
- Facebook: Personal information, relationships
- Job postings: Technology stack revelations

### Phase 3: Scanning

Active enumeration of target systems:

**Host Discovery**
```bash
# Ping sweep
nmap -sn 192.168.1.0/24

# ARP scan (local network)
arp-scan -l

# Discover live hosts
nmap -sP 192.168.1.0/24
```

**Port Scanning**
```bash
# TCP SYN scan (stealth)
nmap -sS target.com

# Full TCP connect scan
nmap -sT target.com

# UDP scan
nmap -sU target.com

# All ports scan
nmap -p- target.com

# Top 1000 ports with service detection
nmap -sV target.com

# Aggressive scan (OS, version, scripts)
nmap -A target.com
```

**Service Enumeration**
```bash
# Specific service scripts
nmap --script=http-enum target.com
nmap --script=smb-enum-shares target.com
nmap --script=ftp-anon target.com

# Vulnerability scanning
nmap --script=vuln target.com
```

**Common Port Reference**
| Port | Service | Notes |
|------|---------|-------|
| 21 | FTP | File transfer |
| 22 | SSH | Secure shell |
| 23 | Telnet | Unencrypted remote |
| 25 | SMTP | Email |
| 53 | DNS | Name resolution |
| 80 | HTTP | Web |
| 443 | HTTPS | Secure web |
| 445 | SMB | Windows shares |
| 3306 | MySQL | Database |
| 3389 | RDP | Remote desktop |

### Phase 4: Vulnerability Analysis

Identify exploitable weaknesses:

**Automated Scanning**
```bash
# Nikto web scanner
nikto -h http://target.com
```

### MITRE ATT&CK Framework Integration
Document how professional pentesters use MITRE ATT&CK:
- ATT&CK Matrix overview (Tactics → Techniques → Sub-techniques)
- Key Tactics relevant to pentesting:
  - TA0001 Initial Access
  - TA0003 Persistence
  - TA0004 Privilege Escalation
  - TA0005 Defense Evasion
  - TA0008 Lateral Movement
  - TA0010 Exfiltration
- How to reference ATT&CK IDs in professional reports (e.g., "T1078 - Valid Accounts")
- ATT&CK Navigator for visualizing coverage
- Threat-informed testing: simulating specific threat actor TTPs

### Phase 5: Vulnerability Analysis (Expanded)
Document the professional vulnerability analysis process:
- OpenVAS/Greenbone for network vulnerability scanning
- Metasploit Framework: db_nmap → vulns → search → use → info (reference workflow, not payload code)
- Nikto web scanner command reference: `nikto -h <target> -o report.html -Format html`
- searchsploit for CVE lookup: `searchsploit <service> <version>`
- Manual verification importance: why automated scanners have false positives
- Vulnerability prioritization matrix: CVSS score × exploitability × business impact
- Chaining concept: combining multiple low-severity findings for higher impact

### Phase 6: Professional Reporting
Full reporting framework:
- **Report Structure**:
  1. Cover page (scope, dates, assessor, classification)
  2. Executive Summary (2 pages max, business language)
  3. Risk Rating Summary (table of all findings)
  4. Detailed Findings (one page per vulnerability)
  5. Remediation Roadmap (prioritized fix list)
  6. Appendices (raw tool output, scope confirmation)
- **Finding Template** (for each vulnerability):
  - Finding ID, Title, Severity (CVSS)
  - Affected Systems
  - Description
  - Evidence (screenshot/request-response)
  - Business Impact
  - Remediation Recommendation
  - References (CVE, CWE, OWASP)
- **CVSS v3.1 Quick Reference**: AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H = 9.8 Critical
- **DREAD scoring** (alternative): Damage + Reproducibility + Exploitability + Affected Users + Discoverability

### Phase 7: Legal & Ethics Framework
- Pre-engagement checklist: authorization letter, scope document, NDA
- Rules of Engagement template items: no DoS, no production data exfil, report critical findings immediately
- Incident response during pentest: what to do if you find active breach
- Evidence handling: chain of custody, encryption, retention policy
- Regulatory context: GDPR implications, PCI DSS scope, HIPAA considerations

### Tool Reference Table
Create a comprehensive table:
| Phase | Tool | Purpose | Key Command/Usage |
|-------|------|---------|-------------------|
| Recon | theHarvester | Email/domain recon | `theHarvester -d domain.com -b all` |
| Recon | Shodan | Internet-exposed services | Web UI or `shodan host <IP>` |
| Recon | Maltego | Relationship mapping | GUI tool |
| Scanning | Nmap | Port/service discovery | `nmap -sV -sC -oA output target` |
| Scanning | Masscan | Fast port scanning | `masscan -p1-65535 target --rate=1000` |
| Web | Nikto | Web server scan | `nikto -h http://target` |
| Web | WhatWeb | Technology fingerprinting | `whatweb target.com` |
| Reporting | Dradis | Collaboration + reporting | Web UI |
| Reporting | PlexTrac | Modern reporting platform | SaaS |

### Continuous Learning Resources
- PortSwigger Web Security Academy (free, hands-on labs)
- Hack The Box (practical machine labs)
- TryHackMe (guided learning paths)
- Offensive Security PEN-200/OSCP certification path
- PTES (pentest-standard.org) full methodology documentation
- OWASP Testing Guide (WSTG) v4.2
