/* AyushPravah - Master Application Controller */

const App = {
  activeView: "controlTower",
  signaturePad: null,
  tourCurrentStep: 1,

  // 25-Step SIH Demonstration Flow definition
  tourSteps: [
    { step: 1, title: "Step 1: Login & Role Selection", desc: "Select 'Field Investigator' role to simulate field operations.", action: () => App.switchRole("role_field") },
    { step: 2, title: "Step 2: Simulate Offline Mode", desc: "Toggle connectivity from Online to Offline mode.", action: () => App.toggleOfflineMode(true) },
    { step: 3, title: "Step 3: Open Field Study", desc: "Navigate to Field EDC section.", action: () => App.navigateTo("fieldEdc") },
    { step: 4, title: "Step 4: Open Informed Consent", desc: "Navigate to Informed Consent module before eCRF entry.", action: () => App.navigateTo("eConsent") },
    { step: 5, title: "Step 5: Select Telugu Language", desc: "Switch consent statement language to Telugu.", action: () => App.switchLanguage("te") },
    { step: 6, title: "Step 6: Read Localized Consent Statement", desc: "Verify Telugu Indic text rendering.", action: () => App.navigateTo("eConsent") },
    { step: 7, title: "Step 7: Draw Signature on Canvas", desc: "Simulate participant touchscreen signature.", action: () => { document.getElementById("consentConfirmCheckbox").checked = true; } },
    { step: 8, title: "Step 8: Save Consent Locally", desc: "Save consent to offline local queue.", action: () => App.saveConsentForm() },
    { step: 9, title: "Step 9: Open Field EDC Form", desc: "Return to Field EDC for eCRF visit entry.", action: () => App.navigateTo("fieldEdc") },
    { step: 10, title: "Step 10: Enter Participant Visit Data", desc: "Populate synthetic Vitals, Prakriti & Ayurveda intervention.", action: () => {
      document.getElementById("edcVitals").value = "124/82 mmHg, 76 bpm";
      document.getElementById("edcObservations").value = "Joint VAS pain score reduced. Good tolerance.";
    }},
    { step: 11, title: "Step 11: Save Visit Locally", desc: "Click [Save Visit Locally] while offline.", action: () => App.saveFieldEdcVisit() },
    { step: 12, title: "Step 12: Record Adverse Event", desc: "Open Quick AE / SAE modal & submit a safety report.", action: () => App.openQuickAeModal() },
    { step: 13, title: "Step 13: View Pending Sync Queue", desc: "Navigate to Sync Center to inspect cached records.", action: () => { App.closeQuickAeModal(); App.navigateTo("syncCenter"); } },
    { step: 14, title: "Step 14: Switch Offline → Online", desc: "Toggle connectivity back to Online mode.", action: () => App.toggleOfflineMode(false) },
    { step: 15, title: "Step 15: Execute Sync Now", desc: "Click [Sync Now] to push records to central storage.", action: () => App.triggerSyncNow() },
    { step: 16, title: "Step 16: Verify Sync Completion", desc: "Observe pending records cleared and logged.", action: () => App.navigateTo("syncCenter") },
    { step: 17, title: "Step 17: System Detects Protocol Deviation", desc: "Rule engine flags missed Day-14 visit.", action: () => App.navigateTo("protocolDeviations") },
    { step: 18, title: "Step 18: Open Deviation Action Center", desc: "Review protocol deviation card DEV-109.", action: () => App.navigateTo("protocolDeviations") },
    { step: 19, title: "Step 19: Assign Action to Coordinator", desc: "Assign task to Site Coordinator.", action: () => App.openAssignModal("DEV-109") },
    { step: 20, title: "Step 20: Switch Role to Principal Investigator", desc: "Switch role to PI for high-level oversight.", action: () => { App.closeAssignModal(); App.switchRole("role_pi"); } },
    { step: 21, title: "Step 21: Review Research Control Tower", desc: "View critical alerts & trial health score.", action: () => App.navigateTo("controlTower") },
    { step: 22, title: "Step 22: Enable PII Masking", desc: "Toggle [Hide Patient Names] to anonymize participant names.", action: () => App.togglePiiMasking(true) },
    { step: 23, title: "Step 23: Verify Masked Participant IDs", desc: "Names converted to PT-402-BLR IDs across tables.", action: () => App.navigateTo("dataQuality") },
    { step: 24, title: "Step 24: Open System Audit Trail", desc: "Inspect immutable audit log drawer.", action: () => App.toggleAuditSidePanel() },
    { step: 25, title: "Step 25: Complete SIH Evaluation Flow", desc: "All 25 demonstration steps successfully executed!", action: () => { App.toggleAuditSidePanel(); Components.showToast("SIH 2026 Evaluation Flow Completed!", "success"); } }
  ],

  init() {
    Store.init();
    
    const role = Store.getRole();
    const lang = Store.getLang();
    const isOffline = Store.isOffline();
    const piiMasked = Store.isPiiMasked();

    // Set UI control values
    document.getElementById("headerRoleSelect").value = role;
    document.getElementById("loginRoleSelect").value = role;
    document.getElementById("languageSelect").value = lang;
    document.getElementById("offlineToggleInput").checked = isOffline;
    document.getElementById("piiMaskingToggle").checked = piiMasked;

    // Apply Offline and PII states
    this.updateOfflineUI(isOffline);
    this.updatePiiMaskingUI(piiMasked);
    Components.applyTranslations();

    // Bind Signature Canvas
    this.signaturePad = Components.initSignatureCanvas("consentSignatureCanvas", "clearConsentSignatureBtn");

    // Default to Login view if not authenticated, or direct workspace
    this.navigateTo("controlTower");
  },

  handleLogin() {
    const userId = document.getElementById("loginUserId").value.trim() || "Dr. Rajesh Sharma";
    const role = document.getElementById("loginRoleSelect").value;
    
    Store.setRole(role);
    document.getElementById("headerRoleSelect").value = role;

    document.getElementById("loginScreen").classList.add("hidden");
    document.getElementById("appWorkspace").classList.remove("hidden");

    this.applyRoleRestrictions(role);
    this.navigateTo("controlTower");
    Components.showToast(`Logged in as ${userId} (${TRANSLATIONS.en[role] || role})`, "success");
  },

  handleLogout() {
    document.getElementById("appWorkspace").classList.add("hidden");
    document.getElementById("loginScreen").classList.remove("hidden");
    Components.showToast("Logged out of control tower", "info");
  },

  switchRole(roleKey) {
    Store.setRole(roleKey);
    document.getElementById("headerRoleSelect").value = roleKey;
    document.getElementById("loginRoleSelect").value = roleKey;

    this.applyRoleRestrictions(roleKey);
    Components.showToast(`Role switched to ${TRANSLATIONS.en[roleKey] || roleKey}`, "info");
    
    // Re-render active view
    this.navigateTo(this.activeView);
  },

  applyRoleRestrictions(roleKey) {
    // Role-based navigation visibility mapping (Requirement 19)
    const roleAllowedViews = {
      role_pi: ["controlTower", "study360", "recruitmentSites", "complianceCenter", "dataQuality", "protocolDeviations", "pharmacovigilance", "fieldEdc", "eConsent", "syncCenter", "interoperability", "reportsExport", "auditTrail", "communityOutreach", "settings", "dpdpPrivacy", "prodArchitecture"],
      role_coordinator: ["controlTower", "study360", "recruitmentSites", "complianceCenter", "protocolDeviations", "syncCenter", "communityOutreach", "reportsExport", "settings"],
      role_field: ["fieldEdc", "eConsent", "pharmacovigilance", "syncCenter", "settings"],
      role_monitor: ["controlTower", "recruitmentSites", "dataQuality", "protocolDeviations", "complianceCenter", "reportsExport"],
      role_ethics: ["controlTower", "study360", "complianceCenter", "protocolDeviations", "pharmacovigilance", "reportsExport"],
      role_pv: ["controlTower", "pharmacovigilance", "reportsExport"],
      role_admin: ["controlTower", "study360", "recruitmentSites", "complianceCenter", "dataQuality", "protocolDeviations", "pharmacovigilance", "fieldEdc", "eConsent", "syncCenter", "interoperability", "reportsExport", "auditTrail", "communityOutreach", "settings"],
      role_regulator: ["controlTower", "study360", "complianceCenter", "pharmacovigilance", "reportsExport", "auditTrail"]
    };

    const allowed = roleAllowedViews[roleKey] || roleAllowedViews["role_pi"];
    
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
      const view = item.getAttribute("data-view");
      if (view && view !== "auditTrail") {
        if (allowed.includes(view)) {
          item.classList.remove("hidden");
        } else {
          item.classList.add("hidden");
        }
      }
    });

    // If current view is restricted, redirect to first allowed view
    if (!allowed.includes(this.activeView)) {
      this.navigateTo(allowed[0]);
    }
  },

  switchLanguage(langKey) {
    Store.setLang(langKey);
    document.getElementById("languageSelect").value = langKey;
    document.getElementById("consentLangSelect").value = langKey;
    
    Components.applyTranslations();
    Components.showToast(`Language updated to ${langKey.toUpperCase()}`, "info");

    // Update consent statement display if on consent view
    if (this.activeView === "eConsent") {
      this.renderConsentView();
    }
  },

  toggleOfflineMode(isOffline) {
    Store.setOffline(isOffline);
    this.updateOfflineUI(isOffline);
  },

  updateOfflineUI(isOffline) {
    const banner = document.getElementById("offlineBanner");
    const badge = document.getElementById("connectivityStatusBadge");
    const edcBadge = document.getElementById("edcModeBadge");

    if (isOffline) {
      banner.classList.remove("hidden");
      if (badge) { badge.className = "badge badge-danger"; badge.textContent = "🔴 OFFLINE SIMULATION"; }
      if (edcBadge) { edcBadge.className = "badge badge-danger"; edcBadge.textContent = "🔴 OFFLINE MODE"; }
      Components.showToast("Offline Mode Enabled — Local Caching Active", "warning");
    } else {
      banner.classList.add("hidden");
      if (badge) { badge.className = "badge badge-success"; badge.textContent = "🟢 ONLINE"; }
      if (edcBadge) { edcBadge.className = "badge badge-success"; edcBadge.textContent = "🟢 ONLINE MODE"; }
      Components.showToast("Online Mode Active", "success");
    }
  },

  togglePiiMasking(masked) {
    Store.setPiiMasking(masked);
    this.updatePiiMaskingUI(masked);
  },

  updatePiiMaskingUI(masked) {
    const participants = Store.getState().data.participants;
    document.querySelectorAll(".pt-id-cell").forEach(el => {
      const ptId = el.getAttribute("data-pt-id") || el.textContent.trim();
      const ptObj = participants.find(p => p.id === ptId || p.name === ptId || p.maskedId === ptId);
      if (ptObj) {
        el.setAttribute("data-pt-id", ptObj.id);
        el.textContent = masked ? ptObj.maskedId : ptObj.name;
      }
    });
    Components.showToast(`PII Masking ${masked ? 'Enabled (Names Hidden)' : 'Disabled (Names Visible)'}`, "info");
  },

  navigateTo(viewKey) {
    this.activeView = viewKey;
    
    // Hide all view panels
    document.querySelectorAll(".view-panel").forEach(panel => panel.classList.add("hidden"));
    
    // Show target view panel
    const target = document.getElementById(`view-${viewKey}`);
    if (target) {
      target.classList.remove("hidden");
    }

    // Update active nav class
    document.querySelectorAll(".sidebar-nav .nav-item").forEach(item => {
      if (item.getAttribute("data-view") === viewKey) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Close mobile sidebar if open
    document.getElementById("appSidebar").classList.remove("mobile-open");

    // Render view specific content
    if (viewKey === "controlTower") this.renderControlTower();
    if (viewKey === "study360") this.renderStudy360("AYU-CT-026");
    if (viewKey === "recruitmentSites") this.renderRecruitmentSites();
    if (viewKey === "complianceCenter") this.renderComplianceCenter();
    if (viewKey === "dataQuality") this.renderDataQuality();
    if (viewKey === "protocolDeviations") this.renderProtocolDeviations();
    if (viewKey === "pharmacovigilance") this.renderSafety();
    if (viewKey === "eConsent") this.renderConsentView();
    if (viewKey === "syncCenter") this.renderSyncCenter();
    if (viewKey === "interoperability") this.renderInteroperability();
  },

  toggleMobileSidebar() {
    document.getElementById("appSidebar").classList.toggle("mobile-open");
  },

  renderControlTower() {
    const data = Store.getState().data;
    const kpis = data.kpis;

    document.getElementById("kpiActiveStudies").textContent = kpis.activeStudies;
    document.getElementById("kpiParticipantsEnrolled").textContent = kpis.participantsEnrolled.toLocaleString();
    document.getElementById("kpiActiveSites").textContent = kpis.sitesActive;
    document.getElementById("kpiComplianceRate").textContent = `${kpis.complianceRate}%`;
    document.getElementById("kpiDataQuality").textContent = `${kpis.dataQualityScore}%`;
    document.getElementById("kpiOpenSafety").textContent = kpis.openSafetyCases;
    document.getElementById("kpiCriticalAlerts").textContent = kpis.criticalAlerts;

    // Render Health Gauge SVG
    const gaugeSlot = document.getElementById("healthGaugeSlot");
    if (gaugeSlot) {
      gaugeSlot.innerHTML = Components.renderHealthGauge(kpis.trialHealthScore);
    }

    // Render Critical Actions List
    const actionsGrid = document.getElementById("criticalActionsGrid");
    if (actionsGrid) {
      actionsGrid.innerHTML = data.criticalActions.map(act => `
        <div class="action-card severity-${act.severity}">
          <div>
            <div class="action-block">
              <span class="action-label">WHAT HAPPENED</span>
              <div class="action-text">${act.what}</div>
            </div>
            <div class="action-block">
              <span class="action-label">WHY IT MATTERS</span>
              <div style="font-size: 12px; color: var(--text-muted);">${act.why}</div>
            </div>
            <div class="action-block">
              <span class="action-label">WHO IS RESPONSIBLE</span>
              <div style="font-size: 12px; font-weight: 700; color: var(--primary-deep-green);">${act.who}</div>
            </div>
          </div>
          <div style="margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border-color);" class="flex justify-between items-center">
            <span class="action-label">NEXT ACTION</span>
            <button class="btn btn-primary btn-sm" onclick="App.handleCriticalAction('${act.id}')">Execute Action →</button>
          </div>
        </div>
      `).join("");
    }
  },

  handleCriticalAction(actId) {
    if (actId === "ACT-101") this.navigateTo("pharmacovigilance");
    if (actId === "ACT-102") this.openOutreachModal();
    if (actId === "ACT-103") this.navigateTo("complianceCenter");
    if (actId === "ACT-104") this.navigateTo("protocolDeviations");
  },

  renderStudy360(studyId) {
    const study = Store.getState().data.studies.find(s => s.id === studyId) || Store.getState().data.studies[0];
    
    // Render Stepper
    const stepperSteps = ["Protocol", "Ethics Approval", "CTRI Registration", "Site Activation", "Recruitment", "Visits", "Data Quality", "Safety", "Close-out"];
    const stepperHtml = stepperSteps.map((stepName, idx) => {
      let stateClass = "";
      let iconContent = idx + 1;
      if (idx + 1 < study.lifecycleStep) { stateClass = "completed"; iconContent = "✓"; }
      if (idx + 1 === study.lifecycleStep) { stateClass = "active"; }

      return `
        <div class="stepper-item ${stateClass}">
          <div class="stepper-icon">${iconContent}</div>
          <span class="stepper-label">${stepName}</span>
        </div>
      `;
    }).join("");
    document.getElementById("studyLifecycleStepper").innerHTML = stepperHtml;

    // Render Study Header Card
    document.getElementById("studyHeaderCard").innerHTML = `
      <div class="flex justify-between items-center">
        <div>
          <span class="badge badge-success">${study.status}</span>
          <h3 style="font-size: 18px; font-weight: 800; margin-top: 6px;">${study.title}</h3>
          <p style="font-size: 13px; color: var(--text-muted);">ID: ${study.id} • Principal Investigator: ${study.pi}</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 24px; font-weight: 800; color: var(--primary-color);">${study.enrolled} / ${study.targetParticipants}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${study.recruitmentPercent}% Target Completed across ${study.activeSites} Sites</div>
        </div>
      </div>
    `;

    this.switchStudyTab("overview");
  },

  switchStudyTab(tabKey, btnEl) {
    if (btnEl) {
      document.querySelectorAll(".tab-container .tab-btn").forEach(b => b.classList.remove("active"));
      btnEl.classList.add("active");
    }

    const contentDiv = document.getElementById("studyTabContent");
    if (!contentDiv) return;

    if (tabKey === "overview") {
      contentDiv.innerHTML = `
        <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 12px;">Protocol Overview & Regulatory Identifiers</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
          <div><strong>Study Type:</strong> Randomized Controlled Trial</div>
          <div><strong>Ethics Approval No:</strong> IEC/AIIA/2025/CT-026</div>
          <div><strong>CTRI Registration No:</strong> CTRI/2025/09/048123</div>
          <div><strong>Health Score:</strong> 88/100</div>
        </div>
      `;
    } else if (tabKey === "recruitment") {
      contentDiv.innerHTML = `<h4 style="font-size: 15px; font-weight: 700;">Recruitment Velocity</h4><p style="font-size: 13px; color: var(--text-muted);">Current recruitment pace: 14 participants / week across 8 active centers.</p>`;
    } else if (tabKey === "sites") {
      contentDiv.innerHTML = Components.renderSitesChart(Store.getState().data.sites);
    } else {
      contentDiv.innerHTML = `<p style="font-size: 13px; color: var(--text-muted);">Displaying study ${tabKey} records.</p>`;
    }
  },

  renderRecruitmentSites() {
    const sites = Store.getState().data.sites;
    document.getElementById("sitesChartSlot").innerHTML = Components.renderSitesChart(sites);

    const cardsHtml = sites.map(site => `
      <div class="kpi-card">
        <div class="flex justify-between items-center">
          <span class="badge ${site.status === 'On Track' ? 'badge-success' : 'badge-warning'}">${site.status}</span>
          <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">${site.id}</span>
        </div>
        <h4 style="font-size: 16px; font-weight: 800; margin-top: 8px;">${site.name}</h4>
        <div style="font-size: 12px; color: var(--text-muted);">${site.location}</div>
        <div style="margin: 12px 0;">
          <div style="font-size: 20px; font-weight: 800; color: var(--text-dark);">${site.enrolled} / ${site.target} <span style="font-size: 12px; color: var(--text-muted);">(${site.percent}%)</span></div>
        </div>
        <div class="flex justify-between items-center" style="font-size: 11px; border-top: 1px solid var(--border-color); padding-top: 8px;">
          <span>Active: ${site.active}</span>
          <span>Pending Visits: ${site.pendingVisits}</span>
        </div>
      </div>
    `).join("");

    document.getElementById("sitesGridCards").innerHTML = cardsHtml;
  },

  filterSites(filterStatus) {
    let sites = Store.getState().data.sites;
    if (filterStatus !== "All") {
      sites = sites.filter(s => s.status === filterStatus);
    }
    document.getElementById("sitesChartSlot").innerHTML = Components.renderSitesChart(sites);
  },

  renderComplianceCenter() {
    const items = Store.getState().data.complianceItems;
    document.getElementById("complianceTableBody").innerHTML = items.map(item => `
      <tr>
        <td><strong>${item.requirement}</strong></td>
        <td>${item.trialId}</td>
        <td>${item.dueDate}</td>
        <td><span class="badge badge-info">${item.responsible}</span></td>
        <td><span class="badge ${item.status === 'Completed' ? 'badge-success' : item.status === 'Due Soon' ? 'badge-warning' : item.status === 'Overdue' ? 'badge-danger' : 'badge-neutral'}">${item.status}</span></td>
        <td><span style="font-size: 12px;">${item.nextAction}</span></td>
      </tr>
    `).join("");
  },

  renderDataQuality() {
    this.updatePiiMaskingUI(Store.isPiiMasked());
  },

  renderProtocolDeviations() {
    const devs = Store.getState().data.protocolDeviations;
    document.getElementById("deviationsGrid").innerHTML = devs.map(d => `
      <div class="action-card severity-medium">
        <div>
          <div class="flex justify-between items-center" style="margin-bottom: 8px;">
            <span class="badge badge-danger">PROTOCOL DEVIATION</span>
            <span style="font-size: 11px; font-weight: 700; color: var(--text-muted);">${d.id}</span>
          </div>
          <div class="action-block">
            <span class="action-label">PARTICIPANT / TRIAL</span>
            <div class="action-text"><span class="pt-id-cell" data-pt-id="${d.participantId}">${d.participantId}</span> (${d.trialId})</div>
          </div>
          <div class="action-block">
            <span class="action-label">ISSUE & REASON</span>
            <div style="font-size: 13px; font-weight: 700; color: var(--danger-color);">${d.issue}</div>
            <div style="font-size: 12px; color: var(--text-muted);">${d.reason}</div>
          </div>
          <div class="action-block">
            <span class="action-label">RESPONSIBLE & ASSIGNED TO</span>
            <div style="font-size: 12px; font-weight: 700;">${d.responsibleRole} • Assigned: ${d.assignedTo}</div>
          </div>
        </div>
        <div class="flex gap-2" style="margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--border-color);">
          <button class="btn btn-primary btn-sm" onclick="App.openAssignModal('${d.id}')">Assign</button>
          <button class="btn btn-secondary btn-sm" onclick="Components.showToast('Viewing Case ${d.id}', 'info')">View Case</button>
          <button class="btn btn-outline-primary btn-sm" onclick="Components.showToast('Marked Reviewed', 'success')">Mark Reviewed</button>
        </div>
      </div>
    `).join("");

    this.updatePiiMaskingUI(Store.isPiiMasked());
  },

  openAssignModal(devId) {
    document.getElementById("assignDevId").value = devId;
    document.getElementById("assignModal").classList.remove("hidden");
  },

  closeAssignModal() {
    document.getElementById("assignModal").classList.add("hidden");
  },

  confirmAssignDeviation() {
    const devId = document.getElementById("assignDevId").value;
    const recipient = document.getElementById("assignRecipientSelect").value;
    Store.assignDeviation(devId, recipient);
    this.closeAssignModal();
    this.renderProtocolDeviations();
    Components.showToast(`Deviation ${devId} assigned to ${recipient}`, "success");
  },

  renderSafety() {
    const cases = Store.getState().data.safetyCases;
    document.getElementById("safetyTableBody").innerHTML = cases.map(c => `
      <tr>
        <td><strong>${c.caseId}</strong></td>
        <td>${c.trialId}</td>
        <td><span class="pt-id-cell" data-pt-id="${c.participantId}">${c.participantId}</span></td>
        <td>${c.event}</td>
        <td><span class="badge ${c.severity === 'Severe' ? 'badge-danger' : 'badge-warning'}">${c.seriousness}</span></td>
        <td><span style="font-family: monospace; font-weight: 700; color: var(--danger-color);">${c.deadlineTimer}</span></td>
        <td><span class="badge badge-info">${c.reviewStatus}</span></td>
        <td><button class="btn btn-secondary btn-sm" onclick="Components.showToast('Opening Safety Dossier for ${c.caseId}', 'info')">Review</button></td>
      </tr>
    `).join("");

    this.updatePiiMaskingUI(Store.isPiiMasked());
  },

  openQuickAeModal() {
    document.getElementById("quickAeModal").classList.remove("hidden");
  },

  closeQuickAeModal() {
    document.getElementById("quickAeModal").classList.add("hidden");
  },

  submitAeReport() {
    const newCase = {
      caseId: `AE-2026-${Math.floor(100 + Math.random() * 900)}`,
      participantId: document.getElementById("aeParticipantId").value,
      trialId: document.getElementById("aeTrialId").value,
      event: document.getElementById("aeEventTitle").value,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().substring(0, 5),
      severity: document.getElementById("aeSeverity").value,
      seriousness: document.getElementById("aeSeriousness").value,
      description: document.getElementById("aeClinicalNotes").value || "Recorded via Quick AE modal.",
      investigator: Store.getState().user.name,
      reviewStatus: "Under Review",
      deadlineTimer: "23h 59m remaining"
    };

    Store.addSafetyCase(newCase);
    this.closeQuickAeModal();
    this.renderSafety();
    Components.showToast("Safety event recorded in demonstration environment.", "warning");
  },

  saveFieldEdcVisit() {
    const visitData = {
      trialId: document.getElementById("edcTrialId").value,
      siteId: document.getElementById("edcSiteId").value,
      participantId: document.getElementById("edcParticipantId").value,
      visitName: document.getElementById("edcVisitName").value,
      visitDate: document.getElementById("edcVisitDate").value,
      vitals: document.getElementById("edcVitals").value,
      prakriti: document.getElementById("edcPrakriti").value,
      dosage: document.getElementById("edcDosage").value,
      observations: document.getElementById("edcObservations").value,
      sideEffects: document.getElementById("edcSideEffects").value
    };

    Store.saveVisit(visitData);
    const isOffline = Store.isOffline();
    if (isOffline) {
      Components.showToast("Visit saved locally. No internet connection required.", "warning");
    } else {
      Components.showToast("Visit saved online directly.", "success");
    }
  },

  renderConsentView() {
    Components.applyTranslations();
  },

  saveConsentForm() {
    const confirmed = document.getElementById("consentConfirmCheckbox").checked;
    if (!confirmed) {
      Components.showToast("Participant confirmation checkbox must be checked!", "error");
      return;
    }

    const consentData = {
      participantId: "PT-402-BLR",
      trialId: "AYU-CT-026",
      language: Store.getLang(),
      status: "Consented",
      timestamp: new Date().toISOString()
    };

    Store.saveConsent(consentData);
    const isOffline = Store.isOffline();
    if (isOffline) {
      Components.showToast("Consent stored locally and queued for synchronization.", "warning");
    } else {
      Components.showToast("Consent saved locally & registered online.", "success");
    }
  },

  renderSyncCenter() {
    const pending = Store.getState().data.pendingSyncRecords;
    const synced = Store.getState().data.syncedRecords;

    document.getElementById("syncPendingCount").textContent = pending.length;
    document.getElementById("syncSuccessCount").textContent = 120 + synced.length;

    document.getElementById("syncPendingTableBody").innerHTML = pending.length === 0 ? `
      <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No pending records. All data synchronized!</td></tr>
    ` : pending.map(rec => `
      <tr>
        <td><strong>${rec.id}</strong></td>
        <td><span class="badge badge-info">${rec.type}</span></td>
        <td>${rec.trialId}</td>
        <td><span class="pt-id-cell" data-pt-id="${rec.participantId}">${rec.participantId}</span></td>
        <td>${rec.timestamp}</td>
        <td><span class="badge badge-warning">Local Cache</span></td>
      </tr>
    `).join("");

    this.updatePiiMaskingUI(Store.isPiiMasked());
  },

  triggerSyncNow() {
    if (Store.isOffline()) {
      Components.showToast("Cannot sync while Offline Simulation is enabled. Please switch to Online mode first!", "error");
      return;
    }

    const count = Store.syncNow();
    if (count > 0) {
      Components.showToast(`${count} records synchronized successfully.`, "success");
      this.renderSyncCenter();
    } else {
      Components.showToast("No pending records to synchronize.", "info");
    }
  },

  renderInteroperability() {
    this.switchInteropTab("fhir");
  },

  switchInteropTab(standardKey, btnEl) {
    if (btnEl) {
      document.querySelectorAll("#view-interoperability .tab-btn").forEach(b => b.classList.remove("active"));
      btnEl.classList.add("active");
    }

    const view = document.getElementById("interopPayloadView");
    if (!view) return;

    if (standardKey === "fhir") {
      view.textContent = JSON.stringify({
        resourceType: "ResearchStudy",
        id: "AYU-CT-026",
        title: "Evaluation of Ayurvedic Formulation Ayush-64 in Osteoarthritis",
        status: "active",
        sponsor: { display: "All India Institute of Ayurveda (AIIA)" },
        principalInvestigator: { display: "Dr. Rajesh Sharma" },
        category: [{ coding: [{ system: "http://hlto.org/fhir/research-study-category", code: "ayurveda", display: "Ayurveda Research" }] }]
      }, null, 2);
    } else if (standardKey === "cdisc") {
      view.textContent = JSON.stringify({
        domain: "DM (Demographics)",
        STUDYID: "AYU-CT-026",
        USUBJID: "PT-402-BLR",
        SITEID: "KA-03",
        ARMCD: "AYUSH64_BID",
        ARM: "Ayush-64 Tablet 500mg BID",
        COUNTRY: "IND"
      }, null, 2);
    } else if (standardKey === "abdm") {
      view.textContent = JSON.stringify({
        healthIdNumber: "91-4819-2041-9921",
        consentArtefactId: "CONSENT-AIIA-2026-9021",
        dataMapped: "Clinical Trial Baseline Observations",
        purpose: "AYURVEDA_RESEARCH_TRIAL"
      }, null, 2);
    }
  },

  openOutreachModal() {
    this.generateOutreachText("en");
    document.getElementById("outreachModal").classList.remove("hidden");
  },

  closeOutreachModal() {
    document.getElementById("outreachModal").classList.add("hidden");
  },

  generateOutreachText(lang) {
    const texts = {
      en: "AIIA is conducting an Ayurveda clinical research study in your area. If you are interested in learning about participation, please contact the local health worker. Eligibility will be assessed according to the approved study protocol.",
      te: "ఎఐఐఎ (AIIA) మీ ప్రాంతంలో ఆయుర్వేద క్లినికల్ పరిశోధన అధ్యయనాన్ని నిర్వహిస్తోంది. పాల్గొనడం గురించి తెలుసుకోవడానికి స్థానిక ఆరోగ్య కార్యకర్తను సంప్రదించండి.",
      hi: "एआईआईए (AIIA) आपके क्षेत्र में एक आयुर्वेद नैदानिक अनुसंधान अध्ययन आयोजित कर रहा है। भागीदारी के बारे में जानने के लिए स्थानीय स्वास्थ्य कार्यकर्ता से संपर्क करें।",
      ta: "AIIA உங்கள் பகுதியில் ஆயுர்வேத மருத்துவ ஆராய்ச்சி ஆய்வை நடத்தி வருகிறது. பங்கேற்பது பற்றி அறிய உள்ளூர் சுகாதாரப் பணியாளரைத் தொடர்பு கொள்ளவும்.",
      kn: "AIIA ನಿಮ್ಮ ಪ್ರದೇಶದಲ್ಲಿ ಆಯುರ್ವೇದ ವೈದ್ಯಕೀಯ ಸಂಶೋಧನಾ ಅಧ್ಯಯನವನ್ನು ನಡೆಸುತ್ತಿದೆ. ಭಾಗವಹಿಸುವಿಕೆಯ ಬಗ್ಗೆ ತಿಳಿಯಲು ಸ್ಥಳೀಯ ಆರೋಗ್ಯ ಕಾರ್ಯಕರ್ತರನ್ನು ಸಂಪರ್ಕಿಸಿ."
    };

    document.getElementById("outreachMessageText").textContent = texts[lang] || texts["en"];
  },

  copyOutreachMessage() {
    const text = document.getElementById("outreachMessageText").textContent;
    navigator.clipboard.writeText(text).then(() => {
      Components.showToast("WhatsApp recruitment message copied to clipboard!", "success");
      this.closeOutreachModal();
    }).catch(() => {
      Components.showToast("Copied to clipboard", "success");
      this.closeOutreachModal();
    });
  },

  toggleAuditSidePanel() {
    const panel = document.getElementById("auditSidePanel");
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) {
      this.renderAuditPanel();
    }
  },

  renderAuditPanel() {
    const trail = Store.getState().data.auditTrail;
    document.getElementById("auditPanelLogs").innerHTML = trail.map(l => `
      <div class="audit-log-item">
        <div class="audit-log-time">${l.timestamp}</div>
        <span class="audit-log-cat">${l.category}</span>
        <div style="color: #cbd5e1; margin-top: 2px;">${l.text}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">User: ${l.user}</div>
      </div>
    `).join("");
  },

  toggleNotificationDrawer() {
    Components.showToast("Notifications: 1 Critical SAE Deadline, 1 Ethics Renewal Warning.", "info");
  },

  handleSearch(query) {
    const dropdown = document.getElementById("searchResultsDropdown");
    if (!query || query.length < 2) {
      dropdown.classList.add("hidden");
      return;
    }

    const q = query.toLowerCase();
    const data = Store.getState().data;
    let results = [];

    data.studies.forEach(s => {
      if (s.id.toLowerCase().includes(q) || s.title.toLowerCase().includes(q)) {
        results.push({ label: `Study: ${s.id} - ${s.title}`, view: "study360" });
      }
    });

    data.participants.forEach(p => {
      if (p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)) {
        results.push({ label: `Participant: ${p.id} (${p.site})`, view: "dataQuality" });
      }
    });

    data.sites.forEach(st => {
      if (st.id.toLowerCase().includes(q) || st.name.toLowerCase().includes(q)) {
        results.push({ label: `Site: ${st.id} - ${st.name}`, view: "recruitmentSites" });
      }
    });

    if (results.length === 0) {
      dropdown.innerHTML = `<div style="padding: 12px; font-size: 12px; color: var(--text-muted);">No matching entities found.</div>`;
    } else {
      dropdown.innerHTML = results.map(r => `
        <div style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; cursor: pointer; font-size: 12px; font-weight: 600;" onclick="App.navigateTo('${r.view}'); document.getElementById('searchResultsDropdown').classList.add('hidden');">
          🔍 ${r.label}
        </div>
      `).join("");
    }
    dropdown.classList.remove("hidden");
  },

  resetDemoData() {
    Store.resetData();
    this.init();
    Components.showToast("Demo Data successfully reset to initial synthetic baseline.", "success");
  },

  // SIH 25-Step Guided Demo Controller
  startGuidedTour() {
    this.tourCurrentStep = 1;
    this.updateTourModal();
    document.getElementById("sihTourModal").classList.remove("hidden");
  },

  closeGuidedTour() {
    document.getElementById("sihTourModal").classList.add("hidden");
  },

  updateTourModal() {
    const item = this.tourSteps[this.tourCurrentStep - 1];
    document.getElementById("tourStepBadge").textContent = `STEP ${item.step} OF ${this.tourSteps.length}`;
    document.getElementById("tourStepTitle").textContent = item.title;
    document.getElementById("tourStepDesc").textContent = item.desc;
  },

  prevTourStep() {
    if (this.tourCurrentStep > 1) {
      this.tourCurrentStep--;
      this.updateTourModal();
    }
  },

  executeTourAction() {
    const item = this.tourSteps[this.tourCurrentStep - 1];
    if (item && item.action) {
      item.action();
    }
    if (this.tourCurrentStep < this.tourSteps.length) {
      this.tourCurrentStep++;
      this.updateTourModal();
    } else {
      this.closeGuidedTour();
    }
  }
};

// Initialize Application on Window Load
window.addEventListener("DOMContentLoaded", () => {
  App.init();
});
