/* ==========================================================
   js/event/createEvent.js
   ========================================================== */

window.addEventListener("DOMContentLoaded", async () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }

    // ── Hiện thông tin nhà tổ chức ────────────────────────────────────────────
    fetch(`${BASE_URL}/nhatochuc/by-taikhoan/${currentUser.maTaiKhoan}`)
        .then(r => r.ok ? r.json() : null)
        .then(org => {
            const nameEl = document.getElementById("orgName");
            const metaEl = document.getElementById("orgMeta");
            if (!org || !nameEl) return;
            nameEl.textContent = org.tenCongTy || "Chưa đặt tên công ty";
            const parts = [];
            if (org.tenNguoiDaiDien) parts.push("👤 " + org.tenNguoiDaiDien);
            if (org.email)           parts.push("✉️ " + org.email);
            if (org.soDienThoai)     parts.push("📞 " + org.soDienThoai);
            if (metaEl) metaEl.textContent = parts.join("  ·  ");
        })
        .catch(() => {
            const nameEl = document.getElementById("orgName");
            if (nameEl) nameEl.textContent = "Không lấy được thông tin nhà tổ chức";
        });

    // ── Load dropdown địa điểm ────────────────────────────────────────────────
    try {
        const diaDiemList = await fetch(`${BASE_URL}/diadiem`).then(r => r.json());
        const select = document.getElementById("diaDiem");
        if (select) {
            select.innerHTML = '<option value="">-- Chọn địa điểm --</option>';
            diaDiemList.forEach(dd => {
                const option = document.createElement("option");
                option.value = dd.maDiaDiem;
                option.textContent = dd.tenDiaDiem;
                select.appendChild(option);
            });
        }
    } catch {
        console.warn("Không load được danh sách địa điểm");
    }

    // ── Set min date = hôm nay ────────────────────────────────────────────────
    const today = new Date().toISOString().split("T")[0];
    const batDauEl    = document.getElementById("thoiGianBatDau");
    const ketThucEl   = document.getElementById("thoiGianKetThuc");
    if (batDauEl)  batDauEl.min  = today;
    if (ketThucEl) ketThucEl.min = today;
    batDauEl?.addEventListener("change", () => {
        if (ketThucEl) ketThucEl.min = batDauEl.value;
    });
});

async function handleCreateEvent() {
    const btn = document.querySelector("button.create-btn");
    if (!btn || btn.disabled) return;

    const tenSuKien       = document.getElementById("tenSuKien")?.value.trim()       || "";
    const moTa            = document.getElementById("moTa")?.value.trim()            || "";
    const maDiaDiem       = document.getElementById("diaDiem")?.value                || null;
    const thoiGianBatDau  = document.getElementById("thoiGianBatDau")?.value         || "";
    const thoiGianKetThuc = document.getElementById("thoiGianKetThuc")?.value        || "";

    if (!tenSuKien || !thoiGianBatDau || !thoiGianKetThuc) {
        showMsg("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc.", "err");
        return;
    }
    if (thoiGianKetThuc < thoiGianBatDau) {
        showMsg("⚠️ Ngày kết thúc phải sau ngày bắt đầu.", "err");
        return;
    }

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }

    btn.disabled    = true;
    btn.textContent = "Đang tạo...";

    try {
        const response = await fetch(`${BASE_URL}/sukien`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tenSuKien,
                moTa,
                maDiaDiem: maDiaDiem || null,
                thoiGianBatDau,
                thoiGianKetThuc,
                maTaiKhoan: currentUser.maTaiKhoan
            })
        });

        if (!response.ok) {
            const msg = await response.text();
            throw new Error(msg || "Tạo sự kiện thất bại");
        }

        showMsg("✅ Sự kiện đã được gửi! Vui lòng chờ admin phê duyệt.", "ok");
        showToast("⏳ Sự kiện đang chờ duyệt");
        setTimeout(() => window.location.href = "loginCreator.html", 2500);

    } catch (error) {
        showMsg("❌ " + error.message, "err");
        btn.disabled    = false;
        btn.textContent = "Tạo sự kiện";
    }
}

function showMsg(text, type) {
    const el = document.getElementById("msgBox");
    if (!el) return;
    el.textContent  = text;
    el.style.color  = type === "ok" ? "#0d9488" : "#dc2626";
    el.style.fontWeight = "600";
}

function showToast(text) {
    document.getElementById("_toast")?.remove();

    const toast = document.createElement("div");
    toast.id = "_toast";
    toast.textContent = text;
    toast.style.cssText = `
        position: fixed;
        bottom: 28px;
        right: 28px;
        background: #1a1a2e;
        color: #fff;
        padding: 12px 20px;
        border-radius: 12px;
        font-size: 0.88rem;
        font-weight: 600;
        font-family: 'Inter', sans-serif;
        box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 8px;
        z-index: 99999;
        opacity: 0;
        transform: translateY(12px);
        transition: opacity 0.3s, transform 0.3s;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
        toast.style.opacity   = "1";
        toast.style.transform = "translateY(0)";
    });

    setTimeout(() => {
        toast.style.opacity   = "0";
        toast.style.transform = "translateY(12px)";
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

function goBack() {
    window.location.href = "loginCreator.html";
}