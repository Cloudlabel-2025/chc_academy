import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { TraineeProgress } from "@/models/TraineeProgress";
import { getAuthUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const areas = [
  "Approvals",
  "Learning",
  "Absence",
  "Checklists",
  "Workforce Structures",
  "Trees",
  "DFF",
  "EFF",
  "KFF",
  "OTBI",
  "Alert Composer",
  "HDL/HSDL",
  "Fast Formula",
  "Work Schedules",
  "Operations",
  "Redwood/VBS",
  "BIP/Extracts",
  "Security/AOR",
];

const requiredApprovals = ["APP-01", "APP-02", "APP-03", "APP-04", "APP-05"];

function extractOutput(data: any): string {
  if (typeof data?.output_text === "string") return data.output_text;
  for (const item of data?.output || []) {
    for (const c of item?.content || []) {
      if (c?.type === "output_text" && typeof c.text === "string") {
        return c.text;
      }
    }
  }
  if (typeof data?.choices?.[0]?.message?.content === "string") {
    return data.choices[0].message.content;
  }
  return "";
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to generate practice tasks." }, { status: 401 });
  }

  await connectToDatabase();
  const completed = await TraineeProgress.find({
    email: user.email,
    itemId: { $in: requiredApprovals },
  }).lean();

  const unlocked = requiredApprovals.every((id) =>
    completed.some((x) => x.itemId === id && ["reviewed", "completed"].includes(x.status))
  );

  if (!unlocked) {
    return NextResponse.json(
      { error: "Complete Approval Tasks APP-01 to APP-05 and have them reviewed or approved by a trainer first." },
      { status: 403 }
    );
  }

  const body = (await request.json()) as { area?: string; level?: number; count?: number };
  const area = areas.includes(body.area || "") ? body.area! : "Approvals";
  const level = Math.min(5, Math.max(1, Number(body.level) || 1));
  const count = Math.min(10, Math.max(1, Number(body.count) || 1));

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "The AI task service is not connected yet. Ask the academy administrator to configure the OPENAI_API_KEY in .env.local.",
      },
      { status: 503 }
    );
  }

  const model = process.env.OPENAI_REVIEW_MODEL || "gpt-4o-mini";

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: `Create ${count} distinct end-to-end Oracle Fusion HCM practice task(s) for area ${area}, Level ${level}. The learner is targeting 2–4 years of practical experience and has already completed five approvals tasks. Tasks must be realistic client requirements, not trivia. Calibrate strictly: Level 1 guided basics; Level 2 independent standard configuration; Level 3 multi-rule design and exceptions; Level 4 cross-feature impact and strong documentation; Level 5 complex end-to-end judgement without requiring architect-level scope. Every task must require a requirement interpretation, functional/design document, configuration or build evidence, and UAT document. Include positive, negative, boundary and exception testing. Do not invent Oracle functionality. Return only the requested structured result.`,
          },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "oracle_hcm_practice_tasks",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                tasks: {
                  type: "array",
                  minItems: count,
                  maxItems: count,
                  items: {
                    type: "object",
                    additionalProperties: false,
                    properties: {
                      name: { type: "string" },
                      brief: { type: "string" },
                      requirements: {
                        type: "array",
                        minItems: 4,
                        maxItems: 6,
                        items: { type: "string" },
                      },
                      deliverables: {
                        type: "array",
                        minItems: 4,
                        maxItems: 5,
                        items: { type: "string" },
                      },
                      tests: {
                        type: "array",
                        minItems: 4,
                        maxItems: 6,
                        items: { type: "string" },
                      },
                      assessment: { type: "string" },
                    },
                    required: ["name", "brief", "requirements", "deliverables", "tests", "assessment"],
                  },
                },
              },
              required: ["tasks"],
            },
          },
        },
        max_tokens: 6000,
      }),
    });

    const data = (await response.json()) as any;
    if (!response.ok) {
      return NextResponse.json(
        { error: "The AI task service could not complete this request. Please retry later." },
        { status: 502 }
      );
    }

    const output = extractOutput(data);
    const parsed = JSON.parse(output);
    return NextResponse.json({ area, level, count, tasks: parsed.tasks });
  } catch (err: any) {
    console.error("AI tasks error:", err);
    return NextResponse.json(
      { error: "The AI returned an unreadable task set. Please retry." },
      { status: 502 }
    );
  }
}
