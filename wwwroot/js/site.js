document.addEventListener('DOMContentLoaded', () => {
  async function getNotifications() {
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' });
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
      body: JSON.stringify({ name })
    });
    document.dispatchEvent(new CustomEvent('notifications:changed'));
  }

  async function updateNotification(id, name) {
    await fetch(`/api/notifications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name })
    });
    document.dispatchEvent(new CustomEvent('notifications:changed'));
  }
  async function deleteNotification(id) {
    await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
    document.dispatchEvent(new CustomEvent('notifications:changed'));
  }
  function populateBell(result) {
    const unauthorized = !!result?.unauthorized;
    const items = result?.items || [];
    const count = unauthorized ? 0 : (Array.isArray(items) ? items.length : 0);
    const countEl = document.getElementById('notifCount');
    if (countEl) countEl.textContent = String(count);
    const list = document.getElementById('notifList');
    const empty = document.getElementById('notifEmpty');
    if (!list) return;
    list.innerHTML = '';
    if (unauthorized) {
      if (empty) empty.style.display = 'none';
      const li = document.createElement('li');
      li.className = 'p-3';
      const a = document.createElement('a');
      a.href = '/Login';
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
      const name = n.name || n.Name;
      const li = document.createElement('li');
      li.className = 'notif-item p-3 border-bottom';
      li.textContent = name;
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
});

//----------------------------------------------------------------------------------------------------------------------------------

// เปิด-ปิด เมนูตัวกรอง
function toggleFilter() {
    document.getElementById("filterMenu").classList.toggle("show");
    // ปิดเมนูโปรไฟล์ถ้าเปิดอยู่
    document.getElementById("profileMenu").classList.remove("show"); 
}

// เปิด-ปิด เมนูโปรไฟล์
function toggleProfile() {
    document.getElementById("profileMenu").classList.toggle("show");
    // ปิดเมนูตัวกรองถ้าเปิดอยู่
    document.getElementById("filterMenu").classList.remove("show");
}

function applyFilter() {
    alert("กำลังกรองข้อมูล...");
    document.getElementById("filterMenu").classList.remove("show");
}

// ถ้าคลิกพื้นที่ว่างๆ นอกเมนู ให้ปิด Dropdown ทั้งหมด
window.onclick = function(event) {
    if (!event.target.closest('.dropdown')) {
        document.getElementById("filterMenu").classList.remove("show");
        document.getElementById("profileMenu").classList.remove("show");
    }
}
