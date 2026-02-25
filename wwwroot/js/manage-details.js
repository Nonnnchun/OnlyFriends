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
      this.innerHTML = '<span class="spinner"></span> กำลังดำเนินการ...';

      try {
        const result = await Api.post(`/Posts/${action}`, { postId });

        if (result.success) {
          Toast.success(result.message || (action === 'join' ? 'สมัครเข้าร่วมสำเร็จ!' : 'ยกเลิกการเข้าร่วมสำเร็จ'));

          // Toggle button state
          if (action === 'join') {
            this.dataset.action = 'leave';
            this.textContent = 'ยกเลิกการเข้าร่วม';
            this.classList.replace('btn-success', 'btn-secondary');
          } else {
            this.dataset.action = 'join';
            this.textContent = 'สมัครเข้าร่วม';
            this.classList.replace('btn-secondary', 'btn-success');
          }

          // Update count display
          updateApplicantCount(postId, result.currentCount, result.maxCount);
        } else {
          Toast.error(result.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
          this.innerHTML = originalHtml;
        }
      } catch (err) {
        Toast.error('ไม่สามารถเชื่อมต่อได้ กรุณาลองใหม่');
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
    if (!confirm('ต้องการปิดรับสมัครโพสต์นี้ใช่หรือไม่?')) return;

    const postId = this.dataset.postId;
    this.disabled = true;
    this.innerHTML = '<span class="spinner"></span>';

    try {
      const result = await Api.post('/Posts/Close', { postId });
      if (result.success) {
        Toast.success('ปิดรับสมัครเรียบร้อยแล้ว');
        setTimeout(() => location.reload(), 1000);
      } else {
        Toast.error(result.message || 'เกิดข้อผิดพลาด');
        this.disabled = false;
        this.innerHTML = 'ปิดรับสมัคร';
      }
    } catch {
      Toast.error('ไม่สามารถเชื่อมต่อได้');
      this.disabled = false;
      this.innerHTML = 'ปิดรับสมัคร';
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
    postsGrid.innerHTML = '<p class="text-muted text-center" style="grid-column:1/-1;padding:3rem">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>';
  }
}

function renderPosts(posts, container) {
  if (!posts.length) {
    container.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-icon">🔍</div>
        <div class="empty-title">ไม่พบโพสต์ที่ค้นหา</div>
        <div class="empty-text">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</div>
      </div>`;
    return;
  }

  container.innerHTML = posts.map(p => {
    const pct = Math.min((p.applicantCount / p.maxMembers) * 100, 100);
    const barClass = pct >= 100 ? 'full' : pct >= 75 ? 'near-full' : '';
    const statusBadge = p.isClosed
      ? '<span class="badge badge-closed">ปิดรับสมัคร</span>'
      : p.applicantCount >= p.maxMembers
        ? '<span class="badge badge-danger">เต็มแล้ว</span>'
        : '<span class="badge badge-success">รับสมัคร</span>';

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
          ${p.expiresAt ? `<span class="text-xs text-muted"><i class="bi bi-calendar-event"></i> หมดอายุ ${p.expiresAt}</span>` : ''}
          <a href="/Posts/Detail/${p.id}" class="btn btn-primary btn-sm">ดูรายละเอียด</a>
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
          if (errorEl) errorEl.textContent = 'กรุณากรอกข้อมูลในช่องนี้';
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
        if (err) err.textContent = 'จำนวนสมาชิกต้องมากกว่า 0';
        valid = false;
      }

      // Validate expiry date is in future
      const expiryField = form.querySelector('[name="ExpiresAt"]');
      if (expiryField && expiryField.value) {
        const expiry = new Date(expiryField.value);
        if (expiry <= new Date()) {
          expiryField.classList.add('is-invalid');
          const err = form.querySelector('[data-error="ExpiresAt"]');
          if (err) err.textContent = 'วันหมดอายุต้องเป็นวันในอนาคต';
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
      confirmBtn.innerHTML = '<span class="spinner"></span> กำลังบันทึก...';

      try {
        const result = await Api.post('/Posts/SelectWinners', { postId, selectedUserIds: selected });
        if (result.success) {
          Toast.success('ประกาศผลเรียบร้อยแล้ว!');
          setTimeout(() => location.reload(), 1200);
        } else {
          Toast.error(result.message || 'เกิดข้อผิดพลาด');
          confirmBtn.disabled = false;
          confirmBtn.textContent = 'ยืนยันการเลือก';
        }
      } catch {
        Toast.error('ไม่สามารถเชื่อมต่อได้');
        confirmBtn.disabled = false;
        confirmBtn.textContent = 'ยืนยันการเลือก';
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
      if (!confirm('ต้องการลบโพสต์นี้ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้')) return;

      const postId = this.dataset.postId;
      try {
        const result = await Api.post('/Posts/Delete', { postId });
        if (result.success) {
          Toast.success('ลบโพสต์เรียบร้อยแล้ว');
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
          Toast.error(result.message || 'เกิดข้อผิดพลาด');
        }
      } catch {
        Toast.error('ไม่สามารถเชื่อมต่อได้');
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