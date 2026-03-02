document.addEventListener('DOMContentLoaded', function () {
<<<<<<< HEAD
    const joinCard = document.querySelector('.ev-join-card');
    const btnJoin = document.getElementById('btnRequestJoin');
    const btnCancel = document.getElementById('btnCancelJoin');

    const eventId = joinCard?.dataset?.eventId;
    const storageKey = eventId ? `event_join_request_${eventId}` : 'event_join_request';

    function readRequestedState() {
        try {
            return window.localStorage.getItem(storageKey) === '1';
        } catch (error) {
            console.warn('Cannot read join request state:', error);
            return false;
        }
    }

    function writeRequestedState(requested) {
        try {
            if (requested) {
                window.localStorage.setItem(storageKey, '1');
            } else {
                window.localStorage.removeItem(storageKey);
            }
        } catch (error) {
            console.warn('Cannot save join request state:', error);
        }
    }

    function setJoinButtonsState(requested) {
        if (!btnJoin || !btnCancel) return;

        btnJoin.disabled = false;
        btnCancel.disabled = false;
        btnJoin.innerText = 'Request to Join';
        btnCancel.innerText = 'Cancel Request';

        btnJoin.style.display = requested ? 'none' : 'block';
        btnCancel.style.display = requested ? 'block' : 'none';
    }

    if (btnJoin && btnCancel) {
        setJoinButtonsState(readRequestedState());

        btnJoin.addEventListener('click', function () {
            if (btnJoin.disabled) return;

            btnJoin.disabled = true;
            btnJoin.innerText = 'Processing...';

            setTimeout(() => {
                writeRequestedState(true);
                setJoinButtonsState(true);
                console.log('Join request created');
            }, 700);
        });

        btnCancel.addEventListener('click', function () {
            if (btnCancel.disabled) return;

            btnCancel.disabled = true;
            btnCancel.innerText = 'Processing...';

            setTimeout(() => {
                writeRequestedState(false);
                setJoinButtonsState(false);
                console.log('Join request cancelled');
            }, 700);
        });
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
=======
    const btnJoin = document.getElementById('btnRequestJoin');
    
    if (btnJoin) {
        btnJoin.addEventListener('click', async function () {
            // ป้องกันการกดซ้ำ
            if (btnJoin.disabled) return;

            const originalText = btnJoin.innerText;
            btnJoin.disabled = true;
            btnJoin.innerText = 'Processing...';

            try {
                // ตัวอย่างการส่ง Request ไปยัง Backend (เปลี่ยน URL ตามจริง)
                // const response = await fetch('/Events/Join/' + eventId, { method: 'POST' });
                
                // จำลองการโหลด 1.5 วินาที
                setTimeout(() => {
                    btnJoin.innerText = 'Request Sent!';
                    btnJoin.style.backgroundColor = '#10b981'; // Success Green
                    
                    // แสดง Notification (ควรทำ UI Modal เพิ่มเติม)
                    console.log("Join request successful");
                }, 1500);

            } catch (error) {
                console.error('Error joining event:', error);
                btnJoin.disabled = false;
                btnJoin.innerText = originalText;
                alert('Something went wrong. Please try again.');
            }
        });
    }

    // เปิดแผนที่เมื่อคลิกที่ชื่อสถานที่
    const locBox = document.querySelector('.ev-meta-item:last-child');
    if (locBox) {
        locBox.style.cursor = 'pointer';
        locBox.addEventListener('click', () => {
            const locName = locBox.querySelector('.ev-strong').innerText.replace(' ↗', '');
            if (locName && locName !== 'No Location') {
                window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locName)}`, '_blank');
            }
        });
    }

    // ปรับความสูงของ Map iframe ให้เหมาะสมกับ Container (ถ้าต้องการ)
    const mapFrame = document.querySelector('.ev-map iframe');
    if (mapFrame) {
        mapFrame.onload = function() {
            console.log("Map loaded");
        };
    }
});
>>>>>>> fd163dbd151e1090c288e527619996954e3b6583
