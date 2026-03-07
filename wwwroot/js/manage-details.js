const Toast = {
  container: null,

  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'default', duration = 3500) {
    this.init();
    const icons = { success: '✓', error: '✕', default: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || icons.default}</span><span>${message}</span>`;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      toast.addEventListener('animationend', () => toast.remove());
    }, duration);
  },

  success(msg) { this.show(msg, 'success'); },
  error(msg) { this.show(msg, 'error'); }
};

// ============================================
// NAVBAR MOBILE MENU
// ============================================
function initNavbar() {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.navbar-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
    toggle.innerHTML = nav.classList.contains('open')
      ? '<i class="bi bi-x-lg"></i>'
      : '<i class="bi bi-list"></i>';
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target)) {
      nav.classList.remove('open');
      toggle.innerHTML = '<i class="bi bi-list"></i>';
    }
  });
}

// ============================================
// MODAL
// ============================================
const Modal = {
  open(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  },
  close(id) {
    const overlay = document.getElementById(id);
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
    document.body.style.overflow = '';
  }
};

function initModals() {
  // Close on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) Modal.closeAll();
    });
  });

  // Close buttons
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => Modal.closeAll());
  });

  // Open buttons
  document.querySelectorAll('[data-modal-open]').forEach(btn => {
    btn.addEventListener('click', () => Modal.open(btn.dataset.modalOpen));
  });
}

// ============================================
// TABS
// ============================================
function initTabs() {
  document.querySelectorAll('.tab-item').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabGroup = tab.closest('.tabs');
      const targetId = tab.dataset.tab;

      tabGroup.querySelectorAll('.tab-item').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const contentParent = tabGroup.nextElementSibling;
      if (contentParent) {
        contentParent.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const target = document.getElementById(targetId);
        if (target) target.classList.add('active');
      }
    });
  });
}

// ============================================
// COUNTDOWN TIMER
// ============================================
function initCountdown() {
  const countdowns = document.querySelectorAll('[data-countdown]');
  countdowns.forEach(el => {
    const targetDate = new Date(el.dataset.countdown);

    function update() {
      const now = new Date();
      const diff = targetDate - now;

      if (diff <= 0) {
        el.classList.add('countdown-expired');
        el.querySelectorAll('.countdown-value').forEach(v => v.textContent = '00');
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);

      const dEl = el.querySelector('[data-cd-days]');
      const hEl = el.querySelector('[data-cd-hours]');
      const mEl = el.querySelector('[data-cd-mins]');
      const sEl = el.querySelector('[data-cd-secs]');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(mins).padStart(2, '0');
      if (sEl) sEl.textContent = String(secs).padStart(2, '0');
    }

    update();
    setInterval(update, 1000);
  });
}

// ============================================
// AJAX HELPERS (สำหรับ ASP.NET Core)
// ============================================
const Api = {
  // Get CSRF token from meta tag หรือ hidden input
  getToken() {
    const meta = document.querySelector('meta[name="__RequestVerificationToken"]');
    if (meta) return meta.content;
    const input = document.querySelector('input[name="__RequestVerificationToken"]');
    if (input) return input.value;
    return '';
  },

  async post(url, data) {
    const isFormData = data instanceof FormData;
    const headers = { 'RequestVerificationToken': this.getToken() };
    if (!isFormData) headers['Content-Type'] = 'application/json';

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data)
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return response.text();
  },

  async get(url) {
    const response = await fetch(url, {
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
};

// ============================================
// JOIN / LEAVE ACTIVITY (AJAX)
// ============================================
function initJoinButtons() {
  document.querySelectorAll('.btn-join').forEach(btn => {
    btn.addEventListener('click', async function () {
      const postId = this.dataset.postId;
      const action = this.dataset.action; // 'join' or 'leave'

      this.disabled = true;
      const originalHtml = this.innerHTML;
      this.innerHTML = '<span class="spinner"></span> Processing...';

      try {
        const result = await Api.post(`/Posts/${action}`, { postId });

        if (result.success) {
          Toast.success(result.message || (action === 'join' ? 'Successfully joined!' : 'Left successfully'));

          // Toggle button state
          if (action === 'join') {
            this.dataset.action = 'leave';
            this.textContent = 'Leave';
            this.classList.replace('btn-success', 'btn-secondary');
          } else {
            this.dataset.action = 'join';
            this.textContent = 'Join';
            this.classList.replace('btn-secondary', 'btn-success');
          }

          // Update count display
          updateApplicantCount(postId, result.currentCount, result.maxCount);
        } else {
          Toast.error(result.message || 'An error occurred. Please try again.');
          this.innerHTML = originalHtml;
        }
      } catch (err) {
        Toast.error('Unable to connect. Please try again.');
        this.innerHTML = originalHtml;
      } finally {
        this.disabled = false;
      }
    });
  });
}

function updateApplicantCount(postId, current, max) {
  // Update progress bar
  const bar = document.querySelector(`[data-post-bar="${postId}"]`);
  const text = document.querySelector(`[data-post-count="${postId}"]`);

  if (bar) {
    const pct = Math.min((current / max) * 100, 100);
    bar.style.width = `${pct}%`;
    bar.className = `progress-bar-fill${pct >= 100 ? ' full' : pct >= 75 ? ' near-full' : ''}`;
  }
  if (text) text.textContent = `${current}/${max}`;

  // Update capacity display on detail page
  const capNumbers = document.querySelector('.capacity-numbers');
  if (capNumbers) {
    capNumbers.innerHTML = `${current}<span>/${max}</span>`;
  }
  const capFill = document.querySelector('.capacity-fill');
  if (capFill) {
    const pct = Math.min((current / max) * 100, 100);
    capFill.style.width = `${pct}%`;
    capFill.className = `capacity-fill${pct >= 100 ? ' full' : pct >= 75 ? ' near' : ''}`;
  }
}

// ============================================
// CLOSE POST (Ajax - owner only)
// ============================================
function initClosePost() {
  const btn = document.querySelector('.btn-close-post');
  if (!btn) return;

  btn.addEventListener('click', async function () {
    if (!confirm('Are you sure you want to close this post?')) return;

    const postId = this.dataset.postId;
    this.disabled = true;
    this.innerHTML = '<span class="spinner"></span>';

    try {
      const result = await Api.post('/Posts/Close', { postId });
      if (result.success) {
        Toast.success('Registration has been closed.');
        setTimeout(() => location.reload(), 1000);
      } else {
        Toast.error(result.message || 'Error occurred');
        this.disabled = false;
        this.innerHTML = 'Close Registration';
      }
    } catch {
      Toast.error('Unable to connect.');
      this.disabled = false;
      this.innerHTML = 'Close Registration';
    }
  });
}

// ============================================
// LIVE SEARCH (AJAX)
// ============================================
function initLiveSearch() {
  const searchInput = document.querySelector('#search-input');
  if (!searchInput) return;

  let debounceTimer;

  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = searchInput.value.trim();
      const category = document.querySelector('#category-filter')?.value || '';
      const status = document.querySelector('#status-filter')?.value || '';

      fetchPosts({ q, category, status });
    }, 350);
  });

  // Category & status filter changes
  ['#category-filter', '#status-filter', '#sort-filter'].forEach(sel => {
    const el = document.querySelector(sel);
    if (!el) return;
    el.addEventListener('change', () => {
      const q = searchInput.value.trim();
      const category = document.querySelector('#category-filter')?.value || '';
      const status = document.querySelector('#status-filter')?.value || '';
      const sort = document.querySelector('#sort-filter')?.value || '';
      fetchPosts({ q, category, status, sort });
    });
  });
}

async function fetchPosts(params) {
  const postsGrid = document.querySelector('#posts-container');
  if (!postsGrid) return;

  // Show skeleton
  postsGrid.innerHTML = Array(6).fill(0).map(() => `
    <div class="post-card">
      <div class="skeleton" style="height:20px;width:70%;margin-bottom:0.75rem;"></div>
      <div class="skeleton" style="height:14px;width:40%;margin-bottom:0.5rem;"></div>
      <div class="skeleton" style="height:50px;margin-bottom:0.75rem;"></div>
      <div class="skeleton" style="height:14px;width:60%;"></div>
    </div>
  `).join('');

  try {
    const query = new URLSearchParams(Object.fromEntries(
      Object.entries(params).filter(([, v]) => v)
    ));
    const data = await Api.get(`/Posts/Search?${query}`);
    renderPosts(data, postsGrid);
  } catch {
    postsGrid.innerHTML = '<p class="text-muted text-center" style="grid-column:1/-1;padding:3rem">Failed to load data</p>';
  }
}

function renderPosts(posts, container) {
  if (!posts.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">No matching posts found</div>
        <div class="empty-text">Try a different keyword or filter</div>
      </div>`;
    return;
  }

  container.innerHTML = posts.map(p => {
    const pct = Math.min((p.applicantCount / p.maxMembers) * 100, 100);
    const barClass = pct >= 100 ? 'full' : pct >= 75 ? 'near-full' : '';
    const statusBadge = p.isClosed
      ? '<span class="badge badge-closed">Closed</span>'
      : p.applicantCount >= p.maxMembers
        ? '<span class="badge badge-danger">Full</span>'
        : '<span class="badge badge-success">Open</span>';

    return `
      <div class="post-card">
        <div class="post-card-header">
          <div>
            <div class="post-title"><a href="/Posts/Detail/${p.id}">${escapeHtml(p.title)}</a></div>
            <div class="post-meta mt-2">
              <span class="post-meta-item"><i class="bi bi-tag"></i>${escapeHtml(p.category)}</span>
              <span class="post-meta-item"><i class="bi bi-person"></i>${escapeHtml(p.ownerName)}</span>
              <span class="post-meta-item"><i class="bi bi-clock"></i>${p.createdAt}</span>
            </div>
          </div>
          ${statusBadge}
        </div>
        <div class="post-description">${escapeHtml(p.description)}</div>
        <div class="post-footer">
          <div class="progress-wrap">
            <div class="progress-bar-container">
              <div class="progress-bar-fill ${barClass}" style="width:${pct}%" data-post-bar="${p.id}"></div>
            </div>
            <span class="progress-text" data-post-count="${p.id}">${p.applicantCount}/${p.maxMembers}</span>
          </div>
          ${p.expiresAt ? `<span class="text-xs text-muted"><i class="bi bi-calendar-event"></i> Expires ${p.expiresAt}</span>` : ''}
          <a href="/Posts/Detail/${p.id}" class="btn btn-primary btn-sm">View details</a>
        </div>
      </div>`;
  }).join('');
}

// ============================================
// FORM VALIDATION
// ============================================
function initFormValidation() {
  const forms = document.querySelectorAll('.needs-validation');
  forms.forEach(form => {
    form.addEventListener('submit', function (e) {
      let valid = true;

      form.querySelectorAll('[required]').forEach(field => {
        const errorEl = form.querySelector(`[data-error="${field.name}"]`);
        if (!field.value.trim()) {
          field.classList.add('is-invalid');
          if (errorEl) errorEl.textContent = 'Please fill in this field';
          valid = false;
        } else {
          field.classList.remove('is-invalid');
          if (errorEl) errorEl.textContent = '';
        }
      });

      // Validate max members >= 1
      const maxField = form.querySelector('[name="MaxMembers"]');
      if (maxField && parseInt(maxField.value) < 1) {
        maxField.classList.add('is-invalid');
        const err = form.querySelector('[data-error="MaxMembers"]');
        if (err) err.textContent = 'Member count must be greater than 0';
        valid = false;
      }

      // Validate expiry date is in future
      const expiryField = form.querySelector('[name="ExpiresAt"]');
      if (expiryField && expiryField.value) {
        const expiry = new Date(expiryField.value);
        if (expiry <= new Date()) {
          expiryField.classList.add('is-invalid');
          const err = form.querySelector('[data-error="ExpiresAt"]');
          if (err) err.textContent = 'Expiry date must be in the future';
          valid = false;
        }
      }

      if (!valid) e.preventDefault();
    });

    // Clear validation on input
    form.querySelectorAll('.form-control').forEach(field => {
      field.addEventListener('input', () => {
        field.classList.remove('is-invalid');
        const err = form.querySelector(`[data-error="${field.name}"]`);
        if (err) err.textContent = '';
      });
    });
  });
}

// ============================================
// PICK WINNERS (Owner: select final members)
// ============================================
function initWinnerSelection() {
  const container = document.querySelector('#applicants-selection');
  if (!container) return;

  const maxMembers = parseInt(container.dataset.max || 0);
  const checkboxes = container.querySelectorAll('input[type="checkbox"]');
  const countDisplay = document.querySelector('#selected-count');
  const confirmBtn = document.querySelector('#btn-confirm-selection');

  function updateCount() {
    const checked = container.querySelectorAll('input[type="checkbox"]:checked').length;
    if (countDisplay) countDisplay.textContent = checked;

    // Disable unchecked if at max
    checkboxes.forEach(cb => {
      if (!cb.checked) cb.disabled = checked >= maxMembers;
    });

    if (confirmBtn) confirmBtn.disabled = checked === 0;
  }

  checkboxes.forEach(cb => cb.addEventListener('change', updateCount));
  updateCount();

  // Submit selection
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      const selected = [...container.querySelectorAll('input[type="checkbox"]:checked')].map(cb => cb.value);
      const postId = container.dataset.postId;

      confirmBtn.disabled = true;
      confirmBtn.innerHTML = '<span class="spinner"></span> Saving...';

      try {
        const result = await Api.post('/Posts/SelectWinners', { postId, selectedUserIds: selected });
        if (result.success) {
          Toast.success('Selection announced successfully!');
          setTimeout(() => location.reload(), 1200);
        } else {
          Toast.error(result.message || 'Error occurred');
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'Confirm selection';
        }
      } catch {
        Toast.error('Unable to connect.');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'Confirm selection';
      }
    });
  }
}

// ============================================
// DELETE POST
// ============================================
function initDeletePost() {
  document.querySelectorAll('.btn-delete-post').forEach(btn => {
    btn.addEventListener('click', async function () {
      if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) return;

      const postId = this.dataset.postId;
      try {
        const result = await Api.post('/Posts/Delete', { postId });
        if (result.success) {
          Toast.success('Post deleted successfully');
          // Remove card from DOM or redirect
          const card = this.closest('.post-card');
          if (card) {
            card.style.opacity = '0';
            card.style.transition = 'opacity 0.3s';
            setTimeout(() => card.remove(), 300);
          } else {
            setTimeout(() => window.location.href = '/Posts', 800);
          }
        } else {
          Toast.error(result.message || 'Error occurred');
        }
      } catch {
        Toast.error('Unable to connect.');
      }
    });
  });
}

// ============================================
// CHAR COUNTER for Textarea
// ============================================
function initCharCounters() {
  document.querySelectorAll('[data-max-length]').forEach(el => {
    const max = parseInt(el.dataset.maxLength);
    const counter = document.querySelector(`[data-counter="${el.name}"]`);
    if (!counter) return;

    function update() {
      const remaining = max - el.value.length;
      counter.textContent = `${el.value.length}/${max}`;
      counter.style.color = remaining < 20 ? 'var(--danger)' : 'var(--gray-400)';
    }

    el.addEventListener('input', update);
    update();
  });
}

// ============================================
// UTILITY
// ============================================
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ============================================
// INIT ALL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initModals();
  initTabs();
  initCountdown();
  initJoinButtons();
  initClosePost();
  initLiveSearch();
  initFormValidation();
  initWinnerSelection();
  initDeletePost();
  initCharCounters();

  // Show TempData alerts as toasts
  const alertSuccess = document.querySelector('[data-alert-success]');
  const alertError = document.querySelector('[data-alert-error]');
  if (alertSuccess) Toast.success(alertSuccess.dataset.alertSuccess);
  if (alertError) Toast.error(alertError.dataset.alertError);
});
// =============================================
// manage-details.js
// =============================================

// Tab switching
function switchTab(el) {
    if (!el) return;

    document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
    el.classList.add('active');

    const name = el.textContent.trim();
    document.querySelectorAll('[id^="tab-"]').forEach((d) => {
        d.style.display = 'none';
    });

    const target = document.getElementById('tab-' + name);
    if (target) target.style.display = 'block';
}

// Edit panel
function openPanel() {
    document.getElementById('editPanel')?.classList.add('open');
    document.getElementById('mainContent')?.classList.add('panel-open');
}

function closePanel() {
    document.getElementById('editPanel')?.classList.remove('open');
    document.getElementById('mainContent')?.classList.remove('panel-open');
}

let pendingPosterUrl = null;

// Cover photo (preview + payload)
function openCoverPicker() {
    const input = document.getElementById('coverFileInput');
    if (!input) return;
    input.click();
}

function handleCoverImageError() {
    const coverImage = document.getElementById('eventCoverImage');
    const coverPlaceholder = document.getElementById('eventCoverPlaceholder');
    if (coverImage) coverImage.classList.add('is-empty');
    coverPlaceholder?.classList.remove('is-hidden');
}

function handleCoverFileChange(inputEl) {
    const file = inputEl?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please choose an image file.');
        inputEl.value = '';
        pendingPosterUrl = null;
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const coverImage = document.getElementById('eventCoverImage');
        const coverPlaceholder = document.getElementById('eventCoverPlaceholder');
        const result = e.target?.result;
        if (coverImage && typeof result === 'string') {
            pendingPosterUrl = result;
            coverImage.src = result;
            coverImage.classList.remove('is-empty');
            coverPlaceholder?.classList.add('is-hidden');
            showToast('Cover photo ready. Click Update Event to save.');
        }
    };
    reader.readAsDataURL(file);
}

// Live preview: title
function previewTitle(v) {
    const title = v || 'Untitled Event';
    const displayTitle = document.getElementById('displayTitle');
    const cardTitle = document.getElementById('cardTitle');

    if (displayTitle) displayTitle.textContent = title;
    if (cardTitle) cardTitle.textContent = title;
}

// Live preview: date
function previewDate(v) {
    if (!v) return;

    const d = new Date(v + 'T00:00:00');
    const opts = { weekday: 'long', month: 'long', day: 'numeric' };
    const cardDate = document.getElementById('cardDate');

    if (cardDate) cardDate.textContent = d.toLocaleDateString('en-US', opts);
}

// Live preview: time
function pad(n) {
    return String(n).padStart(2, '0');
}

function fmt12(h, m) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${pad(m)} ${ampm}`;
}

function previewTime() {
    const s = document.getElementById('inputStart')?.value;
    const e = document.getElementById('inputEnd')?.value;
    if (!s || !e) return;

    const [sh, sm] = s.split(':').map(Number);
    const [eh, em] = e.split(':').map(Number);
    const timeStr = `${fmt12(sh, sm)} - ${fmt12(eh, em)}`;

    const cardTime = document.getElementById('cardTime');
    const whenTime = document.getElementById('whenTime');
    if (cardTime) cardTime.textContent = timeStr;
    if (whenTime) whenTime.textContent = timeStr;
}

// Live preview: capacity
function previewCapacity(v) {
    const n = parseInt(v, 10) || 0;
    const cardCapacity = document.getElementById('cardCapacity');
    const statCapacity = document.getElementById('statCapacity');

    if (cardCapacity) cardCapacity.textContent = `Capacity: ${n}`;
    if (statCapacity) statCapacity.textContent = n;
}

// Capacity adjuster
function adjustCapacity(delta) {
    const inp = document.getElementById('inputCapacity');
    if (!inp) return;

    const val = Math.max(1, (parseInt(inp.value, 10) || 1) + delta);
    inp.value = val;
    previewCapacity(val);
}

// Selection method
function selectMethod(el) {
    document.querySelectorAll('.method-option').forEach((m) => m.classList.remove('selected'));
    el.classList.add('selected');
}

// Registration toggle
let regOpen = true;

function syncRegistrationUI() {
    const statusEl = document.getElementById('regStatus');
    const iconEl = document.getElementById('regToggleIcon');
    const labelEl = document.getElementById('regToggleLabel');
    const toggle2 = document.getElementById('regToggle2');

    if (statusEl) {
        statusEl.className = regOpen ? 'status-open' : 'status-closed';
        statusEl.textContent = regOpen ? 'Registration Open' : 'Registration Closed';
    }

    if (iconEl) {
        iconEl.className = regOpen ? 'fa-solid fa-toggle-on' : 'fa-solid fa-toggle-off';
    }

    if (labelEl) {
        labelEl.textContent = regOpen ? 'Close Registration' : 'Open Registration';
    }

    if (toggle2) {
        toggle2.classList.toggle('on', regOpen);
    }
}

function toggleRegistration() {
    regOpen = !regOpen;
    syncRegistrationUI();

    const eventId = document.getElementById('editPanel')?.dataset.eventId;
    if (!eventId) {
        showToast('Could not find event ID.');
        return;
    }

    fetch('/Event/ToggleRegistration', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            RequestVerificationToken: getAntiForgeryToken()
        },
        body: JSON.stringify({ id: eventId, isOpen: regOpen })
    })
        .then((r) => {
            if (!r.ok) throw new Error('Toggle registration failed');
            return r.json();
        })
        .then(() => {
            showToast(regOpen ? 'Registration is now open.' : 'Registration is now closed.');
        })
        .catch(() => {
            regOpen = !regOpen;
            syncRegistrationUI();
            showToast('Something went wrong. Please try again.');
        });
}

async function deleteEvent() {
    const eventId = parseInt(document.getElementById('editPanel')?.dataset.eventId, 10);
    if (Number.isNaN(eventId)) {
        showToast('Could not find event ID.');
        return;
    }

    const deleteBtn = document.getElementById('deleteEventBtn');
    const confirmBtn = document.getElementById('deleteConfirmBtn');
    const originalConfirmContent = confirmBtn?.innerHTML;

    if (deleteBtn) deleteBtn.disabled = true;
    if (confirmBtn) {
        confirmBtn.disabled = true;
        confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';
    }

    try {
        const response = await fetch(`/api/event/${eventId}`, {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                RequestVerificationToken: getAntiForgeryToken()
            }
        });

        if (response.status === 401) {
            window.location.href = '/login';
            return;
        }

        if (response.status === 403) {
            showToast('You are not allowed to delete this event.');
            return;
        }

        if (!response.ok) {
            throw new Error(`Delete failed (${response.status})`);
        }

        closeDeleteConfirmModal();
        showToast('Event deleted successfully.');
        setTimeout(() => {
            window.location.href = '/Home/Homepage';
        }, 700);
    } catch (error) {
        console.error(error);
        showToast('Could not delete event. Please try again.');
    } finally {
        if (deleteBtn) deleteBtn.disabled = false;
        if (confirmBtn) {
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = originalConfirmContent || 'Confirm Delete';
        }
    }
}

function openDeleteConfirmModal() {
    document.getElementById('deleteConfirmOverlay')?.classList.add('open');
}

function closeDeleteConfirmModal(e) {
    const overlay = document.getElementById('deleteConfirmOverlay');
    if (!overlay) return;
    if (e && e.target !== overlay) return;
    overlay.classList.remove('open');
}

function toIsoUtc(localDateTime) {
    if (!localDateTime) return null;
    const d = new Date(localDateTime);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function combineDateAndTimeToIsoUtc(dateValue, timeValue) {
    if (!dateValue || !timeValue) return null;
    return toIsoUtc(`${dateValue}T${timeValue}`);
}

// Update event
function updateEvent() {
    const eventId = document.getElementById('editPanel')?.dataset.eventId;
    if (!eventId) {
        showToast('Could not find event ID.');
        return;
    }

    const dateValue = document.getElementById('inputDate')?.value || '';
    const startValue = document.getElementById('inputStart')?.value || '';
    const endValue = document.getElementById('inputEnd')?.value || '';
    const categoryEl = document.getElementById('inputCategory');
    const categoryId = parseInt(categoryEl?.value, 10);

    const payload = {
        id: parseInt(eventId, 10),
        title: document.getElementById('inputTitle')?.value?.trim(),
        info: document.getElementById('inputDesc')?.value?.trim(),
        startAt: combineDateAndTimeToIsoUtc(dateValue, startValue),
        endAt: combineDateAndTimeToIsoUtc(dateValue, endValue),
        capacity: parseInt(document.getElementById('inputCapacity')?.value, 10),
        location: document.getElementById('inputLocation')?.value?.trim(),
        categoryIds: Number.isNaN(categoryId) ? [] : [categoryId]
    };
    if (pendingPosterUrl) {
        payload.posterUrl = pendingPosterUrl;
    }

    fetch(`/event/manage/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            RequestVerificationToken: getAntiForgeryToken()
        },
        body: JSON.stringify(payload)
    })
        .then((r) => {
            if (!r.ok) throw new Error(r.response);
            return r;
        })
        .then(() => {
            pendingPosterUrl = null;
            const coverInput = document.getElementById('coverFileInput');
            if (coverInput) coverInput.value = '';
            showToast('Event updated successfully.');
            closePanel();
        })
        .catch((e) => showToast('Something went wrong. Please try again.' + e));
}

// Copy event URL
function copyUrl() {
    const url = document.getElementById('eventUrl')?.textContent?.trim() || window.location.href;
    navigator.clipboard.writeText(url).catch(() => {});
    showToast('Event URL copied.');
}

// Share event
function getSharePayload() {
    const url = document.getElementById('eventUrl')?.textContent?.trim() || window.location.href;
    const title = document.getElementById('displayTitle')?.textContent?.trim() || 'Event';
    return { url, title };
}

function shareEvent(platform) {
    const { url, title } = getSharePayload();
    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const shareUrls = {
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    };

    if (platform === 'native') {
        if (navigator.share) {
            navigator.share({ title, text: title, url }).catch(() => {});
            return;
        }
        copyUrl();
        return;
    }

    const shareUrl = shareUrls[platform];
    if (!shareUrl) return;

    const popup = window.open(shareUrl, '_blank', 'noopener,noreferrer,width=680,height=740');
    if (!popup) {
        showToast('Popup blocked. Please allow popups.');
    }
}

// Toast
function showToast(msg) {
    const t = document.getElementById('toast');
    const msgEl = document.getElementById('toastMsg');
    if (!t || !msgEl) return;

    msgEl.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

// Anti-forgery token
function getAntiForgeryToken() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value || '';
}

// Category options
async function loadCategoryOptions() {
    const select = document.getElementById('inputCategory');
    if (!select) return;

    const selectedRaw = String(select.dataset.selectedId || select.value || '').trim();
    const selectedIds = selectedRaw
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0);
    const selectedId = selectedIds.length > 0 ? selectedIds[0] : '';

    try {
        const response = await fetch('/api/category', { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch categories');

        const categories = await response.json();
        if (!Array.isArray(categories) || categories.length === 0) return;

        categories.sort((a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''));

        select.innerHTML = '';

        categories.forEach((category) => {
            const option = document.createElement('option');
            option.value = String(category.id);
            option.textContent = category.categoryName || `Category #${category.id}`;
            option.selected = String(category.id) === selectedId;
            select.appendChild(option);
        });

        if (!select.value && categories.length > 0) {
            select.value = String(categories[0].id);
        }
    } catch (error) {
        console.error('Could not load categories', error);
    }
}

// Participant status controls
const PARTICIPANT_STATUS = {
    accepted: 'Accepted',
    pending: 'Pending',
    rejected: 'Rejected'
};

function getJointType() {
    const type = (document.getElementById('editPanel')?.dataset.jointType || '').toLowerCase();
    return type === 'public' ? 'public' : 'private';
}

function normalizeParticipantStatus(status, fallback = PARTICIPANT_STATUS.pending) {
    const value = String(status || '').trim().toLowerCase();
    if (value === 'accepted') return PARTICIPANT_STATUS.accepted;
    if (value === 'rejected') return PARTICIPANT_STATUS.rejected;
    if (value === 'pending') return PARTICIPANT_STATUS.pending;
    return fallback;
}

function setParticipantStatusBadge(statusEl, status) {
    if (!statusEl) return;
    statusEl.textContent = status;
    statusEl.classList.remove('is-accepted', 'is-pending', 'is-rejected');
    if (status === PARTICIPANT_STATUS.accepted) statusEl.classList.add('is-accepted');
    if (status === PARTICIPANT_STATUS.pending) statusEl.classList.add('is-pending');
    if (status === PARTICIPANT_STATUS.rejected) statusEl.classList.add('is-rejected');
}

function syncParticipantActionButtons(item, status, isPublic) {
    item.querySelectorAll('.participant-action').forEach((btn) => {
        const buttonStatus = normalizeParticipantStatus(btn.dataset.statusValue || btn.textContent, '');
        const isPendingButton = buttonStatus === PARTICIPANT_STATUS.pending;

        if (isPublic && isPendingButton) {
            btn.style.display = 'none';
            return;
        }

        btn.style.display = '';
        btn.classList.toggle('active', buttonStatus === status);
    });
}

function applyParticipantStatus(item, status) {
    if (!item) return;

    const isPublic = getJointType() === 'public';
    let nextStatus = normalizeParticipantStatus(status);

    if (isPublic && nextStatus === PARTICIPANT_STATUS.pending) {
        nextStatus = PARTICIPANT_STATUS.accepted;
    }

    item.dataset.status = nextStatus;
    setParticipantStatusBadge(item.querySelector('[data-status-target]'), nextStatus);
    syncParticipantActionButtons(item, nextStatus, isPublic);
}

function updateParticipantSummaryStats() {
    const participants = document.querySelectorAll('#participantList .registrant-item');
    let accepted = 0;
    let pending = 0;

    participants.forEach((item) => {
        const status = normalizeParticipantStatus(item.dataset.status, '');
        if (status === PARTICIPANT_STATUS.accepted) accepted += 1;
        if (status === PARTICIPANT_STATUS.pending) pending += 1;
    });

    const approvedEl = document.getElementById('statApproved');
    const registeredEl = document.getElementById('statRegistered');
    if (approvedEl) approvedEl.textContent = String(accepted);
    if (registeredEl) registeredEl.textContent = String(pending);
}

function setParticipantActionButtonsDisabled(item, disabled) {
    if (!item) return;
    item.querySelectorAll('.participant-action').forEach((btn) => {
        btn.disabled = disabled;
    });
}

async function persistParticipantStatus(eventId, userId, status) {
    const response = await fetch('/Event/UpdateParticipantStatus', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            RequestVerificationToken: getAntiForgeryToken()
        },
        body: JSON.stringify({
            eventId,
            userId,
            status,
            // requestStatus: status
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to update participant status (${response.status})`);
    }
}

function resetStatusFilterToAll() {
    currentStatus = '';
    const buttons = document.querySelectorAll('.filter-tabs .filter-btn');
    buttons.forEach((button) => button.classList.remove('active'));
    if (buttons.length > 0) buttons[0].classList.add('active');
}

function initializeParticipantStatusUI() {
    const isPublic = getJointType() === 'public';

    document.querySelectorAll('#participantList .registrant-item').forEach((item) => {
        const storedStatus = normalizeParticipantStatus(item.dataset.status);
        const defaultStatus = (isPublic && storedStatus !== PARTICIPANT_STATUS.rejected)
            ? PARTICIPANT_STATUS.accepted
            : storedStatus;
        applyParticipantStatus(item, defaultStatus);
    });

    document.querySelectorAll('[data-private-only="true"]').forEach((el) => {
        el.style.display = isPublic ? 'none' : '';
    });

    if (isPublic && currentStatus.toLowerCase() === PARTICIPANT_STATUS.pending.toLowerCase()) {
        resetStatusFilterToAll();
    }

    updateParticipantSummaryStats();
}

async function setParticipantStatus(buttonEl, nextStatus) {
    const item = buttonEl?.closest('.registrant-item');
    if (!item) return;

    const eventId = parseInt(document.getElementById('editPanel')?.dataset.eventId, 10);
    const userId = parseInt(item.dataset.userId, 10);
    if (Number.isNaN(eventId) || Number.isNaN(userId)) {
        showToast('Could not find participant or event ID.');
        return;
    }

    const isPublic = getJointType() === 'public';
    const previousStatus = normalizeParticipantStatus(item.dataset.status);
    let normalizedStatus = normalizeParticipantStatus(nextStatus);

    if (isPublic && normalizedStatus === PARTICIPANT_STATUS.pending) {
        normalizedStatus = PARTICIPANT_STATUS.accepted;
    }

    if (previousStatus === normalizedStatus) return;

    applyParticipantStatus(item, normalizedStatus);
    updateParticipantSummaryStats();
    applyFilters();

    setParticipantActionButtonsDisabled(item, true);
    try {
        await persistParticipantStatus(eventId, userId, normalizedStatus);
        showToast(`Participant status updated: ${normalizedStatus}`);
    } catch (error) {
        applyParticipantStatus(item, previousStatus);
        updateParticipantSummaryStats();
        applyFilters();
        showToast('Could not save participant status. Please try again.');
        console.error(error);
    } finally {
        setParticipantActionButtonsDisabled(item, false);
    }
}

// Participant filtering
let currentStatus = '';

function filterByStatus(el, status) {
    currentStatus = status;
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    el.classList.add('active');
    applyFilters();
}

function filterParticipants() {
    applyFilters();
}

function applyFilters() {
    const q = (document.getElementById('participantSearch')?.value || '').trim().toLowerCase();
    const status = currentStatus.toLowerCase();
    let count = 0;

    document.querySelectorAll('#participantList .registrant-item').forEach((item) => {
        const name = (item.dataset.name || '').toLowerCase();
        const email = (item.dataset.email || '').toLowerCase();
        const itemStatus = (item.dataset.status || '').toLowerCase();

        const matchSearch = !q || name.includes(q) || email.includes(q);
        const matchStatus = !status || itemStatus === status;

        const show = matchSearch && matchStatus;
        item.style.display = show ? 'flex' : 'none';
        if (show) count++;
    });

    const empty = document.getElementById('participantEmpty');
    if (empty) empty.style.display = count === 0 ? 'block' : 'none';
}

// Init
let selectedVisibility = 'private';

document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('editPanel');
    if (panel) {
        regOpen = panel.dataset.regOpen === 'true';
        selectedVisibility = panel.dataset.jointType || 'private';
        syncRegistrationUI();
    }

    loadCategoryOptions();
    initializeParticipantStatusUI();
    applyFilters();
});

function openVisibilityModal() {
    document.getElementById('visibilityOverlay').classList.add('open');
}
function closeVisibilityModal(e) {
    if (e && e.target !== document.getElementById('visibilityOverlay')) return;
    document.getElementById('visibilityOverlay').classList.remove('open');
}
function selectVisibility(el) {
    document.querySelectorAll('#visibilityOverlay .confighost-option')
            .forEach(o => o.classList.remove('selected'));
    el.classList.add('selected');
    selectedVisibility = el.dataset.role;
}
function saveVisibility() {
    const eventId = document.getElementById('editPanel')?.dataset.eventId;
    fetch('/Event/UpdateVisibility', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': getAntiForgeryToken()
        },
        body: JSON.stringify({ eventId, isPublic: selectedVisibility === 'public' })
    })
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(() => {
        closeVisibilityModal();
        showToast('✅ Updated visibility');
        setTimeout(() => location.reload(), 800);
    })
    .catch(() => showToast('❌ Error, please try again'));
}
