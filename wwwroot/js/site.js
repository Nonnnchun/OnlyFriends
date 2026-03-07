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
      const row = document.createElement("div");
      row.className = "filter-item";
      row.style.cssText = "padding:8px 0; border-bottom:1px solid #f1f3f5;";
      const label = document.createElement("label");
      label.style.cssText = "display:flex; align-items:center; cursor:pointer; gap:10px; margin:0; width:100%;";
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = String(id);
      input.setAttribute("data-filter-category", "true");
      input.style.cssText = "width:16px; height:16px;";
      input.checked = selectedSet.has(id);
      const textNode = document.createTextNode(String(rawName || ""));
      label.appendChild(input);
      label.appendChild(textNode);
      row.appendChild(label);
      container.appendChild(row);
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
  const selectedIds = getSelectedCategoryIdsFromMenu();
  const currentUrl = new URL(window.location.href);
  const target = new URL("/Home/Homepage", window.location.origin);

  const tab = currentUrl.searchParams.get("tab");
  if (tab === "my" || tab === "all") {
    target.searchParams.set("tab", tab);
  }

  if (selectedIds.length > 0) {
    target.searchParams.set("categoryIds", selectedIds.join(","));
  }

  window.location.href = target.pathname + target.search;
}

function resetFilter() {
  const currentUrl = new URL(window.location.href);
  const target = new URL("/Home/Homepage", window.location.origin);
  const tab = currentUrl.searchParams.get("tab");
  if (tab === "my" || tab === "all") {
    target.searchParams.set("tab", tab);
  }
  window.location.href = target.pathname + target.search;
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
