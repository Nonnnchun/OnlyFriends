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
    let badge = document.getElementById('notifBadge');
    const bell = document.getElementById('notifBell');
    if (!bell) return;
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.id = 'notifBadge';
        badge.className = 'notif-badge';
        bell.appendChild(badge);
      }
      badge.textContent = count > 9 ? '9+' : String(count);
    } else if (badge) {
      badge.remove();
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
      a.textContent = 'กรุณาเข้าสู่ระบบเพื่อดูการแจ้งเตือน';
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
        li.innerHTML = `<div class="notif-msg">🔔 ${escapeHtml(n.message || n.name)}</div>`;
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
  el.textContent = `${hours} นาฬิกา ${minutes} นาที GMT+7`;
}
setInterval(updateNavClock, 1000);
updateNavClock();

//----------------------------------------------------------------------------------------

// เปิด-ปิด เมนูตัวกรอง
function toggleFilter() {
    var filterMenu = document.getElementById("filterMenu");
    var profileMenu = document.getElementById("profileMenu");
    if (filterMenu) filterMenu.classList.toggle("show");
    if (profileMenu) profileMenu.classList.remove("show");
    var bell = document.getElementById("notifMenu");
    if (bell) bell.classList.remove("show");
}

// เปิด-ปิด เมนูโปรไฟล์
function toggleProfile() {
    var profileMenu = document.getElementById("profileMenu");
    var filterMenu = document.getElementById("filterMenu");
    if (profileMenu) profileMenu.classList.toggle("show");
    if (filterMenu) filterMenu.classList.remove("show");
    var bell = document.getElementById("notifMenu");
    if (bell) bell.classList.remove("show");
}

function applyFilter() {
    alert("กำลังกรองข้อมูล...");
    document.getElementById("filterMenu").classList.remove("show");
}

// ถ้าคลิกพื้นที่ว่างๆ นอกเมนู ให้ปิด Dropdown ทั้งหมด
window.onclick = function(event) {
    if (!event.target.closest('.dropdown')) {
        var filterMenu = document.getElementById("filterMenu");
        var profileMenu = document.getElementById("profileMenu");
        if (filterMenu) filterMenu.classList.remove("show");
        if (profileMenu) profileMenu.classList.remove("show");
        var bell = document.getElementById("notifMenu");
        if (bell) bell.classList.remove("show");
    }
}

// เปิด-ปิด กระดิ่งแจ้งเตือน
function toggleBell() {
    var menu = document.getElementById("notifMenu");
    if (!menu) return;
    menu.classList.toggle("show");
    document.getElementById("filterMenu").classList.remove("show");
    document.getElementById("profileMenu").classList.remove("show");
}
