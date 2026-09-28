import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const REPO = "chavanadvait1/threat-analyzer";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/github";

export const createGithubTicket = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        threatId: z.number(),
        severity: z.string(),
        description: z.string(),
        indicators: z.array(z.string()).default([]),
        timestamp: z.string(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const githubKey = process.env["GITHUB_API_KEY"];
    if (!lovableKey || !githubKey) {
      throw new Error("GitHub connection is not configured");
    }

    const title = `[${data.severity.toUpperCase()}] Threat #${data.threatId}: ${data.description.slice(0, 80)}`;
    const body = [
      `**Severity:** ${data.severity.toUpperCase()}`,
      `**Detected:** ${data.timestamp}`,
      "",
      "## Description",
      data.description,
      "",
      "## Indicators of Compromise",
      ...data.indicators.map((i) => `- \`${i}\``),
      "",
      "---",
      "_Created from the Cybersecurity Threat Analyzer dashboard._",
    ].join("\n");

    const response = await fetch(`${GATEWAY_URL}/repos/${REPO}/issues`, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": githubKey,
      },
      body: JSON.stringify({
        title,
        body,
        labels: ["security", `severity-${data.severity}`],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`GitHub issue creation failed [${response.status}]: ${errorBody}`);
      throw new Error(`GitHub request failed [${response.status}]: ${errorBody}`);
    }

    const issue = (await response.json()) as { html_url: string; number: number };
    return { url: issue.html_url, number: issue.number };
  });
