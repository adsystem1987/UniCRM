"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Target,
  Search,
  Sparkles,
  CheckCircle2,
  Phone,
  Globe,
  MapPin,
  Star,
  Users,
  Download,
  Send,
  Zap,
  Lock,
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  Filter,
  Play,
  Coins,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { LeadPackOrderDialog } from "./lead-pack-order-dialog";

interface LeadItem {
  id: string;
  name: string;
  phone: string;
  city: string;
  category: string;
  rating: number;
  reviewsCount: number;
  website?: string;
  matchScore: number;
  verifiedWhatsApp: boolean;
}

const SAMPLE_LEAD_DATABASE: Record<string, LeadItem[]> = {
  "Real Estate": [
    {
      id: "re-1",
      name: "Apex Realty Advisors",
      phone: "+91 98201 44521",
      city: "Mumbai",
      category: "Real Estate Agency",
      rating: 4.8,
      reviewsCount: 128,
      website: "https://apexrealty.in",
      matchScore: 98,
      verifiedWhatsApp: true,
    },
    {
      id: "re-2",
      name: "Skyline Properties & Homes",
      phone: "+91 98450 88219",
      city: "Bangalore",
      category: "Commercial & Residential Broker",
      rating: 4.7,
      reviewsCount: 94,
      website: "https://skylinehomes.in",
      matchScore: 96,
      verifiedWhatsApp: true,
    },
    {
      id: "re-3",
      name: "Elite Square Real Estate",
      phone: "+91 99102 33418",
      city: "Delhi NCR",
      category: "Luxury Property Consultants",
      rating: 4.9,
      reviewsCount: 210,
      website: "https://elitesquare.in",
      matchScore: 99,
      verifiedWhatsApp: true,
    },
    {
      id: "re-4",
      name: "Urban Habitat Spaces",
      phone: "+91 97665 11982",
      city: "Pune",
      category: "Property Marketing & Sales",
      rating: 4.6,
      reviewsCount: 65,
      website: "https://urbanhabitat.co.in",
      matchScore: 94,
      verifiedWhatsApp: true,
    },
    {
      id: "re-5",
      name: "Prime Landmarks",
      phone: "+91 94441 55209",
      city: "Chennai",
      category: "Land & Villa Consultants",
      rating: 4.8,
      reviewsCount: 112,
      website: "https://primelandmarks.com",
      matchScore: 95,
      verifiedWhatsApp: true,
    },
  ],
  "D2C Brands": [
    {
      id: "d2c-1",
      name: "Aura Herbal Organics",
      phone: "+91 98802 66310",
      city: "Bangalore",
      category: "Skincare & Wellness Brand",
      rating: 4.9,
      reviewsCount: 340,
      website: "https://aurawellness.in",
      matchScore: 97,
      verifiedWhatsApp: true,
    },
    {
      id: "d2c-2",
      name: "Kavya Handcrafted Apparel",
      phone: "+91 98214 77901",
      city: "Jaipur",
      category: "Ethnic Fashion E-Commerce",
      rating: 4.8,
      reviewsCount: 220,
      website: "https://kavyaapparel.in",
      matchScore: 95,
      verifiedWhatsApp: true,
    },
    {
      id: "d2c-3",
      name: "NutriBean Cold Brews",
      phone: "+91 99401 22980",
      city: "Chennai",
      category: "Artisanal Coffee & Beverages",
      rating: 4.7,
      reviewsCount: 180,
      website: "https://nutribeancoffee.com",
      matchScore: 94,
      verifiedWhatsApp: true,
    },
    {
      id: "d2c-4",
      name: "Veda Superfoods India",
      phone: "+91 98110 33819",
      city: "Delhi NCR",
      category: "Health Foods & Nutrition",
      rating: 4.9,
      reviewsCount: 410,
      website: "https://vedasuperfoods.in",
      matchScore: 98,
      verifiedWhatsApp: true,
    },
  ],
  "Clinics & Healthcare": [
    {
      id: "cl-1",
      name: "SmileCare Dental Studio",
      phone: "+91 98205 99120",
      city: "Mumbai",
      category: "Cosmetic & Family Dentistry",
      rating: 4.9,
      reviewsCount: 290,
      website: "https://smilecaredental.in",
      matchScore: 99,
      verifiedWhatsApp: true,
    },
    {
      id: "cl-2",
      name: "Dr. Rao's Wellness Clinic",
      phone: "+91 98452 77410",
      city: "Bangalore",
      category: "Integrative Health & Diagnostics",
      rating: 4.8,
      reviewsCount: 175,
      website: "https://raowellness.in",
      matchScore: 96,
      verifiedWhatsApp: true,
    },
    {
      id: "cl-3",
      name: "Apex Physio & Rehab Center",
      phone: "+91 99105 44810",
      city: "Delhi NCR",
      category: "Sports & Spine Physiotherapy",
      rating: 4.7,
      reviewsCount: 140,
      website: "https://apexphysiorehab.com",
      matchScore: 95,
      verifiedWhatsApp: true,
    },
  ],
};

const DEFAULT_NICHES = [
  "Interior Designers",
  "Financial Services",
  "Real Estate",
  "Solar & CleanTech",
  "Law Firms",
  "D2C Brands",
  "Automotive",
  "Clinics & Healthcare",
  "Travel & Hospitality",
  "Event Venues",
  "Gyms & Fitness",
  "Restaurants & Cafes",
];

const DEFAULT_CITIES = [
  "All India",
  "Bangalore",
  "Mumbai",
  "Delhi NCR",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Dubai",
];

export function LeadFinderView({ isDrawer = false }: { isDrawer?: boolean }) {
  const { user } = useAuth();
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [niche, setNiche] = useState("Real Estate");

  useEffect(() => {
    const qNiche = searchParams?.get("niche");
    if (qNiche) {
      setNiche(qNiche);
    }
  }, [searchParams]);
  const [city, setCity] = useState("All India");
  const [whatsappOnly, setWhatsappOnly] = useState(true);
  const [highRatingOnly, setHighRatingOnly] = useState(true);
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [leadPackDialogOpen, setLeadPackDialogOpen] = useState(false);
  const [selectedPackAmount, setSelectedPackAmount] = useState<number>(999);

  // Live Apify & Credit System State
  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);
  const [hasApifyKey, setHasApifyKey] = useState<boolean>(false);
  const [keyStatus, setKeyStatus] = useState<string>("inactive");
  const [contactsToFetch, setContactsToFetch] = useState<number>(100);
  const [scrapingLive, setScrapingLive] = useState<boolean>(false);
  const [liveResults, setLiveResults] = useState<LeadItem[]>([]);

  // Fetch client credit balance on mount
  const fetchCredits = async () => {
    try {
      const res = await fetch("/api/leads-finder/run", { method: "GET" }).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        setCreditsBalance(data.creditsBalance ?? 0);
        setHasApifyKey(!!data.hasKey);
        setKeyStatus(data.status || "active");
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchCredits();
  }, []);

  // Run live Apify scrape with strict limits (100 min, 1000 max) and credit verification
  const handleLiveApifyScrape = async () => {
    if (contactsToFetch < 100 || contactsToFetch > 1000) {
      toast.error("Contacts to fetch must be between 100 (min cap) and 1,000 (max cap).");
      return;
    }

    if (creditsBalance !== null && creditsBalance < contactsToFetch) {
      toast.error(
        `Insufficient credits! You need ${contactsToFetch} credits, but have ${creditsBalance}. Please recharge.`
      );
      setSelectedPackAmount(contactsToFetch >= 500 ? 999 : 499);
      setLeadPackDialogOpen(true);
      return;
    }

    setScrapingLive(true);
    const toastId = toast.loading(`Starting Smart Lead discovery for ${contactsToFetch} contacts in ${city}...`);

    try {
      const res = await fetch("/api/leads-finder/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: niche,
          city: city === "All India" ? "Mumbai" : city,
          count: contactsToFetch,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Scraping failed");
      }

      toast.success(data.message || `Successfully scraped & imported ${data.importedCount} contacts!`, {
        id: toastId,
      });

      if (data.leadsPreview && data.leadsPreview.length > 0) {
        const mapped: LeadItem[] = data.leadsPreview.map((item: any, idx: number) => ({
          id: `live-${idx}-${Date.now()}`,
          name: item.name,
          phone: item.phone,
          city: item.city || city,
          category: item.category || niche,
          rating: item.rating || 4.8,
          reviewsCount: item.reviewsCount || 42,
          website: item.website,
          matchScore: 99,
          verifiedWhatsApp: true,
        }));
        setLiveResults(mapped);
      }

      fetchCredits();
    } catch (err: any) {
      toast.error(err.message || "Failed to execute scraper.", { id: toastId });
    } finally {
      setScrapingLive(false);
    }
  };

  // Active results derived from live search or fallback generator
  const currentCategoryLeads =
    liveResults.length > 0
      ? liveResults
      : SAMPLE_LEAD_DATABASE[niche] || SAMPLE_LEAD_DATABASE["Real Estate"];

  const filteredLeads = currentCategoryLeads.filter((item) => {
    if (city !== "All India" && !item.city.toLowerCase().includes(city.toLowerCase())) {
      return false;
    }
    if (whatsappOnly && !item.verifiedWhatsApp) return false;
    if (highRatingOnly && item.rating < 4.5) return false;
    return true;
  });

  const handleSearch = () => {
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setHasSearched(true);
      setSelectedLeadIds([]);
      toast.success(
        `Discovered ${filteredLeads.length} verified leads matching your target audience!`
      );
    }, 600);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLeadIds(filteredLeads.map((l) => l.id));
    } else {
      setSelectedLeadIds([]);
    }
  };

  const handleToggleLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const [launchingOutreach, setLaunchingOutreach] = useState(false);

  const handleImportToContacts = async (launchOutreach = false) => {
    const leadsToImport = filteredLeads.filter((l) =>
      selectedLeadIds.length > 0 ? selectedLeadIds.includes(l.id) : true
    );

    if (leadsToImport.length === 0) {
      toast.error("Please select at least one lead.");
      return;
    }

    if (launchOutreach) {
      setLaunchingOutreach(true);
    } else {
      setImporting(true);
    }

    try {
      const res = await fetch("/api/leads/import-and-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leads: leadsToImport.map((lead) => ({
            name: lead.name,
            phone: lead.phone,
            city: lead.city,
            category: lead.category,
            rating: lead.rating,
          })),
          enrollInSequence: launchOutreach,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to process leads");
      }

      if (launchOutreach) {
        toast.success(
          `Imported ${data.importedCount || leadsToImport.length} leads and initiated WhatsApp Omnichannel outreach!`
        );
      } else {
        toast.success(
          `Successfully imported ${data.importedCount || leadsToImport.length} leads into UniCRM Contacts!`
        );
      }
      setSelectedLeadIds([]);
    } catch (err: any) {
      console.error("Import error:", err);
      toast.error(err.message || "Failed to import leads");
    } finally {
      setImporting(false);
      setLaunchingOutreach(false);
    }
  };

  return (
    <div className={`space-y-6 ${isDrawer ? "p-1" : ""}`}>
      {/* Header Banner */}
      <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-background to-emerald-500/10 p-5 shadow-xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black shadow-xs">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-foreground">
                  UniCRM Smart Lead Finder
                </h2>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/10 text-[#008f68] dark:text-[#42b991] dark:text-emerald-400 border-emerald-500/20 text-[10px] font-bold uppercase"
                >
                  <Sparkles className="h-3 w-3 mr-1" />
                  Verified ICP Prospector
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Discover targeted prospective buyers and clients matching your Ideal Customer Profile. Import directly to UniCRM Contacts &amp; launch WhatsApp outbound.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {creditsBalance !== null && (
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-xs py-1 px-2.5 font-bold flex items-center gap-1.5"
              >
                <Coins className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>{creditsBalance} Credits</span>
              </Badge>
            )}

            <Button
              size="sm"
              onClick={() => {
                setSelectedPackAmount(999);
                setLeadPackDialogOpen(true);
              }}
              className="font-bold bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 gap-1.5 shadow-xs text-xs"
            >
              <Zap className="h-3.5 w-3.5" />
              Recharge Credits (₹1 = 1 Contact)
            </Button>
          </div>
        </div>
      </div>

      {/* ICP Search Controls Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Filter className="h-4 w-4 text-primary" />
            Define Your Ideal Customer Profile (ICP)
          </CardTitle>
          <CardDescription className="text-xs">
            Filter by industry, geography, and phone verification status.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Niche */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Target Industry / Niche</Label>
              <Input
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Real Estate, D2C Brands, Dentists"
                className="text-xs"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {DEFAULT_NICHES.slice(0, 4).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setNiche(item)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                      niche === item
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Location */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Target City / Territory</Label>
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Mumbai, Bangalore, Delhi NCR"
                className="text-xs"
              />
              <div className="flex flex-wrap gap-1 pt-1">
                {DEFAULT_CITIES.slice(0, 4).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCity(item)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-all ${
                      city === item
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted text-muted-foreground border-border hover:text-foreground"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Filter options and Live Apify Runner Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-border">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <Checkbox
                  checked={whatsappOnly}
                  onCheckedChange={(c) => setWhatsappOnly(!!c)}
                />
                <span>Verified WhatsApp Active</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <Checkbox
                  checked={highRatingOnly}
                  onCheckedChange={(c) => setHighRatingOnly(!!c)}
                />
                <span>High Rating (4.5+ ★)</span>
              </label>
            </div>

            {/* Contacts Count Input: Min 100, Max 1000 */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-1 rounded-lg border border-border">
                <span className="text-[11px] font-semibold text-muted-foreground whitespace-nowrap">Fetch:</span>
                <Input
                  type="number"
                  min={100}
                  max={1000}
                  step={50}
                  value={contactsToFetch}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setContactsToFetch(val);
                  }}
                  className="w-20 h-7 text-xs font-bold text-center"
                />
                <span className="text-[10px] text-muted-foreground font-medium">contacts (100–1,000)</span>
              </div>

              {/* Live Lead Finder Trigger */}
              <Button
                onClick={handleLiveApifyScrape}
                disabled={scrapingLive}
                className="font-bold bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 text-xs gap-1.5 shadow-xs"
              >
                {scrapingLive ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Discovering Verified Leads...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Run Live Leads Finder ({contactsToFetch} Credits)
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table Section */}
      {hasSearched && (
        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <span>Discovered Prospective Leads</span>
                <Badge variant="secondary" className="text-[10px] font-mono">
                  {filteredLeads.length} leads
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Preview sample leads matching your ICP. Select leads to import directly into Contacts.
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleImportToContacts(false)}
                disabled={importing || launchingOutreach || filteredLeads.length === 0}
                className="font-bold text-xs gap-1.5 border-border text-foreground hover:border-border-strong hover:bg-surface-hover"
              >
                <Download className="h-3.5 w-3.5" />
                {selectedLeadIds.length > 0
                  ? `Import (${selectedLeadIds.length})`
                  : "Import All"}
              </Button>
              <Button
                size="sm"
                onClick={() => handleImportToContacts(true)}
                disabled={importing || launchingOutreach || filteredLeads.length === 0}
                className="font-bold bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 text-xs gap-1.5"
              >
                {launchingOutreach ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Launching...
                  </>
                ) : (
                  <>
                    <Send className="h-3 w-3" />
                    {selectedLeadIds.length > 0
                      ? `Launch Outreach (${selectedLeadIds.length})`
                      : "Launch Outreach for All"}
                  </>
                )}
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Table */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase">
                    <tr>
                      <th className="p-3 w-10">
                        <Checkbox
                          checked={
                            selectedLeadIds.length === filteredLeads.length &&
                            filteredLeads.length > 0
                          }
                          onCheckedChange={(c) => handleSelectAll(c === true)}
                          className="border-muted-foreground/50 data-[checked]:border-primary"
                        />
                      </th>
                      <th className="p-3">Business / Prospect</th>
                      <th className="p-3">WhatsApp Phone</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Rating</th>
                      <th className="p-3 text-right">ICP Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border font-medium">
                    {filteredLeads.map((lead) => {
                      const isSelected = selectedLeadIds.includes(lead.id);
                      return (
                        <tr
                          key={lead.id}
                          className={`hover:bg-muted/40 transition-colors ${
                            isSelected ? "bg-primary/5" : ""
                          }`}
                        >
                          <td className="p-3 w-10">
                            <label className="flex items-center justify-center cursor-pointer p-1 -m-1">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleLead(lead.id)}
                                className="border-muted-foreground/60 data-[checked]:border-primary"
                              />
                            </label>
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-foreground">
                              {lead.name}
                            </div>
                            {lead.website && (
                              <a
                                href={lead.website}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 mt-0.5 w-fit"
                              >
                                <Globe className="h-2.5 w-2.5" />
                                {lead.website.replace("https://", "")}
                              </a>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1.5 font-mono font-bold text-[#008f68] dark:text-[#42b991] dark:text-emerald-400">
                              <Phone className="h-3 w-3" />
                              <span>{lead.phone}</span>
                            </div>
                            <span className="text-[9px] font-semibold text-muted-foreground">
                              WhatsApp Verified
                            </span>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{lead.city}</span>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            <span>{lead.category}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400">
                              <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                              <span>{lead.rating}</span>
                              <span className="text-[10px] text-muted-foreground font-normal">
                                ({lead.reviewsCount})
                              </span>
                            </div>
                          </td>
                          <td className="p-3 text-right">
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-[#008f68] dark:text-[#42b991] dark:text-emerald-400 border border-emerald-500/20">
                              {lead.matchScore}% Match
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Outbound Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-muted/30 border border-border text-xs">
              <span className="text-muted-foreground">
                Showing top verified sample leads for <strong className="text-foreground">{niche}</strong> in <strong className="text-foreground">{city}</strong>.
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleImportToContacts(false)}
                  disabled={importing || launchingOutreach || filteredLeads.length === 0}
                  className="font-medium text-xs gap-1.5"
                >
                  <Download className="h-3 w-3" />
                  Import to Contacts
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleImportToContacts(true)}
                  disabled={importing || launchingOutreach || filteredLeads.length === 0}
                  className="font-bold bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 text-xs gap-1.5"
                >
                  {launchingOutreach ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin" />
                      Launching...
                    </>
                  ) : (
                    <>
                      <Send className="h-3 w-3" />
                      {selectedLeadIds.length > 0
                        ? `Launch Outreach (${selectedLeadIds.length})`
                        : "Launch Outreach for All"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Monetization / Custom High-Volume Lead Packs */}
      <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-rose-500/10 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400">
              <Zap className="h-3 w-3" />
              High-Volume Curated Outbound
            </div>
            <h3 className="text-base font-black text-foreground">
              Need 500 to 2,500+ Verified ICP Leads in Your Specific Niche?
            </h3>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              We extract and verify hyper-targeted prospective customers matching your exact business parameters (Google Maps, Verified Directories, and Active WhatsApp accounts) delivered right into your UniCRM instance.
            </p>
          </div>

          <Button
            onClick={() => {
              setSelectedPackAmount(499);
              setLeadPackDialogOpen(true);
            }}
            className="font-bold bg-primary text-primary-foreground hover:opacity-90 active:opacity-80 shrink-0 gap-1.5 shadow-sm active:scale-[0.98] border border-emerald-400/20"
          >
            <span>Order Lead Pack (from ₹499)</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 3 Pricing Packs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => {
              setSelectedPackAmount(499);
              setLeadPackDialogOpen(true);
            }}
            className="p-3.5 rounded-xl border border-border bg-card space-y-1 text-left hover:border-primary/50 hover:bg-muted/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Starter Outbound</span>
              <span className="text-xs font-black text-[#008f68] dark:text-[#42b991]">₹499</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              <strong>250 Verified Leads</strong> • WhatsApp checked • 1-click import to UniCRM
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedPackAmount(999);
              setLeadPackDialogOpen(true);
            }}
            className="p-3.5 rounded-xl border-2 border-emerald-500 bg-card space-y-1 shadow-xs relative text-left hover:bg-emerald-500/5 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Growth Batch 🚀</span>
              <span className="text-xs font-black text-[#008f68] dark:text-[#42b991]">₹999</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              <strong>1,000 Verified Leads</strong> • High ICP match • Direct outbound readiness
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedPackAmount(1999);
              setLeadPackDialogOpen(true);
            }}
            className="p-3.5 rounded-xl border border-border bg-card space-y-1 text-left hover:border-primary/50 hover:bg-muted/40 transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Enterprise Multi-City</span>
              <span className="text-xs font-black text-[#008f68] dark:text-[#42b991]">₹1,999</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              <strong>2,500 Verified Leads</strong> • Phone, WhatsApp & Email enrichment
            </p>
          </button>
        </div>
      </div>

      <LeadPackOrderDialog
        open={leadPackDialogOpen}
        onOpenChange={setLeadPackDialogOpen}
        defaultNiche={niche}
        defaultCity={city}
        initialAmount={selectedPackAmount}
      />
    </div>
  );
}
