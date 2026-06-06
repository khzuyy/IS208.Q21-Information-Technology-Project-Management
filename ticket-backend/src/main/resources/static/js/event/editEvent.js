const params   = new URLSearchParams(window.location.search);
const maSuKien = params.get("id");

// Các trạng thái không cho phép chỉnh sửa
const LOCKED_STATUSES = ["DANG_TO_CHUC", "DA_KET_THUC", "DA_HUY"];

window.addEventListener("DOMContentLoaded", async function () {
    try {
        // Load song song: thông tin sự kiện + danh sách địa điểm
        const [eventRes, diaDiemRes] = await Promise.all([
            fetch(`${BASE_URL}/sukien/${maSuKien}`),
            fetch(`${BASE_URL}/diadiem`)
        ]);

        if (!eventRes.ok) throw new Error("Không lấy được sự kiện");
        if (!diaDiemRes.ok) throw new Error("Không lấy được địa điểm");

        const data      = await eventRes.json();
        const diaDiemList = await diaDiemRes.json();

        // ── Điền thông tin sự kiện ─────────────────────────────────────────
        document.getElementById("tenSuKien").value       = data.tenSuKien || "";
        document.getElementById("moTa").value            = data.moTa      || "";
        document.getElementById("thoiGianBatDau").value  = toDatetimeLocal(data.thoiGianBatDau);
        document.getElementById("thoiGianKetThuc").value = toDatetimeLocal(data.thoiGianKetThuc);

        document.getElementById("thoiGianBatDau").addEventListener("change", () => {
            document.getElementById("thoiGianKetThuc").min =
                document.getElementById("thoiGianBatDau").value;
        });

        // ── Điền dropdown địa điểm ────────────────────────────────────────
        const select = document.getElementById("diaDiem");
        select.innerHTML = '<option value="">-- Chọn địa điểm --</option>';
        diaDiemList.forEach(dd => {
            const option = document.createElement("option");
            option.value = dd.maDiaDiem;
            option.textContent = dd.tenDiaDiem;
            // Chọn sẵn địa điểm hiện tại của sự kiện
            if (data.maDiaDiem && dd.maDiaDiem === data.maDiaDiem) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        // ── Khóa form nếu đang tổ chức / đã kết thúc / đã hủy ───────────
        if (LOCKED_STATUSES.includes(data.trangThai)) {
            lockForm(data.trangThai);
        }

    } catch (err) {
        showMsg("❌ " + err.message, "err");
    }
});

function lockForm(trangThai) {
    const labels = {
        DANG_TO_CHUC: "đang diễn ra",
        DA_KET_THUC:  "đã kết thúc",
        DA_HUY:       "đã bị hủy"
    };

    // Disable toàn bộ input
    ["tenSuKien", "moTa", "diaDiem", "thoiGianBatDau", "thoiGianKetThuc"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.disabled = true;
    });

    // Disable nút cập nhật
    const btn = document.querySelector(".create-btn");
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Không thể chỉnh sửa";
    }

    showMsg(`⚠️ Sự kiện ${labels[trangThai] || trangThai} — không thể chỉnh sửa.`, "err");
}

async function updateEvent() {
    const tenSuKien       = document.getElementById("tenSuKien").value.trim();
    const maDiaDiem       = document.getElementById("diaDiem")?.value || null;
    const moTa            = document.getElementById("moTa").value.trim();
    const thoiGianBatDau  = document.getElementById("thoiGianBatDau").value;
    const thoiGianKetThuc = document.getElementById("thoiGianKetThuc").value;

    if (!tenSuKien || !thoiGianBatDau || !thoiGianKetThuc) {
        showMsg("⚠️ Vui lòng điền đầy đủ thông tin bắt buộc.", "err"); return;
    }
    if (thoiGianKetThuc < thoiGianBatDau) {
        showMsg("⚠️ Ngày kết thúc phải sau ngày bắt đầu.", "err"); return;
    }

    const btn = document.querySelector(".create-btn");
    if (btn) { btn.disabled = true; btn.textContent = "Đang cập nhật..."; }

    try {
        const res = await fetch(`${BASE_URL}/sukien/${maSuKien}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tenSuKien,
                moTa,
                thoiGianBatDau,
                thoiGianKetThuc,
                maDiaDiem: maDiaDiem || null
            })
        });

        if (!res.ok) {
            const t = await res.text();
            throw new Error(t || "Cập nhật thất bại");
        }

        showMsg("✅ Cập nhật thành công! Đang chuyển hướng...", "ok");
        setTimeout(() => window.location.href = "loginCreator.html", 1200);

    } catch (err) {
        showMsg("❌ " + err.message, "err");
        if (btn) { btn.disabled = false; btn.textContent = "Cập nhật"; }
    }
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function toDatetimeLocal(val) {
    if (!val) return "";
    if (Array.isArray(val)) {
        const [y, mo, d] = val;
        return `${y}-${pad(mo)}-${pad(d)}`;
    }
    const dt = new Date(val);
    if (isNaN(dt)) return val;
    return dt.toISOString().slice(0, 10);
}

function pad(n) { return String(n).padStart(2, "0"); }

function showMsg(text, type) {
    const el = document.getElementById("msgBox");
    if (!el) return;
    el.textContent = text;
    el.style.color      = type === "ok" ? "#0d9488" : "#dc2626";
    el.style.fontWeight = "600";
}

function goBack() { window.location.href = "loginCreator.html"; }