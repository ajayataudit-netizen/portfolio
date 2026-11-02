/**
 * AJAY JOSHI — PORTFOLIO CORE JAVASCRIPT
 * Includes Navigation Interactions, macOS Window Effects,
 * and Secret Owner Visitor Intelligence & Telemetry System
 */

(function() {
  'use strict';

  // =========================================================================
  // 1. CONFIGURATION & STATE
  // =========================================================================
  const CONFIG = {
    DEFAULT_PIN: '1836', // Last 4 digits of Ajay's phone number
    STORAGE_KEY_LOGS: 'aj_intel_logs_v1',
    STORAGE_KEY_CONFIG: 'aj_intel_config_v1',
    STORAGE_KEY_GUEST: 'aj_intel_guest_v1',
    PHOTOS_KEY: 'aj_selected_photos_v3'
  };

  const AVAILABLE_PHOTOS = [
    { id: 'final-01.jpg', title: 'Finals 01 · Formal Portrait', label: 'Photo 1' },
    { id: 'final-02.jpg', title: 'Finals 02 · Mountain Ridge Viewpoint', label: 'Photo 2' },
    { id: 'final-03.jpg', title: 'Finals 03 · Articleship Ground', label: 'Photo 3' },
    { id: 'final-04.jpg', title: 'Finals 04 · Founder AJ Associates', label: 'Photo 4' },
    { id: 'final-05.jpg', title: 'Finals 05 · Tools & Problem Solving', label: 'Photo 5' },
    { id: 'final-06.jpg', title: 'Finals 06 · Audit Workings', label: 'Photo 6' },
    { id: 'final-07.jpg', title: 'Finals 07 · Football & Spare Time', label: 'Photo 7' },
    { id: 'final-08.jpg', title: 'Finals 08 · Let’s Connect', label: 'Photo 8' },
    { id: '20250405_151810.jpg', title: 'High-Res Office Shoot', label: 'Archive' },
    { id: '20260325_184003.jpg', title: 'Outdoor Natural Portrait', label: 'Archive' },
    { id: '20260606_200107.jpg', title: 'Casual Outdoor', label: 'Archive' }
  ];

  // Default active photos (8 Slots from PHOTOS/FINALS)
  let activePhotos = {
    photo1: 'final-01.jpg',
    photo2: 'final-02.jpg',
    photo3: 'final-03.jpg',
    photo4: 'final-04.jpg',
    photo5: 'final-05.jpg',
    photo6: 'final-06.jpg',
    photo7: 'final-07.jpg',
    photo8: 'final-08.jpg'
  };

  // Load user saved photos if any
  try {
    const savedPhotos = localStorage.getItem(CONFIG.PHOTOS_KEY);
    if (savedPhotos) {
      activePhotos = Object.assign(activePhotos, JSON.parse(savedPhotos));
    }
  } catch (e) {}

  // Apply active photos to DOM
  function updateDOMPhotos() {
    for (let i = 1; i <= 8; i++) {
      const el = document.getElementById(`story-img-${i}`);
      if (el && activePhotos[`photo${i}`]) {
        el.src = 'assets/images/' + activePhotos[`photo${i}`];
      }
    }
  }

  // =========================================================================
  // 2. MULTI-CANVAS NAVIGATION (Discrete Views for Info, Work, Services, Tools)
  // =========================================================================
  function initNavigation() {
    const navToggles = document.querySelectorAll('.nav-toggle, .canvas-nav-link');
    const canvases = document.querySelectorAll('.site-canvas');

    function switchCanvas(canvasId, updateHash = true) {
      if (!canvasId) canvasId = 'work';
      const cleanKey = canvasId.replace('canvas-', '').toLowerCase();
      
      let targetCanvasKey = cleanKey;
      let scrollTargetId = null;
      if (cleanKey === 'services' || cleanKey === 'tools') {
        targetCanvasKey = 'work';
        scrollTargetId = cleanKey;
      }

      const targetCanvasEl = document.getElementById(`canvas-${targetCanvasKey}`) || document.getElementById(targetCanvasKey);
      if (!targetCanvasEl) return;

      // Hide all canvases
      canvases.forEach(c => {
        c.classList.remove('active');
      });

      // Activate target canvas
      targetCanvasEl.classList.add('active');

      // Update active nav pills
      navToggles.forEach(btn => {
        const btnTarget = (btn.getAttribute('data-target') || btn.getAttribute('href') || '').replace('#', '').replace('canvas-', '').toLowerCase();
        if (btnTarget === targetCanvasKey) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Smooth scroll
      if (scrollTargetId) {
        setTimeout(() => {
          const el = document.getElementById(scrollTargetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 50);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      // Update URL hash
      if (updateHash && window.location.hash !== `#${cleanKey}`) {
        history.pushState(null, null, `#${cleanKey}`);
      }
    }

    // Attach click listeners to all nav links
    navToggles.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        const target = this.getAttribute('data-target') || (this.getAttribute('href') || '').replace('#', '');
        switchCanvas(target);
      });
    });

    // Check URL hash on initial load
    const initialHash = (window.location.hash || '').replace('#', '').toLowerCase().trim();
    if (initialHash && ['work', 'info'].includes(initialHash)) {
      switchCanvas(initialHash, false);
    } else {
      switchCanvas('work', false);
    }

    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
      const hash = (window.location.hash || '').replace('#', '').toLowerCase().trim();
      if (hash && ['work', 'info'].includes(hash)) {
        switchCanvas(hash, false);
      }
    });
  }

  // =========================================================================
  // 3. SECRET OWNER VISITOR INTELLIGENCE & TELEMETRY ENGINE
  // =========================================================================
  class VisitorIntelligenceEngine {
    constructor() {
      this.sessionStartTime = Date.now();
      this.currentSession = null;
      this.init();
    }

    init() {
      // 1. Detect query parameters for tagged visitor names
      const urlParams = new URLSearchParams(window.location.search);
      const urlName = urlParams.get('name') || urlParams.get('v') || urlParams.get('visitor') || urlParams.get('ref');

      // 2. Retrieve existing guest profile
      let guestName = '';
      try {
        guestName = localStorage.getItem(CONFIG.STORAGE_KEY_GUEST) || '';
      } catch (e) {}

      const identifiedName = urlName || guestName || '';

      // 3. Assemble visit fingerprint
      const userAgent = navigator.userAgent;
      const device = this.detectDevice(userAgent);
      const browser = this.detectBrowser(userAgent);
      const os = this.detectOS(userAgent);
      const referrer = document.referrer ? (new URL(document.referrer).hostname || document.referrer) : 'Direct Visit';

      const visitRecord = {
        id: 'vis_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        formattedTime: new Date().toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata'
        }),
        name: identifiedName,
        isIdentified: Boolean(identifiedName),
        urlTag: urlName || '',
        device: device,
        browser: browser,
        os: os,
        screen: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language || 'en',
        referrer: referrer,
        currentPath: window.location.pathname + window.location.search,
        ip: 'Fetching...',
        city: 'Resolving...',
        region: '',
        country: '',
        countryCode: '',
        flag: '📍',
        isp: '',
        durationSeconds: 0
      };

      this.currentSession = visitRecord;

      // 4. Fetch Geolocation silently via IP
      this.resolveLocation(visitRecord).then(updatedRecord => {
        this.saveRecord(updatedRecord);
        this.dispatchAlertIfConfigured(updatedRecord);
      });

      // 5. Setup heartbeat to track visit duration
      this.setupHeartbeat();

      // 6. Setup guest greeting pill interaction
      this.setupGuestGreeting();
    }

    detectDevice(ua) {
      if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
      if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) return 'Mobile';
      return 'Desktop';
    }

    detectOS(ua) {
      if (/Windows/i.test(ua)) return 'Windows';
      if (/Macintosh|Mac OS X/i.test(ua)) return 'macOS';
      if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
      if (/Android/i.test(ua)) return 'Android';
      if (/Linux/i.test(ua)) return 'Linux';
      return 'Unknown OS';
    }

    detectBrowser(ua) {
      if (/Chrome/i.test(ua) && !/Edge|Edg|OPR/i.test(ua)) return 'Chrome';
      if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) return 'Safari';
      if (/Firefox/i.test(ua)) return 'Firefox';
      if (/Edg/i.test(ua)) return 'Edge';
      if (/OPR/i.test(ua)) return 'Opera';
      return 'Browser';
    }

    async resolveLocation(record) {
      try {
        // High quality free HTTPS IP resolver
        const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
        const data = await res.json();
        if (data && data.success !== false) {
          record.ip = data.ip || 'Unknown';
          record.city = data.city || 'Unknown';
          record.region = data.region || '';
          record.country = data.country || '';
          record.countryCode = data.country_code || '';
          record.flag = data.country_code ? this.countryCodeToEmoji(data.country_code) : '📍';
          record.isp = data.connection?.isp || data.connection?.org || '';
          return record;
        }
      } catch (err) {
        // Fallback resolver
        try {
          const fallbackRes = await fetch('https://ipapi.co/json/');
          const fbData = await fallbackRes.json();
          record.ip = fbData.ip || 'Unknown';
          record.city = fbData.city || 'Unknown';
          record.region = fbData.region || '';
          record.country = fbData.country_name || '';
          record.countryCode = fbData.country_code || '';
          record.flag = fbData.country_code ? this.countryCodeToEmoji(fbData.country_code) : '📍';
          record.isp = fbData.org || '';
          return record;
        } catch (e) {
          record.city = 'Location unavailable';
        }
      }
      return record;
    }

    countryCodeToEmoji(countryCode) {
      if (!countryCode || countryCode.length !== 2) return '📍';
      return String.fromCodePoint(
        ...countryCode.toUpperCase().split('').map(c => 127397 + c.charCodeAt(0))
      );
    }

    saveRecord(record) {
      try {
        let logs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_LOGS) || '[]');
        // Update if existing or prepend
        const existingIdx = logs.findIndex(l => l.id === record.id);
        if (existingIdx >= 0) {
          logs[existingIdx] = record;
        } else {
          logs.unshift(record);
        }
        // Limit to latest 300 logs
        if (logs.length > 300) logs = logs.slice(0, 300);
        localStorage.setItem(CONFIG.STORAGE_KEY_LOGS, JSON.stringify(logs));
      } catch (e) {
        console.warn('Telemetry save failed', e);
      }
    }

    updateCurrentGuestName(name) {
      if (!name) return;
      try {
        localStorage.setItem(CONFIG.STORAGE_KEY_GUEST, name);
      } catch (e) {}

      if (this.currentSession) {
        this.currentSession.name = name;
        this.currentSession.isIdentified = true;
        this.saveRecord(this.currentSession);
        // Send immediate alert that user identified themselves!
        this.dispatchAlertIfConfigured(this.currentSession, true);
      }
    }

    setupHeartbeat() {
      // Update duration every 15 seconds
      setInterval(() => {
        if (this.currentSession) {
          this.currentSession.durationSeconds = Math.round((Date.now() - this.sessionStartTime) / 1000);
          this.saveRecord(this.currentSession);
        }
      }, 15000);
    }

    setupGuestGreeting() {
      const pill = document.getElementById('visitor-greeting-pill');
      const input = document.getElementById('visitor-guest-name-input');
      const submitBtn = document.getElementById('visitor-guest-submit');
      const textSpan = document.getElementById('visitor-greeting-text');

      if (!pill || !input) return;

      const storedGuest = localStorage.getItem(CONFIG.STORAGE_KEY_GUEST);
      if (storedGuest) {
        textSpan.innerHTML = `Welcome back, <strong>${storedGuest}</strong>`;
        input.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'none';
        setTimeout(() => { pill.style.opacity = '0.5'; }, 4000);
        return;
      }

      const handleNameSubmit = () => {
        const val = input.value.trim();
        if (val) {
          this.updateCurrentGuestName(val);
          textSpan.innerHTML = `Great to meet you, <strong>${val}</strong>!`;
          input.style.display = 'none';
          if (submitBtn) submitBtn.style.display = 'none';
          setTimeout(() => { pill.style.opacity = '0.4'; }, 5000);
        }
      };

      if (submitBtn) submitBtn.addEventListener('click', handleNameSubmit);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleNameSubmit();
      });
    }

    async dispatchAlertIfConfigured(record, isNameUpdate = false) {
      try {
        const config = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_CONFIG) || '{}');
        const telegramToken = config.telegramToken;
        const telegramChatId = config.telegramChatId;
        const webhookUrl = config.webhookUrl;

        const visitorLabel = record.name ? `👤 ${record.name} (Identified)` : `👤 Anonymous Visitor`;
        const locationLabel = `${record.city || 'Unknown'}, ${record.region || ''} ${record.country || ''} ${record.flag || ''}`;
        const timeLabel = record.formattedTime;
        const deviceLabel = `${record.device} · ${record.os} · ${record.browser}`;
        const refLabel = record.referrer;

        // 1. Telegram Dispatch
        if (telegramToken && telegramChatId) {
          const text = `🔔 *Portfolio Visitor Alert!*\n\n` +
            `*Visitor:* ${record.name ? `*${record.name}*` : '_Anonymous_'}\n` +
            `*Location:* ${locationLabel}\n` +
            `*Time:* ${timeLabel}\n` +
            `*Device:* ${deviceLabel}\n` +
            `*Network/ISP:* ${record.isp || 'N/A'}\n` +
            `*Source:* ${refLabel}\n` +
            (record.urlTag ? `*Tag:* \`${record.urlTag}\`\n` : '') +
            (isNameUpdate ? `✨ *User just entered their name on your site!*` : '');

          fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: telegramChatId,
              text: text,
              parse_mode: 'Markdown'
            })
          }).catch(() => {});
        }

        // 2. Webhook (Discord / Slack / Make / Zapier)
        if (webhookUrl) {
          const payload = {
            content: `🔔 **New Visitor on Ajay Joshi's Portfolio**\n**Name:** ${record.name || 'Anonymous'}\n**Location:** ${locationLabel}\n**Time:** ${timeLabel}\n**Device:** ${deviceLabel} | ${record.isp}\n**Referrer:** ${refLabel}`,
            visitor: record
          };
          fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          }).catch(() => {});
        }
      } catch (e) {}
    }
  }

  // =========================================================================
  // 4. SECRET OWNER DASHBOARD MODAL & UI CONTROLLER
  // =========================================================================
  class SecretOwnerDashboardUI {
    constructor() {
      this.overlay = document.getElementById('owner-modal-overlay');
      this.authBox = document.getElementById('owner-auth-box');
      this.dashContainer = document.getElementById('owner-dashboard-container');
      this.pinInput = document.getElementById('owner-pin-input');
      this.pinSubmit = document.getElementById('owner-pin-submit');
      this.pinError = document.getElementById('owner-pin-error');
      this.closeBtn = document.getElementById('owner-dash-close');
      this.isAuthenticated = false;

      this.initTriggers();
      this.initEventListeners();
    }

    initTriggers() {
      // Trigger 1: Keyboard Shortcut Ctrl + Shift + A (or Cmd + Shift + A)
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
          e.preventDefault();
          this.openModal();
        }
        if (e.key === 'Escape' && this.overlay.classList.contains('active')) {
          this.closeModal();
        }
      });

      // Trigger 2: Triple-click on footer copyright symbol '©'
      const triggerSymbol = document.getElementById('secret-trigger-symbol');
      if (triggerSymbol) {
        let clickCount = 0;
        let clickTimer;
        triggerSymbol.addEventListener('click', (e) => {
          e.preventDefault();
          clickCount++;
          clearTimeout(clickTimer);
          if (clickCount >= 3) {
            clickCount = 0;
            this.openModal();
          } else {
            clickTimer = setTimeout(() => { clickCount = 0; }, 600);
          }
        });
      }

      // Trigger 3: URL hash #owner or ?owner=ajay
      if (window.location.hash === '#owner' || window.location.search.includes('owner=ajay')) {
        setTimeout(() => this.openModal(), 500);
      }
    }

    initEventListeners() {
      if (this.pinSubmit) {
        this.pinSubmit.addEventListener('click', () => this.verifyPIN());
      }
      if (this.pinInput) {
        this.pinInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') this.verifyPIN();
        });
      }
      if (this.closeBtn) {
        this.closeBtn.addEventListener('click', () => this.closeModal());
      }
      this.overlay.addEventListener('click', (e) => {
        if (e.target === this.overlay) this.closeModal();
      });

      // Export CSV
      const exportBtn = document.getElementById('owner-export-csv');
      if (exportBtn) exportBtn.addEventListener('click', () => this.exportToCSV());

      // Clear Logs
      const clearBtn = document.getElementById('owner-clear-logs');
      if (clearBtn) clearBtn.addEventListener('click', () => this.clearLogs());

      // Search filter
      const searchInput = document.getElementById('owner-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => this.filterLogs(e.target.value));
      }

      // Save Webhook Settings
      const saveSettingsBtn = document.getElementById('owner-save-settings');
      if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', () => this.saveSettings());
      }

      // Test Alert Ping
      const testAlertBtn = document.getElementById('owner-test-alert');
      if (testAlertBtn) {
        testAlertBtn.addEventListener('click', () => this.sendTestAlert());
      }

      // Tab switching inside dashboard (Logs / Photos / Settings)
      const tabBtns = document.querySelectorAll('.owner-tab-btn');
      tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          tabBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const tabId = btn.getAttribute('data-tab');
          document.querySelectorAll('.owner-tab-pane').forEach(p => p.style.display = 'none');
          const targetPane = document.getElementById(tabId);
          if (targetPane) targetPane.style.display = 'block';
        });
      });
    }

    openModal() {
      this.overlay.classList.add('active');
      if (!this.isAuthenticated) {
        this.authBox.style.display = 'block';
        this.dashContainer.style.display = 'none';
        if (this.pinInput) {
          this.pinInput.value = '';
          this.pinInput.focus();
        }
      } else {
        this.showDashboard();
      }
    }

    closeModal() {
      this.overlay.classList.remove('active');
    }

    verifyPIN() {
      const config = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_CONFIG) || '{}');
      const expectedPIN = config.customPIN || CONFIG.DEFAULT_PIN;
      const enteredPIN = this.pinInput.value.trim();

      if (enteredPIN === expectedPIN) {
        this.isAuthenticated = true;
        this.pinError.style.display = 'none';
        this.showDashboard();
      } else {
        this.pinError.style.display = 'block';
        this.pinError.innerText = 'Incorrect Master PIN. Access Denied.';
        this.pinInput.value = '';
        this.pinInput.focus();
      }
    }

    showDashboard() {
      this.authBox.style.display = 'none';
      this.dashContainer.style.display = 'flex';
      this.renderStats();
      this.renderTable();
      this.renderPhotoManager();
      this.loadSettings();
    }

    getLogs() {
      try {
        return JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_LOGS) || '[]');
      } catch (e) {
        return [];
      }
    }

    renderStats() {
      const logs = this.getLogs();
      const totalVisits = logs.length;
      const uniqueIPs = new Set(logs.map(l => l.ip)).size;
      const identifiedCount = logs.filter(l => l.name && l.name !== 'Anonymous').length;
      
      const todayStr = new Date().toDateString();
      const todayCount = logs.filter(l => new Date(l.timestamp).toDateString() === todayStr).length;

      document.getElementById('stat-total-visits').innerText = totalVisits;
      document.getElementById('stat-unique-visitors').innerText = uniqueIPs;
      document.getElementById('stat-today-visits').innerText = todayCount;
      document.getElementById('stat-identified-guests').innerText = identifiedCount;
    }

    renderTable(filterTerm = '') {
      const tbody = document.getElementById('owner-log-tbody');
      if (!tbody) return;
      tbody.innerHTML = '';

      let logs = this.getLogs();
      if (filterTerm) {
        const t = filterTerm.toLowerCase();
        logs = logs.filter(l => 
          (l.name && l.name.toLowerCase().includes(t)) ||
          (l.city && l.city.toLowerCase().includes(t)) ||
          (l.country && l.country.toLowerCase().includes(t)) ||
          (l.ip && l.ip.includes(t)) ||
          (l.device && l.device.toLowerCase().includes(t)) ||
          (l.urlTag && l.urlTag.toLowerCase().includes(t))
        );
      }

      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:30px; color:var(--text-muted);">No visitor logs found yet. When someone visits your site, their exact time, name and location will appear here automatically!</td></tr>`;
        return;
      }

      logs.forEach(log => {
        const tr = document.createElement('tr');
        const nameBadge = log.name ? `<span class="visitor-badge-name">✨ ${this.escapeHTML(log.name)}</span>` : `<span style="color:var(--text-muted)">Anonymous</span>`;
        const tagBadge = log.urlTag ? `<span class="badge-tag-url">Tag: ${this.escapeHTML(log.urlTag)}</span>` : '';
        const locationBadge = `<span class="visitor-location-tag">${log.flag || '📍'} ${this.escapeHTML(log.city || 'Unknown')}${log.region ? ', ' + this.escapeHTML(log.region) : ''} (${this.escapeHTML(log.country || '')})</span>`;

        tr.innerHTML = `
          <td><strong>${log.formattedTime}</strong></td>
          <td>${nameBadge} ${tagBadge}</td>
          <td>${locationBadge}</td>
          <td><code>${log.ip || '—'}</code> <small style="display:block; color:var(--text-muted);">${this.escapeHTML(log.isp || '')}</small></td>
          <td>${log.device} · ${log.os} (${log.browser})</td>
          <td>${this.escapeHTML(log.referrer || 'Direct')}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    filterLogs(query) {
      this.renderTable(query);
    }

    renderPhotoManager() {
      const container = document.getElementById('photo-manager-grid');
      if (!container) return;
      container.innerHTML = '';

      AVAILABLE_PHOTOS.forEach(photo => {
        const card = document.createElement('div');
        card.style.cssText = 'background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:8px;';
        
        let slotButtonsHtml = '';
        for (let i = 1; i <= 8; i++) {
          const isSlot = activePhotos[`photo${i}`] === photo.id;
          slotButtonsHtml += `<button class="photo-assign-btn ${isSlot ? 'assigned' : ''}" data-slot="photo${i}" data-id="${photo.id}" style="flex:1; padding:3px 1px; font-size:8.5px; border-radius:4px; border:1px solid ${isSlot ? '#10b981' : 'rgba(255,255,255,0.1)'}; background:${isSlot ? '#10b98122' : 'transparent'}; color:${isSlot ? '#10b981' : '#bbb'};">P${i}</button>`;
        }

        card.innerHTML = `
          <div style="width:100%; height:130px; border-radius:8px; overflow:hidden; background:#000;">
            <img src="assets/images/${photo.id}" style="width:100%; height:100%; object-fit:cover;" alt="${photo.title}">
          </div>
          <div style="font-size:11.5px; font-weight:600; color:#fff; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${photo.title}</div>
          <div style="display:flex; gap:4px; margin-top:auto;">
            ${slotButtonsHtml}
          </div>
        `;
        container.appendChild(card);
      });

      // Handle button clicks to assign photos
      container.querySelectorAll('.photo-assign-btn').forEach(b => {
        b.addEventListener('click', (e) => {
          const slot = b.getAttribute('data-slot');
          const id = b.getAttribute('data-id');
          activePhotos[slot] = id;
          localStorage.setItem(CONFIG.PHOTOS_KEY, JSON.stringify(activePhotos));
          updateDOMPhotos();
          this.renderPhotoManager();
        });
      });
    }

    loadSettings() {
      const config = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_CONFIG) || '{}');
      const tgToken = document.getElementById('cfg-telegram-token');
      const tgChat = document.getElementById('cfg-telegram-chat');
      const webhook = document.getElementById('cfg-webhook-url');
      const newPin = document.getElementById('cfg-custom-pin');

      if (tgToken) tgToken.value = config.telegramToken || '';
      if (tgChat) tgChat.value = config.telegramChatId || '';
      if (webhook) webhook.value = config.webhookUrl || '';
      if (newPin) newPin.value = config.customPIN || '';
    }

    saveSettings() {
      const tgToken = document.getElementById('cfg-telegram-token').value.trim();
      const tgChat = document.getElementById('cfg-telegram-chat').value.trim();
      const webhook = document.getElementById('cfg-webhook-url').value.trim();
      const customPin = document.getElementById('cfg-custom-pin').value.trim();

      const config = {
        telegramToken: tgToken,
        telegramChatId: tgChat,
        webhookUrl: webhook,
        customPIN: customPin || CONFIG.DEFAULT_PIN
      };

      localStorage.setItem(CONFIG.STORAGE_KEY_CONFIG, JSON.stringify(config));
      alert('Security & Notification Settings Saved Successfully!');
    }

    async sendTestAlert() {
      const config = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY_CONFIG) || '{}');
      if (!config.telegramToken && !config.webhookUrl) {
        alert('Please enter either Telegram Bot credentials or a Webhook URL first!');
        return;
      }
      const testRecord = {
        name: 'Ajay Joshi (Test Ping)',
        city: 'Ahmedabad',
        region: 'Gujarat',
        country: 'India',
        flag: '🇮🇳',
        formattedTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        device: 'Desktop · Windows 11 · Chrome',
        isp: 'Airtel Broadband / Jio 5G',
        referrer: 'Manual Owner Test Button'
      };
      await window._ajIntelligence.dispatchAlertIfConfigured(testRecord, false);
      alert('Test alert triggered! Check your Telegram or Webhook channel.');
    }

    exportToCSV() {
      const logs = this.getLogs();
      if (!logs.length) {
        alert('No logs to export.');
        return;
      }

      const headers = ['Timestamp', 'Visitor Name', 'URL Tag', 'City', 'Region', 'Country', 'IP', 'ISP', 'Device', 'OS', 'Browser', 'Referrer'];
      const rows = logs.map(l => [
        `"${l.formattedTime}"`,
        `"${l.name || 'Anonymous'}"`,
        `"${l.urlTag || ''}"`,
        `"${l.city || ''}"`,
        `"${l.region || ''}"`,
        `"${l.country || ''}"`,
        `"${l.ip || ''}"`,
        `"${l.isp || ''}"`,
        `"${l.device || ''}"`,
        `"${l.os || ''}"`,
        `"${l.browser || ''}"`,
        `"${l.referrer || ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Ajay_Joshi_Visitor_Telemetry_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    clearLogs() {
      if (confirm('Are you sure you want to clear all visitor telemetry history? This action cannot be undone.')) {
        localStorage.removeItem(CONFIG.STORAGE_KEY_LOGS);
        this.renderStats();
        this.renderTable();
      }
    }

    escapeHTML(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    }
  }

  // =========================================================================
  // 5. INITIALIZATION ON DOM READY
  // =========================================================================
  document.addEventListener('DOMContentLoaded', () => {
    updateDOMPhotos();
    initNavigation();
    window._ajIntelligence = new VisitorIntelligenceEngine();
    window._ajOwnerUI = new SecretOwnerDashboardUI();

    // Quick contact button opens contact section
    const quickContactBtn = document.getElementById('btn-quick-contact');
    if (quickContactBtn) {
      quickContactBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const connectSec = document.getElementById('connect');
        if (connectSec) {
          connectSec.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  });

})();
