document.addEventListener('DOMContentLoaded', function() {
    // 1. Set default dates to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').value = today;
    document.getElementById('endDate').value = today;

    // 2. Handle Image preview locally
    const fileUpload = document.getElementById('fileUpload');
    if (fileUpload) {
        fileUpload.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.querySelector('.image-upload-box').style.backgroundImage = `url('${e.target.result}')`;
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. Handle Form Submit (Ajax)
    const form = document.getElementById('createEventForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

function handleFormSubmit(event) {
    event.preventDefault(); // ป้องกันการ Refresh หน้าเว็บ

    const btn = document.getElementById('submitBtn');
    const msgBox = document.getElementById('message-box');
    
    // ดึงข้อมูลจากฟอร์ม
    const eventData = {
        name: document.getElementById('eventName').value,
        startDate: document.getElementById('startDate').value,
        startTime: document.getElementById('startTime').value,
        endDate: document.getElementById('endDate').value,
        endTime: document.getElementById('endTime').value,
        location: document.getElementById('eventLocation').value,
        description: document.getElementById('eventDescription').value,
        capacity: document.getElementById('capacity').value || 'Unlimited',
        requireApproval: document.getElementById('requireApproval').checked
    };

    // เปลี่ยนสถานะปุ่ม
    btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Creating...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
    msgBox.style.display = 'none';

    // จำลองการเรียกใช้งาน Ajax (ตรงนี้ในอนาคตให้เปลี่ยน URL เป็น API Endpoint ของ ASP.NET Core MVC เช่น '/Event/Create')
    fetch('[https://jsonplaceholder.typicode.com/posts](https://jsonplaceholder.typicode.com/posts)', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        // จำลองดีเลย์ให้เห็น Loading state
        setTimeout(() => {
            btn.innerHTML = 'Create Event';
            btn.disabled = false;
            btn.style.opacity = '1';
            
            msgBox.className = 'success';
            msgBox.innerHTML = `✅ กิจกรรม "${data.name}" ถูกสร้างเรียบร้อยแล้ว! (รับ ${data.capacity} คน)`;
            msgBox.style.display = 'block';

            // เคลียร์ฟอร์ม
            document.getElementById('createEventForm').reset();
            
            // รีเซ็ตวันที่กลับไปเป็นวันนี้หลังจากเคลียร์ฟอร์ม
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('startDate').value = today;
            document.getElementById('endDate').value = today;
        }, 1000);
    })
    .catch(error => {
        btn.innerHTML = 'Create Event';
        btn.disabled = false;
        btn.style.opacity = '1';
        
        msgBox.className = 'error';
        msgBox.innerHTML = '❌ เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์';
        msgBox.style.display = 'block';
        console.error('Ajax Error:', error);
    });
}