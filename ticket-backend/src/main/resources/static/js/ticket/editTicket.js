
function validateLoaiVe(value){
    return value === "VIP" || value === "Thường";
}

const params = new URLSearchParams(window.location.search);
const maVe   = params.get("id");

let daBan = 0; // số vé đã bán — load từ API, dùng để validate soLuong

window.addEventListener("DOMContentLoaded", function () {

    fetch(`${BASE_URL}/ve/${maVe}`)
        .then(r => { if (!r.ok) throw new Error("Không lấy được vé"); return r.json(); })
        .then(data => {
            document.getElementById("tenVe").value     = data.tenVe     || "";
            document.getElementById("loaiVe").value = data.loaiVe    || "";
document.getElementById("loaiVe").disabled = true;
            document.getElementById("gia").value       = data.gia       || 0;
            document.getElementById("soLuong").value   = data.soLuong   || 0;
            document.getElementById("trangThai").value = data.trangThai || "available";
            document.getElementById("moTa").value      = data.moTa      || "";

            // Hiển thị stock info readonly
            daBan = data.daBan || 0;
            renderStockInfo(data.soLuong || 0, data.daBan || 0, data.conLai ?? 0);
            // soLuong disabled — chỉ hiển thị, không cho sửa
            const slInput = document.getElementById("soLuong");
            if (slInput) slInput.value = data.soLuong || 0;
        })
        .catch(err => showMsg("❌ " + err.message, "err"));
});

function renderStockInfo(soLuong, sold, conLai) {
    let el = document.getElementById("stockInfo");
    if (!el) {
        el = document.createElement("div");
        el.id = "stockInfo";
        el.style.cssText = `
            background:#f0faf9; border-radius:10px; padding:10px 14px;
            font-size:0.85rem; font-weight:600; margin-top:6px;
            display:flex; gap:16px; flex-wrap:wrap; align-items:center;
        `;
        document.getElementById("soLuong")
            ?.closest(".form-group")
            ?.appendChild(el);
    }

    const pct = soLuong > 0 ? Math.round(sold / soLuong * 100) : 0;
    const conLaiColor = conLai <= 0 ? "#dc2626" : conLai <= 10 ? "#ea580c" : "#0d9488";

    el.innerHTML = `
        <span style="color:#555">📦 Tổng: <strong>${soLuong.toLocaleString("vi-VN")}</strong></span>
        <span style="color:#555">🛒 Đã bán: <strong style="color:#6366f1">${sold.toLocaleString("vi-VN")}</strong></span>
        <span style="color:${conLaiColor}">🎟 Còn lại: <strong>${conLai.toLocaleString("vi-VN")}</strong></span>
        ${soLuong > 0 ? `
        <div style="width:100%;background:#e5e7eb;border-radius:20px;height:5px;overflow:hidden">
            <div style="width:${pct}%;height:100%;
                background:${pct>=90?"#ef4444":pct>=60?"#f59e0b":"#3cdbd8"};
                border-radius:20px;transition:width .4s"></div>
        </div>
        <span style="font-size:0.78rem;color:#888">Đã bán ${pct}%</span>` : ""}
        ${conLai <= 0 && soLuong > 0
            ? `<span style="background:#fee2e2;color:#dc2626;padding:2px 10px;border-radius:20px;font-size:0.78rem">Hết vé</span>`
            : ""}
    `;
}

function updateTicket() {

    const tenVe     = document.getElementById("tenVe").value.trim();
    const loaiVe    = document.getElementById("loaiVe").value.trim();
    const gia       = parseFloat(document.getElementById("gia").value);
    const trangThai = document.getElementById("trangThai").value;
    const moTa      = document.getElementById("moTa").value.trim();

    if (!tenVe || !loaiVe) {
        showMsg("⚠️ Vui lòng nhập đầy đủ thông tin.", "err"); return;
    }
    if (isNaN(gia) || gia < 0) {
        showMsg("⚠️ Giá vé không hợp lệ.", "err"); return;
    }

    const btn = document.querySelector(".create-btn");
    if (btn) { btn.disabled = true; btn.textContent = "Đang cập nhật..."; }

    fetch(`${BASE_URL}/ve/${maVe}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenVe, loaiVe, gia, trangThai, moTa })
    })
    .then(async r => {
        if (!r.ok) { const t = await r.text(); throw new Error(t || "Cập nhật thất bại"); }
        return r.json();
    })
    .then(() => {
        showMsg("✅ Cập nhật vé thành công! Đang chuyển hướng...", "ok");
        setTimeout(() => window.location.href = "loginCreator.html", 1200);
    })
    .catch(err => {
        showMsg("❌ " + err.message, "err");
        if (btn) { btn.disabled = false; btn.textContent = "Cập nhật vé"; }
    });
}

function showMsg(text, type) {
    let el = document.getElementById("msgBox");
    if (!el) {
        el = document.createElement("div");
        el.id = "msgBox";
        el.style.cssText = "margin:10px 0;font-size:.88rem;font-weight:600";
        document.querySelector(".button-group")?.insertAdjacentElement("beforebegin", el);
    }
    el.textContent = text;
    el.style.color = type === "ok" ? "#0d9488" : "#dc2626";
}

function goBack() { window.location.href = "loginCreator.html"; }