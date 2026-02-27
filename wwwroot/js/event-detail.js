document.addEventListener('DOMContentLoaded', function () {
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