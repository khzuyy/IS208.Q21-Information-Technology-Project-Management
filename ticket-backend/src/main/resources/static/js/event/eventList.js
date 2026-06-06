/* ==========================================================
   js/event/eventList.js  —  Quản lý sự kiện (Creator)
   Thêm: tabs "Sắp diễn ra" / "Đang tổ chức" / "Đã tổ chức"
   ========================================================== */

let allEvents    = [];
let activeTabSK  = "all";   // tab đang chọn

function loadEvents() {

    clearContent();

    const eventList = document.getElementById("eventList");

    eventList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateEvent()">+ Tạo sự kiện</button>
        </div>

        <!-- STATUS TABS -->
        <div class="sk-tab-nav">
            <button class="sk-tab-btn active" data-tab="all"          onclick="switchSKTab(this)">Tất cả</button>
            <button class="sk-tab-btn"        data-tab="Sắp diễn ra"  onclick="switchSKTab(this)">🕐 Sắp diễn ra</button>
            <button class="sk-tab-btn"        data-tab="Đang tổ chức" onclick="switchSKTab(this)">🟢 Đang tổ chức</button>
            <button class="sk-tab-btn"        data-tab="Đã tổ chức"   onclick="switchSKTab(this)">✅ Đã tổ chức</button>
        </div>

        <div class="filter-panel" style="margin-top:12px">
            <input type="text" id="filterTenSuKien" placeholder="🔍 Tìm theo tên sự kiện..."
                   oninput="applyEventFilter()" />
        </div>

        <div id="eventContent"></div>
    `;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        window.location.href = "loginpopup.html";
        return;
    }

    fetch(`${BASE_URL}/sukien/creator/${currentUser.maTaiKhoan}`)
        .then(response => {
            if (!response.ok) throw new Error("Không lấy được sự kiện");
            return response.json();
        })
        .then(data => {
            allEvents = data;
            renderEvents(filterByTab(data));
        })
        .catch(error => {
            document.getElementById("eventContent").innerHTML =
                `<div style="text-align:center;padding:40px;color:#e55">⚠️ ${error.message}</div>`;
        });
}

/* ── Tab switching ── */
function switchSKTab(btn) {
    document.querySelectorAll(".sk-tab-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    activeTabSK = btn.dataset.tab;
    applyEventFilter();
}

function filterByTab(data) {
    if (activeTabSK === "all") return data;
    return data.filter(sk => sk.trangThai === activeTabSK);
}

/* ── Filter + tab combined ── */
function applyEventFilter() {
    const keyword = (document.getElementById("filterTenSuKien")?.value || "").trim().toLowerCase();
    const filtered = filterByTab(allEvents).filter(sk =>
        sk.tenSuKien.toLowerCase().includes(keyword)
    );
    renderEvents(filtered);
}

/* ── Render ── */
function renderEvents(data) {

    const container = document.getElementById("eventContent");
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:#bbb">
                <div style="font-size:3rem;margin-bottom:12px">🎪</div>
                <p>Không có sự kiện nào trong mục này.</p>
            </div>`;
        return;
    }

    const html = data.map(sk => {
        const badge = trangThaiBadge(sk.trangThai);
        const canEdit   = sk.trangThai !== "Đã tổ chức";
        const canDelete = sk.trangThai !== "Đang tổ chức" && sk.trangThai !== "Đã tổ chức";

        return `
            <div class="event-card">
                <div class="event-card-header">
                    <h2 class="event-card-title">Tên sự kiện: ${escHtml(sk.tenSuKien)}</h2>
                    ${badge}
                </div>
                <p class="event-card-desc">Mô tả: ${escHtml(sk.moTa || "—")}</p>
                <div class="event-card-dates">
                    <span>📅 Bắt đầu: <strong>${fmtDate(sk.thoiGianBatDau)}</strong></span>
                    <span>🏁 Kết thúc: <strong>${fmtDate(sk.thoiGianKetThuc)}</strong></span>
                </div>
                <div class="event-actions">
                    ${canEdit
                        ? `<button class="edit-btn" onclick="editEvent(${sk.maSuKien})">✏️ Chỉnh sửa</button>`
                        : `<button class="edit-btn" disabled style="opacity:.45;cursor:not-allowed">✏️ Chỉnh sửa</button>`
                    }
                    ${canDelete
                        ? `<button class="delete-btn" onclick="deleteEvent(${sk.maSuKien})">🗑 Xóa</button>`
                        : `<button class="delete-btn" disabled style="opacity:.45;cursor:not-allowed" title="Không thể xóa sự kiện đang/đã diễn ra">🗑 Xóa</button>`
                    }
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = html;
}

/* ── Badge HTML theo trangThai ── */
// Thêm vào trangThaiBadge()
function trangThaiBadge(trangThai) {
    const map = {
        "Sắp diễn ra":  { cls: "badge-upcoming",   label: "🕐 Sắp diễn ra" },
        "Đang tổ chức": { cls: "badge-ongoing",    label: "🟢 Đang tổ chức" },
        "Đã tổ chức":   { cls: "badge-done",       label: "✅ Đã tổ chức" },
        "Chờ duyệt":    { cls: "badge-pending",    label: "⏳ Chờ duyệt" },
        "Từ chối":      { cls: "badge-cancelled",  label: "🚫 Từ chối" },
        "Vi phạm":      { cls: "badge-cancelled",  label: "⚠️ Vi phạm" },
        "Ẩn":           { cls: "badge-done",       label: "👁 Ẩn" },
    };
    const b = map[trangThai] || { cls: "badge-upcoming", label: trangThai || "—" };
    return `<span class="sk-status-badge ${b.cls}">${b.label}</span>`;
}

function editEvent(maSuKien) {
    window.location.href = `editSuKien.html?id=${maSuKien}`;
}

function deleteEvent(maSuKien) {
    if (!confirm("Bạn có chắc muốn xóa sự kiện này?")) return;

    fetch(`${BASE_URL}/sukien/${maSuKien}`, { method: "DELETE" })
        .then(async response => {
            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || "Xóa thất bại");
            }
            loadEvents();
        })
        .catch(error => alert(error.message));
}

/* ── Helpers ── */
function fmtDate(val) {
    if (!val) return "—";
    if (Array.isArray(val)) {
        const [y, m, d] = val;
        return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
    }
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleDateString("vi-VN");
}

function escHtml(s) {
    return String(s || "")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

/* ── Inject CSS cho tabs và badges (chạy 1 lần) ── */
(function injectEventCSS() {
    if (document.getElementById("event-list-style")) return;
    const style = document.createElement("style");
    style.id = "event-list-style";
    style.textContent = `
        /* Tab nav */
        .sk-tab-nav {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-bottom: 4px;
        }
        .sk-tab-btn {
            padding: 8px 18px;
            border: 1.5px solid #e0e0e0;
            border-radius: 20px;
            background: #f8f9fb;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            color: #666;
            font-family: 'Inter', sans-serif;
            transition: 0.18s;
        }
        .sk-tab-btn:hover { border-color: #0d9488; color: #0d9488; }
        .sk-tab-btn.active {
            background: #0d9488;
            border-color: #0d9488;
            color: #fff;
        }

        /* Event card header */
        .event-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
            margin-bottom: 6px;
        }
        .event-card-title {
            margin: 0;
            font-size: 1.05rem;
            font-weight: 700;
            color: #1a1a2e;
        }
        .event-card-desc {
            font-size: 0.88rem;
            color: #666;
            margin: 0 0 10px;
        }
        .event-card-dates {
            display: flex;
            gap: 18px;
            font-size: 0.85rem;
            color: #555;
            margin-bottom: 12px;
            flex-wrap: wrap;
        }

        /* Status badges */
        .sk-status-badge {
            display: inline-block;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 4px 12px;
            border-radius: 20px;
            white-space: nowrap;
        }
        .badge-pending { background: #fef3c7; color: #92400e; }
        .badge-upcoming  { background: #dbeafe; color: #1d4ed8; }
        .badge-ongoing   { background: #dcfce7; color: #15803d; }
        .badge-done      { background: #f3f4f6; color: #6b7280; }
        .badge-cancelled { background: #fee2e2; color: #dc2626; }
    `;
    document.head.appendChild(style);
})();