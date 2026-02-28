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

// Cover photo (frontend-only preview)
function openCoverPicker() {
    const input = document.getElementById('coverFileInput');
    if (!input) return;
    input.click();
}

function handleCoverFileChange(inputEl) {
    const file = inputEl?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        showToast('Please choose an image file.');
        inputEl.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const coverImage = document.getElementById('eventCoverImage');
        const result = e.target?.result;
        if (coverImage && typeof result === 'string') {
            coverImage.src = result;
            showToast('Cover photo updated (preview only).');
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

// Update event
function updateEvent() {
    const eventId = document.getElementById('editPanel')?.dataset.eventId;
    if (!eventId) {
        showToast('Could not find event ID.');
        return;
    }

    const payload = {
        id: eventId,
        title: document.getElementById('inputTitle')?.value,
        description: document.getElementById('inputDesc')?.value,
        date: document.getElementById('inputDate')?.value,
        startTime: document.getElementById('inputStart')?.value,
        endTime: document.getElementById('inputEnd')?.value,
        deadline: document.getElementById('inputDeadline')?.value,
        capacity: parseInt(document.getElementById('inputCapacity')?.value, 10),
        selectionMethod: document.querySelector('.method-option.selected .method-name')?.textContent || ''
    };

    fetch('/Event/Update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            RequestVerificationToken: getAntiForgeryToken()
        },
        body: JSON.stringify(payload)
    })
        .then((r) => {
            if (!r.ok) throw new Error('Server error');
            return r.json();
        })
        .then(() => {
            showToast('Event updated successfully.');
            closePanel();
        })
        .catch(() => showToast('Something went wrong. Please try again.'));
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

    const selectedId = String(select.dataset.selectedId || select.value || '').trim();

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

// Init
document.addEventListener('DOMContentLoaded', () => {
    const panel = document.getElementById('editPanel');
    if (panel) {
        regOpen = panel.dataset.regOpen === 'true';
        syncRegistrationUI();
    }

    loadCategoryOptions();
});

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

let selectedVisibility = '@(Model.JointType == EnumJointType.Public ? "public" : "private")';

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
