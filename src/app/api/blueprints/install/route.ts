import { NextRequest, NextResponse } from "next/server";
import { getCurrentAccount, requireRole } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/flows/admin-client";
import {
  getBlueprintById,
  INDUSTRY_BLUEPRINTS,
  BlueprintRegion,
} from "@/lib/blueprints/catalog";

export const dynamic = "force-dynamic";

/**
 * GET /api/blueprints/install
 * Returns list of installed pipelines/blueprints and the active blueprint metadata.
 */
export async function GET() {
  try {
    const { supabase, accountId } = await getCurrentAccount();

    const [accountRes, pipelinesRes] = await Promise.all([
      supabase.from("accounts").select("metadata").eq("id", accountId).single(),
      supabase.from("pipelines").select("id, name, created_at").eq("account_id", accountId),
    ]);

    const activeBlueprintId = accountRes.data?.metadata?.active_blueprint || null;
    const activeRegion = accountRes.data?.metadata?.blueprint_region || "global";

    return NextResponse.json({
      activeBlueprintId,
      activeRegion,
      installedPipelines: pipelinesRes.data || [],
      catalogCount: INDUSTRY_BLUEPRINTS.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unauthorized";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}

/**
 * POST /api/blueprints/install
 * Installs an industry blueprint (Pipeline, Stages, Tags, and WhatsApp Templates).
 */
export async function POST(request: NextRequest) {
  try {
    const { accountId, userId, role } = await requireRole("agent");
    const body = await request.json().catch(() => ({}));

    const blueprintId = typeof body.blueprintId === "string" ? body.blueprintId.trim() : "";
    const rawRegion = typeof body.region === "string" ? body.region.trim().toLowerCase() : "global";
    const region: BlueprintRegion = ["in", "us", "ae", "global"].includes(rawRegion)
      ? (rawRegion as BlueprintRegion)
      : "global";

    const blueprint = getBlueprintById(blueprintId);
    if (!blueprint) {
      return NextResponse.json(
        { error: `Blueprint '${blueprintId}' not found in catalog.` },
        { status: 404 }
      );
    }

    const admin = supabaseAdmin();
    const pipelineName = `${blueprint.name} Pipeline`;

    // 1. Create or retrieve existing Pipeline
    let pipelineId: string;
    const { data: existingPipeline } = await admin
      .from("pipelines")
      .select("id")
      .eq("account_id", accountId)
      .eq("name", pipelineName)
      .maybeSingle();

    if (existingPipeline) {
      pipelineId = existingPipeline.id;
    } else {
      const { data: newPipeline, error: pipeErr } = await admin
        .from("pipelines")
        .insert({
          account_id: accountId,
          user_id: userId,
          name: pipelineName,
        })
        .select("id")
        .single();

      if (pipeErr || !newPipeline) {
        throw new Error(pipeErr?.message || "Failed to create pipeline for blueprint");
      }
      pipelineId = newPipeline.id;
    }

    // 2. Install Pipeline Stages (if not already seeded)
    const selectedStages = blueprint.stages[region] || blueprint.stages.global;
    const { data: existingStages } = await admin
      .from("pipeline_stages")
      .select("id, name")
      .eq("pipeline_id", pipelineId);

    const existingStageNames = new Set((existingStages || []).map((s) => s.name.toLowerCase()));
    const stagesToInsert = selectedStages
      .filter((s) => !existingStageNames.has(s.name.toLowerCase()))
      .map((s, idx) => ({
        pipeline_id: pipelineId,
        name: s.name,
        color: s.color,
        position: (existingStages?.length || 0) + idx,
      }));

    if (stagesToInsert.length > 0) {
      await admin.from("pipeline_stages").insert(stagesToInsert);
    }

    // 3. Install Tags (clean, non-duplicating)
    const selectedTags = blueprint.tags[region] || blueprint.tags.global;
    const { data: existingTags } = await admin
      .from("tags")
      .select("id, name")
      .eq("account_id", accountId);

    const existingTagNames = new Set((existingTags || []).map((t) => t.name.toLowerCase()));
    const tagsToInsert = selectedTags
      .filter((t) => !existingTagNames.has(t.name.toLowerCase()))
      .map((t) => ({
        account_id: accountId,
        user_id: userId,
        name: t.name,
        color: t.color,
      }));

    if (tagsToInsert.length > 0) {
      await admin.from("tags").insert(tagsToInsert);
    }

    // 4. Install WhatsApp Message Templates
    const selectedTemplates = blueprint.templates[region] || blueprint.templates.global;
    const { data: existingTemplates } = await admin
      .from("message_templates")
      .select("id, name")
      .eq("user_id", userId);

    const existingTemplateNames = new Set(
      (existingTemplates || []).map((tpl) => tpl.name.toLowerCase())
    );

    const templatesToInsert = selectedTemplates
      .filter((tpl) => !existingTemplateNames.has(tpl.name.toLowerCase()))
      .map((tpl) => ({
        user_id: userId,
        name: tpl.name,
        category: tpl.category,
        language: region === "ae" ? "ar_AE" : "en_US",
        body_text: tpl.bodyText,
        status: "Draft",
      }));

    if (templatesToInsert.length > 0) {
      await admin.from("message_templates").insert(templatesToInsert);
    }

    // 5. Update account metadata with active blueprint info
    const { data: acc } = await admin
      .from("accounts")
      .select("metadata")
      .eq("id", accountId)
      .single();

    const currentMetadata = (acc?.metadata as Record<string, unknown>) || {};
    await admin
      .from("accounts")
      .update({
        metadata: {
          ...currentMetadata,
          active_blueprint: blueprint.id,
          blueprint_region: region,
          blueprint_installed_at: new Date().toISOString(),
        },
      })
      .eq("id", accountId);

    return NextResponse.json({
      success: true,
      blueprintId: blueprint.id,
      pipelineId,
      stagesInstalled: stagesToInsert.length,
      tagsInstalled: tagsToInsert.length,
      templatesInstalled: templatesToInsert.length,
      message: `Successfully installed the ${blueprint.name} Turnkey Blueprint!`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to install blueprint";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
