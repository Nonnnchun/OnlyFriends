document.addEventListener('DOMContentLoaded', () => {
  async function getNotifications() {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store', credentials: 'include' });
      if (res.status === 401) {
        return { unauthorized: true, items: [] };
      }
      if (!res.ok) return { items: [] };
      const data = await res.json();
      return { items: data };
    } catch {
      return { items: [] };
    }
  }

  async function createNotification(name) {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
      credentials: 'include'
    });
    document.dispatchEvent(new CustomEvent('notifications:changed'));
  }

  async function updateNotification(id, name) {
    await fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name }),
      credentials: 'include'
    });
    document.dispatchEvent(new CustomEvent('notifications:changed'));
  }
  async function deleteNotification(id) {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE', credentials: 'include' });
    document.dispatchEvent(new CustomEvent('notifications:changed'));
  }
  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateBadge(count) {
    const badge = document.getElementById('notifCount');
    if (!badge) return;
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : String(count);
      badge.style.display = 'inline-block';
    } else {
      badge.textContent = '0';
      badge.style.display = 'none';
    }
  }

  function removeNotifCard(notifId) {
    const li = document.querySelector(`#notifList li[data-id="${notifId}"]`);
    if (li) li.remove();
    const remaining = document.querySelectorAll('#notifList li').length;
    const empty = document.getElementById('notifEmpty');
    if (remaining === 0 && empty) empty.style.display = '';
    updateBadge(remaining);
  }

  async function acceptFriendRequest(fromUserId, notifId) {
    const res = await fetch(`/user/friends/${fromUserId}/accept`, { method: 'PATCH', credentials: 'include' });
    if (res.ok) removeNotifCard(notifId);
    else alert('Could not accept friend request.');
  }

  async function declineFriendRequest(fromUserId, notifId) {
    const res = await fetch(`/user/friends/${fromUserId}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) removeNotifCard(notifId);
    else alert('Could not decline friend request.');
  }

  // Expose accept/decline globally so inline onclick attributes can call them
  window.acceptFriendRequest = acceptFriendRequest;
  window.declineFriendRequest = declineFriendRequest;

  function populateBell(result) {
    const unauthorized = !!result?.unauthorized;
    const items = result?.items || [];
    const count = unauthorized ? 0 : (Array.isArray(items) ? items.length : 0);
    const list = document.getElementById('notifList');
    const empty = document.getElementById('notifEmpty');
    if (!list) return;
    list.innerHTML = '';
    updateBadge(count);
    if (unauthorized) {
      if (empty) empty.style.display = 'none';
      const li = document.createElement('li');
      li.className = 'notif-item';
      const a = document.createElement('a');
      a.href = '/login';
      a.textContent = 'Please sign in to view notifications';
      li.appendChild(a);
      list.appendChild(li);
      return;
    }
    if (!items || items.length === 0) {
      if (empty) empty.style.display = '';
      return;
    }
    if (empty) empty.style.display = 'none';
    items.slice(0, 10).forEach(n => {
      const li = document.createElement('li');
      li.className = 'notif-item';
      li.dataset.id = n.id;

      if (n.type === 'FriendRequest') {
        li.innerHTML = `
          <div class="notif-msg">👤 ${escapeHtml(n.message)}</div>
          <div class="notif-actions">
            <button class="notif-btn notif-btn-accept" onclick="acceptFriendRequest(${n.fromUserId}, ${n.id})">Accept</button>
            <button class="notif-btn notif-btn-decline" onclick="declineFriendRequest(${n.fromUserId}, ${n.id})">Decline</button>
          </div>`;
      } else {
        const linkHtml = n.eventId ? `<a href="/event/view/${n.eventId}" style="text-decoration:none; color:inherit; display:block;">` : `<div style="display:block;">`;
        const endLinkHtml = n.eventId ? `</a>` : `</div>`;
        li.innerHTML = `${linkHtml}<div class="notif-msg">🔔 ${escapeHtml(n.message || n.name)}</div>${endLinkHtml}`;
        if (n.eventId) {
            li.style.cursor = 'pointer';
            li.onmouseover = () => li.style.background = '#f8f9fa';
            li.onmouseleave = () => li.style.background = '';
        }
      }
      list.appendChild(li);
    });
  }

  async function loadBellNotifications() {
    const result = await getNotifications();
    populateBell(result);
  }
  document.addEventListener('notifications:changed', loadBellNotifications);
  loadBellNotifications();
  setInterval(loadBellNotifications, 1000);
  window.NotifAPI = {
    getNotifications,
    createNotification,
    updateNotification,
    deleteNotification,
    refreshBell: loadBellNotifications
  };

  async function isAuthenticated() {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store', credentials: 'include' });
      return res.ok;
    } catch {
      return false;
    }
  }

  async function handleRequireAuthClick(e) {
    const authed = await isAuthenticated();
    if (!authed) {
      e.preventDefault();
      window.location.href = '/login';
      return false;
    }
    return true;
  }

  document.querySelectorAll('[data-require-auth="true"]').forEach(el => {
    el.addEventListener('click', handleRequireAuthClick);
  });
});

// แสดงเวลาแบบเดียวกับหน้า Heropage บน Navbar (ถ้ามี element navClock)
function updateNavClock() {
  const el = document.getElementById('navClock');
  if (!el) return;
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  el.textContent = `${hours}:${minutes} GMT+7`;
}
setInterval(updateNavClock, 1000);
updateNavClock();

//----------------------------------------------------------------------------------------

function closeAllMenus() {
  document.getElementById("filterMenu")?.classList.remove("show");
  document.getElementById("profileMenu")?.classList.remove("show");
  document.getElementById("notifMenu")?.classList.remove("show");
  document.getElementById("notifBell")?.setAttribute("aria-expanded", "false");
}

// เปิด-ปิด เมนูตัวกรอง
function toggleFilter() {
  const filterMenu = document.getElementById("filterMenu");
  const next = !filterMenu?.classList.contains("show");
  closeAllMenus();
  if (next) filterMenu?.classList.add("show");
}

// เปิด-ปิด เมนูโปรไฟล์
function toggleProfile() {
  const profileMenu = document.getElementById("profileMenu");
  const next = !profileMenu?.classList.contains("show");
  closeAllMenus();
  if (next) profileMenu?.classList.add("show");
}

// เปิด-ปิด เมนูแจ้งเตือน
function toggleNotifMenu(event) {
  event?.stopPropagation();
  const notifMenu = document.getElementById("notifMenu");
  const bell = document.getElementById("notifBell");
  const next = !notifMenu?.classList.contains("show");
  closeAllMenus();
  if (next) {
    notifMenu?.classList.add("show");
    bell?.setAttribute("aria-expanded", "true");
  }
}

function parseCategoryIdsQuery(text) {
  if (!text) return [];
  return [...new Set(
    text
      .split(",")
      .map(x => parseInt(x, 10))
      .filter(Number.isInteger)
  )];
}

function getSelectedCategoryIdsFromMenu() {
  const checked = document.querySelectorAll('#filterCategoryList input[data-filter-category]:checked');
  return [...new Set([...checked]
    .map(el => parseInt(el.value, 10))
    .filter(Number.isInteger))];
}

function setSelectedCategoryIdsToMenu(ids) {
  const set = new Set(ids);
  document.querySelectorAll('#filterCategoryList input[data-filter-category]').forEach(el => {
    el.checked = set.has(parseInt(el.value, 10));
    const pill = el.closest('.filter-tag-pill');
    if (pill) pill.classList.toggle('selected', el.checked);
  });
}

function syncTabLinksCategoryQuery(selectedIds) {
  document.querySelectorAll('.event-tabs .event-tab').forEach(link => {
    const href = link.getAttribute("href");
    if (!href) return;
    const targetUrl = new URL(href, window.location.origin);
    if (selectedIds.length > 0) {
      targetUrl.searchParams.set("categoryIds", selectedIds.join(","));
    } else {
      targetUrl.searchParams.delete("categoryIds");
    }
    link.setAttribute("href", targetUrl.pathname + targetUrl.search);
  });
}

async function loadFilterCategories() {
  const container = document.getElementById("filterCategoryList");
  if (!container) return;

  const categoryIdsFromQuery = parseCategoryIdsQuery(new URLSearchParams(window.location.search).get("categoryIds") || "");

  try {
    const res = await fetch("/api/category", { cache: "no-store", credentials: "include" });
    if (!res.ok) throw new Error("Failed to load categories");
    const categories = await res.json();

    if (!Array.isArray(categories) || categories.length === 0) {
      container.innerHTML = '<div class="filter-item" style="padding:8px 0; color:#6c757d;">No categories found</div>';
      return;
    }

    categories.sort((a, b) => String(a.categoryName || a.CategoryName || "").localeCompare(String(b.categoryName || b.CategoryName || ""), "en"));
    const selectedSet = new Set(categoryIdsFromQuery);
    container.innerHTML = "";

    categories.forEach(category => {
      const rawId = category?.id ?? category?.Id;
      const rawName = category?.categoryName ?? category?.CategoryName;
      const id = parseInt(rawId, 10);
      if (!Number.isInteger(id)) return;
      const isSelected = selectedSet.has(id);

      // Hidden real checkbox (keeps existing filter logic working)
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = String(id);
      input.setAttribute("data-filter-category", "true");
      input.style.cssText = "position:absolute; opacity:0; pointer-events:none; width:0; height:0;";
      input.checked = isSelected;

      // Pill button
      const pill = document.createElement("label");
      pill.className = "filter-tag-pill" + (isSelected ? " selected" : "");
      pill.appendChild(input);

      const checkIcon = document.createElement("span");
      checkIcon.className = "filter-pill-check";
      checkIcon.innerHTML = "&#10003;";
      pill.appendChild(checkIcon);

      const nameSpan = document.createElement("span");
      nameSpan.textContent = String(rawName || "");
      pill.appendChild(nameSpan);

      pill.addEventListener("click", () => {
        input.checked = !input.checked;
        pill.classList.toggle("selected", input.checked);
        // ── Instant AJAX filter ──
        const selectedIds = getSelectedCategoryIdsFromMenu();
        fetchAndRenderEvents(selectedIds);
      });

      container.appendChild(pill);
    });
  } catch {
    container.innerHTML = '<div class="filter-item" style="padding:8px 0; color:#dc3545;">Failed to load categories</div>';
  }

  if (document.querySelector(".home-page")) {
    setSelectedCategoryIdsToMenu(categoryIdsFromQuery);
    const selectedIds = getSelectedCategoryIdsFromMenu();
    syncTabLinksCategoryQuery(selectedIds);
  }
}

function applyFilter() {
  // Keep for legacy compatibility — instant AJAX now handles filtering
  const selectedIds = getSelectedCategoryIdsFromMenu();
  fetchAndRenderEvents(selectedIds);
}

function resetFilter() {
  // Uncheck all pills
  document.querySelectorAll('#filterCategoryList input[data-filter-category]').forEach(el => {
    el.checked = false;
    const pill = el.closest('.filter-tag-pill');
    if (pill) pill.classList.remove('selected');
  });
  fetchAndRenderEvents([]);
}

// ── AJAX: fetch events and re-render the homepage event list ──
let _ajaxAbort = null;
async function fetchAndRenderEvents(selectedIds) {
  const listEl = document.getElementById('ajaxEventList');
  if (!listEl) return; // not on homepage

  // Update URL silently
  const url = new URL(window.location.href);
  if (selectedIds.length > 0) {
    url.searchParams.set('categoryIds', selectedIds.join(','));
  } else {
    url.searchParams.delete('categoryIds');
  }
  history.replaceState(null, '', url.pathname + url.search);

  // Cancel in-flight request
  if (_ajaxAbort) _ajaxAbort.abort();
  _ajaxAbort = new AbortController();

  // Show loading state
  listEl.style.opacity = '0.4';
  listEl.style.pointerEvents = 'none';

  try {
    const qs = selectedIds.length > 0 ? `?categoryIds=${selectedIds.join(',')}` : '';
    const activeTab = new URLSearchParams(window.location.search).get('tab') || 'all';
    const res = await fetch(`/api/event${qs}`, { credentials: 'include', signal: _ajaxAbort.signal });
    if (!res.ok) throw new Error('Failed');
    const events = await res.json();

    // Get current user id from a data attribute set by the page
    const uid = parseInt(document.getElementById('ajaxEventList')?.dataset.uid || '0', 10);
    renderEventList(listEl, events, activeTab, uid);
  } catch (err) {
    if (err.name !== 'AbortError') {
      listEl.innerHTML = '<div style="padding:24px; color:#dc3545;">Could not load events.</div>';
    }
  } finally {
    listEl.style.opacity = '';
    listEl.style.pointerEvents = '';
  }
}

function renderEventList(container, events, activeTab, uid) {
  const currentUserId = uid;

  // Filter for joined tab
  let eventsToShow = events;
  if (activeTab === 'my') {
    eventsToShow = events.filter(e =>
      (e.userEvents || []).some(ue => ue.userId === currentUserId && ue.requestStatus !== 2 /* Rejected */) ||
      e.owner?.id === currentUserId
    );
  }

  if (!eventsToShow.length) {
    container.innerHTML = `<div class="empty-state" style="min-height:280px;display:flex;align-items:center;justify-content:center;text-align:center;color:#666;">${
      activeTab === 'my' ? 'You have not joined any events yet.' : 'No events available at the moment.'
    }</div>`;
    return;
  }

  let html = '';
  let lastDate = '';
  eventsToShow.forEach(item => {
    const startAt = item.startAt ? new Date(item.startAt) : new Date();
    const dateText = startAt.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
    const timeText = startAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

    if (dateText !== lastDate) {
      html += `<div class="timeline-date">${dateText}</div>`;
      lastDate = dateText;
    }

    const posterUrl = item.posterUrl || 'https://placehold.co/140x140?text=No+Image';
    const owner = item.owner || {};
    const cats = (item.categories || []).map(c =>
      `<span class="tag-category" style="background:#f1f3f5;color:#495057;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:600;">${c.categoryName}</span>`
    ).join('');

    // Status tag
    let statusTag = '';
    if (owner.id === currentUserId) {
      statusTag = `<a href="/event/manage/${item.id}" style="text-decoration:none !important;"><span class="tag-status manage-btn" style="background:#f1f3f5;color:#495057;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:4px;">Manage Event <span>→</span></span></a>`;
    } else if ((item.eventStatus ?? item.EventStatus) === 0) {
      statusTag = `<span class="tag-status">Registration Open</span>`;
    } else {
      statusTag = `<span class="tag-status closed">Registration Closed</span>`;
    }

    // Avatars
    const avatars = (item.users || []).slice(0, 3)
      .map(u => `<img class="tag-avatar" src="${u.profilePictureUrl || '/images/avatar-placeholder.svg'}" alt="${u.username}" loading="lazy" />`)
      .join('');
    const participantCount = (item.userEvents || []).filter(ue => ue.requestStatus !== 2).length;

    // My-tab status badge
    let myStatusBadge = '';
    if (activeTab === 'my') {
      if (owner.id === currentUserId) {
        myStatusBadge = `<span style="background:#0d6efd15;color:#0d6efd;padding:4px 10px;border-radius:99px;font-size:12px;font-weight:700;">Host</span>`;
      } else {
        const ue = (item.userEvents || []).find(ue => ue.userId === currentUserId);
        if (ue) {
          const colorMap = { 0: '#fd7e14', 1: '#198754', 2: '#dc3545' };
          const textMap = { 0: 'Pending Approval', 1: 'Joined', 2: 'Rejected' };
          const color = colorMap[ue.requestStatus] || '#888';
          const text = textMap[ue.requestStatus] || '';
          myStatusBadge = `<span style="background:${color}15;color:${color};padding:4px 10px;border-radius:99px;font-size:12px;font-weight:700;">${text}</span>`;
        }
      }
    }

    html += `
      <a href="/event/view/${item.id}" class="card-link text-decoration-none">
        <div class="event-card">
          <div class="event-info">
            <div class="event-time">${timeText}</div>
            <div class="event-title">${item.title}</div>
            <div class="event-organizer">👤 By ${owner.username || 'Unknown'}</div>
            <div class="event-location">📍 ${item.location || ''}</div>
            <div class="event-tags" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:8px;">
              ${cats}${statusTag}
              <span class="tag-count">
                <div class="tag-avatars">${avatars}</div>+${participantCount}
              </span>
              ${myStatusBadge}
            </div>
          </div>
          <div class="event-image">
            <img src="${posterUrl}" alt="${item.title}">
          </div>
        </div>
      </a>`;
  });
  container.innerHTML = html;
}

// ถ้าคลิกพื้นที่ว่างๆ นอกเมนู ให้ปิด Dropdown ทั้งหมด
window.addEventListener("click", function (event) {
  if (!event.target.closest(".dropdown")) {
    closeAllMenus();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  loadFilterCategories();
});
