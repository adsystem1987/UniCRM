/**
 * Turnkey Industry Blueprints Catalog
 * Pre-configured industry pipelines, lead tags, WhatsApp outreach scripts,
 * and clean lead search parameters for high-converting sales cycles.
 * Supports smart regional customization: India (IN), USA/UK (US), UAE/GCC (AE), Global.
 */

export type BlueprintRegion = "in" | "us" | "ae" | "global";

export interface BlueprintStage {
  name: string;
  color: string;
  position: number;
}

export interface BlueprintTag {
  name: string;
  color: string;
}

export interface BlueprintTemplate {
  name: string;
  category: "Marketing" | "Utility";
  bodyText: string;
}

export interface IndustryBlueprint {
  id: string;
  name: string;
  shortDesc: string;
  category: "Real Estate & Home" | "Finance & Legal" | "Health & Lifestyle" | "Automotive & Retail" | "Services & Events";
  iconName: string;
  leadNiche: string;
  suggestedCities: string[];
  stages: Record<BlueprintRegion, BlueprintStage[]>;
  tags: Record<BlueprintRegion, BlueprintTag[]>;
  templates: Record<BlueprintRegion, BlueprintTemplate[]>;
}

export const INDUSTRY_BLUEPRINTS: IndustryBlueprint[] = [
  // 1. Interior Design & Architecture
  {
    id: "interior_design",
    name: "Interior Design & Fitouts",
    shortDesc: "For interior designers, modular kitchen studios, architects, and luxury home decorators.",
    category: "Real Estate & Home",
    iconName: "Home",
    leadNiche: "Interior Designers",
    suggestedCities: ["Bangalore", "Mumbai", "Delhi NCR", "Dubai", "New York", "London"],
    stages: {
      in: [
        { name: "Fresh Inquiry", color: "#3b82f6", position: 0 },
        { name: "Site Measurement Done", color: "#eab308", position: 1 },
        { name: "3D Design & Moodboard Sent", color: "#f97316", position: 2 },
        { name: "Quotation & Material Finalization", color: "#8b5cf6", position: 3 },
        { name: "Advance Received (Execution)", color: "#10b981", position: 4 },
        { name: "Handover Completed", color: "#059669", position: 5 },
      ],
      us: [
        { name: "Initial Consultation", color: "#3b82f6", position: 0 },
        { name: "On-Site Walkthrough", color: "#eab308", position: 1 },
        { name: "Design Concept & Renderings", color: "#f97316", position: 2 },
        { name: "Estimate & Scope Approval", color: "#8b5cf6", position: 3 },
        { name: "Retainer Paid / In Progress", color: "#10b981", position: 4 },
        { name: "Project Completion", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Villa / Apartment Inspection", color: "#eab308", position: 1 },
        { name: "3D Visuals & Material Board", color: "#f97316", position: 2 },
        { name: "BOQ & Fitout Contract", color: "#8b5cf6", position: 3 },
        { name: "Advance Paid / Site Mobilization", color: "#10b981", position: 4 },
        { name: "Handover & Snagging Clearance", color: "#059669", position: 5 },
      ],
      global: [
        { name: "New Lead", color: "#3b82f6", position: 0 },
        { name: "Space Assessment Scheduled", color: "#eab308", position: 1 },
        { name: "Design Proposal Sent", color: "#f97316", position: 2 },
        { name: "Quote Review & Negotiation", color: "#8b5cf6", position: 3 },
        { name: "Deposit Paid & Active", color: "#10b981", position: 4 },
        { name: "Delivered & Signed Off", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "2BHK", color: "#3b82f6" },
        { name: "3BHK / Villa", color: "#8b5cf6" },
        { name: "Modular Kitchen", color: "#f97316" },
        { name: "Turnkey Fitout", color: "#10b981" },
        { name: "Commercial / Office", color: "#06b6d4" },
      ],
      us: [
        { name: "Full Home Remodel", color: "#8b5cf6" },
        { name: "Kitchen & Bath", color: "#f97316" },
        { name: "High Budget ($50k+)", color: "#10b981" },
        { name: "Residential", color: "#3b82f6" },
        { name: "Commercial Interior", color: "#06b6d4" },
      ],
      ae: [
        { name: "Luxury Villa", color: "#8b5cf6" },
        { name: "Downtown Apartment", color: "#3b82f6" },
        { name: "Commercial Fitout", color: "#06b6d4" },
        { name: "Turnkey Contracting", color: "#10b981" },
      ],
      global: [
        { name: "Residential", color: "#3b82f6" },
        { name: "Commercial", color: "#06b6d4" },
        { name: "Luxury / High Value", color: "#8b5cf6" },
        { name: "Renovation", color: "#f97316" },
      ],
    },
    templates: {
      in: [
        {
          name: "interior_intro_portfolio",
          category: "Marketing",
          bodyText: "Hello {{name}}, thank you for exploring home interior options with us. Would you like a quick PDF brochure of our recent 3D project walk-throughs in {{city}}?",
        },
        {
          name: "interior_measurement_reminder",
          category: "Utility",
          bodyText: "Hi {{name}}, our senior designer is scheduled to visit your site for laser measurements on {{date}}. Please confirm if this time works for you.",
        },
      ],
      us: [
        {
          name: "interior_consult_intro",
          category: "Marketing",
          bodyText: "Hi {{name}}, thanks for reaching out regarding your upcoming renovation project. We'd love to share our latest project lookbook. When would be a good time for a brief 10-minute discovery call?",
        },
        {
          name: "interior_estimate_sent",
          category: "Utility",
          bodyText: "Hi {{name}}, we've prepared your custom design proposal and scope estimate. Review the link here and let us know if you'd like to adjust any finishes: {{link}}",
        },
      ],
      ae: [
        {
          name: "interior_villa_welcome",
          category: "Marketing",
          bodyText: "Dear {{name}}, greetings from our design studio. We specialize in luxury villa and apartment fitouts across {{city}}. Would you like to review our recent portfolio and book a complimentary site assessment?",
        },
        {
          name: "interior_proposal_review",
          category: "Utility",
          bodyText: "Hello {{name}}, your turnkey 3D visual package and BOQ quotation are ready for your review: {{link}}. Let us know when we can arrange a brief review session.",
        },
      ],
      global: [
        {
          name: "interior_welcome_catalog",
          category: "Marketing",
          bodyText: "Hello {{name}}, thanks for connecting with us. We have attached our design catalog and client case studies. What style are you envisioning for your space?",
        },
        {
          name: "interior_quote_followup",
          category: "Utility",
          bodyText: "Hi {{name}}, just following up on the quotation we shared. Let us know if you have questions regarding the material choices or milestone schedule.",
        },
      ],
    },
  },

  // 2. Loan Providers & Mortgage Brokers (DSA)
  {
    id: "loan_provider",
    name: "Loan Providers & Mortgage Brokers",
    shortDesc: "For loan consultants, DSAs, mortgage advisors, and commercial lending brokers.",
    category: "Finance & Legal",
    iconName: "Landmark",
    leadNiche: "Financial Services",
    suggestedCities: ["Mumbai", "Delhi NCR", "Bangalore", "Dubai", "New York", "London"],
    stages: {
      in: [
        { name: "Lead Received", color: "#3b82f6", position: 0 },
        { name: "Document Collection (KYC/ITR)", color: "#eab308", position: 1 },
        { name: "CIBIL / Bank Eligibility Checked", color: "#f97316", position: 2 },
        { name: "Logged into Bank / NBFC", color: "#8b5cf6", position: 3 },
        { name: "Sanction Letter Issued", color: "#10b981", position: 4 },
        { name: "Disbursed & Commission Settled", color: "#059669", position: 5 },
      ],
      us: [
        { name: "Applicant Intake", color: "#3b82f6", position: 0 },
        { name: "Document Upload (W2/1099)", color: "#eab308", position: 1 },
        { name: "Pre-Approval & Credit Review", color: "#f97316", position: 2 },
        { name: "Underwriting & Appraisal", color: "#8b5cf6", position: 3 },
        { name: "Clear to Close", color: "#10b981", position: 4 },
        { name: "Loan Funded", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Salary Certificate & Bank Statement", color: "#eab308", position: 1 },
        { name: "AECB Score & Eligibility", color: "#f97316", position: 2 },
        { name: "Bank Pre-Approval Obtained", color: "#8b5cf6", position: 3 },
        { name: "Final Offer Accepted", color: "#10b981", position: 4 },
        { name: "Mortgage Disbursed", color: "#059669", position: 5 },
      ],
      global: [
        { name: "Inquiry / Application", color: "#3b82f6", position: 0 },
        { name: "Proof of Income Submitted", color: "#eab308", position: 1 },
        { name: "Lender Matching & Rate Comparison", color: "#f97316", position: 2 },
        { name: "Submitted to Lender", color: "#8b5cf6", position: 3 },
        { name: "Approved / Term Sheet Issued", color: "#10b981", position: 4 },
        { name: "Funded & Disbursed", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "Home Loan", color: "#3b82f6" },
        { name: "Business Loan", color: "#8b5cf6" },
        { name: "LAP (Property Loan)", color: "#f97316" },
        { name: "Salaried", color: "#10b981" },
        { name: "Self-Employed", color: "#06b6d4" },
      ],
      us: [
        { name: "Conventional Mortgage", color: "#3b82f6" },
        { name: "Refinance", color: "#06b6d4" },
        { name: "Hard Money / DSCR", color: "#8b5cf6" },
        { name: "First-Time Buyer", color: "#10b981" },
      ],
      ae: [
        { name: "Residential Mortgage", color: "#3b82f6" },
        { name: "Commercial Financing", color: "#8b5cf6" },
        { name: "Non-Resident Loan", color: "#f97316" },
        { name: "Salary Transfer", color: "#10b981" },
      ],
      global: [
        { name: "Residential", color: "#3b82f6" },
        { name: "Commercial", color: "#8b5cf6" },
        { name: "High Net Worth", color: "#10b981" },
        { name: "Urgent Disbursement", color: "#f97316" },
      ],
    },
    templates: {
      in: [
        {
          name: "loan_instant_comparison",
          category: "Marketing",
          bodyText: "Hi {{name}}, we assist with instant rate comparisons across top banks in {{city}} with 0 processing charges. Would you like a quick EMI calculation for your requirement?",
        },
        {
          name: "loan_doc_checklist",
          category: "Utility",
          bodyText: "Hello {{name}}, to process your sanction letter quickly, please share the following 3 documents over WhatsApp: 1) Last 3 months payslips/bank statements 2) PAN & Aadhaar 3) Electricity bill.",
        },
      ],
      us: [
        {
          name: "loan_rate_check",
          category: "Marketing",
          bodyText: "Hi {{name}}, mortgage rates recently updated. Would you like a free, no-obligation rate quote and pre-approval check for your upcoming property purchase?",
        },
        {
          name: "loan_upload_link",
          category: "Utility",
          bodyText: "Hi {{name}}, your secure document portal is ready. Please upload your recent W2 and bank statements here to expedite your underwriting: {{link}}",
        },
      ],
      ae: [
        {
          name: "loan_dubai_mortgage",
          category: "Marketing",
          bodyText: "Dear {{name}}, we provide independent mortgage advisory across UAE banks with preferred rates for residents & investors. Would you like to check your maximum borrowing eligibility?",
        },
        {
          name: "loan_preapproval_ready",
          category: "Utility",
          bodyText: "Hello {{name}}, your bank pre-approval certificate has been received! Review the terms and validity period here: {{link}}",
        },
      ],
      global: [
        {
          name: "loan_welcome_quote",
          category: "Marketing",
          bodyText: "Hello {{name}}, thanks for your financing inquiry. We compare offerings from multiple vetted lenders to secure the lowest rates. What loan amount are you considering?",
        },
        {
          name: "loan_status_update",
          category: "Utility",
          bodyText: "Hi {{name}}, good news! Your application has advanced to the next review stage. We will notify you as soon as the final terms are issued.",
        },
      ],
    },
  },

  // 3. Real Estate Developers & Brokers
  {
    id: "real_estate",
    name: "Real Estate Developers & Brokers",
    shortDesc: "For property developers, channel partners, real estate agents, and land brokers.",
    category: "Real Estate & Home",
    iconName: "Building",
    leadNiche: "Real Estate",
    suggestedCities: ["Mumbai", "Bangalore", "Delhi NCR", "Dubai", "Miami", "Toronto"],
    stages: {
      in: [
        { name: "Fresh Lead", color: "#3b82f6", position: 0 },
        { name: "Site Visit Scheduled", color: "#eab308", position: 1 },
        { name: "Site Visit Completed", color: "#f97316", position: 2 },
        { name: "Price & Floor Plan Negotiation", color: "#8b5cf6", position: 3 },
        { name: "Token / Booking Advance Paid", color: "#10b981", position: 4 },
        { name: "Sale Deed & Registration Done", color: "#059669", position: 5 },
      ],
      us: [
        { name: "New Buyer / Seller", color: "#3b82f6", position: 0 },
        { name: "Showing Scheduled", color: "#eab308", position: 1 },
        { name: "Property Tour Completed", color: "#f97316", position: 2 },
        { name: "Offer Submitted & Countered", color: "#8b5cf6", position: 3 },
        { name: "Under Contract / Escrow", color: "#10b981", position: 4 },
        { name: "Closing Complete", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Investor Inquiry", color: "#3b82f6", position: 0 },
        { name: "Viewing Scheduled", color: "#eab308", position: 1 },
        { name: "Viewing / Virtual Tour Done", color: "#f97316", position: 2 },
        { name: "Payment Plan Selection", color: "#8b5cf6", position: 3 },
        { name: "Booking Deposit Received", color: "#10b981", position: 4 },
        { name: "SPA Signed & Oqood Registered", color: "#059669", position: 5 },
      ],
      global: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Property Viewing Booked", color: "#eab308", position: 1 },
        { name: "Viewing Attended", color: "#f97316", position: 2 },
        { name: "Contract / Price Negotiation", color: "#8b5cf6", position: 3 },
        { name: "Deposit Paid", color: "#10b981", position: 4 },
        { name: "Sold / Leased", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "End User Buyer", color: "#3b82f6" },
        { name: "Investor", color: "#10b981" },
        { name: "2BHK / 3BHK", color: "#8b5cf6" },
        { name: "Plot / Villa", color: "#f97316" },
        { name: "Ready to Move", color: "#06b6d4" },
      ],
      us: [
        { name: "Buyer", color: "#3b82f6" },
        { name: "Seller Listing", color: "#8b5cf6" },
        { name: "Cash Buyer", color: "#10b981" },
        { name: "Single Family Home", color: "#f97316" },
      ],
      ae: [
        { name: "Off-Plan Investment", color: "#8b5cf6" },
        { name: "Luxury Waterfront", color: "#3b82f6" },
        { name: "Golden Visa Buyer", color: "#10b981" },
        { name: "High ROI (>8%)", color: "#06b6d4" },
      ],
      global: [
        { name: "Buyer", color: "#3b82f6" },
        { name: "Investor", color: "#10b981" },
        { name: "Luxury", color: "#8b5cf6" },
        { name: "High Intent", color: "#f97316" },
      ],
    },
    templates: {
      in: [
        {
          name: "re_brochure_share",
          category: "Marketing",
          bodyText: "Hello {{name}}, thank you for inquiring about our luxury projects in {{city}}. I have attached the project master layout and payment plan PDF. Would this weekend work for a guided site tour?",
        },
        {
          name: "re_visit_reminder",
          category: "Utility",
          bodyText: "Hi {{name}}, confirming your site visit for {{project}} tomorrow at {{time}}. Google Maps location pin: {{location}}. Our sales representative will receive you at the experience center.",
        },
      ],
      us: [
        {
          name: "re_showing_welcome",
          category: "Marketing",
          bodyText: "Hi {{name}}, thanks for reaching out regarding property listings in {{city}}. I've pulled up 3 exclusive properties matching your criteria. When are you free for a quick walkthrough this week?",
        },
        {
          name: "re_showing_confirm",
          category: "Utility",
          bodyText: "Hi {{name}}, your property showing at {{address}} is confirmed for {{time}}. Looking forward to walking you through!",
        },
      ],
      ae: [
        {
          name: "re_dubai_offplan",
          category: "Marketing",
          bodyText: "Dear {{name}}, greetings from Dubai. We have exclusive off-plan investment units offering up to 9% net rental yields with flexible 5-year post-handover payment plans. Would you like the official brochure?",
        },
        {
          name: "re_dubai_viewing",
          category: "Utility",
          bodyText: "Hello {{name}}, your private viewing appointment at the sales gallery is confirmed for {{time}}. Valet parking is available at the entrance.",
        },
      ],
      global: [
        {
          name: "re_general_intro",
          category: "Marketing",
          bodyText: "Hello {{name}}, thanks for your interest in our property portfolio. We'd love to help you find the ideal space. Are you looking to purchase for personal use or investment?",
        },
        {
          name: "re_followup_feedback",
          category: "Utility",
          bodyText: "Hi {{name}}, thank you for attending the property tour today. We would love to hear your feedback on the layout and pricing. Did it match what you are looking for?",
        },
      ],
    },
  },

  // 4. Home Services & Contractors (Solar, HVAC, Roofing, Plumbers)
  {
    id: "home_services",
    name: "Home Services & Contractors",
    shortDesc: "For solar energy installers, HVAC specialists, roofing contractors, plumbers, and electricians.",
    category: "Real Estate & Home",
    iconName: "Wrench",
    leadNiche: "Solar & CleanTech",
    suggestedCities: ["Bangalore", "Pune", "Austin", "Phoenix", "London", "Sydney"],
    stages: {
      in: [
        { name: "Service Inquiry", color: "#3b82f6", position: 0 },
        { name: "Site Inspection / Roof Audit", color: "#eab308", position: 1 },
        { name: "Subsidy & Cost Estimate Sent", color: "#f97316", position: 2 },
        { name: "Order Confirmed & Advance Paid", color: "#8b5cf6", position: 3 },
        { name: "Installation Completed", color: "#10b981", position: 4 },
        { name: "Net Metering & AMC Active", color: "#059669", position: 5 },
      ],
      us: [
        { name: "New Lead / Service Request", color: "#3b82f6", position: 0 },
        { name: "Estimate Visit Scheduled", color: "#eab308", position: 1 },
        { name: "Proposal & Quote Delivered", color: "#f97316", position: 2 },
        { name: "Contract Signed & Deposit Paid", color: "#8b5cf6", position: 3 },
        { name: "Work In Progress / Crew On Site", color: "#10b981", position: 4 },
        { name: "Job Completed & Warranty Active", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Service Request", color: "#3b82f6", position: 0 },
        { name: "Technician Inspection Scheduled", color: "#eab308", position: 1 },
        { name: "Quotation & Parts List Sent", color: "#f97316", position: 2 },
        { name: "Approved & Mobilized", color: "#8b5cf6", position: 3 },
        { name: "Maintenance / Install Completed", color: "#10b981", position: 4 },
        { name: "Warranty & Signoff", color: "#059669", position: 5 },
      ],
      global: [
        { name: "New Job Request", color: "#3b82f6", position: 0 },
        { name: "Inspection Booked", color: "#eab308", position: 1 },
        { name: "Estimate Delivered", color: "#f97316", position: 2 },
        { name: "Deposit Paid / Scheduled", color: "#8b5cf6", position: 3 },
        { name: "Execution Finished", color: "#10b981", position: 4 },
        { name: "Paid in Full", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "Solar Rooftop", color: "#f97316" },
        { name: "Government Subsidy", color: "#10b981" },
        { name: "Commercial / Factory", color: "#8b5cf6" },
        { name: "Residential", color: "#3b82f6" },
      ],
      us: [
        { name: "Emergency Service", color: "#ef4444" },
        { name: "Solar + Battery", color: "#f97316" },
        { name: "HVAC Replacement", color: "#3b82f6" },
        { name: "Insurance Claim", color: "#8b5cf6" },
      ],
      ae: [
        { name: "AC Maintenance / HVAC", color: "#3b82f6" },
        { name: "Villa Annual Contract", color: "#10b981" },
        { name: "Commercial Facilities", color: "#8b5cf6" },
      ],
      global: [
        { name: "Residential", color: "#3b82f6" },
        { name: "Commercial", color: "#8b5cf6" },
        { name: "Urgent", color: "#ef4444" },
        { name: "Maintenance Contract", color: "#10b981" },
      ],
    },
    templates: {
      in: [
        {
          name: "solar_subsidy_intro",
          category: "Marketing",
          bodyText: "Hello {{name}}, with the latest government solar rooftop subsidy, homeowners in {{city}} can save up to 80% on monthly electricity bills. Would you like a free rooftop assessment?",
        },
        {
          name: "contractor_visit_confirm",
          category: "Utility",
          bodyText: "Hi {{name}}, our field engineer is scheduled to arrive at your premises for the technical survey on {{date}} at {{time}}.",
        },
      ],
      us: [
        {
          name: "contractor_quote_followup",
          category: "Marketing",
          bodyText: "Hi {{name}}, thank you for requesting an estimate. We provide full warranty protection and flexible financing. When would you like our estimator to stop by for a quick 15-minute measurement?",
        },
        {
          name: "contractor_job_scheduled",
          category: "Utility",
          bodyText: "Hi {{name}}, your job is confirmed on our crew schedule for {{date}}. Please ensure site access is clear prior to our arrival.",
        },
      ],
      ae: [
        {
          name: "maintenance_annual_offer",
          category: "Marketing",
          bodyText: "Dear {{name}}, ensure your villa's cooling and plumbing stay trouble-free with our 24/7 emergency response contract. Would you like a complimentary AC health check?",
        },
        {
          name: "maintenance_technician_eta",
          category: "Utility",
          bodyText: "Hello {{name}}, your assigned technician is en route to your address. Estimated arrival time: {{time}}.",
        },
      ],
      global: [
        {
          name: "service_estimate_ready",
          category: "Utility",
          bodyText: "Hi {{name}}, your detailed service estimate is ready: {{link}}. Please review and let us know if you approve so we can lock in your installation date.",
        },
        {
          name: "service_completion_checkin",
          category: "Utility",
          bodyText: "Hi {{name}}, our technician marked your service request as completed. Please let us know if everything is running smoothly!",
        },
      ],
    },
  },

  // 5. Legal, Tax & Accounting (CA / CPA)
  {
    id: "legal_tax",
    name: "Legal, Tax Advisory & Accounting",
    shortDesc: "For chartered accountants, CPAs, tax consultants, corporate lawyers, and bookkeeping firms.",
    category: "Finance & Legal",
    iconName: "Scale",
    leadNiche: "Law Firms",
    suggestedCities: ["Delhi NCR", "Mumbai", "Bangalore", "Dubai", "New York", "Chicago"],
    stages: {
      in: [
        { name: "Consultation Request", color: "#3b82f6", position: 0 },
        { name: "Document Intake (Bank/GST)", color: "#eab308", position: 1 },
        { name: "Computation & Draft Ready", color: "#f97316", position: 2 },
        { name: "Client Approval & Signing", color: "#8b5cf6", position: 3 },
        { name: "Filed with Authority", color: "#10b981", position: 4 },
        { name: "Acknowledgement & Billed", color: "#059669", position: 5 },
      ],
      us: [
        { name: "New Client Consultation", color: "#3b82f6", position: 0 },
        { name: "Engagement Letter Signed", color: "#eab308", position: 1 },
        { name: "Financial Documents Uploaded", color: "#f97316", position: 2 },
        { name: "Tax Return / Filing Prepared", color: "#8b5cf6", position: 3 },
        { name: "Client Review & e-Signature", color: "#10b981", position: 4 },
        { name: "IRS Filed & Retainer Active", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Corporate Advisory Inquiry", color: "#3b82f6", position: 0 },
        { name: "Freezone / Mainland Assessment", color: "#eab308", position: 1 },
        { name: "Document Collection (Passport/Ejari)", color: "#f97316", position: 2 },
        { name: "Corporate Tax / VAT Filing", color: "#8b5cf6", position: 3 },
        { name: "License / Tax Return Approved", color: "#10b981", position: 4 },
        { name: "Compliance Retainer Active", color: "#059669", position: 5 },
      ],
      global: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Discovery Call & Engagement", color: "#eab308", position: 1 },
        { name: "Document Collection", color: "#f97316", position: 2 },
        { name: "Drafting & Review", color: "#8b5cf6", position: 3 },
        { name: "Approved & Submitted", color: "#10b981", position: 4 },
        { name: "Retainer Complete", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "Income Tax (ITR)", color: "#3b82f6" },
        { name: "GST Compliance", color: "#10b981" },
        { name: "Company Incorporation", color: "#8b5cf6" },
        { name: "Audit / Notice", color: "#ef4444" },
      ],
      us: [
        { name: "Individual 1040", color: "#3b82f6" },
        { name: "Corporate 1120S", color: "#8b5cf6" },
        { name: "Monthly Bookkeeping", color: "#10b981" },
        { name: "Tax Resolution / IRS", color: "#ef4444" },
      ],
      ae: [
        { name: "Corporate Tax (9%)", color: "#8b5cf6" },
        { name: "VAT Registration / Return", color: "#10b981" },
        { name: "Company Setup (Freezone)", color: "#3b82f6" },
        { name: "Golden Visa Legal", color: "#f97316" },
      ],
      global: [
        { name: "Tax Advisory", color: "#3b82f6" },
        { name: "Corporate Legal", color: "#8b5cf6" },
        { name: "Monthly Retainer", color: "#10b981" },
      ],
    },
    templates: {
      in: [
        {
          name: "tax_filing_deadline",
          category: "Utility",
          bodyText: "Hello {{name}}, this is a reminder from your tax advisory team. Upcoming statutory filing deadline is approaching. Please share your bank statements & GST invoices to avoid late fees.",
        },
        {
          name: "tax_incorporation_info",
          category: "Marketing",
          bodyText: "Hi {{name}}, planning to register a new Pvt Ltd or LLP? We handle complete name approval, DIN, MOA, and GST registration in 7 business days with transparent pricing. Can we discuss your startup requirements?",
        },
      ],
      us: [
        {
          name: "cpa_tax_prep_intro",
          category: "Marketing",
          bodyText: "Hi {{name}}, tax season is here. We help business owners maximize deductions and minimize tax liability with proactive year-round planning. Would you like a 15-minute tax review?",
        },
        {
          name: "cpa_portal_reminder",
          category: "Utility",
          bodyText: "Hi {{name}}, we are ready to finalize your return. Please review and electronically sign your authorization forms in your client portal here: {{link}}",
        },
      ],
      ae: [
        {
          name: "dubai_corporate_tax",
          category: "Marketing",
          bodyText: "Dear {{name}}, UAE Corporate Tax registration is now mandatory for all active trade licenses. Our certified tax agents ensure 100% compliance without penalties. May we schedule a consultation?",
        },
        {
          name: "dubai_doc_request",
          category: "Utility",
          bodyText: "Hello {{name}}, to complete your trade license renewal and tax filing, please share your updated Memorandum of Association (MOA) and Ejari certificate.",
        },
      ],
      global: [
        {
          name: "legal_consultation_welcome",
          category: "Marketing",
          bodyText: "Hello {{name}}, thank you for reaching out to our advisory practice. We assist clients with corporate structuring, contracts, and tax strategy. When are you free for a consultation?",
        },
        {
          name: "legal_draft_ready",
          category: "Utility",
          bodyText: "Hi {{name}}, your draft document is ready for your review: {{link}}. Please leave your feedback or approvals so we can finalize execution.",
        },
      ],
    },
  },

  // 6. B2B & Digital Marketing Agencies
  {
    id: "digital_agency",
    name: "Digital Agencies & B2B Services",
    shortDesc: "For performance marketing agencies, web developers, SEO specialists, and creative studios.",
    category: "Services & Events",
    iconName: "Sparkles",
    leadNiche: "D2C Brands",
    suggestedCities: ["Bangalore", "Mumbai", "London", "Austin", "Dubai", "Singapore"],
    stages: {
      in: [
        { name: "Inquiry / Audit Request", color: "#3b82f6", position: 0 },
        { name: "Discovery Call Done", color: "#eab308", position: 1 },
        { name: "Growth Strategy & Pitch Sent", color: "#f97316", position: 2 },
        { name: "Contract & Retainer Negotiated", color: "#8b5cf6", position: 3 },
        { name: "Onboarding & Retainer Paid", color: "#10b981", position: 4 },
        { name: "Active Retainer / Scaling", color: "#059669", position: 5 },
      ],
      us: [
        { name: "Inbound Prospect", color: "#3b82f6", position: 0 },
        { name: "Discovery Call Completed", color: "#eab308", position: 1 },
        { name: "Proposal & Scope of Work Sent", color: "#f97316", position: 2 },
        { name: "Contract Review", color: "#8b5cf6", position: 3 },
        { name: "Deposit Paid / Kickoff", color: "#10b981", position: 4 },
        { name: "Active Client", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Strategy Briefing Done", color: "#eab308", position: 1 },
        { name: "Proposal & Commercial Offer", color: "#f97316", position: 2 },
        { name: "Agreement Signed", color: "#8b5cf6", position: 3 },
        { name: "Advance Invoiced & Onboarding", color: "#10b981", position: 4 },
        { name: "Campaign Scaling", color: "#059669", position: 5 },
      ],
      global: [
        { name: "New Lead", color: "#3b82f6", position: 0 },
        { name: "Discovery Call Done", color: "#eab308", position: 1 },
        { name: "Proposal Sent", color: "#f97316", position: 2 },
        { name: "Contract In Review", color: "#8b5cf6", position: 3 },
        { name: "Won & Retainer Paid", color: "#10b981", position: 4 },
        { name: "Active Delivery", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "Performance Marketing (Meta/Google)", color: "#3b82f6" },
        { name: "Web / App Development", color: "#8b5cf6" },
        { name: "Monthly Retainer", color: "#10b981" },
        { name: "High Budget (>₹1L/mo)", color: "#f97316" },
      ],
      us: [
        { name: "PPC / Paid Ads", color: "#3b82f6" },
        { name: "SEO & Content", color: "#10b981" },
        { name: "Shopify / Web Design", color: "#8b5cf6" },
        { name: "Retainer ($3k+/mo)", color: "#f97316" },
      ],
      ae: [
        { name: "Social Media Management", color: "#3b82f6" },
        { name: "Lead Generation", color: "#10b981" },
        { name: "Branding & Production", color: "#8b5cf6" },
      ],
      global: [
        { name: "Retainer", color: "#10b981" },
        { name: "Project", color: "#3b82f6" },
        { name: "High Value", color: "#f97316" },
      ],
    },
    templates: {
      in: [
        {
          name: "agency_free_audit",
          category: "Marketing",
          bodyText: "Hi {{name}}, we reviewed your digital presence in {{city}} and spotted 3 key opportunities to double your qualified leads on WhatsApp. Would you like a complimentary 5-minute video audit?",
        },
        {
          name: "agency_proposal_share",
          category: "Utility",
          bodyText: "Hi {{name}}, your tailored marketing strategy deck and ROI projections are ready: {{link}}. Let's connect tomorrow to walk through the deliverables.",
        },
      ],
      us: [
        {
          name: "agency_discovery_invite",
          category: "Marketing",
          bodyText: "Hi {{name}}, loved your recent product updates. We specialize in scaling high-intent customer acquisition for brands in your space. Would you be open to a 10-minute strategy call next Tuesday?",
        },
        {
          name: "agency_sow_sent",
          category: "Utility",
          bodyText: "Hi {{name}}, our scope of work and monthly retainer proposal is ready for your review: {{link}}. Looking forward to partnering together!",
        },
      ],
      ae: [
        {
          name: "dubai_agency_pitch",
          category: "Marketing",
          bodyText: "Dear {{name}}, we manage omni-channel performance marketing for top commercial brands in {{city}}. Would you like to review our client case studies and growth metrics?",
        },
        {
          name: "agency_kickoff_confirm",
          category: "Utility",
          bodyText: "Hello {{name}}, onboarding is underway! Please review our shared Slack / WhatsApp channel invite and client assets checklist here: {{link}}",
        },
      ],
      global: [
        {
          name: "agency_welcome_case_study",
          category: "Marketing",
          bodyText: "Hello {{name}}, thanks for reaching out. We help companies accelerate revenue with predictable acquisition funnels. What is your primary growth target for this quarter?",
        },
        {
          name: "agency_contract_followup",
          category: "Utility",
          bodyText: "Hi {{name}}, just following up on our proposal. Let us know if your executive team has any questions on the milestones or timeline.",
        },
      ],
    },
  },

  // 7. Auto Dealerships (New & Used Cars)
  {
    id: "auto_dealers",
    name: "Automotive & Dealerships",
    shortDesc: "For pre-owned car showrooms, luxury auto brokers, test-drive centers, and car exporters.",
    category: "Automotive & Retail",
    iconName: "Car",
    leadNiche: "Automotive",
    suggestedCities: ["Delhi NCR", "Mumbai", "Dubai", "Houston", "Frankfurt", "London"],
    stages: {
      in: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Test Drive Scheduled", color: "#eab308", position: 1 },
        { name: "Car Inspection & Valuation", color: "#f97316", position: 2 },
        { name: "Auto Loan / Finance Approval", color: "#8b5cf6", position: 3 },
        { name: "Token Advance Paid", color: "#10b981", position: 4 },
        { name: "Car Delivered & RC Transferred", color: "#059669", position: 5 },
      ],
      us: [
        { name: "Vehicle Inquiry", color: "#3b82f6", position: 0 },
        { name: "Test Drive Booked", color: "#eab308", position: 1 },
        { name: "Trade-In Appraisal", color: "#f97316", position: 2 },
        { name: "Financing / Lease Approval", color: "#8b5cf6", position: 3 },
        { name: "Deposit Placed", color: "#10b981", position: 4 },
        { name: "Sold & Keys Handed Over", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Buyer Inquiry", color: "#3b82f6", position: 0 },
        { name: "Showroom Viewing / Test Drive", color: "#eab308", position: 1 },
        { name: "Inspection & RTA Passing", color: "#f97316", position: 2 },
        { name: "Bank Finance / Export Papers", color: "#8b5cf6", position: 3 },
        { name: "Booking Deposit Received", color: "#10b981", position: 4 },
        { name: "Mulkiya Transferred & Delivery", color: "#059669", position: 5 },
      ],
      global: [
        { name: "Inquiry", color: "#3b82f6", position: 0 },
        { name: "Test Drive Scheduled", color: "#eab308", position: 1 },
        { name: "Inspection & Quote", color: "#f97316", position: 2 },
        { name: "Financing / Payment", color: "#8b5cf6", position: 3 },
        { name: "Deposit Paid", color: "#10b981", position: 4 },
        { name: "Vehicle Delivered", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "SUV", color: "#3b82f6" },
        { name: "Sedan / Hatchback", color: "#06b6d4" },
        { name: "Luxury Brand", color: "#8b5cf6" },
        { name: "Budget <₹10L", color: "#10b981" },
        { name: "Car Exchange / Trade-In", color: "#f97316" },
      ],
      us: [
        { name: "Truck / SUV", color: "#3b82f6" },
        { name: "EV / Hybrid", color: "#10b981" },
        { name: "Trade-In Appraisal", color: "#f97316" },
        { name: "Bad Credit / Subprime", color: "#8b5cf6" },
      ],
      ae: [
        { name: "Luxury Exotics", color: "#8b5cf6" },
        { name: "GCC Specs", color: "#10b981" },
        { name: "Export Clearance", color: "#f97316" },
        { name: "Zero Down Payment", color: "#3b82f6" },
      ],
      global: [
        { name: "Buyer", color: "#3b82f6" },
        { name: "Seller / Trade-in", color: "#f97316" },
        { name: "Finance Needed", color: "#8b5cf6" },
      ],
    },
    templates: {
      in: [
        {
          name: "auto_car_photos_specs",
          category: "Marketing",
          bodyText: "Hello {{name}}, thank you for inquiring about our certified pre-owned vehicles. I have attached the inspection report, service history, and HD photos. When can we arrange your test drive?",
        },
        {
          name: "auto_testdrive_confirm",
          category: "Utility",
          bodyText: "Hi {{name}}, your test drive for {{car_model}} is confirmed for {{time}} at our showroom in {{city}}. Please carry your original driving license.",
        },
      ],
      us: [
        {
          name: "auto_carfax_intro",
          category: "Marketing",
          bodyText: "Hi {{name}}, thanks for checking out {{car_model}}. It comes with a clean Carfax report and full dealer warranty. Are you trading in an existing vehicle?",
        },
        {
          name: "auto_appointment_reminder",
          category: "Utility",
          bodyText: "Hi {{name}}, reminding you of your test drive appointment today at {{time}}. We'll have the keys ready for you at the front desk!",
        },
      ],
      ae: [
        {
          name: "auto_dubai_spec_sheet",
          category: "Marketing",
          bodyText: "Dear {{name}}, thank you for inquiring about our GCC-spec inventory in Dubai. Attached is the full options list, warranty coverage, and monthly installment breakdown.",
        },
        {
          name: "auto_rta_passing_update",
          category: "Utility",
          bodyText: "Hello {{name}}, good news! Your vehicle has passed comprehensive RTA inspection with flying colors. We can now proceed with ownership transfer.",
        },
      ],
      global: [
        {
          name: "auto_general_inquiry",
          category: "Marketing",
          bodyText: "Hello {{name}}, thanks for your interest in our vehicle inventory. Are you looking to finance or purchase outright?",
        },
        {
          name: "auto_followup_quote",
          category: "Utility",
          bodyText: "Hi {{name}}, just following up on the drive and quotation. Let us know if you'd like to negotiate the trade-in allowance.",
        },
      ],
    },
  },

  // 8. Clinics, Aesthetics & Med-Spas
  {
    id: "clinics_healthcare",
    name: "Clinics, Aesthetics & Med-Spas",
    shortDesc: "For dental clinics, dermatology & hair transplant centers, cosmetic surgeons, and wellness clinics.",
    category: "Health & Lifestyle",
    iconName: "Stethoscope",
    leadNiche: "Clinics & Healthcare",
    suggestedCities: ["Mumbai", "Bangalore", "Delhi NCR", "Dubai", "Beverly Hills", "London"],
    stages: {
      in: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Doctor Consultation Booked", color: "#eab308", position: 1 },
        { name: "Consultation & Treatment Plan", color: "#f97316", position: 2 },
        { name: "Treatment Session Scheduled", color: "#8b5cf6", position: 3 },
        { name: "Procedure Completed & Paid", color: "#10b981", position: 4 },
        { name: "Post-Care & Followup Review", color: "#059669", position: 5 },
      ],
      us: [
        { name: "New Patient Lead", color: "#3b82f6", position: 0 },
        { name: "Consultation Booked", color: "#eab308", position: 1 },
        { name: "Assessment & Treatment Plan", color: "#f97316", position: 2 },
        { name: "Procedure Deposit Paid", color: "#8b5cf6", position: 3 },
        { name: "Treatment Completed", color: "#10b981", position: 4 },
        { name: "Followup & Maintenance", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Consultation Confirmed", color: "#eab308", position: 1 },
        { name: "Doctor Assessment Done", color: "#f97316", position: 2 },
        { name: "Package Booked & Advance Paid", color: "#8b5cf6", position: 3 },
        { name: "Session Administered", color: "#10b981", position: 4 },
        { name: "Review & Recall Active", color: "#059669", position: 5 },
      ],
      global: [
        { name: "Inquiry", color: "#3b82f6", position: 0 },
        { name: "Consultation Booked", color: "#eab308", position: 1 },
        { name: "Treatment Plan Sent", color: "#f97316", position: 2 },
        { name: "Procedure Scheduled", color: "#8b5cf6", position: 3 },
        { name: "Completed & Paid", color: "#10b981", position: 4 },
        { name: "Follow-up Due", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "Dental Implants / Aligners", color: "#3b82f6" },
        { name: "Dermatology / Skin Care", color: "#8b5cf6" },
        { name: "Hair Restoration", color: "#f97316" },
        { name: "VIP Patient", color: "#10b981" },
      ],
      us: [
        { name: "Botox / Injectables", color: "#8b5cf6" },
        { name: "Laser / Aesthetic", color: "#3b82f6" },
        { name: "High Ticket Procedure", color: "#10b981" },
        { name: "Cash Pay / Self Pay", color: "#f97316" },
      ],
      ae: [
        { name: "Cosmetic Surgery", color: "#8b5cf6" },
        { name: "Medical Tourism Patient", color: "#10b981" },
        { name: "Premium Aesthetics", color: "#3b82f6" },
      ],
      global: [
        { name: "Consultation", color: "#3b82f6" },
        { name: "Active Treatment", color: "#10b981" },
        { name: "Follow-up Due", color: "#f97316" },
      ],
    },
    templates: {
      in: [
        {
          name: "clinic_consult_booking",
          category: "Marketing",
          bodyText: "Hello {{name}}, thank you for contacting our clinic. Our senior specialist has slots open this week for a private consultation in {{city}}. What day suits your schedule?",
        },
        {
          name: "clinic_appt_reminder",
          category: "Utility",
          bodyText: "Hi {{name}}, reminding you of your doctor appointment tomorrow at {{time}}. Clinic location pin: {{location}}. Please arrive 10 minutes prior for registration.",
        },
      ],
      us: [
        {
          name: "medspa_welcome_offer",
          category: "Marketing",
          bodyText: "Hi {{name}}, thanks for reaching out to our wellness team. We offer customized treatment plans designed around your goals. Would you like to schedule your complimentary skin analysis?",
        },
        {
          name: "medspa_aftercare_checkin",
          category: "Utility",
          bodyText: "Hi {{name}}, checking in on you post-treatment! Remember to avoid direct sun exposure and stay hydrated. Reply here if you have any questions.",
        },
      ],
      ae: [
        {
          name: "clinic_dubai_vip",
          category: "Marketing",
          bodyText: "Dear {{name}}, welcome to our medical aesthetics center in Dubai. We host internationally certified consultants with private VIP suites. May we arrange your consultation?",
        },
        {
          name: "clinic_dubai_confirm",
          category: "Utility",
          bodyText: "Hello {{name}}, your appointment is confirmed with Dr. {{doctor}} on {{date}} at {{time}}. Complimentary valet is available.",
        },
      ],
      global: [
        {
          name: "clinic_general_confirm",
          category: "Utility",
          bodyText: "Hi {{name}}, your appointment has been confirmed for {{time}}. Looking forward to seeing you at the clinic!",
        },
        {
          name: "clinic_recall_followup",
          category: "Utility",
          bodyText: "Hi {{name}}, it's time for your routine 6-month checkup! Would you like us to reserve a convenient slot for you this week?",
        },
      ],
    },
  },

  // 9. Travel Agencies & Visa Consultants
  {
    id: "travel_visa",
    name: "Travel Agencies & Visa Consultants",
    shortDesc: "For custom holiday planners, visa consultants, Umrah & pilgrimage organizers, and corporate travel.",
    category: "Services & Events",
    iconName: "Plane",
    leadNiche: "Travel & Hospitality",
    suggestedCities: ["Delhi NCR", "Mumbai", "Dubai", "London", "Toronto", "Kochi"],
    stages: {
      in: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Custom Itinerary & Quote Sent", color: "#eab308", position: 1 },
        { name: "Flight & Hotel Finalized", color: "#f97316", position: 2 },
        { name: "Visa / Passport Processing", color: "#8b5cf6", position: 3 },
        { name: "Booking Confirmed & Vouchers Issued", color: "#10b981", position: 4 },
        { name: "Trip Completed & Review Received", color: "#059669", position: 5 },
      ],
      us: [
        { name: "Trip Inquiry", color: "#3b82f6", position: 0 },
        { name: "Proposal & Itinerary Delivered", color: "#eab308", position: 1 },
        { name: "Dates & Lodging Selected", color: "#f97316", position: 2 },
        { name: "Deposit Collected", color: "#8b5cf6", position: 3 },
        { name: "Booked & Confirmation Sent", color: "#10b981", position: 4 },
        { name: "Trip Completed", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Bespoke Itinerary Designed", color: "#eab308", position: 1 },
        { name: "Flights / 5-Star Hotel Locked", color: "#f97316", position: 2 },
        { name: "Payment Collected", color: "#8b5cf6", position: 3 },
        { name: "Vouchers & Transfers Issued", color: "#10b981", position: 4 },
        { name: "Post-Travel Concierge", color: "#059669", position: 5 },
      ],
      global: [
        { name: "Inquiry", color: "#3b82f6", position: 0 },
        { name: "Itinerary Sent", color: "#eab308", position: 1 },
        { name: "Booking Finalized", color: "#f97316", position: 2 },
        { name: "Deposit Paid", color: "#8b5cf6", position: 3 },
        { name: "Vouchers Sent", color: "#10b981", position: 4 },
        { name: "Completed", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "International Holiday", color: "#3b82f6" },
        { name: "Europe / Schengen Visa", color: "#8b5cf6" },
        { name: "Honeymoon Package", color: "#f97316" },
        { name: "Umrah / Pilgrimage", color: "#10b981" },
      ],
      us: [
        { name: "Luxury Cruise", color: "#3b82f6" },
        { name: "All-Inclusive Resort", color: "#10b981" },
        { name: "Family Vacation", color: "#8b5cf6" },
      ],
      ae: [
        { name: "Europe Summer Trip", color: "#3b82f6" },
        { name: "Maldives / Tropical", color: "#06b6d4" },
        { name: "VIP Jet / Concierge", color: "#8b5cf6" },
      ],
      global: [
        { name: "Leisure", color: "#3b82f6" },
        { name: "Corporate Travel", color: "#8b5cf6" },
        { name: "VIP Traveler", color: "#10b981" },
      ],
    },
    templates: {
      in: [
        {
          name: "travel_itinerary_share",
          category: "Marketing",
          bodyText: "Hello {{name}}, thank you for inquiring about your upcoming trip to {{destination}}. Attached is your customized day-by-day itinerary with hotel ratings and flight options. Would you like to adjust any dates?",
        },
        {
          name: "travel_voucher_delivery",
          category: "Utility",
          bodyText: "Hi {{name}}, your flight tickets, hotel vouchers, and airport pickup confirmation are ready: {{link}}. Wishing you a fantastic journey!",
        },
      ],
      us: [
        {
          name: "travel_discovery_welcome",
          category: "Marketing",
          bodyText: "Hi {{name}}, excited to help plan your getaway! We take care of every detail from private transfers to exclusive resort perks. When is your ideal travel window?",
        },
        {
          name: "travel_quote_ready",
          category: "Utility",
          bodyText: "Hi {{name}}, your curated trip proposal is ready for viewing here: {{link}}. Take a look and let us know your favorite resort option!",
        },
      ],
      ae: [
        {
          name: "travel_dubai_luxury",
          category: "Marketing",
          bodyText: "Dear {{name}}, planning your next international escape? We offer bespoke luxury itineraries with guaranteed 5-star benefits and VIP airport fast-track. Where are you dreaming of going?",
        },
        {
          name: "travel_dubai_docs",
          category: "Utility",
          bodyText: "Hello {{name}}, to finalize your visa application and bookings, please share your passport copies and preferred departure dates.",
        },
      ],
      global: [
        {
          name: "travel_general_quote",
          category: "Marketing",
          bodyText: "Hello {{name}}, thanks for reaching out. We have crafted a personalized travel plan matching your budget. What is your preferred travel month?",
        },
        {
          name: "travel_feedback_request",
          category: "Utility",
          bodyText: "Welcome home, {{name}}! We hope you had an unforgettable trip. We would love to hear how your stays and excursions went!",
        },
      ],
    },
  },

  // 10. Weddings, Event Planners & Banquet Venues
  {
    id: "events_weddings",
    name: "Weddings & Event Venues",
    shortDesc: "For wedding planners, luxury banquet halls, event decorators, and destination wedding specialists.",
    category: "Services & Events",
    iconName: "PartyPopper",
    leadNiche: "Event Venues",
    suggestedCities: ["Delhi NCR", "Jaipur", "Mumbai", "Dubai", "Cancun", "Florence"],
    stages: {
      in: [
        { name: "Date & Guest Inquiry", color: "#3b82f6", position: 0 },
        { name: "Venue / Studio Tour Scheduled", color: "#eab308", position: 1 },
        { name: "Decor Theme & Food Tasting", color: "#f97316", position: 2 },
        { name: "Contract & Advance Token Paid", color: "#8b5cf6", position: 3 },
        { name: "Vendor Coordination / Final Layout", color: "#10b981", position: 4 },
        { name: "Event Executed Successfully", color: "#059669", position: 5 },
      ],
      us: [
        { name: "Initial Inquiry", color: "#3b82f6", position: 0 },
        { name: "Venue Walkthrough Booked", color: "#eab308", position: 1 },
        { name: "Package & Catering Proposal", color: "#f97316", position: 2 },
        { name: "Date Reserved & Deposit Paid", color: "#8b5cf6", position: 3 },
        { name: "Planning & Rehearsal", color: "#10b981", position: 4 },
        { name: "Event Completed", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Event Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Ballroom / Island Site Visit", color: "#eab308", position: 1 },
        { name: "Bespoke Decor & Catering Pitch", color: "#f97316", position: 2 },
        { name: "Contract Signed & Deposit Paid", color: "#8b5cf6", position: 3 },
        { name: "Production & Rehearsal Done", color: "#10b981", position: 4 },
        { name: "Grand Execution", color: "#059669", position: 5 },
      ],
      global: [
        { name: "Inquiry", color: "#3b82f6", position: 0 },
        { name: "Tour Booked", color: "#eab308", position: 1 },
        { name: "Proposal Sent", color: "#f97316", position: 2 },
        { name: "Deposit Paid", color: "#8b5cf6", position: 3 },
        { name: "Rehearsal & Setup", color: "#10b981", position: 4 },
        { name: "Event Done", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "Destination Wedding", color: "#8b5cf6" },
        { name: "Banquet Hall (>500 guests)", color: "#3b82f6" },
        { name: "Luxury Decor Package", color: "#10b981" },
        { name: "High Budget (>₹25L)", color: "#f97316" },
      ],
      us: [
        { name: "Wedding (Full Planning)", color: "#8b5cf6" },
        { name: "Corporate Gala", color: "#3b82f6" },
        { name: "Private Estate / Venue", color: "#10b981" },
      ],
      ae: [
        { name: "Luxury Hotel Ballroom", color: "#8b5cf6" },
        { name: "Beachfront Destination", color: "#06b6d4" },
        { name: "Royal Gala", color: "#10b981" },
      ],
      global: [
        { name: "Wedding", color: "#8b5cf6" },
        { name: "Corporate", color: "#3b82f6" },
        { name: "High Value", color: "#10b981" },
      ],
    },
    templates: {
      in: [
        {
          name: "wedding_brochure_dates",
          category: "Marketing",
          bodyText: "Congratulations {{name}}! We host memorable celebrations in {{city}}. I have attached our packages and sample decor photos. What is your tentative wedding date and expected guest count?",
        },
        {
          name: "venue_tour_reminder",
          category: "Utility",
          bodyText: "Hi {{name}}, your guided tour of our venue is confirmed for {{date}} at {{time}}. We look forward to showing your family around!",
        },
      ],
      us: [
        {
          name: "event_walkthrough_welcome",
          category: "Marketing",
          bodyText: "Hi {{name}}, thanks for reaching out regarding dates for your celebration. Our dates for this upcoming season are booking fast. When are you available for a private venue walkthrough?",
        },
        {
          name: "event_quote_ready",
          category: "Utility",
          bodyText: "Hi {{name}}, your personalized catering and floral proposal is ready: {{link}}. Take a look and let us know if you'd like to hold the date!",
        },
      ],
      ae: [
        {
          name: "event_dubai_welcome",
          category: "Marketing",
          bodyText: "Dear {{name}}, greetings from our events production team in Dubai. We design iconic celebrations with world-class hospitality. Would you like to review our past weddings lookbook?",
        },
        {
          name: "event_site_visit_confirm",
          category: "Utility",
          bodyText: "Hello {{name}}, your site inspection at the ballroom is confirmed for {{time}}. Our senior event producer will welcome you at the grand lobby.",
        },
      ],
      global: [
        {
          name: "event_general_intro",
          category: "Marketing",
          bodyText: "Hello {{name}}, thank you for considering our venue for your upcoming event. What date or month do you have in mind?",
        },
        {
          name: "event_deposit_confirm",
          category: "Utility",
          bodyText: "Hi {{name}}, your deposit has been processed and your event date is officially reserved on our calendar! Looking forward to creating something wonderful.",
        },
      ],
    },
  },

  // 11. High-Ticket D2C & Custom Luxury (Jewelry, Apparel, Art)
  {
    id: "luxury_d2c",
    name: "Luxury Retail & Custom D2C",
    shortDesc: "For fine jewelry brands, bespoke tailoring, handmade furniture, and luxury e-commerce.",
    category: "Automotive & Retail",
    iconName: "Gem",
    leadNiche: "D2C Brands",
    suggestedCities: ["Mumbai", "Jaipur", "New York", "Dubai", "Paris", "London"],
    stages: {
      in: [
        { name: "Product Inquiry", color: "#3b82f6", position: 0 },
        { name: "Live Video Tour / Custom Sizing", color: "#eab308", position: 1 },
        { name: "Custom Quote & Certification Sent", color: "#f97316", position: 2 },
        { name: "UPI / Card Payment Link Paid", color: "#8b5cf6", position: 3 },
        { name: "Order Dispatched & Tracking Shared", color: "#10b981", position: 4 },
        { name: "Delivered & Repeat VIP", color: "#059669", position: 5 },
      ],
      us: [
        { name: "Customer Inquiry", color: "#3b82f6", position: 0 },
        { name: "Virtual Consultation / Styling", color: "#eab308", position: 1 },
        { name: "Custom Quote / Invoice Sent", color: "#f97316", position: 2 },
        { name: "Order Paid & In Production", color: "#8b5cf6", position: 3 },
        { name: "Shipped with Tracking", color: "#10b981", position: 4 },
        { name: "Delivered & Review Received", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Private Viewing / Video Showcase", color: "#eab308", position: 1 },
        { name: "Order Invoiced", color: "#f97316", position: 2 },
        { name: "Payment Received", color: "#8b5cf6", position: 3 },
        { name: "White-Glove Courier Delivery", color: "#10b981", position: 4 },
        { name: "VIP Relationship Active", color: "#059669", position: 5 },
      ],
      global: [
        { name: "Inquiry", color: "#3b82f6", position: 0 },
        { name: "Custom Details Finalized", color: "#eab308", position: 1 },
        { name: "Invoice Sent", color: "#f97316", position: 2 },
        { name: "Paid", color: "#8b5cf6", position: 3 },
        { name: "Dispatched", color: "#10b981", position: 4 },
        { name: "Delivered", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "Gold / Diamond Jewelry", color: "#eab308" },
        { name: "Bespoke Bridal Wear", color: "#f97316" },
        { name: "High Value VIP", color: "#8b5cf6" },
        { name: "Repeat Buyer", color: "#10b981" },
      ],
      us: [
        { name: "Custom Fine Jewelry", color: "#eab308" },
        { name: "High AOV ($1,000+)", color: "#10b981" },
        { name: "Made to Order", color: "#8b5cf6" },
      ],
      ae: [
        { name: "Haute Horlogerie / Watches", color: "#8b5cf6" },
        { name: "Bespoke Jewelry", color: "#eab308" },
        { name: "VIP Client", color: "#10b981" },
      ],
      global: [
        { name: "High Value", color: "#10b981" },
        { name: "Custom Order", color: "#8b5cf6" },
        { name: "Repeat Buyer", color: "#3b82f6" },
      ],
    },
    templates: {
      in: [
        {
          name: "d2c_video_showcase",
          category: "Marketing",
          bodyText: "Hello {{name}}, thank you for admiring our handcrafted collection! Would you like a quick 2-minute live WhatsApp video to inspect the detailing and craftsmanship up close?",
        },
        {
          name: "d2c_order_dispatch",
          category: "Utility",
          bodyText: "Hi {{name}}, your handcrafted order has been carefully packed and dispatched via insured courier. Tracking link: {{link}}.",
        },
      ],
      us: [
        {
          name: "luxury_custom_invite",
          category: "Marketing",
          bodyText: "Hi {{name}}, thanks for your interest in our bespoke pieces. Every item is individually crafted by our master artisans. Can we share a quick measurement and gemstone selection guide?",
        },
        {
          name: "luxury_tracking_update",
          category: "Utility",
          bodyText: "Hi {{name}}, your custom piece has shipped via FedEx Priority with signature required upon delivery: {{link}}.",
        },
      ],
      ae: [
        {
          name: "luxury_dubai_concierge",
          category: "Marketing",
          bodyText: "Dear {{name}}, thank you for contacting our private client salon in Dubai. Would you prefer a private viewing at our boutique or a discrete presentation at your residence?",
        },
        {
          name: "luxury_dubai_tracking",
          category: "Utility",
          bodyText: "Hello {{name}}, your order has been dispatched with our private courier and will arrive today between {{time}}. Our driver will call in advance.",
        },
      ],
      global: [
        {
          name: "luxury_general_inquiry",
          category: "Marketing",
          bodyText: "Hello {{name}}, thanks for your interest in our collection. Do you have a specific deadline or occasion you are shopping for?",
        },
        {
          name: "luxury_invoice_link",
          category: "Utility",
          bodyText: "Hi {{name}}, your customized order invoice is ready: {{link}}. Once confirmed, production will begin immediately.",
        },
      ],
    },
  },

  // 12. Fitness Coaches, Dieticians & Studios
  {
    id: "fitness_coaches",
    name: "Fitness Coaches & Nutritionists",
    shortDesc: "For transformation coaches, certified dieticians, personal trainers, and boutique fitness studios.",
    category: "Health & Lifestyle",
    iconName: "Dumbbell",
    leadNiche: "Gyms & Fitness",
    suggestedCities: ["Bangalore", "Mumbai", "London", "Austin", "Dubai", "Sydney"],
    stages: {
      in: [
        { name: "Fitness / Diet Inquiry", color: "#3b82f6", position: 0 },
        { name: "Assessment Call Done", color: "#eab308", position: 1 },
        { name: "Custom Plan & Pricing Sent", color: "#f97316", position: 2 },
        { name: "Enrolled & Fees Paid", color: "#8b5cf6", position: 3 },
        { name: "Active Transformation Client", color: "#10b981", position: 4 },
        { name: "Renewal / Upsell Due", color: "#059669", position: 5 },
      ],
      us: [
        { name: "New Client Inquiry", color: "#3b82f6", position: 0 },
        { name: "Strategy Call Booked", color: "#eab308", position: 1 },
        { name: "Coaching Program Offered", color: "#f97316", position: 2 },
        { name: "Membership Activated", color: "#8b5cf6", position: 3 },
        { name: "Active In Coaching", color: "#10b981", position: 4 },
        { name: "Renewal Due", color: "#059669", position: 5 },
      ],
      ae: [
        { name: "Inquiry Received", color: "#3b82f6", position: 0 },
        { name: "Body Composition Assessment", color: "#eab308", position: 1 },
        { name: "Personal Training Package Sent", color: "#f97316", position: 2 },
        { name: "Package Enrolled & Paid", color: "#8b5cf6", position: 3 },
        { name: "Active Training Sessions", color: "#10b981", position: 4 },
        { name: "Program Renewal", color: "#059669", position: 5 },
      ],
      global: [
        { name: "Inquiry", color: "#3b82f6", position: 0 },
        { name: "Consultation Booked", color: "#eab308", position: 1 },
        { name: "Plan Sent", color: "#f97316", position: 2 },
        { name: "Enrolled", color: "#8b5cf6", position: 3 },
        { name: "Active Client", color: "#10b981", position: 4 },
        { name: "Renewal Due", color: "#059669", position: 5 },
      ],
    },
    tags: {
      in: [
        { name: "Weight Loss", color: "#3b82f6" },
        { name: "PCOS / Thyroid Diet", color: "#8b5cf6" },
        { name: "Personal Training (1-on-1)", color: "#10b981" },
        { name: "3-Month Transformation", color: "#f97316" },
      ],
      us: [
        { name: "Online Coaching", color: "#3b82f6" },
        { name: "Nutrition Plan", color: "#10b981" },
        { name: "High-Ticket Client", color: "#8b5cf6" },
      ],
      ae: [
        { name: "Private Villa Training", color: "#8b5cf6" },
        { name: "Weight Management", color: "#3b82f6" },
        { name: "VIP Transformation", color: "#10b981" },
      ],
      global: [
        { name: "Coaching", color: "#3b82f6" },
        { name: "Active", color: "#10b981" },
        { name: "Renewal Due", color: "#f97316" },
      ],
    },
    templates: {
      in: [
        {
          name: "fitness_free_assessment",
          category: "Marketing",
          bodyText: "Hi {{name}}, congratulations on taking the first step towards your fitness goals! What is your primary focus right now: fat loss, muscle building, or managing a health condition like PCOS/thyroid?",
        },
        {
          name: "fitness_weekly_checkin",
          category: "Utility",
          bodyText: "Hey {{name}}, time for your weekly check-in! Please send your fasting weight today and let me know how your meal consistency went this week.",
        },
      ],
      us: [
        {
          name: "fitness_strategy_invite",
          category: "Marketing",
          bodyText: "Hi {{name}}, thanks for reaching out. We help busy professionals achieve sustainable results with flexible nutrition and efficient programming. When is good for a quick 10-minute roadmap call?",
        },
        {
          name: "fitness_workout_reminder",
          category: "Utility",
          bodyText: "Hey {{name}}, your custom workout block for this week has been loaded into your training app! Let's crush this week's sessions.",
        },
      ],
      ae: [
        {
          name: "fitness_dubai_welcome",
          category: "Marketing",
          bodyText: "Dear {{name}}, greetings from our private coaching team in Dubai. We offer discreet 1-on-1 personal training at your residential gym or private facility. May we schedule a consultation?",
        },
        {
          name: "fitness_dubai_session_confirm",
          category: "Utility",
          bodyText: "Hello {{name}}, your personal training session is confirmed for tomorrow at {{time}} at your building gym.",
        },
      ],
      global: [
        {
          name: "fitness_general_intro",
          category: "Marketing",
          bodyText: "Hello {{name}}, thank you for reaching out. What is the single biggest obstacle holding you back from hitting your health targets right now?",
        },
        {
          name: "fitness_renewal_notice",
          category: "Utility",
          bodyText: "Hi {{name}}, your current coaching block finishes this Sunday. You've made incredible progress! Would you like to reserve your spot for the next month?",
        },
      ],
    },
  },
];

export function getBlueprintById(id: string): IndustryBlueprint | undefined {
  return INDUSTRY_BLUEPRINTS.find((b) => b.id === id);
}

export function getBlueprintsByCategory(category?: string): IndustryBlueprint[] {
  if (!category || category === "all") return INDUSTRY_BLUEPRINTS;
  return INDUSTRY_BLUEPRINTS.filter((b) => b.category === category);
}
