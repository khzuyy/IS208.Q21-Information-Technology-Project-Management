function validateLoaiVe(value){
    return value === "VIP" || value === "Thường";
}

let allTickets = [];

function loadTickets() {

    clearContent();

    const ticketList = document.getElementById("ticketList");
    ticketList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateTicket()">+ Tạo vé</button>
        </div>
        <div class="filter-panel">
            <input type="text" id="filterTenVe"     placeholder="🔍 Tìm theo tên vé..."   oninput="applyTicketFilter()" />
            <input type="text" id="filterTenSuKien" placeholder="🔍 Tìm theo sự kiện..." oninput="applyTicketFilter()" />
        </div>
        <div id="ticketContent"></div>
    `;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }

    fetch(`${BASE_URL}/ve/creator/${currentUser.maTaiKhoan}`)
        .then(r => { if (!r.ok) throw new Error("Không lấy được danh sách vé"); return r.json(); })
        .then(data => { allTickets = data; renderTickets(data); })
        .catch(err => {
            document.getElementById("ticketContent").innerHTML =
                `<div style="text-align:center;padding:40px;color:#e55">⚠️ ${escHtml(err.message)}</div>`;
        });
}

function applyTicketFilter() {
    const tenVe     = (document.getElementById("filterTenVe")?.value     || "").trim().toLowerCase();
    const tenSuKien = (document.getElementById("filterTenSuKien")?.value || "").trim().toLowerCase();
    const filtered  = allTickets.filter(ve =>
        (ve.tenVe     || "").toLowerCase().includes(tenVe) &&
        (ve.tenSuKien || "").toLowerCase().includes(tenSuKien)
    );
    renderTickets(filtered);
}

// Cache tên địa điểm theo maSuKien để không fetch lại
const _venueNameCache = {};

function _fetchVenueName(maSuKien) {
    if (!maSuKien || maSuKien === "unknown") return Promise.resolve("");
    if (_venueNameCache[maSuKien] !== undefined) return Promise.resolve(_venueNameCache[maSuKien]);
    const base = typeof BASE_URL !== "undefined" ? BASE_URL : "";
    return fetch(`${base}/sukien/${maSuKien}`)
        .then(r => r.ok ? r.json() : null)
        .then(sk => {
            if (!sk) { _venueNameCache[maSuKien] = ""; return ""; }
            // Thử các field tên địa điểm theo thứ tự ưu tiên
            const dd = sk.diaDiem || sk.DiaDiem || sk.diadiem || {};
            const ten = dd.tenDiaDiem || dd.ten || dd.Ten || dd.name
                     || sk.tenDiaDiem || sk.tenDiaDiemSuKien || dd.diaChi || "";
            _venueNameCache[maSuKien] = ten;
            return ten;
        })
        .catch(() => { _venueNameCache[maSuKien] = ""; return ""; });
}

function renderTickets(data) {

    const container = document.getElementById("ticketContent");
    if (!container) return;

    if (!data.length) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:#bbb">
                <div style="font-size:3rem;margin-bottom:12px">🎫</div>
                <p>Không có vé nào.</p>
            </div>`;
        return;
    }

    // Group theo sự kiện
    const grouped = new Map();
    data.forEach(ve => {
        const key = ve.maSuKien ?? "unknown";
        if (!grouped.has(key)) {
            // Lấy tên địa điểm nếu backend đã trả sẵn trong object vé
            const tenDiaDiemSan = ve.tenDiaDiem
                || (ve.diaDiem && (ve.diaDiem.tenDiaDiem || ve.diaDiem.ten || ve.diaDiem.name))
                || ve.tenDiaDiemSuKien
                || null;
            grouped.set(key, { tenSuKien: ve.tenSuKien || "—", tenDiaDiem: tenDiaDiemSan, ves: [] });
        }
        grouped.get(key).ves.push(ve);
    });

    // Render ngay với dữ liệu có sẵn
    _renderGroupedTickets(grouped, container);

    // Fetch tên địa điểm cho nhóm nào chưa có, rồi re-render
    const fetchPromises = [];
    grouped.forEach((group, maSuKien) => {
        if (!group.tenDiaDiem && maSuKien !== "unknown") {
            fetchPromises.push(
                _fetchVenueName(maSuKien).then(ten => { if (ten) group.tenDiaDiem = ten; })
            );
        }
    });
    if (fetchPromises.length) {
        Promise.all(fetchPromises).then(() => _renderGroupedTickets(grouped, container));
    }
}

function _renderGroupedTickets(grouped, container) {
    let html = "";
    grouped.forEach(group => {
        const venueLine = group.tenDiaDiem
            ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:.75rem;
                color:#0369a1;background:#e0f2fe;border-radius:20px;padding:2px 10px;
                font-weight:600;white-space:nowrap">📍 ${escHtml(group.tenDiaDiem)}</span>`
            : "";

        html += `
            <div class="event-group" style="margin-bottom:24px">
                <h2 style="font-size:1rem;font-weight:700;color:#1a1a2e;
                            border-left:4px solid #0d9488;padding-left:10px;margin-bottom:12px;
                            display:flex;align-items:center;flex-wrap:wrap;gap:6px">
                    🎪 ${escHtml(group.tenSuKien)} ${venueLine}
                </h2>`;

        group.ves.forEach(ve => {
            const conLai  = ve.conLai  ?? null;
            const soLuong = ve.soLuong ?? null;
            const daBan   = ve.daBan   ?? null;
            const pct     = soLuong > 0 && daBan != null
                ? Math.round(daBan / soLuong * 100) : null;

            const badge = trangThaiBadgeVe(ve.trangThai);

            // Tên địa điểm riêng trên mỗi vé (nếu có từ trực tiếp trong ve object)
            const veTenDiaDiem = ve.tenDiaDiem
                || (ve.diaDiem && (ve.diaDiem.tenDiaDiem || ve.diaDiem.ten))
                || group.tenDiaDiem  // kế thừa từ group nếu vé không có riêng
                || null;

            const venueTag = veTenDiaDiem
                ? `<p style="display:inline-flex;align-items:center;gap:4px;font-size:.75rem;
                    color:#0369a1;background:#e0f2fe;border-radius:20px;padding:2px 10px;
                    font-weight:600;margin:0 0 6px;width:fit-content">
                    📍 ${escHtml(veTenDiaDiem)}
                   </p>`
                : "";

            const stockInfo = soLuong != null ? `
                <div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 4px;align-items:center">
                    ${chip(soLuong.toLocaleString("vi-VN") + " vé", "#e0f2fe","#0369a1")}
                    ${daBan != null  ? chip("Đã bán: " + daBan, "#f3f4f6","#555") : ""}
                    ${conLai != null
                        ? conLai === 0
                            ? chip("Hết vé", "#fee2e2","#dc2626")
                            : conLai <= 10
                                ? chip("🔥 Còn " + conLai, "#fff7ed","#ea580c")
                                : chip("Còn " + conLai.toLocaleString("vi-VN"), "#dcfce7","#15803d")
                        : ""}
                </div>
                ${pct != null ? `
                <div style="background:#f3f4f6;border-radius:20px;height:5px;overflow:hidden;max-width:200px;margin-bottom:8px">
                    <div style="width:${pct}%;height:100%;
                        background:${pct>=90?"#ef4444":pct>=60?"#f59e0b":"#3cdbd8"};
                        border-radius:20px;transition:width .4s"></div>
                </div>` : ""}
            ` : "";

            html += `
                <div class="ticket-card" style="margin-bottom:12px">
                    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;flex-wrap:wrap">
                        <div style="flex:1">
                            <p style="font-weight:700;font-size:.95rem;margin:0 0 4px">
                                🎟️ ${escHtml(ve.tenVe)}
                            </p>
                            <p style="color:#888;font-size:.82rem;margin:0 0 4px">
                                ${escHtml(ve.loaiVe || "—")}
                            </p>
                            ${venueTag}
                            ${stockInfo}
                            ${ve.moTa ? `<p style="color:#666;font-size:.82rem;margin:0">📝 ${escHtml(ve.moTa)}</p>` : ""}
                        </div>
                        <div style="text-align:right;min-width:120px">
                            <div style="font-size:1.1rem;font-weight:800;color:#0d9488;margin-bottom:6px">
                                ${formatPrice(ve.gia)}
                            </div>
                            ${badge}
                        </div>
                    </div>
                    <div class="event-actions" style="margin-top:12px">
                        <button class="edit-btn"   onclick="editTicket(${ve.maVe})">✏️ Chỉnh sửa</button>
                        <button class="delete-btn" onclick="deleteTicket(${ve.maVe})">🗑 Xóa</button>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    });

    container.innerHTML = html;
}

function trangThaiBadgeVe(trangThai) {
    const map = {
        "available":   { bg: "#dcfce7", color: "#15803d", label: "✅ Còn vé" },
        "soldout":     { bg: "#fee2e2", color: "#dc2626", label: "🚫 Hết vé" },
        "unavailable": { bg: "#f3f4f6", color: "#6b7280", label: "⏸ Tạm ngưng" },
    };
    const b = map[trangThai] || { bg: "#f3f4f6", color: "#888", label: trangThai || "—" };
    return `<span style="font-size:.75rem;font-weight:700;padding:3px 10px;
        border-radius:20px;background:${b.bg};color:${b.color};white-space:nowrap">${b.label}</span>`;
}

function chip(label, bg, color) {
    return `<span style="background:${bg};color:${color};font-size:.72rem;
        font-weight:700;padding:2px 9px;border-radius:20px;white-space:nowrap">${label}</span>`;
}

function formatPrice(n) {
    return Number(n || 0).toLocaleString("vi-VN") + " ₫";
}

function escHtml(s) {
    return String(s || "")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function editTicket(maVe) {
    window.location.href = `editVe.html?id=${maVe}`;
}

function deleteTicket(maVe) {
    if (!confirm("Bạn có chắc muốn xóa vé này?")) return;
    fetch(`${BASE_URL}/ve/${maVe}`, { method: "DELETE" })
        .then(async r => {
            if (!r.ok) { const t = await r.text(); throw new Error(t || "Xóa vé thất bại"); }
            loadTickets();
        })
        .catch(err => alert(err.message));
}