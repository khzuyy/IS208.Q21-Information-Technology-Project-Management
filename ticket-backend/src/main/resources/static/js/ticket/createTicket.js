function validateLoaiVe(value){
    return value === "VIP" || value === "Thường";
}

window.addEventListener("DOMContentLoaded", function () {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }

    fetch(`${BASE_URL}/sukien/creator/${currentUser.maTaiKhoan}`)
        .then(r => { if (!r.ok) throw new Error("Không lấy được sự kiện"); return r.json(); })
        .then(data => {
            const select = document.getElementById("maSuKien");
            // FIX: chỉ hiện sự kiện "Sắp diễn ra" hoặc "Đang tổ chức" — không cho tạo vé cho SK đã xong
            const active = data.filter(sk =>
                sk.trangThai === "Sắp diễn ra" || sk.trangThai === "Đang tổ chức" || !sk.trangThai
            );
            if (active.length === 0) {
                select.innerHTML = `<option value="">-- Không có sự kiện phù hợp --</option>`;
                showMsg("Bạn chưa có sự kiện nào đang hoặc sắp diễn ra.", "err");
                return;
            }
            active.forEach(sk => {
                const opt = document.createElement("option");
                opt.value       = sk.maSuKien;
                opt.textContent = sk.tenSuKien;
                select.appendChild(opt);
            });
            // Tự động fetch địa điểm cho sự kiện đầu tiên trong list
            if (active.length > 0) onEventChange();
        })
        .catch(err => showMsg(err.message, "err"));

    // Khi đổi loại vé → cập nhật lại preview soLuong
    const loaiVeEl = document.getElementById("loaiVe");
    if (loaiVeEl) loaiVeEl.addEventListener("change", _updateSoLuongPreview);
});

// ── Khi chọn sự kiện: fetch địa điểm để tính soLuong ───────────────────────
// Cache để không gọi lại nhiều lần
window._diaDiemCache = {};
window._currentDiaDiem = null;

async function onEventChange() {
    const maSuKien = document.getElementById("maSuKien").value;
    if (!maSuKien) {
        window._currentDiaDiem = null;
        _updateSoLuongPreview();
        return;
    }
    try {
        if (window._diaDiemCache[maSuKien]) {
            window._currentDiaDiem = window._diaDiemCache[maSuKien];
        } else {
            // Bước 1: lấy sự kiện → lấy maDiaDiem
            const sk = await fetch(`${BASE_URL}/sukien/${maSuKien}`).then(r => r.json());
            if (!sk?.maDiaDiem) { window._currentDiaDiem = null; _updateSoLuongPreview(); return; }
            // Bước 2: lấy địa điểm
            const dd = await fetch(`${BASE_URL}/diadiem/${sk.maDiaDiem}`).then(r => r.json());
            window._diaDiemCache[maSuKien] = dd;
            window._currentDiaDiem = dd;
        }
    } catch(e) {
        console.error("Lấy địa điểm thất bại:", e);
        window._currentDiaDiem = null;
    }
    _updateSoLuongPreview();
}

/**
 * Tính soLuong dựa trên sucChua & loaiSoDo của địa điểm.
 * Hình tròn  : VIP = sucChua/10*4, Thường = sucChua/10*6
 * Hình chữ nhật: VIP = sucChua/10*3, Thường = sucChua/10*7
 */
function _calcSoLuong(loaiVe, diaDiem) {
    if (!diaDiem?.sucChua) return null;
    const cap = diaDiem.sucChua;
    const isCircle = (diaDiem.loaiSoDo || '').toUpperCase().includes('TRON')
                  || (diaDiem.loaiSoDo || '').toUpperCase().includes('TRÒN');
    const loai = (loaiVe || '').toUpperCase();
    if (isCircle) {
        return loai.includes('VIP')
            ? Math.floor(cap / 10 * 4)
            : Math.floor(cap / 10 * 6);
    } else {
        return loai.includes('VIP')
            ? Math.floor(cap / 10 * 3)
            : Math.floor(cap / 10 * 7);
    }
}

/** Cập nhật preview số lượng vé ở UI */
function _updateSoLuongPreview() {
    const loaiVe = document.getElementById("loaiVe")?.value || '';
    const el = document.getElementById("soLuongPreview");
    if (!el) return;
    const dd = window._currentDiaDiem;
    if (!dd || !loaiVe) {
        el.textContent = '';
        return;
    }
    const sl = _calcSoLuong(loaiVe, dd);
    if (sl == null) {
        el.textContent = 'Địa điểm chưa có sức chứa.';
        el.style.color = '#e55';
        return;
    }
    const isCircle = (dd.loaiSoDo || '').toUpperCase().includes('TRON')
                  || (dd.loaiSoDo || '').toUpperCase().includes('TRÒN');
    el.innerHTML = `✅ Số lượng vé tự động: <strong>${sl.toLocaleString('vi-VN')}</strong> &nbsp;`
        + `<span style="color:#888;font-size:.83rem">(Sức chứa ${dd.sucChua} · ${isCircle ? 'Hình tròn' : 'Hình chữ nhật'})</span>`;
    el.style.color = '#0d9488';
}

async function createTicket() {

    const tenVe    = document.getElementById("tenVe").value.trim();
    const loaiVe   = document.getElementById("loaiVe").value.trim();
    const gia      = parseFloat(document.getElementById("gia").value);
    const moTa     = document.getElementById("moTa").value.trim();
    const maSuKien = document.getElementById("maSuKien").value;

    if (!tenVe || !loaiVe || !maSuKien) {
        showMsg("⚠️ Vui lòng nhập đầy đủ thông tin bắt buộc.", "err"); return;
    }
    if (!validateLoaiVe(loaiVe)) {
        showMsg("⚠️ Loại vé không hợp lệ. Chỉ chấp nhận 'VIP' hoặc 'Thường'.", "err"); return;
    }
    if (isNaN(gia) || gia < 0) {
        showMsg("⚠️ Giá vé không hợp lệ.", "err"); return;
    }

    // Kiểm tra xem loại vé này đã tồn tại cho sự kiện chưa
    showMsg("⏳ Đang kiểm tra...", "ok");
    const alreadyExists = await checkLoaiVeExists(maSuKien, loaiVe);
    if (alreadyExists) {
        showMsg(`⚠️ Sự kiện này đã có vé loại "${loaiVe}". Mỗi sự kiện chỉ được tạo một vé VIP và một vé Thường.`, "err");
        return;
    }

    const btn = document.querySelector("button.create-btn");
    btn.disabled    = true;
    btn.textContent = "Đang tạo...";

    // ── Tính soLuong từ địa điểm ─────────────────────────────────────────
    let soLuong = null;
    const diaDiem = window._currentDiaDiem;
    if (diaDiem?.sucChua) {
        soLuong = _calcSoLuong(loaiVe, diaDiem);
    }
    if (!soLuong || soLuong <= 0) {
        showMsg("⚠️ Không thể xác định số lượng vé. Hãy chọn sự kiện có địa điểm hợp lệ.", "err");
        btn.disabled = false; btn.textContent = "Tạo vé";
        return;
    }

    fetch(`${BASE_URL}/ve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tenVe, loaiVe,
            gia,
            soLuong,
            moTa,
            maSuKien: parseInt(maSuKien),
            trangThai: "available"
        })
    })
    .then(async r => {
        if (!r.ok) { const t = await r.text(); throw new Error(t || "Tạo vé thất bại"); }
        return r.json();
    })
    .then(() => {
        showMsg("✅ Tạo vé thành công! Đang chuyển hướng...", "ok");
        setTimeout(() => window.location.href = "loginCreator.html", 1200);
    })
    .catch(err => {
        showMsg("❌ " + err.message, "err");
        btn.disabled    = false;
        btn.textContent = "Tạo vé";
    });
}

function showMsg(text, type) {
    const el = document.getElementById("msgBox");
    if (!el) return;
    el.textContent  = text;
    el.style.color  = type === "ok" ? "#0d9488" : "#dc2626";
    el.style.fontWeight = "600";
}

function goBack() { window.location.href = "loginCreator.html"; }
async function checkLoaiVeExists(eventId, loaiVe){
    try{
        const response = await fetch(`${BASE_URL}/ve/check-type?maSuKien=${eventId}&loaiVe=${encodeURIComponent(loaiVe)}`);
        if(!response.ok) return false;

        const data = await response.json();
        return data.exists === true;
    }catch(err){
        console.error("checkLoaiVeExists error:", err);
        return false;
    }
}