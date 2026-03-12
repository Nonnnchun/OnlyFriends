function getInviteOverlay() {
    return document.getElementById('inviteOverlay');
}

function getInviteEventId() {
    const fromEditPanel = parseInt(document.getElementById('editPanel')?.dataset?.eventId, 10);
    if (!Number.isNaN(fromEditPanel)) return fromEditPanel;

    const fromInviteContext = parseInt(document.getElementById('inviteContext')?.dataset?.eventId, 10);
    if (!Number.isNaN(fromInviteContext)) return fromInviteContext;

    const fromJoinCard = parseInt(document.querySelector('.ev-join-card')?.dataset?.eventId, 10);
    if (!Number.isNaN(fromJoinCard)) return fromJoinCard;

    return NaN;
}

function getInviteAntiForgeryToken() {
    return document.querySelector('input[name="__RequestVerificationToken"]')?.value || '';
}

function notifyInvite(message) {
    if (typeof showToast === 'function') {
        showToast(message);
        return;
    }
    alert(message);
}

// ── Open / Close ──
function openInviteModal() {
    const overlay = getInviteOverlay();
    if (!overlay) return;
    overlay.classList.add('open');
}

function closeInviteModal(e) {
    const overlay = getInviteOverlay();
    if (!overlay) return;
    // ถ้าคลิก overlay ด้านนอก modal ให้ปิด
    if (e && e.target !== overlay) return;
    overlay.classList.remove('open');
    resetInviteModal();
}

function resetInviteModal() {
    // เคลียร์ selection ทั้งหมด
    document.querySelectorAll('.guest-item.selected')
            .forEach(el => el.classList.remove('selected'));
    updateSelectedCount();
}

// ── Sidebar Tab Switch ──
function switchSideTab(el, tab) {
    document.querySelectorAll('.sidebar-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    ['emails', 'suggestions', 'everyone', 'past'].forEach(t => {
        const panel = document.getElementById('tab-' + t);
        if (panel) panel.style.display = (t === tab) ? 'block' : 'none';
    });
}

// ── Toggle Guest Selection ──
function toggleGuest(el) {
    el.classList.toggle('selected');
    updateSelectedCount();
}

function updateSelectedCount() {
    const count = document.querySelectorAll('#inviteStep1 .guest-item.selected').length;
    const counter = document.getElementById('selectedCount');
    const btn = document.getElementById('btnSendNow');
    if (counter) counter.textContent = count + ' Selected';
    if (btn) btn.disabled = count === 0;
}

// ── Send Invites (Ajax → ASP.NET Core) ──
function sendInvites() {
    const selected = [...document.querySelectorAll('#inviteStep1 .guest-item.selected')]
        .map(el => el.dataset.id)
        .map(id => parseInt(id, 10))
        .filter(id => !Number.isNaN(id));
    if (!selected.length) {
        notifyInvite('Please select at least one friend.');
        return;
    }
    const eventId = getInviteEventId();
    if (Number.isNaN(eventId)) {
        notifyInvite('Unable to detect event id.');
        return;
    }

    fetch('/Event/SendInvites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': getInviteAntiForgeryToken()
        },
        body: JSON.stringify({ eventId, userIds: selected, message: '' })
    })
    .then(r => { if (!r.ok) throw new Error('Server error'); return r.json(); })
    .then(() => {
        closeInviteModal();
        notifyInvite('Invite sent.');
    })
    .catch(() => notifyInvite('Failed to send invite. Please try again.'));
}
