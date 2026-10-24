import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** Toggle a threat's resolved mark. Server-side only: the database no longer
 * accepts direct public writes, so the browser calls this instead. */
export const setThreatResolved = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        threatKey: z.string().min(1).max(64),
        resolved: z.boolean(),
      })
      .parse(input)
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("threat_resolutions")
      .upsert({
        threat_key: data.threatKey,
        resolved: data.resolved,
        updated_at: new Date().toISOString(),
      });
    if (error) {
      console.error("Failed to save resolution", error);
      throw new Error("Could not save the resolution");
    }
    return { ok: true };
  });
