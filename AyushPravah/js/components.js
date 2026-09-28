/* AyushPravah - UI Components, Canvas Signature & Custom Charts */

const Components = {
  // Translate visible elements with data-i18n
  applyTranslations() {
    const lang = Store.getLang();
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
    
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (dict[key]) {
        el.setAttribute("placeholder", dict[key]);
      }
    });
  },

  // Toast Notification
  showToast(message, type = "success") {
    let container = document.getElementById("toastContainer");
    if (!container) {
      container = document.createElement("div");
      container.id = "toastContainer";
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast toast-${type} animate-slide-in`;
    
    let icon = "✓";
    if (type === "warning") icon = "⚠️";
    if (type === "error") icon = "❌";
    if (type === "info") icon = "ℹ️";

    toast.innerHTML = `
      <span class="toast-icon">${icon}</span>
      <span class="toast-msg">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-fade-out");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  },

  // Pure SVG Health Gauge Chart
  renderHealthGauge(score) {
    const circumference = 2 * Math.PI * 45;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    let color = "#10b981"; // Green
    if (score < 75) color = "#f59e0b"; // Orange
    if (score < 60) color = "#ef4444"; // Red

    return `
      <div class="health-gauge-container">
        <svg class="gauge-svg" viewBox="0 0 100 100">
          <circle class="gauge-bg" cx="50" cy="50" r="45"></circle>
          <circle class="gauge-fill" cx="50" cy="50" r="45" 
                  style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset}; stroke: ${color};"></circle>
        </svg>
        <div class="gauge-text">
          <span class="gauge-score">${score}</span>
          <span class="gauge-max">/100</span>
        </div>
      </div>
    `;
  },

  // Pure HTML/CSS Multi-Bar Comparison Chart for Sites
  renderSitesChart(sites) {
    let barsHtml = sites.map(site => {
      const pct = Math.min(100, Math.round((site.enrolled / site.target) * 100));
      let barColor = "var(--primary-color)";
      if (site.status === "Needs Attention") barColor = "var(--warning-color)";
      if (site.status === "Critical") barColor = "var(--danger-color)";

      return `
        <div class="site-bar-item">
          <div class="site-bar-labels">
            <span class="site-bar-name">${site.name}</span>
            <span class="site-bar-val">${site.enrolled} / ${site.target} (${pct}%)</span>
          </div>
          <div class="site-bar-track">
            <div class="site-bar-progress" style="width: ${pct}%; background-color: ${barColor};"></div>
          </div>
        </div>
      `;
    }).join("");

    return `<div class="sites-chart-wrapper">${barsHtml}</div>`;
  },

  // Interactive HTML5 Signature Canvas
  initSignatureCanvas(canvasId, clearBtnId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let hasSignature = false;

    // Set canvas dimensions based on container
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || 400;
    canvas.height = rect.height || 180;

    // Draw baseline
    function drawBaseline() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(20, canvas.height - 35);
      ctx.lineTo(canvas.width - 20, canvas.height - 35);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    drawBaseline();

    function getPos(e) {
      const r = canvas.getBoundingClientRect();
      if (e.touches && e.touches[0]) {
        return {
          x: e.touches[0].clientX - r.left,
          y: e.touches[0].clientY - r.top
        };
      }
      return {
        x: e.clientX - r.left,
        y: e.clientY - r.top
      };
    }

    function startDraw(e) {
      e.preventDefault();
      isDrawing = true;
      hasSignature = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = "#1e3a8a"; // Healthcare Deep Blue Signature
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
    }

    function moveDraw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    function stopDraw(e) {
      if (isDrawing) {
        isDrawing = false;
        ctx.closePath();
      }
    }

    canvas.addEventListener("mousedown", startDraw);
    canvas.addEventListener("mousemove", moveDraw);
    canvas.addEventListener("mouseup", stopDraw);
    canvas.addEventListener("mouseleave", stopDraw);

    canvas.addEventListener("touchstart", startDraw, { passive: false });
    canvas.addEventListener("touchmove", moveDraw, { passive: false });
    canvas.addEventListener("touchend", stopDraw);

    const clearBtn = document.getElementById(clearBtnId);
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        drawBaseline();
        hasSignature = false;
        Components.showToast("Signature cleared", "info");
      });
    }

    return {
      hasSignature: () => hasSignature,
      getDataUrl: () => canvas.toDataURL(),
      clear: () => {
        drawBaseline();
        hasSignature = false;
      }
    };
  },

  // Export functions (CSV & JSON)
  exportData(format, filename, dataObj) {
    let content = "";
    let mimeType = "";

    if (format === "json") {
      content = JSON.stringify(dataObj, null, 2);
      mimeType = "application/json";
      filename += ".json";
    } else if (format === "csv") {
      mimeType = "text/csv";
      filename += ".csv";
      if (Array.isArray(dataObj) && dataObj.length > 0) {
        const headers = Object.keys(dataObj[0]);
        content = headers.join(",") + "\n";
        dataObj.forEach(row => {
          content += headers.map(h => `"${(row[h] || "").toString().replace(/"/g, '""')}"`).join(",") + "\n";
        });
      } else {
        content = "Key,Value\n";
        for (let k in dataObj) {
          content += `"${k}","${JSON.stringify(dataObj[k]).replace(/"/g, '""')}"\n`;
        }
      }
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    Components.showToast(`Exported prototype report to ${filename}`, "success");
  }
};
