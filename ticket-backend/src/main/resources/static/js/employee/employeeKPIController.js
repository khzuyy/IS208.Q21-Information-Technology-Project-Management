/* ==========================================================
   js/employee/employeeKpiController.js
   Báo cáo KPI theo ngày — dành riêng cho nhân viên.

   Backend trả về (GET /hoadon/nhanvien/{maNV}):
   [{ maHoaDon, ngayLap, thanhTien, trangThai, chiTiet: [{maVe, donGia, soLuong}] }]
   ========================================================== */

// ── STATE ─────────────────────────────────────────────────
let _kpiDate   = new Date();
let _kpiOrders = [];


// ── REFRESH sau khi mua vé ────────────────────────────────
// Gọi hàm này sau confirmBuy / finalConfirmBuy để KPI cập nhật ngay
async function refreshKpi() {
    try {
        const maNV = (typeof currentUser !== "undefined") ? currentUser.maNhanVien : null;
        if (!maNV) return;
        _kpiOrders = await OrderService.getByEmployee(maNV);
        renderKpi();
    } catch (e) {
        console.warn("[KPI] refreshKpi lỗi:", e);
    }
}

// ── ENTRY POINT ───────────────────────────────────────────
async function loadKpi() {
    const root = document.getElementById("kpiRoot");
    root.innerHTML = `<div class="loading-state"><div class="spinner"></div><p>Đang tải báo cáo...</p></div>`;
    try {
        const maNV = (typeof currentUser !== "undefined") ? currentUser.maNhanVien : null;
        if (!maNV) throw new Error("Không tìm thấy thông tin nhân viên.");
        _kpiOrders = await OrderService.getByEmployee(maNV);
        // Giữ nguyên ngày đang xem, chỉ reset về hôm nay nếu chưa có
        if (!_kpiDate) _kpiDate = new Date();
        renderKpi();
    } catch (err) {
        root.innerHTML = `<div class="kpi-empty">❌ ${err.message || "Không thể tải dữ liệu."}</div>`;
    }
}

// ── HELPERS ───────────────────────────────────────────────
function _toDateStr(d) {
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function _getOrderDate(order) {
    const raw = order.ngayLap || order.ngayMua || order.thoiGian;
    if (!raw) return null;
    if (Array.isArray(raw)) {
        const [y, m, d] = raw;
        return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    }
    return String(raw).slice(0, 10);
}

function _fmt(n) {
    return Number(n || 0).toLocaleString("vi-VN") + " ₫";
}

function _esc(s) {
    return String(s || "")
        .replace(/&/g,"&amp;").replace(/</g,"&lt;")
        .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

function _isRefunded(o) {
    // Vé đã hoàn thành công: trangThaiHoan === "approved"
    return o.trangThaiHoan === "approved";
}

function _countSeats(orders) {
    // soLuongHoan là int (default 0 khi chưa hoàn) — KHÔNG dùng || vì 0 là falsy.
    return orders.reduce((total, o) => {
        const bought   = o.soLuong    || 0;
        const hoan     = _isRefunded(o) ? (o.soLuongHoan != null ? o.soLuongHoan : bought) : 0;
        return total + bought - hoan;
    }, 0);
}

function _sumRevenue(orders) {
    // thanhTienHoan không có trong VeKhachHangResponse.
    // Tính tỉ lệ: đơn giá bình quân (thanhTien/soLuong) × soLuongHoan.
    return orders.reduce((s, o) => {
        const revenue = o.thanhTien || 0;
        if (!_isRefunded(o)) return s + revenue;
        const bought  = o.soLuong    || 1;
        const hoan    = o.soLuongHoan != null ? o.soLuongHoan : bought;
        const hoanRev = (revenue / bought) * hoan;
        return s + revenue - hoanRev;
    }, 0);
}

function _groupByDay(orders) {
    const map = {};
    orders.forEach(o => {
        const key = _getOrderDate(o);
        if (!key) return;
        if (!map[key]) map[key] = [];
        map[key].push(o);
    });
    return map;
}

function _last7Days(base) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date(base);
        d.setDate(d.getDate() - i);
        days.push(_toDateStr(d));
    }
    return days;
}

function _dayLabel(s)  { const [,m,d] = s.split("-"); return `${d}/${m}`; }
function _navLabel(d)  {
    return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

// ── NAVIGATE DATE ─────────────────────────────────────────
function kpiPrevDay() { _kpiQuickMode = null; _kpiDate.setDate(_kpiDate.getDate()-1); renderKpi(); }
function kpiNextDay() {
    const tom = new Date(); tom.setDate(tom.getDate()+1);
    if (_kpiDate >= tom) return;
    _kpiQuickMode = null; _kpiDate.setDate(_kpiDate.getDate()+1); renderKpi();
}

// Chọn ngày từ date picker
function kpiPickDate(val) {
    if (!val) return;
    const [y, m, d] = val.split("-").map(Number);
    const picked = new Date(y, m - 1, d);
    const today  = new Date(); today.setHours(23,59,59,999);
    if (picked > today) return;
    _kpiQuickMode = null;
    _kpiDate = picked;
    renderKpi();
}

// Chọn nhanh: today | yesterday | week | month
function kpiQuickSelect(preset) {
    const now = new Date();
    switch (preset) {
        case "today":
            _kpiDate = new Date(now);
            _kpiQuickMode = null;
            break;
        case "yesterday":
            _kpiDate = new Date(now);
            _kpiDate.setDate(_kpiDate.getDate() - 1);
            _kpiQuickMode = null;
            break;

    }
    renderKpi();
}

// Mode chọn nhanh ảnh hưởng đến khoảng ngày khi export
let _kpiQuickMode = null; // null | "week" | "month"

// ── MODAL CHI TIẾT ────────────────────────────────────────
function _ensureKpiModal() {
    if (document.getElementById("kpiModal")) return;
    document.body.insertAdjacentHTML("beforeend", `
        <div id="kpiModalOverlay" onclick="closeKpiModal()" style="
            display:none;position:fixed;inset:0;
            background:rgba(0,0,0,.45);z-index:9000"></div>
        <div id="kpiModal" style="
            display:none;position:fixed;top:50%;left:50%;
            transform:translate(-50%,-50%);
            background:#fff;border-radius:18px;
            box-shadow:0 8px 40px rgba(0,0,0,.18);
            width:min(500px,94vw);max-height:82vh;
            overflow-y:auto;z-index:9001;padding:28px 24px 20px">
          <button onclick="closeKpiModal()" style="
              position:absolute;top:14px;right:16px;background:none;
              border:none;font-size:1.3rem;cursor:pointer;color:#aaa">✕</button>
          <div id="kpiModalBody"></div>
          <div style="text-align:right;margin-top:16px">
            <button onclick="closeKpiModal()" style="
                background:#0d9488;color:#fff;border:none;
                padding:9px 24px;border-radius:10px;
                font-weight:700;cursor:pointer">Đóng</button>
          </div>
        </div>`);
}

window.closeKpiModal = function() {
    const m = document.getElementById("kpiModal");
    const o = document.getElementById("kpiModalOverlay");
    if (m) m.style.display = "none";
    if (o) o.style.display = "none";
};

window.openKpiOrderDetail = function(idx) {
    _ensureKpiModal();
    const o = _kpiOrders[idx];
    if (!o) { console.error("KPI: không tìm thấy hóa đơn idx=", idx); return; }

    // API /hoadon/nhanvien/{maNV} trả về VeKhachHangResponse — KHÔNG có chiTiet[].
    // Dữ liệu vé nằm trực tiếp ở root: tenVe, loaiVe, gia, soLuong, thanhTien,
    // thanhTienGoc, tenSuKien, gheDat[], trangThaiHoan.
    const ngay = _getOrderDate(o) || "";

    const showDiscount = o.thanhTienGoc && o.thanhTien
        && Number(o.thanhTien) < Number(o.thanhTienGoc);

    const discountRow = showDiscount
        ? `<tr style="color:#16a34a">
               <td colspan="3" style="padding:9px 10px;text-align:right;font-size:.85rem">Giảm giá (voucher)</td>
               <td style="padding:9px 10px;text-align:right">
                   -${_fmt(Number(o.thanhTienGoc) - Number(o.thanhTien))}
               </td>
           </tr>`
        : "";

    const gheDatStr = (o.gheDat && o.gheDat.length) ? o.gheDat.join(", ") : "—";

    const trangThaiLabel = (() => {
        switch (o.trangThaiHoan) {
            case "pending":  return `<span style="background:#fef3c7;color:#92400e;padding:3px 12px;border-radius:20px;font-weight:700;font-size:.85rem">⏳ Chờ hoàn</span>`;
            case "approved": return `<span style="background:#d1fae5;color:#065f46;padding:3px 12px;border-radius:20px;font-weight:700;font-size:.85rem">💚 Đã hoàn</span>`;
            case "rejected": return `<span style="background:#fee2e2;color:#dc2626;padding:3px 12px;border-radius:20px;font-weight:700;font-size:.85rem">❌ Hoàn bị từ chối</span>`;
            default:         return `<span style="background:#dcfce7;color:#15803d;padding:3px 12px;border-radius:20px;font-weight:700;font-size:.85rem">✅ Hoàn thành</span>`;
        }
    })();

    document.getElementById("kpiModalBody").innerHTML = `
        <div style="text-align:center;margin-bottom:20px">
            <div style="font-size:2rem">🧾</div>
            <h2 style="margin:6px 0 4px;font-size:1.15rem;color:#111">
                Hóa đơn #${o.maHoaDon}
            </h2>
            <p style="color:#888;font-size:.82rem;margin:0">
                📅 ${ngay} &nbsp;·&nbsp; ${trangThaiLabel}
            </p>
        </div>
        <div style="background:#f9fafb;border-radius:10px;padding:10px 14px;
                    margin-bottom:16px;font-size:.85rem;color:#555;line-height:1.8">
            <div>🎪 Sự kiện: <strong style="color:#111">${_esc(o.tenSuKien || "—")}</strong></div>
            <div>💺 Ghế đã đặt: <strong style="color:#0d9488">${_esc(gheDatStr)}</strong></div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:.87rem">
            <thead>
                <tr style="background:#f3f4f6;color:#374151">
                    <th style="padding:9px 10px;text-align:left">Loại vé</th>
                    <th style="padding:9px 10px;text-align:center">Số ghế</th>
                    <th style="padding:9px 10px;text-align:right">Đơn giá</th>
                    <th style="padding:9px 10px;text-align:right">Thành tiền</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding:9px 10px">
                        <div style="font-weight:600;color:#1a1a2e">${_esc(o.tenVe || "—")}</div>
                        ${o.loaiVe ? `<div style="font-size:.78rem;color:#888">${_esc(o.loaiVe)}</div>` : ""}
                    </td>
                    <td style="padding:9px 10px;text-align:center">
                        <span style="background:#dbeafe;color:#1d4ed8;padding:3px 12px;
                                     border-radius:20px;font-weight:700;font-size:.85rem">
                            ${o.soLuong || 0} ghế
                        </span>
                    </td>
                    <td style="padding:9px 10px;text-align:right;color:#555">${_fmt(o.gia || 0)}</td>
                    <td style="padding:9px 10px;text-align:right;font-weight:700;color:#0d9488">
                        ${_fmt(o.thanhTien || 0)}
                    </td>
                </tr>
            </tbody>
            <tfoot>
                ${discountRow}
                <tr style="border-top:2px solid #e5e7eb">
                    <td colspan="3" style="padding:10px;text-align:right;font-weight:700">Tổng cộng</td>
                    <td style="padding:10px;text-align:right;font-weight:800;
                               color:#0d9488;font-size:1.05rem">${_fmt(o.thanhTien || 0)}</td>
                </tr>
            </tfoot>
        </table>`;

    document.getElementById("kpiModalOverlay").style.display = "block";
    document.getElementById("kpiModal").style.display        = "block";
};

// ── RENDER ────────────────────────────────────────────────
// ── RENDER HELPERS cho date nav ──────────────────────────────────────────────
function _renderQuickBtns() {
    const presets = [
        ["today",     "Hôm nay"],
        ["yesterday", "Hôm qua"],
    ];
    return '<div style="display:flex;gap:5px;flex-wrap:wrap">' +
        presets.map(function(p) {
            const key    = p[0], label = p[1];
            const active = _kpiQuickMode === key;
            const bg     = active ? "#0d9488" : "#f0fdfa";
            const col    = active ? "#fff"    : "#0d9488";
            return "<button onclick=\"kpiQuickSelect('" + key + "')\"" +
                   " style=\"padding:5px 12px;border-radius:8px;font-size:.78rem;" +
                   "font-weight:700;cursor:pointer;border:1.5px solid #0d9488;" +
                   "white-space:nowrap;background:" + bg + ";color:" + col + "\">" +
                   label + "</button>";
        }).join("") +
    "</div>";
}



function renderKpi() {
    const root    = document.getElementById("kpiRoot");
    const today   = _toDateStr(_kpiDate);
    const grouped = _groupByDay(_kpiOrders);

    const dayOrders   = grouped[today] || [];
    const daySeats    = _countSeats(dayOrders);
    const dayRevenue  = _sumRevenue(dayOrders);
    const dayInvoices = dayOrders.length;

    const monthKey    = today.slice(0, 7);
    const monthOrders = _kpiOrders.filter(o => (_getOrderDate(o) || "").startsWith(monthKey));
    const monthSeats  = _countSeats(monthOrders);
    const monthRev    = _sumRevenue(monthOrders);

    const totalSeats  = _countSeats(_kpiOrders);
    const totalRev    = _sumRevenue(_kpiOrders);

    const days7    = _last7Days(_kpiDate);
    const maxSeats = Math.max(...days7.map(d => _countSeats(grouped[d] || [])), 1);
    const barColors = ["#0d9488","#0891b2","#7c3aed","#d97706","#dc2626","#16a34a","#0d9488"];

    const isToday = today === _toDateStr(new Date());
    const nextDis = isToday ? 'disabled style="opacity:.4;cursor:not-allowed"' : '';

    root.innerHTML = `
    <div class="kpi-wrapper">

      <div class="kpi-header">
        <div class="kpi-title">📊 Báo cáo KPI nhân viên</div>
        <div class="kpi-date-nav" style="display:flex;flex-wrap:wrap;align-items:center;gap:8px">
          ${_renderQuickBtns()}
          <input type="date" id="kpiDatePicker"
            value="${today}"
            max="${_toDateStr(new Date())}"
            onchange="kpiPickDate(this.value)"
            style="padding:5px 10px;border:1.5px solid #0d9488;border-radius:8px;
                   font-size:.82rem;color:#0d9488;font-weight:600;cursor:pointer;
                   background:#f0fdfa;outline:none" />
        </div>
      </div>

      <div class="kpi-cards">
        <div class="kpi-card">
          <div class="kpi-card-icon">💺</div>
          <div class="kpi-card-val">${daySeats}</div>
          <div class="kpi-card-label">Ghế bán trong ngày</div>
          <div class="kpi-card-sub">${dayInvoices} hóa đơn</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-icon">💰</div>
          <div class="kpi-card-val" style="font-size:1.2rem">${_fmt(dayRevenue)}</div>
          <div class="kpi-card-label">Doanh thu trong ngày</div>
          <div class="kpi-card-sub">&nbsp;</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-icon">📅</div>
          <div class="kpi-card-val">${monthSeats}</div>
          <div class="kpi-card-label">Ghế bán tháng ${monthKey.slice(5)}</div>
          <div class="kpi-card-sub">${_fmt(monthRev)}</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-icon">🏆</div>
          <div class="kpi-card-val">${totalSeats}</div>
          <div class="kpi-card-label">Tổng ghế đã bán</div>
          <div class="kpi-card-sub">${_fmt(totalRev)}</div>
        </div>
      </div>

      <div class="kpi-chart-wrap">
        <div class="kpi-section-title">📈 7 ngày gần nhất (số ghế bán)</div>
        ${days7.map((d, i) => {
            const cnt  = _countSeats(grouped[d] || []);
            const pct  = Math.round(cnt / maxSeats * 100);
            const isSel = d === today;
            return `
            <div class="kpi-bar-row">
              <div class="kpi-bar-label" style="${isSel?"color:#0d9488;font-weight:800":""}">
                ${_dayLabel(d)}
              </div>
              <div class="kpi-bar-track">
                <div class="kpi-bar-fill"
                     style="width:${pct}%;background:${isSel?"#0d9488":barColors[i]}">
                </div>
              </div>
              <div class="kpi-bar-count" style="${isSel?"color:#0d9488;font-weight:800":""}">
                ${cnt}
              </div>
            </div>`;
        }).join("")}
      </div>

      <div class="kpi-table-wrap">
        <div class="kpi-section-title">🧾 Hóa đơn ngày ${_navLabel(_kpiDate)}</div>
        ${dayOrders.length === 0
          ? `<div class="kpi-empty">Không có hóa đơn nào trong ngày này 🗂️</div>`
          : `<table class="kpi-table">
              <thead>
                <tr>
                  <th>Mã HĐ</th>
                  <th style="text-align:center">Số ghế</th>
                  <th style="text-align:right">Doanh thu</th>
                  <th style="text-align:center">Trạng thái</th>
                  <th style="text-align:center">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                ${dayOrders.map(o => {
                    const idx        = _kpiOrders.indexOf(o);
                    const refunded   = _isRefunded(o);
                    const bought     = o.soLuong     || 0;
                    const hoanSeats  = refunded ? (o.soLuongHoan != null ? o.soLuongHoan : bought) : 0;
                    const hoanRev    = (() => {
                        if (!refunded) return 0;
                        const revenue = o.thanhTien || 0;
                        const hoan    = o.soLuongHoan != null ? o.soLuongHoan : bought;
                        return (revenue / (bought || 1)) * hoan;
                    })();
                    const cancel     = o.trangThai === "DA_HUY";
                    const statusBadge = refunded
                        ? `<span class="kpi-badge" style="background:#d1fae5;color:#065f46">💚 Đã hoàn (${hoanSeats}/${bought} ghế)</span>`
                        : cancel
                            ? `<span class="kpi-badge" style="background:#fee2e2;color:#dc2626">❌ Đã huỷ</span>`
                            : `<span class="kpi-badge green">✅ Hoàn thành</span>`;
                    // Doanh thu thực = thanhTien - phần đã hoàn
                    const netRev     = (o.thanhTien || 0) - hoanRev;
                    const netSeats   = bought - hoanSeats;
                    return `
                    <tr style="${refunded ? 'opacity:.8;background:#fff5f5' : ''}">
                      <td style="font-size:.82rem;color:#888;font-weight:600">#${o.maHoaDon||"—"}</td>
                      <td style="text-align:center">
                          <span class="kpi-badge" style="background:#dbeafe;color:#1d4ed8">
                              💺 ${netSeats} ghế
                          </span>
                          ${refunded && hoanSeats > 0 ? `<div style="font-size:.7rem;color:#dc2626;margin-top:2px">-${hoanSeats} hoàn</div>` : ""}
                      </td>
                      <td style="text-align:right;font-weight:700;color:#0d9488">
                          ${_fmt(netRev)}
                          ${refunded && hoanRev > 0 ? `<div style="font-size:.7rem;color:#dc2626;font-weight:400">-${_fmt(hoanRev)}</div>` : ""}
                      </td>
                      <td style="text-align:center">${statusBadge}</td>
                      <td style="text-align:center">
                          <button onclick="openKpiOrderDetail(${idx})"
                              style="background:#f0fdfa;color:#0d9488;
                                     border:1.5px solid #0d9488;padding:4px 14px;
                                     border-radius:8px;font-size:.8rem;font-weight:700;
                                     cursor:pointer;white-space:nowrap"
                              onmouseover="this.style.background='#ccfbf1'"
                              onmouseout="this.style.background='#f0fdfa'">
                              🔍 Xem
                          </button>
                      </td>
                    </tr>`;
                }).join("")}
              </tbody>
             </table>`}
      </div>
    </div>`;
    _injectExportBtn();
}
// ══════════════════════════════════════════════════════════════════════════════
// BÁO CÁO KPI — Lưu DB + Xuất Excel
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Gọi API lưu báo cáo vào DB, nhận payload JSON,
 * sau đó dùng SheetJS (xlsx.full.min.js) tạo file .xlsx tải về.
 *
 * Cần thêm SheetJS vào HTML:
 *   <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
 */
async function exportKpiReport() {
    const btn = document.getElementById("kpiExportBtn");
    if (btn) { btn.disabled = true; btn.textContent = "⏳ Đang xuất..."; }

    try {
        const maNV = (typeof currentUser !== "undefined") ? currentUser.maNhanVien : null;
        if (!maNV) throw new Error("Không tìm thấy thông tin nhân viên.");

        // Lưu báo cáo theo ngày đang xem
        const ngayBatDau  = _toDateStr(_kpiDate);
        const ngayKetThuc = _toDateStr(_kpiDate);

        // 1. Gọi API lưu DB và lấy payload
        const payload = await apiFetch(
            `/baocao/kpi/${maNV}?ngayBatDau=${ngayBatDau}&ngayKetThuc=${ngayKetThuc}`,
            { method: "POST" }
        );

        // Điền tenNhanVien từ currentUser (backend để trống)
        payload.tenNhanVien = currentUser.tenDangNhap || currentUser.hoTen || `NV#${maNV}`;

        // 2. Tạo file Excel từ payload
        _buildAndDownloadExcel(payload);

        if (btn) { btn.disabled = false; btn.textContent = "📊 Báo cáo KPI"; }
        if (typeof showToast === "function") showToast("✅ Đã lưu và xuất báo cáo KPI!", "success");

    } catch (err) {
        if (btn) { btn.disabled = false; btn.textContent = "📊 Báo cáo KPI"; }
        alert("❌ " + (err.message || "Không thể xuất báo cáo."));
    }
}

// ── Tạo workbook Excel bằng SheetJS và trigger download ──────────────────────
function _buildAndDownloadExcel(p) {
    if (typeof XLSX === "undefined") {
        alert("❌ Thư viện SheetJS chưa được tải. Vui lòng thêm thẻ <script> của xlsx.full.min.js vào HTML.");
        return;
    }

    const wb = XLSX.utils.book_new();

    // ── Sheet 1: Tổng Quan ───────────────────────────────────────────────────
    const hieuSuat = (p.tongVeDaBan + p.tongVeTon) > 0
        ? ((p.tongVeDaBan / (p.tongVeDaBan + p.tongVeTon)) * 100).toFixed(1) + "%"
        : "—";

    const s1Data = [
        ["BÁO CÁO KPI NHÂN VIÊN"],
        [`Nhân viên: ${p.tenNhanVien}  |  Mã NV: ${p.maNhanVien}`],
        [`Kỳ báo cáo: ${p.ngayBatDau} → ${p.ngayKetThuc}  |  Xuất: ${p.ngayXuat}`],
        [],
        ["CHỈ TIÊU","GIÁ TRỊ","GHI CHÚ"],
        ["💰 Tổng doanh thu (₫)", p.tongDoanhThu, "Sau giảm giá"],
        ["🎫 Tổng vé đã bán",     p.tongVeDaBan,  "Số lượng vé"],
        ["📦 Vé tồn",             p.tongVeTon,    "Chưa bán"],
        ["📈 Hiệu suất bán",      hieuSuat,       "% vé bán / tổng vé"],
        [],
        ["📅 CHI TIẾT THEO NGÀY"],
        ["Ngày","Số HĐ","Số vé bán","Doanh thu (₫)","TB / HĐ (₫)"],
        ...(p.chiTietNgay || []).map(d => [
            d.ngay, d.soHoaDon, d.soVe, d.doanhThu,
            d.soHoaDon > 0 ? Math.round(d.doanhThu / d.soHoaDon) : 0,
        ]),
        ["TỔNG",
         (p.chiTietNgay||[]).reduce((s,d)=>s+d.soHoaDon,0),
         p.tongVeDaBan,
         p.tongDoanhThu,
         (p.chiTietNgay||[]).reduce((s,d)=>s+d.soHoaDon,0) > 0
             ? Math.round(p.tongDoanhThu / (p.chiTietNgay||[]).reduce((s,d)=>s+d.soHoaDon,0))
             : 0,
        ],
    ];
    const ws1 = XLSX.utils.aoa_to_sheet(s1Data);
    ws1["!cols"] = [{wch:32},{wch:22},{wch:20},{wch:20},{wch:18}];
    XLSX.utils.book_append_sheet(wb, ws1, "Tổng Quan");

    // ── Sheet 2: Chi Tiết Hóa Đơn ────────────────────────────────────────────
    const s2Data = [
        [`CHI TIẾT HÓA ĐƠN  —  ${p.tenNhanVien}`],
        [`Kỳ: ${p.ngayBatDau} → ${p.ngayKetThuc}  |  Xuất: ${p.ngayXuat}`],
        [],
        ["Mã HĐ","Ngày mua","Tên vé","Loại vé","Số lượng","Đơn giá (₫)","Thành tiền (₫)","Trạng thái"],
        ...(p.chiTietHoaDon || []).map(hd => {
            const isHoan     = hd.trangThaiHoan === "approved";
            // Vé hoàn: soLuong và thanhTien hiển thị âm (trừ khỏi doanh thu)
            const soLuongVal = isHoan ? -hd.soLuong : hd.soLuong;
            const thanhTienVal = isHoan ? -hd.thanhTien : hd.thanhTien;
            const trangThaiLabel = {pending:"⏳ Chờ hoàn",approved:"💚 Đã hoàn",rejected:"❌ Từ chối"}[hd.trangThaiHoan] || "✅ Hoàn thành";
            return [`#${hd.maHoaDon}`, hd.ngayMua, hd.tenVe, hd.loaiVe,
                soLuongVal, hd.gia, thanhTienVal, trangThaiLabel];
        }),
        ["TỔNG","","","","",
         "",
         // Tổng thực = cộng hóa đơn bình thường, trừ hóa đơn đã hoàn
         (p.chiTietHoaDon||[]).reduce((s,h) => h.trangThaiHoan === "approved" ? s - h.thanhTien : s + h.thanhTien, 0),
         ""],
    ];
    const ws2 = XLSX.utils.aoa_to_sheet(s2Data);
    ws2["!cols"] = [{wch:10},{wch:14},{wch:20},{wch:14},{wch:10},{wch:16},{wch:18},{wch:16}];
    XLSX.utils.book_append_sheet(wb, ws2, "Chi Tiết Hóa Đơn");

    // ── Sheet 3: Dữ liệu biểu đồ (ChartData) ────────────────────────────────
    const s3Data = [
        ["Ngày","Doanh Thu (₫)","Số Vé Bán"],
        ...(p.chiTietNgay || []).map(d => [d.ngay, d.doanhThu, d.soVe]),
    ];
    const ws3 = XLSX.utils.aoa_to_sheet(s3Data);
    ws3["!cols"] = [{wch:14},{wch:18},{wch:12}];
    XLSX.utils.book_append_sheet(wb, ws3, "Dữ Liệu Biểu Đồ");

    // ── Download ─────────────────────────────────────────────────────────────
    const fileName = `BaoCaoKPI_NV${p.maNhanVien}_${p.ngayXuat}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

// ── Render nút trong header KPI (gọi thêm trong renderKpi) ──────────────────
function _injectExportBtn() {
    if (document.getElementById("kpiExportBtn")) return; // đã có rồi
    const header = document.querySelector(".kpi-header");
    if (!header) return;
    const btn = document.createElement("button");
    btn.id        = "kpiExportBtn";
    btn.innerHTML = "📊 Báo cáo KPI";
    btn.onclick   = exportKpiReport;
    btn.style.cssText = `
        background:#0d9488;color:#fff;border:none;
        padding:8px 18px;border-radius:10px;
        font-weight:700;font-size:.85rem;cursor:pointer;
        margin-left:auto;white-space:nowrap;
        box-shadow:0 2px 8px rgba(13,148,136,.3);
        transition:background .2s,transform .1s;
    `;
    btn.onmouseover = () => btn.style.background = "#0f766e";
    btn.onmouseout  = () => btn.style.background = "#0d9488";
    btn.onmousedown = () => btn.style.transform = "scale(.97)";
    btn.onmouseup   = () => btn.style.transform = "scale(1)";
    header.appendChild(btn);
}