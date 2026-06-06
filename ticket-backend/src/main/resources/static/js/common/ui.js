/* ==========================================================
   js/common/ui.js
   View layer dùng chung: popup, dropdown, điều hướng, logout.
   Phụ thuộc: helpers.js
   ========================================================== */

/* ── POPUP ─────────────────────────────────────────────── */

function openPopup() {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("popup").style.display   = "block";
}

function closePopup() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("popup").style.display   = "none";
}

/* ── DROPDOWN MENU ──────────────────────────────────────── */

function toggleMenu(event) {
    event.stopPropagation();
    const menu = document.getElementById("menu");
    if (menu) menu.classList.toggle("show");
}

window.addEventListener("click", function (event) {
    if (!event.target.closest(".dropdown")) {
        const menu = document.getElementById("menu");
        if (menu) menu.classList.remove("show");
    }
});

/* ── ĐIỀU HƯỚNG ─────────────────────────────────────────── */

function register() {
    window.location.href = "registerPopup.html";
}

function forget() {
    window.location.href = "forgetPassword.html";
}

function cancelRF() {
    window.location.href = "loginpopup.html";
}

function cancelLogin() {
    parent.closePopup();
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "index.html";
}

/* ── CREATOR DASHBOARD — XÓA NỘI DUNG & ĐIỀU HƯỚNG ──── */

function clearContent() {
    ["ticketList", "eventList", "voucherList", "hoanVeList"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });
}

function openCreateTicket()  { window.location.href = "taoVe.html"; }
function openCreateEvent()   { window.location.href = "taoSuKien.html"; }
function openCreateVoucher() { window.location.href = "taoKhuyenMai.html"; }

/* ── MODAL HELPERS ──────────────────────────────────────── */

/**
 * Mở một modal theo id, thêm class "open" sau frame để trigger animation.
 * @param {string} modalId
 * @param {string} overlayId
 */
function openModal(modalId, overlayId) {
    document.getElementById(overlayId).style.display = "block";
    const box = document.getElementById(modalId);
    box.style.display = "block";
    requestAnimationFrame(() => box.classList.add("open"));
}

/**
 * Đóng modal theo id, xóa class "open" rồi ẩn sau 220ms.
 */
function closeModal(modalId, overlayId) {
    const box = document.getElementById(modalId);
    box.classList.remove("open");
    setTimeout(() => {
        box.style.display = "none";
        document.getElementById(overlayId).style.display = "none";
    }, 220);
}

/* ── TAB SWITCHER ───────────────────────────────────────── */

/**
 * Chuyển tab đơn giản: toggle class "active" trên .tab-btn và .tab-pane.
 * @param {string} tabName
 * @param {Function} [onSwitch] - callback tuỳ chọn khi tab được chọn
 */
function showTab(tabName, onSwitch) {
    document.querySelectorAll(".tab-btn").forEach(b  => b.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));
    document.getElementById("tab-"  + tabName).classList.add("active");
    document.getElementById("pane-" + tabName).classList.add("active");
    if (typeof onSwitch === "function") onSwitch(tabName);
    const menu = document.getElementById("menu");
    if (menu) menu.classList.remove("show");
}
