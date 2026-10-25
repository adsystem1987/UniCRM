"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Home,
  Landmark,
  Building,
  Wrench,
  Scale,
  Sparkles,
  Car,
  Stethoscope,
  Plane,
  PartyPopper,
  Gem,
  Dumbbell,
  CheckCircle2,
  Check,
  Search,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Tags,
  GitBranch,
  Layers,
  Globe,
  Compass,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SettingsPanelHead } from "./settings-panel-head";
import {
  INDUSTRY_BLUEPRINTS,
  IndustryBlueprint,
  BlueprintRegion,
} from "@/lib/blueprints/catalog";

// Map catalog icon names to Lucide icons
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Landmark,
  Building,
  Wrench,
  Scale,
  Sparkles,
  Car,
  Stethoscope,
  Plane,
  PartyPopper,
  Gem,
  Dumbbell,
};

const CATEGORIES = [
  "All",
  "Real Estate & Home",
  "Finance & Legal",
  "Health & Lifestyle",
  "Automotive & Retail",
  "Services & Events",
];

const REGIONS: { id: BlueprintRegion; label: string; flag: string; desc: string }[] = [
  { id: "in", label: "India", flag: "🇮🇳", desc: "INR, UPI, CIBIL, BHK & local terms" },
  { id: "us", label: "USA & UK", flag: "🇺🇸", desc: "USD/GBP, FICO, W2 & remodel terms" },
  { id: "ae", label: "UAE & GCC", flag: "🇦🇪", desc: "AED/SAR, Ejari, Villa & fitout terms" },
  { id: "global", label: "Global", flag: "🌍", desc: "Universal terminology & currency" },
];

export function IndustryBlueprintsPanel() {
  const [selectedRegion, setSelectedRegion] = useState<BlueprintRegion>("in");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeBlueprintId, setActiveBlueprintId] = useState<string | null>(null);
  const [installingId, setInstallingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Tab view inside blueprint card: 'stages' | 'tags' | 'templates'
  const [cardTab, setCardTab] = useState<Record<string, "stages" | "tags" | "templates">>({});

  // Fetch installed blueprint metadata
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/blueprints/install");
      if (res.ok) {
        const data = await res.json();
        setActiveBlueprintId(data.activeBlueprintId || null);
        if (data.activeRegion && ["in", "us", "ae", "global"].includes(data.activeRegion)) {
          setSelectedRegion(data.activeRegion as BlueprintRegion);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStatus();
  }, []);

  const handleInstall = async (blueprint: IndustryBlueprint) => {
    setInstallingId(blueprint.id);
    try {
      const res = await fetch("/api/blueprints/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blueprintId: blueprint.id,
          region: selectedRegion,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to install blueprint");
      }

      setActiveBlueprintId(blueprint.id);
      toast.success(data.message || `Installed ${blueprint.name} Blueprint!`, {
        description: `Created dedicated pipeline, ${data.stagesInstalled || 6} stages, ${data.tagsInstalled || 4} tags & WhatsApp templates.`,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Installation failed");
    } finally {
      setInstallingId(null);
    }
  };

  const filteredBlueprints = INDUSTRY_BLUEPRINTS.filter((bp) => {
    const matchesCategory =
      selectedCategory === "All" || bp.category === selectedCategory;
    const matchesSearch =
      bp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bp.leadNiche.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <SettingsPanelHead
        title="Turnkey Industry Blueprints"
        description="1-Click pre-configured pipelines, lead tags, and high-converting WhatsApp message templates tailored for your exact industry."
      />

      {/* Top Banner & Region Selector */}
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Target Market &amp; Region
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Blueprints automatically adapt terminology, currency references, and WhatsApp scripts.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedRegion(r.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                  selectedRegion === r.id
                    ? "bg-card text-foreground shadow-xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={r.desc}
              >
                <span>{r.flag}</span>
                <span>{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 pt-2 border-t border-border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search industries (e.g. Interior, Loan, Real Estate, Clinics)..."
              className="pl-9 h-9 text-xs bg-muted/40 border-border"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors border ${
                  selectedCategory === cat
                    ? "bg-primary/10 text-primary border-primary/30 font-semibold"
                    : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blueprints Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBlueprints.map((blueprint) => {
          const Icon = ICON_MAP[blueprint.iconName] || Briefcase;
          const isInstalled = activeBlueprintId === blueprint.id;
          const isInstalling = installingId === blueprint.id;
          const currentTab = cardTab[blueprint.id] || "stages";

          const stages = blueprint.stages[selectedRegion] || blueprint.stages.global;
          const tags = blueprint.tags[selectedRegion] || blueprint.tags.global;
          const templates = blueprint.templates[selectedRegion] || blueprint.templates.global;

          return (
            <Card
              key={blueprint.id}
              className={`border transition-all flex flex-col justify-between ${
                isInstalled
                  ? "border-primary/40 bg-card shadow-sm"
                  : "border-border bg-card hover:border-border-strong"
              }`}
            >
              <CardHeader className="pb-3 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-bold text-foreground">
                          {blueprint.name}
                        </CardTitle>
                        {isInstalled && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-primary/30 text-primary bg-primary/5 font-bold">
                            Active
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] mt-1 text-muted-foreground border-border">
                        {blueprint.category}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                  {blueprint.shortDesc}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 flex-1">
                {/* Preview Tabs: Stages | Tags | WhatsApp */}
                <div className="flex items-center gap-1 p-0.5 bg-muted/60 rounded-md border border-border text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCardTab((prev) => ({ ...prev, [blueprint.id]: "stages" }))}
                    className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                      currentTab === "stages"
                        ? "bg-card text-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Pipeline ({stages.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTab((prev) => ({ ...prev, [blueprint.id]: "tags" }))}
                    className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                      currentTab === "tags"
                        ? "bg-card text-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Tags ({tags.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTab((prev) => ({ ...prev, [blueprint.id]: "templates" }))}
                    className={`flex-1 py-1 rounded text-center font-medium transition-colors ${
                      currentTab === "templates"
                        ? "bg-card text-foreground font-semibold shadow-2xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    WhatsApp ({templates.length})
                  </button>
                </div>

                {/* Tab Content */}
                <div className="min-h-[110px] rounded-lg bg-muted/30 p-2.5 border border-border/60">
                  {currentTab === "stages" && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        Standard Sales Stages
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {stages.map((stg, idx) => (
                          <span
                            key={stg.name}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-card border border-border text-foreground"
                          >
                            <span className="text-[10px] font-mono opacity-50">{idx + 1}.</span>
                            {stg.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentTab === "tags" && (
                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        Pre-Configured Lead Tags
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map((tg) => (
                          <span
                            key={tg.name}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-card border border-border text-foreground"
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: tg.color }}
                            />
                            {tg.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentTab === "templates" && (
                    <div className="space-y-2">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                        High-Converting WhatsApp Script
                      </div>
                      <p className="text-xs text-foreground italic line-clamp-3 bg-card p-2 rounded border border-border">
                        &ldquo;{templates[0]?.bodyText || "Custom WhatsApp outreach script."}&rdquo;
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <Link
                    href={`/leads?niche=${encodeURIComponent(blueprint.leadNiche)}`}
                    className="inline-flex items-center justify-center h-8 px-2.5 rounded-md text-xs font-medium gap-1 text-muted-foreground hover:text-foreground border border-border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <Search className="h-3.5 w-3.5 text-primary" />
                    Find Leads
                  </Link>

                  <Button
                    size="sm"
                    variant={isInstalled ? "outline" : "default"}
                    disabled={isInstalling}
                    onClick={() => handleInstall(blueprint)}
                    className="h-8 text-xs font-bold gap-1"
                  >
                    {isInstalling ? (
                      <span>Installing...</span>
                    ) : isInstalled ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                        Re-Apply Pack
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-3.5 w-3.5" />
                        1-Click Install
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
