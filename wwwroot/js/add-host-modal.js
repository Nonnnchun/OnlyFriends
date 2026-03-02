// =============================================
// add-host-modal.js
// =============================================

// State
let selectedHostUserId = null;
let selectedHostName = '';
let showOnPage = true;
let selectedAccessRole = 'Manager';

// Open / Close
function openAddHostModal() {
    document.getElementById('addHostOverlay')?.classList.add('open');
    goToStep1Host();
    document.getElementById('addHostInput')?.focus();
}

function closeAddHostModal(e) {
    if (e && e.target !== document.getElementById('addHostOverlay')) return;

    document.getElementById('addHostOverlay')?.classList.remove('open');

    const input = document.getElementById('addHostInput');
    if (input) input.value = '';

    filterHostResults('');
}

// Step 1 -> Step 2
function goToStep1Host() {
    document.getElementById('addHostStep1').style.display = 'block';
    document.getElementById('addHostStep2').style.display = 'none';
}

function goToStep2Host(source, name, email, avatarUrl) {
    let userId = source;

    if (source && source.dataset) {
        userId = source.dataset.id;
        name = source.dataset.name || '';
        email = source.dataset.email || '';
        avatarUrl = source.dataset.avatar || '';
    }

    selectedHostUserId = parseInt(userId, 10);
    selectedHostName = name;
    showOnPage = true;
    selectedAccessRole = 'Manager';

    document.getElementById('configHostName').textContent = name || '-';
    document.getElementById('configHostEmail').textContent = email || '-';

    const imgEl = document.getElementById('configHostImg');
    const fallbackEl = document.getElementById('configHostFallback');

    if (avatarUrl) {
        imgEl.src = avatarUrl;
        imgEl.style.display = 'block';
        fallbackEl.style.display = 'none';
    } else {
        imgEl.style.display = 'none';
        fallbackEl.style.display = 'flex';
        fallbackEl.textContent = (name || '?').charAt(0).toUpperCase();
    }

    syncConfigHostUI();

    document.getElementById('addHostStep1').style.display = 'none';
    document.getElementById('addHostStep2').style.display = 'block';
}

// Filter
function filterHostResults(query) {
    const q = (query || '').trim().toLowerCase();
    let count = 0;

    document.querySelectorAll('.addhost-result-item').forEach((item) => {
        const name = item.dataset.name?.toLowerCase() || '';
        const email = item.dataset.email?.toLowerCase() || '';
        const match = !q || name.includes(q) || email.includes(q);

        item.style.display = match ? 'flex' : 'none';
        if (match) count++;
    });

    const empty = document.getElementById('addHostEmpty');
    if (empty) empty.style.display = count === 0 ? 'block' : 'none';
}

function selectAccessRole(role) {
    selectedAccessRole = role;
    syncConfigHostUI();
}

function syncConfigHostUI() {
    const toggle = document.getElementById('configShowToggle');
    if (toggle) toggle.classList.toggle('on', showOnPage);

    document.querySelectorAll('.confighost-option').forEach((opt) => {
        opt.classList.toggle('selected', opt.dataset.role === selectedAccessRole);
    });
}

// Send invite
function sendHostInvite() {
    if (!selectedHostUserId) {
        showToast('Please choose a host first.');
        return;
    }

    const eventId = document.getElementById('editPanel')?.dataset.eventId;
    if (!eventId) {
        showToast('Could not find event ID.');
        return;
    }

    fetch('/Event/AddHost', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            RequestVerificationToken: getAntiForgeryToken()
        },
        body: JSON.stringify({
            eventId: eventId,
            userId: selectedHostUserId,
            showOnPage: showOnPage,
            accessRole: selectedAccessRole
        })
    })
        .then((r) => {
            if (!r.ok) throw new Error('Add host failed');
            return r.json();
        })
        .then(() => {
            closeAddHostModal();
            showToast(`${selectedHostName} has been invited as host.`);
            setTimeout(() => location.reload(), 800);
        })
        .catch(() => showToast('Something went wrong. Please try again.'));
}
