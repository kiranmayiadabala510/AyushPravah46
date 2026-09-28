/* AyushPravah - Synthetic Demo Dataset */
const INITIAL_DEMO_DATA = {
  kpis: {
    activeStudies: 12,
    participantsEnrolled: 1284,
    recruitmentTarget: 1600,
    recruitmentProgress: 78,
    sitesActive: 24,
    complianceRate: 94,
    dataQualityScore: 91,
    openSafetyCases: 7,
    criticalAlerts: 3,
    trialHealthScore: 87
  },
  
  studies: [
    {
      id: "AYU-CT-026",
      title: "Evaluation of Ayurvedic Formulation Ayush-64 in Mild-to-Moderate Osteoarthritis",
      pi: "Dr. Rajesh Sharma (AIIA Delhi)",
      type: "Randomized Controlled Trial (Phase II)",
      intervention: "Ayush-64 Tablet 500mg twice daily vs Placebo",
      targetParticipants: 500,
      enrolled: 412,
      recruitmentPercent: 82,
      activeSites: 8,
      status: "Active - Recruiting",
      ethicsApprovalNo: "IEC/AIIA/2025/CT-026",
      ctriRegNo: "CTRI/2025/09/048123",
      healthScore: 88,
      lifecycleStep: 5 // 1: Protocol, 2: Ethics, 3: CTRI, 4: Site Activation, 5: Recruitment, 6: Visits, 7: Data Quality, 8: Safety, 9: Close-out
    },
    {
      id: "AYU-CT-014",
      title: "Multi-Center Clinical Evaluation of Ashwagandha Extract in Chronic Stress & Sleep Quality",
      pi: "Dr. Ananya Sen (AIIA Delhi)",
      type: "Double-Blind Placebo-Controlled Trial",
      intervention: "Standardized Ashwagandha Extract 300mg caps",
      targetParticipants: 600,
      enrolled: 470,
      recruitmentPercent: 78,
      activeSites: 10,
      status: "Active - Data Collection",
      ethicsApprovalNo: "IEC/AIIA/2025/CT-014",
      ctriRegNo: "CTRI/2025/03/039401",
      healthScore: 92,
      lifecycleStep: 6
    },
    {
      id: "AYU-CT-089",
      title: "Observational Trial on Guduchi Ghan Vati in Metabolic Health & Immunity",
      pi: "Dr. P. K. Varma (AIIA Research Centre)",
      type: "Prospective Cohort Observational Study",
      intervention: "Guduchi Ghan Vati 250mg post-meals",
      targetParticipants: 500,
      enrolled: 402,
      recruitmentPercent: 80,
      activeSites: 6,
      status: "Active - Monitoring",
      ethicsApprovalNo: "IEC/AIIA/2025/CT-089",
      ctriRegNo: "CTRI/2025/11/051290",
      healthScore: 84,
      lifecycleStep: 7
    }
  ],

  sites: [
    { id: "AIIA-DEL", name: "AIIA Delhi Central", location: "New Delhi", target: 300, enrolled: 264, percent: 88, active: 210, pendingVisits: 14, status: "On Track", openIssues: 1 },
    { id: "AIIA-GUR", name: "AIIA Research Centre", location: "Gurugram, Haryana", target: 250, enrolled: 210, percent: 84, active: 180, pendingVisits: 9, status: "On Track", openIssues: 0 },
    { id: "AP-04", name: "Andhra Pradesh Site", location: "Tirupati, AP", target: 200, enrolled: 120, percent: 60, active: 95, pendingVisits: 28, status: "Needs Attention", openIssues: 4 },
    { id: "TS-07", name: "Telangana Site", location: "Hyderabad, TS", target: 200, enrolled: 175, percent: 87.5, active: 150, pendingVisits: 11, status: "On Track", openIssues: 1 },
    { id: "KA-03", name: "Karnataka Site", location: "Bengaluru, KA", target: 200, enrolled: 165, percent: 82.5, active: 140, pendingVisits: 16, status: "On Track", openIssues: 2 },
    { id: "TN-05", name: "Tamil Nadu Site", location: "Chennai, TN", target: 150, enrolled: 150, percent: 100, active: 125, pendingVisits: 5, status: "On Track", openIssues: 0 }
  ],

  participants: [
    { id: "PT-402-BLR", maskedId: "PT-402-BLR", name: "Lakshmi Devi", site: "KA-03", trialId: "AYU-CT-026", status: "Active", prakriti: "Pittaja-Kaphaja", currentVisit: "Day 14", missedVisits: 1 },
    { id: "PT-418-AP", maskedId: "PT-418-AP", name: "Rahul Kumar", site: "AP-04", trialId: "AYU-CT-026", status: "Deviation Flagged", prakriti: "Vataja-Pittaja", currentVisit: "Day 28", missedVisits: 0 },
    { id: "PT-431-TG", maskedId: "PT-431-TG", name: "Sita Rao", site: "TS-07", trialId: "AYU-CT-014", status: "Active", prakriti: "Kaphaja", currentVisit: "Day 7", missedVisits: 0 },
    { id: "PT-445-KA", maskedId: "PT-445-KA", name: "Vikram Singh", site: "KA-03", trialId: "AYU-CT-014", status: "Active", prakriti: "Vataja", currentVisit: "Day 56", missedVisits: 0 },
    { id: "PT-452-TN", maskedId: "PT-452-TN", name: "Meena Sundaram", site: "TN-05", trialId: "AYU-CT-089", status: "Completed", prakriti: "Pittaja", currentVisit: "Day 56", missedVisits: 0 }
  ],

  criticalActions: [
    {
      id: "ACT-101",
      type: "Safety",
      severity: "high",
      what: "SAE reporting 24-hour regulatory deadline approaching for Case SAE-2026-088",
      why: "NDCT Rules 2019 require expedited submission to CTRI & Ethics Committee within 24h.",
      who: "Pharmacovigilance Officer",
      nextAction: "Review clinical narrative & click [Submit Expedited SAE Report]",
      linkedId: "SAE-2026-088"
    },
    {
      id: "ACT-102",
      type: "Recruitment",
      severity: "medium",
      what: "Site AP-04 recruitment lagging 28% below projected milestone",
      why: "Threatens study timeline and statistical power for Phase II interim evaluation.",
      who: "Study Coordinator",
      nextAction: "Generate WhatsApp Recruitment Link for local ASHA workers & review site budget.",
      linkedId: "AP-04"
    },
    {
      id: "ACT-103",
      type: "Compliance",
      severity: "high",
      what: "Institutional Ethics Committee (IEC) annual renewal due in 17 days for AYU-CT-026",
      why: "GCP-ASU guidelines dictate mandatory protocol re-validation prior to expiration.",
      who: "Principal Investigator",
      nextAction: "Upload interim progress dossier to Ethics Committee portal.",
      linkedId: "AYU-CT-026"
    },
    {
      id: "ACT-104",
      type: "Deviation",
      severity: "medium",
      what: "Protocol deviation flagged: Missed Day-14 blood draw for participant PT-402-BLR",
      why: "Out-of-window visit invalidates lab biomarkers for primary endpoint safety cohort.",
      who: "Field Investigator",
      nextAction: "Open Protocol Deviation Board & assign root-cause resolution task.",
      linkedId: "DEV-109"
    }
  ],

  protocolDeviations: [
    {
      id: "DEV-109",
      participantId: "PT-402-BLR",
      trialId: "AYU-CT-026",
      siteId: "KA-03",
      issue: "Day-14 blood draw missed",
      reason: "Assessment outside permitted visit window (+3 days due to local transport strike)",
      responsibleRole: "Field Investigator",
      status: "Needs Action",
      assignedTo: "Unassigned",
      dateFlagged: "2026-09-27 10:15"
    },
    {
      id: "DEV-112",
      participantId: "PT-418-AP",
      trialId: "AYU-CT-026",
      siteId: "AP-04",
      issue: "Missing Vata/Pitta assessment score at Day-7",
      reason: "Field EDC tablet lost battery power before local sync",
      responsibleRole: "Site Coordinator",
      status: "In Review",
      assignedTo: "Dr. K. S. Reddy",
      dateFlagged: "2026-09-26 16:40"
    },
    {
      id: "DEV-115",
      participantId: "PT-431-TG",
      trialId: "AYU-CT-014",
      siteId: "TS-07",
      issue: "Dose adjustment unrecorded in eCRF",
      reason: "Concomitant medication reporting delay",
      responsibleRole: "Principal Investigator",
      status: "Needs Action",
      assignedTo: "Unassigned",
      dateFlagged: "2026-09-28 08:20"
    }
  ],

  safetyCases: [
    {
      caseId: "SAE-2026-088",
      trialId: "AYU-CT-026",
      participantId: "PT-418-AP",
      event: "Severe Epigastric Burning & Nausea",
      date: "2026-09-27",
      time: "14:30",
      severity: "Severe",
      seriousness: "SAE - Requires Hospitalization",
      description: "Participant reported acute epigastric pain 3 hours post evening dose of Ayush-64 formulation. Admitted for observation.",
      investigator: "Dr. K. S. Reddy (AP-04)",
      reviewStatus: "Under Review",
      deadlineTimer: "18h 42m remaining"
    },
    {
      caseId: "AE-2026-104",
      trialId: "AYU-CT-014",
      participantId: "PT-445-KA",
      event: "Transient Mild Headache",
      date: "2026-09-28",
      time: "09:15",
      severity: "Mild",
      seriousness: "Non-Serious AE",
      description: "Mild frontal headache reported on Day 7 morning. Resolved spontaneously without medication.",
      investigator: "Dr. N. Bhat (KA-03)",
      reviewStatus: "Reviewed",
      deadlineTimer: "Completed"
    }
  ],

  complianceItems: [
    { requirement: "Institutional Ethics Committee Renewal", trialId: "AYU-CT-026", dueDate: "2026-10-15", responsible: "Ethics Committee", status: "Due Soon", nextAction: "Submit interim annual progress report" },
    { requirement: "CTRI Bi-Annual Progress Update", trialId: "AYU-CT-014", dueDate: "2026-10-30", responsible: "Principal Investigator", status: "Upcoming", nextAction: "Compile recruitment & safety metrics" },
    { requirement: "GCP-ASU Site Quality Audit", trialId: "AIIA-DEL", dueDate: "2026-09-20", responsible: "Clinical Trial Monitor", status: "Completed", nextAction: "Sign off site inspection certificate" },
    { requirement: "Day-14 Protocol Window Audit for Site AP-04", trialId: "AYU-CT-026", dueDate: "2026-09-25", responsible: "Study Coordinator", status: "Overdue", nextAction: "Execute corrective action plan (CAPA)" }
  ],

  pendingSyncRecords: [
    {
      id: "SYNC-REC-001",
      type: "Field eCRF Visit",
      trialId: "AYU-CT-026",
      participantId: "PT-402-BLR",
      visit: "Day 14 Assessment",
      timestamp: "2026-09-28 14:10",
      data: { vitals: "120/80 mmHg, 72 bpm", prakriti: "Vata-Pitta", dosage: "500mg BID", notes: "No acute distress" }
    },
    {
      id: "SYNC-REC-002",
      type: "e-Consent Signature",
      trialId: "AYU-CT-026",
      participantId: "PT-418-AP",
      visit: "Baseline Screening",
      timestamp: "2026-09-28 15:05",
      data: { language: "Telugu", status: "Consented", signatureCaptured: true }
    },
    {
      id: "SYNC-REC-003",
      type: "Adverse Event Log",
      trialId: "AYU-CT-014",
      participantId: "PT-431-TG",
      visit: "Day 7 Unscheduled",
      timestamp: "2026-09-28 15:45",
      data: { event: "Mild Vertigo", severity: "Mild" }
    }
  ],

  syncedRecords: [
    { id: "SYNC-REC-000", type: "Baseline Visit", trialId: "AYU-CT-026", participantId: "PT-445-KA", visit: "Day 1", timestamp: "2026-09-28 09:30" }
  ],

  auditTrail: [
    { timestamp: "2026-09-28 15:25:42", category: "ACTION", user: "Principal Investigator", text: "Protocol deviation DEV-109 assigned to Site Coordinator AP-04." },
    { timestamp: "2026-09-28 15:18:07", category: "PRIVACY", user: "Principal Investigator", text: "PII masking enabled. Patient names anonymized to Trial IDs across views." },
    { timestamp: "2026-09-28 15:15:20", category: "CONSENT", user: "Field Investigator 04", text: "e-Consent captured offline for PT-418-AP (Telugu localized form)." },
    { timestamp: "2026-09-28 15:10:44", category: "ALERT", user: "System Rule Engine", text: "Protocol deviation flagged for PT-402 by automated rule engine." },
    { timestamp: "2026-09-28 14:32:01", category: "SYNC", user: "Field Investigator 04", text: "Synchronized 12 records from local cache to central storage." },
    { timestamp: "2026-09-28 12:00:00", category: "SAFETY", user: "PV Officer", text: "Opened SAE case SAE-2026-088 and set 24h regulatory timer." }
  ],

  notifications: [
    { id: 1, type: "critical", title: "SAE Reporting Deadline Approaching", desc: "18h 42m remaining for Case SAE-2026-088.", time: "10m ago", targetSection: "pharmacovigilance" },
    { id: 2, type: "warning", title: "Ethics Renewal Due", desc: "AYU-CT-026 IEC approval renewal due in 17 days.", time: "1h ago", targetSection: "complianceCenter" },
    { id: 3, type: "warning", title: "Site AP-04 Recruitment Lag", desc: "Recruitment is 28% behind target milestone.", time: "2h ago", targetSection: "recruitmentSites" },
    { id: 4, type: "info", title: "Offline Sync Complete", desc: "12 local records synced successfully.", time: "3h ago", targetSection: "syncCenter" }
  ]
};
