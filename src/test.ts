// To run this file:
// pnpm run test

import { gateway, generateText, stepCountIs } from "ai";
import { executeCode } from "./index";

async function main() {
  const result = await generateText({
    model: gateway("openai/gpt-4o-mini"),
    prompt: `Generate and execute Python code that performs the following calculations with two variables, a and b:
    1. Sum
    2. Difference
    3. Product
    4. Quotient
    5. Exponentiation

    The code should print each result clearly.`,
    tools: {
      executeCode: executeCode(),
    },
    stopWhen: stepCountIs(5),
  });

  console.log("Result:", result.text);
}

main().catch(console.error);
