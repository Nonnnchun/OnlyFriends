document.addEventListener('DOMContentLoaded', function () {
    const joinCard = document.querySelector('.ev-join-card');
    const btnJoin = document.getElementById('btnRequestJoin');
    const btnCancel = document.getElementById('btnCancelJoin');

    const eventId = joinCard?.dataset?.eventId;
    const initialJoined = joinCard?.dataset?.joined === 'true';

    // btnCancel is replaced by the hover behaviour on btnJoin
    if (btnCancel) btnCancel.style.display = 'none';

    function setJoined(joined) {
        if (!btnJoin) return;

        btnJoin.disabled = false;
        btnJoin.style.display = 'block';

        if (joined) {
            btnJoin.innerText = 'Joined';
            btnJoin.classList.add('ev-btn-joined');
            btnJoin.onmouseenter = () => { btnJoin.innerText = 'Cancel Request'; };
            btnJoin.onmouseleave = () => { btnJoin.innerText = 'Joined'; };
            btnJoin.onclick = handleCancel;
        } else {
            btnJoin.innerText = 'Request to Join';
            btnJoin.classList.remove('ev-btn-joined');
            btnJoin.onmouseenter = null;
            btnJoin.onmouseleave = null;
            btnJoin.onclick = handleJoin;
        }
    }

    function handleJoin() {
        if (btnJoin.disabled) return;
        btnJoin.disabled = true;
        btnJoin.innerText = 'Processing...';

        fetch(`/event/join/${eventId}`, { method: 'POST' })
            .then(res => {
                if (res.ok) {
                    setJoined(true);
                } else if (res.status === 401) {
                    window.location.href = '/Login';
                } else {
                    alert('Failed to join. Please try again.');
                    setJoined(false);
                }
            })
            .catch(() => {
                alert('Network error. Please try again.');
                setJoined(false);
            });
    }

    function handleCancel() {
        if (btnJoin.disabled) return;
        btnJoin.disabled = true;
        btnJoin.innerText = 'Processing...';
        btnJoin.onmouseenter = null;
        btnJoin.onmouseleave = null;

        fetch(`/event/join/${eventId}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    setJoined(false);
                } else if (res.status === 401) {
                    window.location.href = '/Login';
                } else {
                    alert('Failed to cancel. Please try again.');
                    setJoined(true);
                }
            })
            .catch(() => {
                alert('Network error. Please try again.');
                setJoined(true);
            });
    }

    if (btnJoin && eventId) {
        setJoined(initialJoined);
    }

    const locBox = document.querySelector('.ev-meta-item:last-child');
    if (locBox) {
        locBox.style.cursor = 'pointer';
        locBox.addEventListener('click', () => {
            const label = locBox.querySelector('.ev-strong')?.innerText || '';
            const locName = label
                .replace(/\u2197/g, '')
                .replace(/\u00e2\u2020\u2014/g, '')
                .trim();

            if (locName && locName !== 'No Location') {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locName)}`, '_blank');
            }
        });
    }

    const mapFrame = document.querySelector('.ev-map iframe');
    if (mapFrame) {
        mapFrame.onload = function () {
            console.log('Map loaded');
        };
    }
});
