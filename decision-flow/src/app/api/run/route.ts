import { Inngest, step } from "inngest";
import { endpointAdapter } from "inngest/next";
import type { NextRequest } from "next/server";
import { executeFlow, runSchema } from "@/lib/flow";
import { judge } from "@/lib/judge";

const inngest = new Inngest({ id: "flyrank-decision-flow", endpointAdapter });

export const POST = inngest.endpoint(async (request: NextRequest) => {
  try {
    // ponytail: durable endpoints consume request bodies before replay; a query payload is fine for this small demo. Move graphs to storage if they grow.
    const payload = request.nextUrl.searchParams.get("payload");
    if (!payload) throw new Error("Missing flow payload");
    const value = runSchema.parse(JSON.parse(payload));
    return Response.json(await executeFlow(value, (id, work) => step.run(id, work), judge));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Flow failed" }, { status: 400 });
  }
});
