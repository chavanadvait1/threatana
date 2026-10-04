import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Out = z.object({
  severity: z.enum(["critical", "high", "medium", "low"]),
  category: z.string().min(1).max(100),
  description: z.string().min(1).max(600),
  novel: z.boolean(),
  indicators: z
    .array(z.object({ type: z.enum(["ip", "file", "hash", "user"]), value: z.string().max(120) }))
    .max(10),
});
export type AiAnalysis = z.infer<typeof Out>;

const SYSTEM = `You are a senior SOC analyst. Classify the security log precisely.
Use MITRE ATT&CK-aligned categories (e.g. Brute Force, Reconnaissance, Unauthorized Access, Privilege Escalation, Malicious Execution, Lateral Movement, Malicious Upload, C2 Beaconing, Data Exfiltration, Ransomware, System Tampering, Web Attack, Benign Activity).
Severity rules: successful compromise/ransomware/root access = critical; active attacker tooling, webshells, lateral movement = high; beaconing, exfil suspicion = medium; failed logins, scans = low (escalate if very many or followed by success).
Set novel=true only if the activity is suspicious but does not fit any known category.
Description: 1-2 concise sentences with the concrete evidence (counts, IPs, users, ports). Extract real IOCs only from the log.`;

export const analyzeLogsAI = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ logs: z.string().min(1).max(20000) }).parse(d))
  .handler(async ({ data }): Promise<AiAnalysis | null> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return null;
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM },
            { role: "user", content: data.logs },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "report_threat",
                parameters: {
                  type: "object",
                  properties: {
                    severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                    category: { type: "string" },
                    description: { type: "string" },
                    novel: { type: "boolean" },
                    indicators: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["ip", "file", "hash", "user"] },
                          value: { type: "string" },
                        },
                        required: ["type", "value"],
                      },
                    },
                  },
                  required: ["severity", "category", "description", "novel", "indicators"],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "report_threat" } },
        }),
      });
      if (!res.ok) {
        console.error("AI analysis failed", res.status, await res.text());
        return null;
      }
      const json = await res.json();
      const args = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
      return Out.parse(JSON.parse(args));
    } catch (e) {
      console.error("AI analysis error", e);
      return null;
    }
  });
