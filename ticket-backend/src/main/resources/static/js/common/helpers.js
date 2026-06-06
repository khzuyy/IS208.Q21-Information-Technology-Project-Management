/* ==========================================================
   js/common/helpers.js
   Các hàm tiện ích thuần túy — không phụ thuộc DOM.
   ========================================================== */

function formatDate(val) {
    if (!val) return "—";
    if (Array.isArray(val)) {
        const [y, m, d] = val;
        return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
    }
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleDateString("vi-VN");
}

function formatPrice(n) {
    return Number(n || 0).toLocaleString("vi-VN") + " ₫";
}

function escHtml(s) {
    return String(s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/**
 * Tạo một badge nhỏ dạng pill.
 * @param {string} label
 * @param {string} bg   - màu nền (css color)
 * @param {string} color - màu chữ (css color)
 */
function chip(label, bg, color) {
    return `<span style="background:${bg};color:${color};font-size:.72rem;font-weight:700;padding:2px 9px;border-radius:20px;white-space:nowrap">${label}</span>`;
}

/**
 * Trả về HTML trạng thái trống / lỗi dùng chung.
 */
function emptyState(icon, msg) {
    return `<div class="empty-state">
        <div class="empty-icon">${icon}</div>
        <p>${escHtml(msg)}</p>
    </div>`;
}

function errorState(msg) {
    return emptyState("⚠️", msg);
}
