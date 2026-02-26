// =============================================
// manage-event.js
// วางไว้ที่: wwwroot/js/manage-event.js
// =============================================

// ── Tab switching ──
function switchTab(el) {
    if (!el) return;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    const name = el.textContent.trim();
    document.querySelectorAll('[id^="tab-"]').forEach(d => d.style.display = 'none');
    const target = document.getElementById('tab-' + name);
    if (target) target.style.display = 'block';
}

// ── Edit Panel ──
function openPanel() {
    document.getElementById('editPanel').classList.add('open');
}
function closePanel() {
    document.getElementById('editPanel').classList.remove('open');
}

// ── Live Preview: Title ──
function previewTitle(v) {
    document.getElementById('displayTitle').textContent = v || 'Untitled Event';
    document.getElementById('cardTitle').textContent = v || 'Untitled Event';
}

// ── Live Preview: Date ──
function previewDate(v) {
    if (!v) return;
    const d = new Date(v + 'T00:00:00');
    const opts = { weekday: 'long', month: 'long', day: 'numeric' };
    document.getElementById('cardDate').textContent = d.toLocaleDateString('en-US', opts);
}

// ── Live Preview: Time ──
function pad(n) { return String(n).padStart(2, '0'); }
function fmt12(h, m) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${pad(m)} ${ampm}`;
}
function previewTime() {
    const s = document.getElementById('inputStart').value;
    const e = document.getElementById('inputEnd').value;
    if (!s || !e) return;
    const [sh, sm] = s.split(':').map(Number);
    const [eh, em] = e.split(':').map(Number);
    const timeStr = `${fmt12(sh, sm)} – ${fmt12(eh, em)}`;
    document.getElementById('cardTime').textContent = timeStr;
    document.getElementById('whenTime').textContent = timeStr + ' GMT+7';
}

// ── Live Preview: Capacity ──
function previewCapacity(v) {
    const n = parseInt(v) || 0;
    document.getElementById('cardCapacity').textContent = `รับ ${n} คน`;
    document.getElementById('statCapacity').textContent = n;
}

// ── Capacity Adjuster ──
function adjustCapacity(delta) {
    const inp = document.getElementById('inputCapacity');
    const val = Math.max(1, (parseInt(inp.value) || 1) + delta);
    inp.value = val;
    previewCapacity(val);
}

// ── Selection Method ──
function selectMethod(el) {
    document.querySelectorAll('.method-option').forEach(m => m.classList.remove('selected'));
    el.classList.add('selected');
}

// ── Registration Toggle ──
let regOpen = true;
function toggleRegistration() {
    regOpen = !regOpen;
    const statusEl  = document.getElementById('regStatus');
    const iconEl    = document.getElementById('regToggleIcon');
    const labelEl   = document.getElementById('regToggleLabel');
    const toggle2   = document.getElementById('regToggle2');

    if (regOpen) {
        statusEl.className  = 'status-open';
        statusEl.textContent = 'Registration Open';
        iconEl.className    = 'fa-solid fa-toggle-on';
        labelEl.textContent = 'Registration Closed';
        if (toggle2) toggle2.classList.add('on');
    } else {
        statusEl.className  = 'status-closed';
        statusEl.textContent = 'Registration Closed';
        iconEl.className    = 'fa-solid fa-toggle-off';
        labelEl.textContent = 'Registration Open';
        if (toggle2) toggle2.classList.remove('on');
    }

    // ── Ajax: Toggle Registration (ASP.NET Core) ──
    // แทนค่า eventId ด้วย ID จริงของ event (อาจดึงจาก data attribute หรือตัวแปร Razor)
    const eventId = document.getElementById('editPanel').dataset.eventId;
    fetch(`/Event/ToggleRegistration`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': getAntiForgeryToken()
        },
        body: JSON.stringify({ id: eventId, isOpen: regOpen })
    })
    .then(r => r.json())
    .then(() => showToast(regOpen ? '✅ เปิดรับสมัครแล้ว' : '🔒 ปิดรับสมัครแล้ว'))
    .catch(() => showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่'));
}

// ── Update Event (Ajax POST) ──
function updateEvent() {
    const eventId = document.getElementById('editPanel').dataset.eventId;

    const payload = {
        id:          eventId,
        title:       document.getElementById('inputTitle').value,
        description: document.getElementById('inputDesc').value,
        date:        document.getElementById('inputDate').value,
        startTime:   document.getElementById('inputStart').value,
        endTime:     document.getElementById('inputEnd').value,
        deadline:    document.getElementById('inputDeadline').value,
        capacity:    parseInt(document.getElementById('inputCapacity').value),
        selectionMethod: document.querySelector('.method-option.selected .method-name')?.textContent || ''
    };

    fetch('/Event/Update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': getAntiForgeryToken()
        },
        body: JSON.stringify(payload)
    })
    .then(r => {
        if (!r.ok) throw new Error('Server error');
        return r.json();
    })
    .then(() => {
        showToast('✅ บันทึกสำเร็จ!');
        closePanel();
    })
    .catch(() => showToast('❌ เกิดข้อผิดพลาด กรุณาลองใหม่'));
}

// ── Copy Event URL ──
function copyUrl() {
    const url = document.getElementById('eventUrl')?.textContent || window.location.href;
    navigator.clipboard.writeText(url).catch(() => {});
    showToast('📋 คัดลอก URL แล้ว!');
}

// ── Toast Notification ──
function showToast(msg) {
    const t = document.getElementById('toast');
    document.getElementById('toastMsg').textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
}

// ── Anti-Forgery Token (สำหรับ ASP.NET Core) ──
function getAntiForgeryToken() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value || '';
}

// ── Init on DOMContentLoaded ──
document.addEventListener('DOMContentLoaded', () => {
    // Set initial registration state from server-rendered data attribute
    const panel = document.getElementById('editPanel');
    if (panel) {
        regOpen = panel.dataset.regOpen === 'true';
        // sync toggle UI to match server state
        const toggle2 = document.getElementById('regToggle2');
        if (toggle2) {
            regOpen ? toggle2.classList.add('on') : toggle2.classList.remove('on');
        }
        const statusEl = document.getElementById('regStatus');
        if (statusEl) {
            statusEl.className  = regOpen ? 'status-open' : 'status-closed';
            statusEl.textContent = regOpen ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร';
        }
    }
});