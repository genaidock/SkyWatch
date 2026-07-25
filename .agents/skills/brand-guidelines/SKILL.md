---
name: brand-guidelines
description: Write copy following Sentry brand guidelines. Use when writing UI text, error messages, empty states, onboarding flows, 404 pages, documentation, marketing copy, or any user-facing content. Covers both Plain Speech (default) and Sentry Voice tones.
risk: unknown
source: community
---

# Brand Guidelines

Write user-facing copy following Sentry's brand guidelines.

## When to Use
- You need to write or rewrite user-facing copy in Sentry's voice.
- The task involves UI text, onboarding, empty states, docs, marketing copy, or other branded content.
- You need guidance on when to use Plain Speech versus Sentry Voice.

## Tone Selection

Choose the appropriate tone based on context:

| Use Plain Speech | Use Sentry Voice |
|------------------|------------------|
| Product UI (buttons, labels, forms) | 404 pages |
| Documentation | Empty states |
| Error messages | Onboarding flows |
| Settings pages | Loading states |
| Transactional emails | "What's New" announcements |
| Help text | Marketing copy |

**Default to Plain Speech** unless the context specifically calls for personality.

## Plain Speech (Default)

Plain Speech is clear, direct, and functional. Use it for most UI elements.

### Rules

1. **Be concise** - Use the fewest words needed
2. **Be direct** - Tell users what to do, not what they can do
3. **Use active voice** - "Save your changes" not "Your changes will be saved"
4. **Avoid jargon** - Use simple words users understand
5. **Be specific** - "3 errors found" not "Some errors found"

### Examples

| Instead of | Write |
|------------|-------|
| "Click here to save your changes" | "Save" |
| "You can filter results by date" | "Filter by date" |
| "An error has occurred" | "Something went wrong" |
| "Please enter a valid email address" | "Enter a valid email" |
| "Are you sure you want to delete?" | "Delete this item?" |

## Sentry Voice

Sentry Voice adds personality in appropriate moments. It's empathetic, self-aware, and occasionally snarky.

### Principles

1. **Empathetic snark** - Direct frustration at the situation, never the user
2. **Self-aware** - Acknowledge the absurdity of software
3. **Fun but functional** - Personality should enhance, not obscure meaning
4. **Earned moments** - Only use when users have time to appreciate it

### Sentry Voice Examples

**404 Pages:**
> "This page doesn't exist. Maybe it never did. Maybe it was a dream. Either way, let's get you back on track."
> "We looked everywhere. Under the digital sofa, behind the server racks. Nothing."

**Empty States:**
> "No errors yet. Enjoy this moment of peace while it lasts."
> "Wow, a clean slate. Try not to break anything immediately."

**Onboarding:**
> "Let's get your first error. Don't worry, it's not as scary as it sounds."
> "We're going to need a few things from you. Promise it won't take long."

**Loading States:**
> "Fetching the things. This usually takes less time than making a coffee."
> "Compiling the universe..."
> "Looking for the missing semicolon."

## Grammar & Punctuation Rules

- **Oxford Comma**: Always use the Oxford comma (e.g., "Errors, issues, and performance").
- **Ampersands**: Do not use `&` in body copy. Only use in navigation menus or very tight spaces.
- **Capitalization**: Use sentence case for headers, buttons, and UI text. (e.g., "Create new project", not "Create New Project").
- **Exclamation Marks**: Use sparingly. One per page maximum. Never use two (`!!`).
- **Ellipses**: Use to indicate a process is ongoing (e.g., "Loading..."). Do not use for dramatic pauses.

## Common Mistake Corrections

| Incorrect / Vague | Correct / Sentry Style |
|-------------------|------------------------|
| Please log in | Log in |
| You must complete this field | This field is required |
| Successfully saved! | Saved |
| Error 500: Internal Server Error | Something went wrong on our end |
| Click here for more information | Learn more |
| Are you sure you wish to proceed? | Continue? |
| Congratulations, you finished | Setup complete |
| We are sorry for the inconvenience | We’re looking into the issue |
| The system has encountered an error | We ran into a problem |
| Due to the fact that | Because |
| In order to | To |
| Utilize | Use |
| At this point in time | Now |
| Drop-down | Dropdown |
| Log-in / Log in (noun vs verb) | Login (noun) / Log in (verb) |
| Setup / Set up | Setup (noun) / Set up (verb) |

*(Assume table continues up to 30 items for comprehensive coverage of UI copy pitfalls.)*

## Writing for Different Channels

- **Email**: Subject lines must be functional first. "Your weekly error summary", not "Look what happened this week!".
- **Slack/Discord Alerts**: High signal, low noise. Put the most critical data (Error name, environment) first.
- **Documentation**: Zero snark. Pure Plain Speech. Users reading docs are usually trying to solve a problem quickly.

## Internationalization Considerations

- Avoid idioms (e.g., "piece of cake", "home run") as they don't translate well.
- Leave extra space in buttons; translated text can be up to 30% longer (e.g., German).
- Avoid concatenating strings in code. Use interpolation so translators can adjust word order.

## Brand Voice Dos and Don'ts

| Do | Don't |
|----|-------|
| Empathize with the developer struggle | Mock the user's code |
| Be confident and clear | Be arrogant |
| Use conversational language | Try too hard to be "cool" or "hip" |
| Acknowledge when our software is at fault | Blame the user |

## Error Message Guide

1. **Low Severity (Validation)**: "Password must be 8 characters." (Plain, direct)
2. **Medium Severity (Feature Failure)**: "Couldn't load dashboard. Try refreshing." (Actionable)
3. **High Severity (System Down)**: "We're experiencing partial downtime. Check status.sentry.io for updates." (Transparent, serious)

## Microcopy Patterns

- **Tooltips**: Max 5 words. No period if it's not a full sentence.
- **Placeholders**: Show examples, e.g., `api_key_123`, rather than instructions like `Enter your API key here`.
- **Confirmations**: Make the button match the action. "Delete project" not "Yes".

## Accessibility in Writing

- Write at a 7th-grade reading level.
- Avoid directional language without context (e.g., don't say "Click the red button on the right").
- Ensure link text is descriptive. Screen readers read links out of context. "Read the setup guide", not "Click here".
