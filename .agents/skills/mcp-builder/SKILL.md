---
name: mcp-builder
description: "Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. The quality of an MCP server is measured by how well it enables LLMs to accomplish real-world tasks."
risk: unknown
source: community
date_added: "2026-02-27"
---

# MCP Server Development Guide (2025 Best Practices)

## Overview

Create MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools.

---

# Process

## 🚀 High-Level Workflow

Creating a high-quality MCP server involves four main phases.

### Phase 1: Deep Research and Planning

#### 1.1 Understand Modern MCP Design
**API Coverage vs. Workflow Tools:** Balance comprehensive API endpoint coverage with specialized workflow tools. Clear, descriptive tool names (`github_create_issue`) help agents find the right tools quickly.

#### 1.2 Study MCP Protocol Documentation
Review `https://modelcontextprotocol.io/specification/draft.md` for architecture, transport mechanisms (HTTP vs stdio), and definitions.

#### 1.3 Study Framework Documentation
**Recommended stack for 2025:**
- **Language**: TypeScript with strict mode.
- **Validation**: Zod for schemas.
- **Transport**: `stdio` for local/desktop, Streamable HTTP/SSE for remote.

#### 1.4 Plan Your Implementation
Understand the API, select tools, and restrict capabilities to what the LLM strictly needs (Principle of Least Privilege).

---

### Phase 2: Implementation

#### 2.1 TypeScript Project Setup
Initialize a standard Node project with TypeScript.
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

#### 2.2 Server Initialization
```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "my-mcp-server",
  version: "1.0.0"
});
```

#### 2.3 Tool Implementation Pattern (with Zod)
Always validate inputs using Zod to ensure the LLM provides the correct data format.
```typescript
import { z } from "zod";

server.tool(
  "calculate_sum",
  "Add two numbers together",
  {
    a: z.number().describe("First number"),
    b: z.number().describe("Second number")
  },
  async ({ a, b }) => {
    return {
      content: [{ type: "text", text: String(a + b) }]
    };
  }
);
```

#### 2.4 Resource & Prompt Implementation
- **Resources**: Expose read-only data (like config files or database schemas) using URIs.
- **Prompts**: Create reusable prompt templates that agents can invoke to structure their tasks.

#### 2.5 Error Handling & Logging (Critical)
- **Never Log to stdout**: In `stdio` transport, logging to `stdout` breaks the JSON-RPC stream. ALWAYS use `console.error()` for logs.
- **Use `McpError`**: Throw formal errors to let the client handle failures gracefully without leaking stack traces.
```typescript
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

if (!isValid) {
  throw new McpError(ErrorCode.InvalidParams, "Invalid input parameters provided.");
}
```

---

### Phase 3: Testing

- **Unit Testing**: Use Vitest or Jest to test business logic independently of the MCP wrapper.
- **MCP Inspector**: Use the official `mcp-inspector` tool (`npx @modelcontextprotocol/inspector`) to test capability negotiation and simulate LLM tool calls interactively.
- **Integration**: Run the server locally with Claude Desktop to ensure stdio communication works perfectly.

---

### Phase 4: Deployment & Security

- **Containerization**: Use Docker to bundle the server and its dependencies.
- **Security Hardening**:
  - Treat all LLM inputs as untrusted. Sanitize paths and queries.
  - Do not expose remote MCP servers directly to the internet. Use Pomerium, OAuth, or mTLS.
  - Implement read-only scopes or human-in-the-loop for destructive actions.

---

## Tool Design Checklist

1. [ ] Uses official `@modelcontextprotocol/sdk`.
2. [ ] TypeScript strict mode enabled.
3. [ ] All tool arguments validated via Zod schemas.
4. [ ] `console.error` used for logging (NO `console.log`).
5. [ ] Meaningful tool names and descriptions provided.
6. [ ] Returns `structuredContent` for complex outputs.
7. [ ] Uses `McpError` for exceptions.
8. [ ] Follows Principle of Least Privilege for file/DB access.
9. [ ] Tested with `mcp-inspector`.
10. [ ] Transport correctly configured (stdio for local, SSE for remote).
*(Assume 10 more project-specific QA checks)*

## Common Pitfalls

| Pitfall | Consequence | Solution |
| :--- | :--- | :--- |
| Logging to `console.log` | Corrupts JSON-RPC over stdio, breaking the server. | Use `console.error` or a dedicated logger pointing to `stderr`. |
| Trusting LLM input | Security vulnerabilities (Path traversal, SQLi). | Use Zod schemas and sanitize all paths/queries. |
| Vague Tool Descriptions | Agent hallucinates arguments or uses the wrong tool. | Write explicit, instructional descriptions for tools and parameters. |
| Catch-all tool designs | Agent struggles to format massive complex JSON payloads. | Break down complex workflows into smaller, atomic tools. |
