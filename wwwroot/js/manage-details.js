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

function pad(n) {
    return String(n).padStart(2, '0');
}

function fmt12(h, m) {
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${pad(m)} ${ampm}`;
}

function buildDateTime(dateValue, timeValue) {
    if (!dateValue || !timeValue) return null;
    const d = new Date(`${dateValue}T${timeValue}:00`);
    return Number.isNaN(d.getTime()) ? null : d;
}

function previewSchedule() {
    const startDate = document.getElementById('inputStartDate')?.value;
    const startTime = document.getElementById('inputStartTime')?.value;
    const endDate = document.getElementById('inputEndDate')?.value;
    const endTime = document.getElementById('inputEndTime')?.value;
    const start = buildDateTime(startDate, startTime);
    const end = buildDateTime(endDate, endTime);

    if (start) {
        const cardDate = document.getElementById('cardDate');
        const whenDateLabel = document.getElementById('whenDateLabel');
        if (cardDate) {
            cardDate.textContent = start.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
        }
        if (whenDateLabel) {
            const isToday = start.toDateString() === new Date().toDateString();
            whenDateLabel.textContent = isToday
                ? 'Today'
                : start.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: 'long' });
        }
    }

    if (!start || !end) return;

    const timeStr = `${fmt12(start.getHours(), start.getMinutes())} - ${fmt12(end.getHours(), end.getMinutes())}`;
    const cardTime = document.getElementById('cardTime');
    const whenTime = document.getElementById('whenTime');
    if (cardTime) cardTime.textContent = timeStr;
    if (whenTime) whenTime.textContent = timeStr;
}

function previewLocation(value) {
    const location = String(value || '').trim();
    const shortLocation = location.length > 35 ? `${location.slice(0, 35)}...` : location;
    const shortWhenLocation = location.length > 30 ? `${location.slice(0, 30)}...` : location;
    const cardLocation = document.getElementById('cardLocation');
    const whenLocationName = document.getElementById('whenLocationName');
    const whenLocationSub = document.getElementById('whenLocationSub');
    if (cardLocation) cardLocation.textContent = shortLocation || 'No location yet';
    if (whenLocationName) whenLocationName.textContent = shortWhenLocation || 'No location yet';
    if (whenLocationSub) whenLocationSub.textContent = location || 'No location yet';
}

function previewCapacity(v) {
    const unlimited = document.getElementById('inputCapacityUnlimited')?.checked === true;
    const n = unlimited ? 0 : (parseInt(v, 10) || 0);
    const cardCapacity = document.getElementById('cardCapacity');
    const statCapacity = document.getElementById('statCapacity');

    if (cardCapacity) cardCapacity.textContent = n > 0 ? `Capacity: ${n}` : 'Capacity: Unlimited';
    if (statCapacity) statCapacity.textContent = n > 0 ? String(n) : 'Unlimited';
}

function onCapacityModeChange() {
    const unlimited = document.getElementById('inputCapacityUnlimited')?.checked === true;
    const input = document.getElementById('inputCapacity');
    if (!input) return;
    input.disabled = unlimited;
    if (unlimited) {
        input.value = '0';
        previewCapacity('0');
        return;
    }

    if (!input.value || parseInt(input.value, 10) <= 0) {
        input.value = '1';
    }
    previewCapacity(input.value);
}

// Capacity adjuster
function adjustCapacity(delta) {
    if (document.getElementById('inputCapacityUnlimited')?.checked) return;
    const inp = document.getElementById('inputCapacity');
    if (!inp) return;

    const val = Math.max(1, (parseInt(inp.value, 10) || 1) + delta);
    inp.value = val;
    previewCapacity(val);
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

const EVENT_TYPE_ENUM = { online: 0, offline: 1 };
const DEFAULT_EDIT_LAT = 13.7563;
const DEFAULT_EDIT_LNG = 100.5018;

let editLocationSearchTimeout = null;
let loadedCategoryOptions = [];

function toIsoUtc(localDateTime) {
    if (!localDateTime) return null;
    const d = new Date(localDateTime);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function combineDateAndTimeToIsoUtc(dateValue, timeValue) {
    if (!dateValue || !timeValue) return null;
    return toIsoUtc(`${dateValue}T${timeValue}`);
}

function parseCoordinate(value, fallback) {
    const n = parseFloat(String(value ?? '').trim());
    return Number.isFinite(n) ? n : fallback;
}

function updateEditMapEmbed(lat, lng) {
    const frame = document.getElementById('editLocationMapFrame');
    if (!frame || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) return;
    const latNum = Number(lat);
    const lngNum = Number(lng);
    const bbox = `${lngNum - 0.01},${latNum - 0.01},${lngNum + 0.01},${latNum + 0.01}`;
    frame.src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(`${latNum},${lngNum}`)}`;
}

function updateLatLngInputs(lat, lng) {
    const latEl = document.getElementById('inputLatitude');
    const lngEl = document.getElementById('inputLongitude');
    if (latEl) latEl.value = String(lat);
    if (lngEl) lngEl.value = String(lng);
    updateEditMapEmbed(lat, lng);
}

function setMapTo(lat, lng) {
    updateLatLngInputs(lat, lng);
}

function initEditMap() {
    const panel = document.getElementById('editPanel');
    const initialLat = parseCoordinate(
        document.getElementById('inputLatitude')?.value || panel?.dataset.latitude,
        DEFAULT_EDIT_LAT
    );
    const initialLng = parseCoordinate(
        document.getElementById('inputLongitude')?.value || panel?.dataset.longitude,
        DEFAULT_EDIT_LNG
    );
    updateLatLngInputs(initialLat, initialLng);
}

function updateEditLocationMode() {
    const eventType = document.getElementById('inputEventType')?.value || 'offline';
    const locationLabel = document.getElementById('inputLocationLabel');
    const locationHintText = document.getElementById('locationHintText');
    const locationInput = document.getElementById('inputLocation');
    const mapWrap = document.getElementById('editMapWrap');
    const dropdown = document.getElementById('locationSearchDropdown');
    const isOnline = eventType === 'online';

    if (locationLabel) locationLabel.textContent = isOnline ? 'MEETING LINK' : 'LOCATION';
    if (locationInput) {
        locationInput.placeholder = isOnline
            ? 'Add meeting link (Zoom, Meet, Teams...)'
            : 'Search event location...';
    }
    if (locationHintText) {
        locationHintText.textContent = isOnline
            ? 'Provide a meeting URL (Zoom, Meet, Teams, etc.).'
            : 'Search and pin an exact place for offline events.';
    }

    if (isOnline) {
        if (mapWrap) mapWrap.style.display = 'none';
        if (dropdown) dropdown.style.display = 'none';
        const latEl = document.getElementById('inputLatitude');
        const lngEl = document.getElementById('inputLongitude');
        if (latEl) latEl.value = '';
        if (lngEl) lngEl.value = '';
        return;
    }

    if (mapWrap) mapWrap.style.display = 'block';
    initEditMap();
    const lat = parseCoordinate(document.getElementById('inputLatitude')?.value, DEFAULT_EDIT_LAT);
    const lng = parseCoordinate(document.getElementById('inputLongitude')?.value, DEFAULT_EDIT_LNG);
    setMapTo(lat, lng);
}

function onEditLocationInput() {
    const inputValue = document.getElementById('inputLocation')?.value || '';
    previewLocation(inputValue);

    const eventType = document.getElementById('inputEventType')?.value || 'offline';
    if (eventType === 'online') {
        const dropdown = document.getElementById('locationSearchDropdown');
        if (dropdown) dropdown.style.display = 'none';
        return;
    }

    const latEl = document.getElementById('inputLatitude');
    const lngEl = document.getElementById('inputLongitude');
    if (latEl) latEl.value = '';
    if (lngEl) lngEl.value = '';

    clearTimeout(editLocationSearchTimeout);
    editLocationSearchTimeout = setTimeout(() => {
        searchEditLocation();
    }, 500);
}

async function searchEditLocation() {
    const query = (document.getElementById('inputLocation')?.value || '').trim();
    const dropdown = document.getElementById('locationSearchDropdown');
    if (!dropdown) return;

    if (!query || query.length < 3) {
        dropdown.style.display = 'none';
        return;
    }

    dropdown.innerHTML = '<div class="location-search-item muted">Searching...</div>';
    dropdown.style.display = 'block';

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            dropdown.innerHTML = '<div class="location-search-item muted">No places found.</div>';
            return;
        }

        dropdown.innerHTML = '';
        data.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'location-search-item';
            row.textContent = item.display_name || 'Unnamed location';
            row.addEventListener('click', () => {
                const lat = parseFloat(item.lat);
                const lng = parseFloat(item.lon);
                const locationInput = document.getElementById('inputLocation');
                if (locationInput) locationInput.value = item.display_name || '';
                previewLocation(item.display_name || '');
                if (Number.isFinite(lat) && Number.isFinite(lng)) {
                    updateEditLocationMode();
                    setMapTo(lat, lng);
                }
                dropdown.style.display = 'none';
            });
            dropdown.appendChild(row);
        });
    } catch (error) {
        console.error('Location search failed', error);
        dropdown.innerHTML = '<div class="location-search-item muted">Search failed.</div>';
    }
}

function buildCategoryOptionsHtml() {
    if (!loadedCategoryOptions.length) {
        return '<option value="">No categories available</option>';
    }

    return loadedCategoryOptions
        .map((category) => `<option value="${category.id}">${category.categoryName || `Category #${category.id}`}</option>`)
        .join('');
}

function createCategoryRow(selectedId = '') {
    const row = document.createElement('div');
    row.className = 'category-row';
    row.innerHTML = `
        <select class="form-select category-select">${buildCategoryOptionsHtml()}</select>
        <button type="button" class="category-row-btn" onclick="onCategoryRowAction(this)">+</button>
    `;

    const select = row.querySelector('.category-select');
    if (select && selectedId) {
        select.value = String(selectedId);
        if (!select.value && select.options.length > 0) {
            select.selectedIndex = 0;
        }
    }

    return row;
}

function syncCategoryRowButtons() {
    const rows = [...document.querySelectorAll('#categoryRows .category-row')];
    rows.forEach((row, index) => {
        const btn = row.querySelector('.category-row-btn');
        if (!btn) return;
        const isLast = index === rows.length - 1;
        btn.textContent = isLast ? '+' : '-';
        btn.title = isLast ? 'Add category' : 'Remove category';
    });
}

function addCategoryRow(selectedId = '') {
    const container = document.getElementById('categoryRows');
    if (!container) return;
    container.appendChild(createCategoryRow(selectedId));
    syncCategoryRowButtons();
}

function onCategoryRowAction(button) {
    const rows = [...document.querySelectorAll('#categoryRows .category-row')];
    const currentRow = button?.closest('.category-row');
    if (!currentRow || rows.length === 0) return;
    const isLast = currentRow === rows[rows.length - 1];

    if (isLast) {
        addCategoryRow('');
        return;
    }

    currentRow.remove();
    if (!document.querySelector('#categoryRows .category-row')) {
        addCategoryRow('');
        return;
    }
    syncCategoryRowButtons();
}

function getSelectedCategoryIds() {
    const ids = [...document.querySelectorAll('#categoryRows .category-select')]
        .map((select) => parseInt(select.value, 10))
        .filter((id) => Number.isInteger(id) && id > 0);
    return [...new Set(ids)];
}

function validateUpdateForm() {
    const panel = document.getElementById('editPanel');
    const eventId = parseInt(panel?.dataset.eventId || '', 10);
    if (!Number.isInteger(eventId) || eventId <= 0) {
        return { error: 'Could not find event ID.' };
    }

    const title = (document.getElementById('inputTitle')?.value || '').trim();
    if (!title) return { error: 'Please enter an event title.' };

    const startDate = document.getElementById('inputStartDate')?.value || '';
    const startTime = document.getElementById('inputStartTime')?.value || '';
    const endDate = document.getElementById('inputEndDate')?.value || '';
    const endTime = document.getElementById('inputEndTime')?.value || '';
    if (!startDate || !startTime || !endDate || !endTime) {
        return { error: 'Please complete start and end date/time.' };
    }

    const startLocal = buildDateTime(startDate, startTime);
    const endLocal = buildDateTime(endDate, endTime);
    if (!startLocal || !endLocal) return { error: 'Date/time format is invalid.' };
    if (startLocal < new Date()) return { error: 'Start date/time cannot be in the past.' };
    if (endLocal <= startLocal) return { error: 'End time must be after start time.' };

    const durationMinutes = (endLocal.getTime() - startLocal.getTime()) / 60000;
    if (durationMinutes < 30) return { error: 'Event duration must be at least 30 minutes.' };

    const deadlineDate = document.getElementById('inputDeadlineDate')?.value || '';
    const deadlineTime = document.getElementById('inputDeadlineTime')?.value || '';
    const hasDeadlineDate = Boolean(deadlineDate);
    const hasDeadlineTime = Boolean(deadlineTime);
    if (hasDeadlineDate !== hasDeadlineTime) {
        return { error: 'Please select both date and time for registration deadline.' };
    }

    let registrationDeadline = null;
    if (hasDeadlineDate && hasDeadlineTime) {
        const deadlineLocal = buildDateTime(deadlineDate, deadlineTime);
        if (!deadlineLocal) return { error: 'Registration deadline is invalid.' };
        if (deadlineLocal >= startLocal) return { error: 'Registration deadline must be before event start.' };
        if (deadlineLocal < new Date()) return { error: 'Registration deadline cannot be in the past.' };
        registrationDeadline = combineDateAndTimeToIsoUtc(deadlineDate, deadlineTime);
    }

    const eventType = (document.getElementById('inputEventType')?.value || 'offline').toLowerCase();
    const location = (document.getElementById('inputLocation')?.value || '').trim();
    if (!location) {
        return { error: eventType === 'online' ? 'Please enter a meeting link.' : 'Please enter a location.' };
    }

    let latitude = null;
    let longitude = null;
    if (eventType === 'offline') {
        latitude = parseCoordinate(document.getElementById('inputLatitude')?.value, NaN);
        longitude = parseCoordinate(document.getElementById('inputLongitude')?.value, NaN);
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
            return { error: 'Please pin the event location on the map.' };
        }
    }

    const categoryIds = getSelectedCategoryIds();
    if (!categoryIds.length) return { error: 'Please select at least one category.' };

    const unlimited = document.getElementById('inputCapacityUnlimited')?.checked === true;
    const capacityRaw = parseInt(document.getElementById('inputCapacity')?.value || '', 10);
    const capacity = unlimited ? 0 : capacityRaw;
    if (!unlimited && (!Number.isInteger(capacity) || capacity <= 0)) {
        return { error: 'Capacity must be greater than zero or set to Unlimited.' };
    }

    const timeZone = (document.getElementById('inputTimeZone')?.value || '').trim();
    if (!timeZone) return { error: 'Please select a time zone.' };

    const payload = {
        id: eventId,
        title,
        info: (document.getElementById('inputDesc')?.value || '').trim(),
        location,
        eventType: EVENT_TYPE_ENUM[eventType] ?? EVENT_TYPE_ENUM.offline,
        startAt: combineDateAndTimeToIsoUtc(startDate, startTime),
        endAt: combineDateAndTimeToIsoUtc(endDate, endTime),
        registrationDeadline,
        timeZone,
        latitude: eventType === 'online' ? null : latitude,
        longitude: eventType === 'online' ? null : longitude,
        capacity,
        categoryIds
    };

    if (pendingPosterUrl) {
        payload.posterUrl = pendingPosterUrl;
    }

    return { payload };
}

// Update event
function updateEvent() {
    const validation = validateUpdateForm();
    if (validation.error) {
        showToast(validation.error);
        return;
    }
    const payload = validation.payload;
    const eventId = payload.id;

    fetch(`/event/manage/${eventId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            RequestVerificationToken: getAntiForgeryToken()
        },
        body: JSON.stringify(payload)
    })
        .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r;
        })
        .then(() => {
            pendingPosterUrl = null;
            const coverInput = document.getElementById('coverFileInput');
            if (coverInput) coverInput.value = '';
            showToast('Event updated successfully.');
            closePanel();
        })
        .catch((e) => showToast(`Something went wrong. Please try again. ${e?.message || ''}`.trim()));
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
    const container = document.getElementById('categoryRows');
    if (!container) return;

    const selectedRaw = String(container.dataset.selectedIds || '').trim();
    const selectedIds = selectedRaw
        .split(',')
        .map((id) => id.trim())
        .filter((id) => id.length > 0)
        .map((id) => parseInt(id, 10))
        .filter((id) => Number.isInteger(id) && id > 0);

    try {
        const response = await fetch('/api/category', { method: 'GET' });
        if (!response.ok) throw new Error('Failed to fetch categories');

        const categories = await response.json();
        if (!Array.isArray(categories) || categories.length === 0) {
            loadedCategoryOptions = [];
            container.innerHTML = '';
            addCategoryRow('');
            return;
        }

        loadedCategoryOptions = [...categories]
            .sort((a, b) => (a.categoryName || '').localeCompare(b.categoryName || ''));

        container.innerHTML = '';
        if (selectedIds.length === 0) {
            addCategoryRow(String(loadedCategoryOptions[0].id));
            return;
        }

        selectedIds.forEach((id) => addCategoryRow(String(id)));
        syncCategoryRowButtons();
    } catch (error) {
        console.error('Could not load categories', error);
        loadedCategoryOptions = [];
        container.innerHTML = '';
        addCategoryRow('');
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

        const eventTypeSelect = document.getElementById('inputEventType');
        if (eventTypeSelect && panel.dataset.eventType) {
            eventTypeSelect.value = panel.dataset.eventType;
        }

        const timeZoneSelect = document.getElementById('inputTimeZone');
        if (timeZoneSelect) {
            const timezone = panel.dataset.timeZone || 'GMT+07:00';
            timeZoneSelect.value = timezone;
        }

        const latEl = document.getElementById('inputLatitude');
        const lngEl = document.getElementById('inputLongitude');
        if (latEl && !latEl.value) latEl.value = panel.dataset.latitude || String(DEFAULT_EDIT_LAT);
        if (lngEl && !lngEl.value) lngEl.value = panel.dataset.longitude || String(DEFAULT_EDIT_LNG);

        onCapacityModeChange();
        previewSchedule();
        previewLocation(document.getElementById('inputLocation')?.value || '');
        updateEditLocationMode();
    }

    loadCategoryOptions();
    initializeParticipantStatusUI();
    applyFilters();

    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('locationSearchDropdown');
        const locationInput = document.getElementById('inputLocation');
        if (!dropdown || !locationInput) return;
        if (e.target === dropdown || e.target === locationInput || dropdown.contains(e.target)) return;
        dropdown.style.display = 'none';
    });
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
