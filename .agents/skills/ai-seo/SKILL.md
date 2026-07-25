---
name: ai-seo
description: "Guidelines and instructions for optimizing content, structure, and metadata for AI SEO (GEO)."
---

# AI SEO & Generative Engine Optimization (GEO)

This skill provides best practices for optimizing web content for traditional search engines and AI-driven aggregators (LLMs, AI search bots). As of 2025/2026, the focus has shifted to deep semantic clarity, brand authority, and structured answers over "magic bullet" hacks.

**Key Terminology:**
- **GEO**: Generative Engine Optimization.
- **AEO**: Answer Engine Optimization.

## 1. The Reality of `llms.txt`

- **What it is:** A proposed Markdown standard (`/llms.txt`) to map content for AI models.
- **Current Status (2026):** It is considered **future-proofing**. It has not been officially confirmed as an organic ranking factor by major AI providers yet.
- **When to use it:** Use it strictly for **developer tools, AI coding assistants (like Cursor/Copilot), and internal AI agents** to help them ingest documentation context efficiently.

## 2. Generative Engine Optimization (GEO) Core Principles

Instead of hacking files, optimize the content itself to be highly "digestible" by AI:

### Thinking in Answers, Not Pages
- **Direct Answer First**: Start immediately with a 40-60 word direct, concise answer to the core query, and only elaborate afterward.
- **Modular Chunks**: Break content into 75–300 word modules with clear, question-based headings (e.g., "How do I configure X?").
- **High Information Density**: Eliminate fluff. AI embeddings value facts, data, and unique insights over filler words.
- **Freshness**: Top-cited content in AI engines is almost always updated within the last 30 days. Maintain content freshness.

### Structuring Semantic HTML & Data
- **Structured Data (JSON-LD):** The highest priority schemas are `FAQPage`, `HowTo`, and `Article`. AI parsers read structured data before parsing the DOM.
- **Logical Hierarchy:** Strict `H1 -> H2 -> H3` flows.
- **Semantic Tags:** Use `<main>`, `<article>`, `<section>`, `<nav>` so bots can skip boilerplate.
- **Tables and Lists**: Format complex comparisons in HTML tables and step-by-step guides in `<ol>` lists.

---

## 3. E-E-A-T and Brand Exposure

AI models cite what they trust and what they see frequently in their training data:
- **Original Data**: Original data, statistics, and primary research get the most citations from AI engines. 
- **Experience & Expertise**: Include first-person testing and case studies.
- **Trustworthiness**: Transparent sourcing, clear author credentials, and accurate update dates.
- **Brand Mention Patterns**: Ensure your brand name is syntactically tied to your core value proposition (e.g., "AcmeCorp's high-speed routing...").

---

## 4. Technical AI SEO Foundations

Traditional technical SEO remains the bedrock for AI crawlers:
- **Fast and Accessible:** If a bot cannot render the page quickly or gets blocked by heavy JS, it won't be cited.
- **robots.txt**: Ensure you explicitly ALLOW the following bots to crawl your site:
  - `GPTBot` (OpenAI)
  - `OAI-SearchBot` (OpenAI Search)
  - `PerplexityBot` (Perplexity AI)
  - `ClaudeBot` (Anthropic)
  - `Google-Extended` (Google AI)
- **Clean Sitemaps**: Keep XML sitemaps ruthlessly clean (no 404s, redirects) to preserve AI crawl budget.

---

## 5. Measurement & Monitoring

How to know if GEO is working:
- **Citation Rate**: Track the % of target queries where your brand appears directly in AI responses. This is your primary KPI.
- **Prompt Monitoring**: Regularly prompt major LLMs with your core target questions and log responses.
- **Brand mention tracking**: Monitor the broader web, as LLM training data lags behind live web mentions.

---

## Implementation Checklist (2026 Standards)

- [ ] Meta title/description are concise and descriptive.
- [ ] JSON-LD (FAQPage, HowTo, Article) validates.
- [ ] Strictly logical heading hierarchy (H1 -> H2 -> H3).
- [ ] Semantic HTML tags (`<article>`, `<main>`) applied.
- [ ] Content starts with a direct 40-60 word "Answer First" block.
- [ ] Content is chunked into 75-300 word modular sections.
- [ ] Tables used for comparisons/data.
- [ ] `<ol>` used for step-by-step guides.
- [ ] `/llms.txt` deployed (for future-proofing/dev tools).
- [ ] `robots.txt` explicitly allows GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot, Google-Extended.
- [ ] XML Sitemap is error-free.
- [ ] Contains original data, statistics, or primary research (highest citation value).
- [ ] Content has been updated within the last 30 days.
- [ ] Author credentials and update dates clearly visible.
- [ ] Entity names clearly disambiguated.
- [ ] Fluff removed; high factual density.

---

## Quick Wins Table (Effort vs Impact)

| Action | Effort | Impact for AI | Why it works |
|--------|--------|---------------|--------------|
| Write 40-60w "Answer First" | Low | Very High | Matches exact extraction pattern LLMs use |
| Add `FAQPage/HowTo` schema | Low | High | Feeds directly into AI Q&A extraction |
| Allow AI Bots in `robots.txt` | Low | High | Without this, no AI search engine will crawl you |
| Fix Heading Structure | Low | Medium | Helps LLMs build accurate document outlines |
| Conduct Original Statistics/Research | High | Very High | Generates real citations and factual authority |
| Update Old Content | Medium | High | AI engines heavily favor content < 30 days old |
