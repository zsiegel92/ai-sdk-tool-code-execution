# AI SDK Code Execution Tool

A TypeScript package that provides a code execution tool for the AI SDK. Execute Python code in a sandboxed environment using [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox).

## Installation

```bash
pnpm add ai-sdk-tool-code-execution
```

## Prerequisites

- A Vercel account with access to Vercel Sandbox (available in Beta on all plans)
- [Vercel CLI](https://vercel.com/docs/cli) installed
- A Vercel OIDC token for authentication

## Setup

### 1. Link your Vercel project

From your project directory, link to a new or existing Vercel project:

```bash
vercel link
```

### 2. Pull environment variables

Download your Vercel OIDC token:

```bash
vercel env pull
```

This creates a `.env.local` file with your `VERCEL_OIDC_TOKEN` that the SDK uses to authenticate with Vercel Sandbox.

**Note:** Development tokens expire after 12 hours. Run `vercel env pull` again when your token expires.

### 3. Add your AI provider credentials

If using Vercel AI Gateway, add your API key to `.env.local`:

```bash
AI_GATEWAY_API_KEY=your_api_key_here
```

## Usage

```typescript
import { executeCode } from "ai-sdk-tool-code-execution";
import { generateText, gateway } from "ai";

const result = await generateText({
  model: gateway("openai/gpt-4o-mini"),
  prompt: "What is 5 + 5 minus 84 cubed?",
  tools: {
    executeCode: executeCode(),
  },
});

console.log(result.text);
```

The `executeCode` tool allows your AI agent to run Python 3.13 code in a Vercel Sandbox environment. The agent can perform calculations, data processing, and other computational tasks safely in an isolated environment.

### Options

Configure the tool with optional parameters:

```typescript
type CodeExecutionToolOptions = {
  debug?: boolean;
};
```

**Example with debug enabled:**

```typescript
const result = await generateText({
  model: gateway("openai/gpt-4o-mini"),
  prompt: "Calculate the factorial of 10",
  tools: {
    executeCode: executeCode({ debug: true }),
  },
});
```

When `debug` is enabled, you'll see detailed logs of code execution in your terminal.

## How it works

This package uses [Vercel Sandbox](https://vercel.com/docs/vercel-sandbox) to execute Python code in an ephemeral, isolated environment. Each code execution:

1. Creates a new sandbox with Python 3.13 runtime
2. Executes your code using `python3 -c`
3. Captures stdout, stderr, and exit codes
4. Automatically stops the sandbox after execution

## Important notes

- **Python 3.13 runtime:** Code runs in Vercel Sandbox's `python3.13` image
- **Not a REPL:** You must use `print()` to see output. Bare expressions produce no output
- **Isolated execution:** Each sandbox runs in a secure, ephemeral environment on Amazon Linux 2023
- **Authentication required:** Requires a valid Vercel OIDC token
- **Resource limits:** See [Vercel Sandbox pricing and limits](https://vercel.com/docs/vercel-sandbox/pricing)

## Alternative authentication

If you cannot use `VERCEL_OIDC_TOKEN`, you can authenticate with access tokens. Set these environment variables:

```bash
VERCEL_TEAM_ID=your_team_id_here
VERCEL_PROJECT_ID=your_project_id_here
VERCEL_TOKEN=your_access_token_here
```

Find your [team ID](https://vercel.com/docs/accounts#find-your-team-id), [project ID](https://vercel.com/docs/project-configuration/general-settings#project-id), and create an [access token](https://vercel.com/docs/rest-api/reference/welcome#creating-an-access-token) in your Vercel dashboard.

## Development

### Testing locally

Test the tool with the included test script:

```bash
pnpm test
```

### Building

Build the package:

```bash
pnpm build
```

### Publishing

Update the version in `package.json`, then publish:

```bash
pnpm publish
```

The package automatically builds before publishing.

## Project structure

```
.
├── src/
│   ├── tools/
│   │   └── execute-code.ts   # Code execution tool implementation
│   ├── index.ts              # Tool exports
│   └── test.ts               # Test script
├── dist/                     # Build output (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## Monitoring usage

Track your sandbox usage in the [Vercel dashboard](https://vercel.com/docs/vercel-sandbox#observability):

1. Go to your project
2. Click the AI tab
3. Click Sandboxes to view execution history and URLs

View compute usage across all projects in the Usage tab of your dashboard.

## Learn more

- [Vercel Sandbox documentation](https://vercel.com/docs/vercel-sandbox)
- [Vercel Sandbox examples](https://vercel.com/docs/vercel-sandbox/examples)
- [Vercel Sandbox SDK reference](https://vercel.com/docs/vercel-sandbox/reference/globals)

## License

ISC
