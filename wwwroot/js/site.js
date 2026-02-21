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