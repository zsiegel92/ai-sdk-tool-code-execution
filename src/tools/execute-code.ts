import { AISDKError, tool } from "ai";
import { z } from "zod";
import { Sandbox } from "sandbox";

type CodeExecutionToolOptions = {
  debug?: boolean;
};

/**
* Tool for executing Python 3 code snippets in a Vercel Sandbox environment.
 *
 * @param options - Configuration options
 * @param options.debug - Enable debug logging (default: false)
 * @returns A tool that executes Python code and returns the output
 */
export const executeCode = ({ debug = false }: CodeExecutionToolOptions = {}) =>
  tool({
    description:
      "Execute Python 3 code in a sandboxed environment. THIS IS NOT A REPL - NO OUTPUT WILL BE SHOWN UNLESS YOU USE print(). Do NOT write bare expressions. Every value you want to see MUST be wrapped in print(). This is mandatory and non-negotiable.",
    inputSchema: z.object({
      code: z
        .string()
        .describe(
          "Python 3 code to execute. MANDATORY REQUIREMENT: ALL expressions must be wrapped in print() to produce output. Bare expressions like '5 + 5' will produce NOTHING. You MUST write 'print(5 + 5)'. NO EXCEPTIONS. The sandbox is NOT interactive and does NOT echo results. If you don't use print(), the output will be empty. Example: print(2 + 2), print('hello'), print([x**2 for x in range(10)])",
        ),
    }),
    execute: async ({ code }) => {
      const log = (...args: any[]) => {
        if (process.env.NODE_ENV === "development" || debug) {
          console.log(...args);
        }
      };
      if (!process.env.VERCEL_OIDC_TOKEN) {
        throw new Error(
          "VERCEL_OIDC_TOKEN environment variable is not defined. This is required to use the executeCode tool. Learn more at: https://vercel.com/docs/vercel-sandbox#authentication.",
        );
      }

      // Check if code contains print statement
      if (!code.includes("print(") && !code.includes("print (")) {
        return {
          output:
            "ERROR: You MUST include a print() statement to see output. This is NOT a REPL - bare expressions will produce no output. Wrap your expressions in print(). Example: print(2 + 2)",
          exitCode: 1,
          stderr: "No print() statement detected in code",
        };
      }

      try {
        const sandbox = await Sandbox.create({
          runtime: "python3.13",
        });

        log(
          `[executeCode] code preview: ${code.substring(0, 100)}${code.length > 100 ? "..." : ""}`,
        );

        const runResult = await sandbox.runCommand({
          cmd: "python3",
          args: ["-c", code],
        });

        log(
          `[executeCode] command completed with exit code: ${runResult.exitCode}`,
        );

        const output = await runResult.stdout();
        const errorOutput = await runResult.stderr();

        log(
          `[executeCode] output preview: ${output.trim().substring(0, 100)}${output.length > 100 ? "..." : ""}`,
        );

        if (errorOutput) {
          log(`[executeCode] error output: ${errorOutput}`);
        }

        log(`[executeCode] stopping sandbox`);

        await sandbox.stop();

        log(`[executeCode] sandbox stopped successfully`);

        // If output is empty and exit code is 0, provide a helpful message
        if (!output && runResult.exitCode === 0) {
          return {
            output:
              "Code executed successfully but produced no output. If you expected output, make sure to use print() to display results.",
            exitCode: runResult.exitCode,
            stderr: errorOutput,
          };
        }

        return {
          output: output || errorOutput,
          exitCode: runResult.exitCode,
          stderr: errorOutput,
        };
      } catch (error) {
        log(`[executeCode] error occurred: ${error}`);
        return {
          output: "",
          exitCode: 1,
          stderr: error instanceof Error ? error.message : String(error),
        };
      }
    },
  });
