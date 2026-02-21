document.addEventListener("DOMContentLoaded", () => {
  const joinCard = document.querySelector(".ev-join-card");
  const btnJoin = document.getElementById("btnJoin");
  const joinTitle = document.getElementById("joinTitle");

  const btnTicket = document.getElementById("btnMyTicket");
  const btnInvite = document.getElementById("btnInvite");
  const btnCopy = document.getElementById("btnCopyLocation");
  const locText = document.getElementById("locText");
  const btnSub = document.getElementById("btnSubscribe");

  // --- Simulate join state (เพื่อลอง UI ก่อน ยังไม่ต่อ DB) ---
  // เก็บสถานะ join ไว้ใน localStorage
  const joinedKey = "onlyfriends_joined_demo";
  const status = (joinCard?.dataset.status || "").toLowerCase();
  const isClosed = status === "closed";
  const isJoined = localStorage.getItem(joinedKey) === "1";

  function renderJoinState() {
    if (!btnJoin || !joinTitle || !btnTicket || !btnInvite) return;

    if (isClosed) {
      btnJoin.disabled = true;
      btnJoin.textContent = "Closed";
      joinTitle.textContent = "Event Closed";
      btnTicket.style.display = "none";
      btnInvite.style.display = "none";
      return;
    }

    const joined = localStorage.getItem(joinedKey) === "1";
    if (joined) {
      joinTitle.textContent = "Thank You for Joining";
      btnJoin.textContent = "Joined";
      btnJoin.disabled = true;
      btnTicket.style.display = "inline-flex";
      btnInvite.style.display = "inline-flex";
    } else {
      joinTitle.textContent = "Register Now";
      btnJoin.textContent = "Join";
      btnJoin.disabled = false;
      btnTicket.style.display = "none";
      btnInvite.style.display = "none";
    }
  }

  renderJoinState();

  if (btnJoin && !isClosed) {
    btnJoin.addEventListener("click", () => {
      const ok = confirm("Join this event? (demo)");
      if (!ok) return;
      localStorage.setItem(joinedKey, "1");
      renderJoinState();
      alert("Joined! (demo)");
    });
  }

  // Ticket / Invite (demo)
  btnTicket?.addEventListener("click", () => alert("My Ticket (demo)"));
  btnInvite?.addEventListener("click", () => alert("Invite a Friend (demo)"));

  // Copy location
  btnCopy?.addEventListener("click", async () => {
    const text = (locText?.textContent || "").trim();
    if (!text) return;

    try {
      await navigator.clipboard.writeText(text);
      btnCopy.textContent = "Copied!";
      setTimeout(() => (btnCopy.textContent = "Copy"), 1200);
    } catch {
      prompt("Copy location:", text);
    }
  });

  // Subscribe (demo)
  btnSub?.addEventListener("click", () => alert("Subscribed! (demo)"));
});