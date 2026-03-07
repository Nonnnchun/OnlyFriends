// =============================================
// invite-modal.js
// วางไว้ที่: wwwroot/js/invite-modal.js
// =============================================

// ── Open / Close ──
function openInviteModal() {
    document.getElementById('inviteOverlay').classList.add('open');
}

function closeInviteModal(e) {
    // ถ้าคลิก overlay ด้านนอก modal ให้ปิด
    if (e && e.target !== document.getElementById('inviteOverlay')) return;
    document.getElementById('inviteOverlay').classList.remove('open');
    resetInviteModal();
}

function resetInviteModal() {
    goToStep1();
    // เคลียร์ selection ทั้งหมด
    document.querySelectorAll('.guest-item.selected')
            .forEach(el => el.classList.remove('selected'));
    updateSelectedCount();
    // เคลียร์ custom message
    const msg = document.getElementById('customMessage');
    if (msg) msg.value = '';
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
    document.getElementById('selectedCount').textContent = count + ' Selected';
    const btn = document.getElementById('btnNext');
    if (btn) btn.disabled = count === 0;
}

// ── Add Email Manually ──
function addEmail() {
    const input = document.getElementById('emailInput');
    const email = input.value.trim();
    if (!email || !email.includes('@')) return;

    const list = document.getElementById('guestList');
    const div  = document.createElement('div');
    div.className = 'guest-item selected';
    div.setAttribute('data-id', 'email-' + Date.now());
    div.onclick = () => { div.classList.toggle('selected'); updateSelectedCount(); };
    div.innerHTML = `
        <div class="guest-avatar"
             style="background:var(--accent);display:flex;align-items:center;
                    justify-content:center;color:#fff;font-weight:700;font-size:13px">
            ${email[0].toUpperCase()}
        </div>
        <div class="guest-info">
            <div class="guest-name">${email}</div>
        </div>
        <div class="guest-check" style="display:flex">
            <i class="fa-solid fa-check"></i>
        </div>
    `;
    list.prepend(div);
    input.value = '';
    updateSelectedCount();
}

function handleEmailKey(e) {
    if (e.key === 'Enter') addEmail();
}

// ── Step 1 → Step 2 ──
function goToStep2() {
    const selected = document.querySelectorAll('#inviteStep1 .guest-item.selected');
    if (!selected.length) return;

    // สร้าง list ใน sidebar ของ step 2
    const listEl = document.getElementById('selectedList');
    listEl.innerHTML = '';
    selected.forEach(item => {
        const clone = item.cloneNode(true);
        const check = clone.querySelector('.guest-check');
        if (check) check.style.display = 'none';
        // ลบ onclick เดิมออก ไม่ให้ toggle ใน step 2
        clone.onclick = null;
        listEl.appendChild(clone);
    });

    const count = selected.length;
    document.getElementById('invitingLabel').textContent =
        `Inviting ${count} ${count === 1 ? 'Person' : 'People'}`;

    document.getElementById('inviteStep1').style.display  = 'none';
    document.getElementById('inviteStep2').style.display  = 'flex';
    document.getElementById('footerStep1').style.display  = 'none';
    document.getElementById('footerStep2').style.display  = 'flex';
    document.getElementById('slotsBadge').style.display   = 'none';
}

// ── Step 2 → Step 1 ──
function goToStep1() {
    document.getElementById('inviteStep1').style.display  = 'flex';
    document.getElementById('inviteStep2').style.display  = 'none';
    document.getElementById('footerStep1').style.display  = 'flex';
    document.getElementById('footerStep2').style.display  = 'none';
    document.getElementById('slotsBadge').style.display   = 'flex';
}

// ── Send Invites (Ajax → ASP.NET Core) ──
function sendInvites() {
    const selected = [...document.querySelectorAll('#inviteStep1 .guest-item.selected')]
        .map(el => el.dataset.id)
        .filter(id => !String(id).startsWith('email-'))
        .map(id => parseInt(id, 10));
    const message = document.getElementById('customMessage')?.value || '';
    const eventId = parseInt(document.getElementById('editPanel')?.dataset.eventId, 10);

    fetch('/Event/SendInvites', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': getAntiForgeryToken()
        },
        body: JSON.stringify({ eventId, userIds: selected, message })
    })
    .then(r => { if (!r.ok) throw new Error('Server error'); return r.json(); })
    .then(() => {
        closeInviteModal();
        showToast('✅ Invitation sent!');
    })
    .catch(() => showToast('❌ Something went wrong. Please try again.'));
}
