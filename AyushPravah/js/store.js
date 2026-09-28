/* AyushPravah - Store & State Management */

const Store = {
  STATE_KEY: "ayushpravah_state_v1",

  init() {
    let saved = localStorage.getItem(this.STATE_KEY);
    if (!saved) {
      this.resetData();
    } else {
      try {
        let parsed = JSON.parse(saved);
        if (!parsed.data || !parsed.data.studies) {
          this.resetData();
        }
      } catch (e) {
        this.resetData();
      }
    }
  },

  getState() {
    let saved = localStorage.getItem(this.STATE_KEY);
    if (!saved) {
      this.resetData();
      saved = localStorage.getItem(this.STATE_KEY);
    }
    return JSON.parse(saved);
  },

  saveState(state) {
    localStorage.setItem(this.STATE_KEY, JSON.stringify(state));
  },

  resetData() {
    const initialState = {
      role: "role_pi",
      lang: "en",
      isOffline: false,
      piiMasking: true, // Privacy by default
      user: {
        name: "Dr. Rajesh Sharma",
        id: "USER-DELHI-01",
        email: "r.sharma@aiia.gov.in"
      },
      data: JSON.parse(JSON.stringify(INITIAL_DEMO_DATA))
    };
    this.saveState(initialState);
    return initialState;
  },

  getRole() {
    return this.getState().role;
  },

  setRole(newRole) {
    let state = this.getState();
    state.role = newRole;
    this.saveState(state);
    this.addAuditLog("ROLE_SWITCH", `User switched demo role to ${TRANSLATIONS.en[newRole] || newRole}.`);
  },

  getLang() {
    return this.getState().lang || "en";
  },

  setLang(newLang) {
    let state = this.getState();
    state.lang = newLang;
    this.saveState(state);
  },

  isOffline() {
    return !!this.getState().isOffline;
  },

  setOffline(status) {
    let state = this.getState();
    state.isOffline = status;
    this.saveState(state);
    let msg = status ? "Switched to OFFLINE simulation mode. Local caching enabled." : "Returned to ONLINE mode.";
    this.addAuditLog("CONNECTIVITY", msg);
  },

  isPiiMasked() {
    return !!this.getState().piiMasking;
  },

  setPiiMasking(masked) {
    let state = this.getState();
    state.piiMasking = masked;
    this.saveState(state);
    this.addAuditLog("PRIVACY", `PII Masking toggle set to ${masked ? 'ENABLED (Names masked)' : 'DISABLED (Names visible)'}.`);
  },

  addAuditLog(category, text) {
    let state = this.getState();
    const now = new Date();
    const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
    const roleName = TRANSLATIONS.en[state.role] || state.role;
    
    state.data.auditTrail.unshift({
      timestamp: timestamp,
      category: category,
      user: `${state.user.name} (${roleName})`,
      text: text
    });
    // Keep max 50 logs
    if (state.data.auditTrail.length > 50) {
      state.data.auditTrail.pop();
    }
    this.saveState(state);
  },

  addPendingSync(record) {
    let state = this.getState();
    state.data.pendingSyncRecords.unshift(record);
    this.saveState(state);
    this.addAuditLog("OFFLINE_SAVE", `Record ${record.id} stored locally in offline cache (${record.type}).`);
  },

  syncNow() {
    let state = this.getState();
    let pending = state.data.pendingSyncRecords;
    if (pending.length === 0) return 0;

    let count = pending.length;
    const now = new Date().toISOString().replace("T", " ").substring(0, 19);
    
    pending.forEach(rec => {
      rec.syncedAt = now;
      state.data.syncedRecords.unshift(rec);
    });
    
    state.data.pendingSyncRecords = [];
    this.saveState(state);
    this.addAuditLog("SYNC", `Synchronized ${count} pending records from local cache to central database.`);
    return count;
  },

  assignDeviation(devId, assignedTo) {
    let state = this.getState();
    let item = state.data.protocolDeviations.find(d => d.id === devId);
    if (item) {
      item.assignedTo = assignedTo;
      item.status = "Assigned";
      this.saveState(state);
      this.addAuditLog("ACTION", `Protocol deviation ${devId} assigned to ${assignedTo}.`);
    }
  },

  addSafetyCase(newCase) {
    let state = this.getState();
    state.data.safetyCases.unshift(newCase);
    state.data.kpis.openSafetyCases++;
    this.saveState(state);
    this.addAuditLog("SAFETY", `New Adverse Event case ${newCase.caseId} recorded (${newCase.severity}).`);
  },

  saveConsent(consentObj) {
    let state = this.getState();
    let p = state.data.participants.find(pt => pt.id === consentObj.participantId);
    if (p) {
      p.consentStatus = consentObj.status;
    }
    this.saveState(state);
    
    if (state.isOffline) {
      this.addPendingSync({
        id: `CONSENT-${Date.now()}`,
        type: "e-Consent Form",
        trialId: consentObj.trialId,
        participantId: consentObj.participantId,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        data: consentObj
      });
    } else {
      this.addAuditLog("CONSENT", `Informed consent saved for ${consentObj.participantId} (${consentObj.language}).`);
    }
  },

  saveVisit(visitObj) {
    let state = this.getState();
    if (state.isOffline) {
      this.addPendingSync({
        id: `VISIT-${Date.now()}`,
        type: "Field EDC Visit",
        trialId: visitObj.trialId,
        participantId: visitObj.participantId,
        visit: visitObj.visitName,
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        data: visitObj
      });
    } else {
      this.addAuditLog("EDC_VISIT", `Visit data saved online for participant ${visitObj.participantId}.`);
    }
  }
};
