/* ==========================================================
   js/income/incomeList.js  —  Ngày 4: Doanh thu creator
   ========================================================== */

let incomeData   = [];   // raw data từ backend
let revenueChart = null; // Chart.js instance biểu đồ doanh thu
let ticketChart  = null; // Chart.js instance biểu đồ vé bán

/* ── ENTRY POINT (gọi từ loginCreator.html) ── */
function followIncome() {
    clearContent();

    const container = document.getElementById("ticketList");
    container.innerHTML = `
        <div id="incomePanel">
            <div class="income-header">
                <h2>📊 Theo dõi doanh thu</h2>
                <button class="income-refresh-btn" onclick="loadIncome()">🔄 Làm mới</button>
            </div>

            <!-- KPI tổng quan -->
            <div class="income-kpi-row" id="kpiRow">
                <div class="kpi-card kpi-loading">Đang tải...</div>
            </div>

            <!-- Biểu đồ -->
            <div class="income-charts-row">
                <div class="chart-box">
                    <h3>Doanh thu theo sự kiện (₫)</h3>
                    <canvas id="revenueChart"></canvas>
                </div>
                <div class="chart-box">
                    <h3>Vé đã bán theo sự kiện</h3>
                    <canvas id="ticketChart"></canvas>
                </div>
            </div>

            <!-- Bảng chi tiết -->
            <div class="income-table-wrap" id="incomeTableWrap">
                <div style="text-align:center;padding:40px;color:#888">
                    <div class="spinner" style="margin:0 auto 12px"></div>
                    <p>Đang tải dữ liệu...</p>
                </div>
            </div>
        </div>
    `;

    // Inject CSS nếu chưa có
    injectIncomeCSS();
    loadIncome();
}

/* ── LOAD DATA ── */
function loadIncome() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return;

    const tableWrap = document.getElementById("incomeTableWrap");
    if (tableWrap) tableWrap.innerHTML = `
        <div style="text-align:center;padding:40px;color:#888">
            <div class="spinner" style="margin:0 auto 12px"></div>
            <p>Đang tải dữ liệu...</p>
        </div>`;

    fetch(`${BASE_URL}/doanhthu/creator/${user.maTaiKhoan}`)
        .then(r => { if (!r.ok) throw new Error("Không lấy được dữ liệu doanh thu"); return r.json(); })
        .then(data => {
            incomeData = data;
            renderKPI(data);
            renderCharts(data);
            renderTable(data);
        })
        .catch(err => {
            if (tableWrap) tableWrap.innerHTML = `
                <div style="text-align:center;padding:40px;color:#e55">
                    ⚠️ ${err.message}
                </div>`;
        });
}

/* ── TÍNH DOANH THU THỰC TỪ CHITIẾT (gia × daBan) ── */
function _calcDoanhThuSuKien(sk) {
    // Ưu tiên tính từ chiTietLoaiVe để tránh backend tính sai
    if (sk.chiTietLoaiVe && sk.chiTietLoaiVe.length > 0) {
        return sk.chiTietLoaiVe.reduce((s, v) => s + (v.gia || 0) * (v.daBan || 0), 0);
    }
    // Fallback: dùng tongDoanhThu nếu không có chiTiet
    return sk.tongDoanhThu || 0;
}

/* ── KPI CARDS ── */
function renderKPI(data) {
    const tongDoanhThu    = data.reduce((s, d) => s + _calcDoanhThuSuKien(d), 0);
    const tongVeBan       = data.reduce((s, d) => s + (d.tongVeDaBan || 0), 0);
    const soSuKien        = data.length;
    const soSuKienCoDoanh = data.filter(d => _calcDoanhThuSuKien(d) > 0).length;

    const kpiRow = document.getElementById("kpiRow");
    if (!kpiRow) return;
    kpiRow.innerHTML = `
        <div class="kpi-card">
            <div class="kpi-icon">💰</div>
            <div class="kpi-value">${formatPrice(tongDoanhThu)}</div>
            <div class="kpi-label">Tổng doanh thu</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon">🎫</div>
            <div class="kpi-value">${tongVeBan.toLocaleString("vi-VN")}</div>
            <div class="kpi-label">Tổng vé đã bán</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon">🎪</div>
            <div class="kpi-value">${soSuKien}</div>
            <div class="kpi-label">Sự kiện đang có</div>
        </div>
        <div class="kpi-card">
            <div class="kpi-icon">📈</div>
            <div class="kpi-value">${soSuKienCoDoanh}</div>
            <div class="kpi-label">Sự kiện có doanh thu</div>
        </div>
    `;
}

/* ── CHARTS ── */
function renderCharts(data) {
    if (!data.length) return;

    const labels   = data.map(d => truncate(d.tenSuKien, 18));
    const revenues = data.map(d => _calcDoanhThuSuKien(d));
    const tickets  = data.map(d => d.tongVeDaBan || 0);

    const COLORS = [
        "#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6",
        "#ec4899","#14b8a6","#f97316","#8b5cf6","#06b6d4"
    ];
    const bgColors  = data.map((_, i) => COLORS[i % COLORS.length] + "cc");
    const brdColors = data.map((_, i) => COLORS[i % COLORS.length]);

    // Phá instance cũ nếu có
    if (revenueChart) { revenueChart.destroy(); revenueChart = null; }
    if (ticketChart)  { ticketChart.destroy();  ticketChart  = null; }

    const rCanvas = document.getElementById("revenueChart");
    const tCanvas = document.getElementById("ticketChart");
    if (!rCanvas || !tCanvas) return;

    revenueChart = new Chart(rCanvas, {
        type: "bar",
        data: {
            labels,
            datasets: [{
                label: "Doanh thu (₫)",
                data: revenues,
                backgroundColor: bgColors,
                borderColor: brdColors,
                borderWidth: 2,
                borderRadius: 6,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => " " + formatPrice(ctx.raw)
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: v => (v >= 1_000_000
                            ? (v/1_000_000).toFixed(1) + "M"
                            : v >= 1_000 ? (v/1_000).toFixed(0) + "K" : v)
                    }
                }
            }
        }
    });

    ticketChart = new Chart(tCanvas, {
        type: "doughnut",
        data: {
            labels,
            datasets: [{
                label: "Vé đã bán",
                data: tickets,
                backgroundColor: bgColors,
                borderColor: "#fff",
                borderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 12 } } },
                tooltip: {
                    callbacks: {
                        label: ctx => ` ${ctx.label}: ${ctx.raw} vé`
                    }
                }
            }
        }
    });
}

/* ── TABLE ── */
function renderTable(data) {
    const wrap = document.getElementById("incomeTableWrap");
    if (!wrap) return;

    if (!data.length) {
        wrap.innerHTML = `
            <div style="text-align:center;padding:60px;color:#888">
                <div style="font-size:3rem;margin-bottom:12px">📭</div>
                <p>Chưa có dữ liệu doanh thu. Hãy tạo sự kiện và bán vé trước.</p>
            </div>`;
        return;
    }

    const rows = data.map(sk => {
        const doanhThuThuc = _calcDoanhThuSuKien(sk);
        const tongVeDaBan  = sk.tongVeDaBan || 0;
        const phanTramBan  = sk.tongVeTongSo > 0
            ? Math.round(tongVeDaBan / sk.tongVeTongSo * 100)
            : 0;

        // Chi tiết loại vé: doanh thu = gia × daBan (tránh dùng v.doanhThu backend tính sai)
        const chiTietRows = (sk.chiTietLoaiVe || []).map(v => {
            const doanhThuVe = (v.gia || 0) * (v.daBan || 0);
            return `
            <tr class="detail-row">
                <td style="padding:8px 16px 8px 40px;color:#555">↳ ${esc(v.tenVe)}</td>
                <td style="padding:8px 16px;color:#777;font-size:0.85rem">${esc(v.loaiVe || "—")}</td>
                <td style="padding:8px 16px;text-align:right;color:#777">${formatPrice(v.gia)}</td>
                <td style="padding:8px 16px;text-align:center">
                    <span class="sold-badge">${v.daBan || 0}</span>
                </td>
                <td></td>
                <td style="padding:8px 16px;text-align:right;color:#059669;font-weight:600">${formatPrice(doanhThuVe)}</td>
                <td></td>
            </tr>
        `}).join("");

        return `
            <tr class="event-row" onclick="toggleDetail('detail-${sk.maSuKien}')">
                <td style="padding:14px 16px;font-weight:700;color:#1e1b4b">
                    <span class="expand-icon" id="icon-${sk.maSuKien}">▶</span>
                    ${esc(sk.tenSuKien)}
                </td>
                <td style="padding:14px 16px;color:#666;font-size:0.85rem">
                    ${sk.thoiGianBatDau || "—"}<br>
                    <span style="color:#999">→ ${sk.thoiGianKetThuc || "—"}</span>
                </td>
                <td style="padding:14px 16px;text-align:right">—</td>
                <td style="padding:14px 16px;text-align:center">
                    <span class="sold-badge sold-total">${tongVeDaBan}</span>
                </td>
                <td style="padding:14px 16px">
                    <div class="progress-wrap">
                        <div class="progress-bar" style="width:${phanTramBan}%"></div>
                    </div>
                    <div style="font-size:0.78rem;color:#888;margin-top:3px;text-align:center">${phanTramBan}%</div>
                </td>
                <td style="padding:14px 16px;text-align:right;font-weight:800;color:#4f46e5;font-size:1rem">
                    ${formatPrice(doanhThuThuc)}
                </td>
                <td style="padding:14px 16px;text-align:center">
                    <span class="expand-hint">Chi tiết</span>
                </td>
            </tr>
            <tr id="detail-${sk.maSuKien}" style="display:none;background:#f8faff">
                <td colspan="7" style="padding:0">
                    <table style="width:100%;border-collapse:collapse">
                        <thead>
                            <tr style="background:#f1f5f9;font-size:0.82rem;color:#666">
                                <th style="padding:8px 16px 8px 40px;text-align:left">Loại vé</th>
                                <th style="padding:8px 16px;text-align:left">Phân loại</th>
                                <th style="padding:8px 16px;text-align:right">Giá</th>
                                <th style="padding:8px 16px;text-align:center">Đã bán</th>
                                <th></th>
                                <th style="padding:8px 16px;text-align:right">Doanh thu</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>${chiTietRows}</tbody>
                    </table>
                </td>
            </tr>
        `;
    }).join("");

    wrap.innerHTML = `
        <h3 style="padding:20px 24px 8px;font-size:1rem;font-weight:700;color:#333">
            📋 Chi tiết theo sự kiện
            <span style="font-weight:400;font-size:0.85rem;color:#888;margin-left:8px">
                (nhấn vào hàng để xem chi tiết loại vé)
            </span>
        </h3>
        <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:0.9rem">
                <thead>
                    <tr style="background:#f3f4f6;color:#555;text-align:left;font-size:0.85rem">
                        <th style="padding:12px 16px">Sự kiện</th>
                        <th style="padding:12px 16px">Thời gian</th>
                        <th style="padding:12px 16px;text-align:right">Giá vé</th>
                        <th style="padding:12px 16px;text-align:center">Vé đã bán</th>
                        <th style="padding:12px 16px;min-width:120px">Tỉ lệ bán</th>
                        <th style="padding:12px 16px;text-align:right">Doanh thu</th>
                        <th style="padding:12px 16px;text-align:center"></th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    `;
}

/* ── TOGGLE DETAIL ROW ── */
function toggleDetail(rowId) {
    const row  = document.getElementById(rowId);
    const maSuKien = rowId.replace("detail-", "");
    const icon = document.getElementById("icon-" + maSuKien);
    if (!row) return;
    const isHidden = row.style.display === "none";
    row.style.display  = isHidden ? "table-row" : "none";
    if (icon) icon.textContent = isHidden ? "▼" : "▶";
}

/* ── HELPERS ── */
function formatPrice(v) {
    if (v == null) return "—";
    return Number(v).toLocaleString("vi-VN") + " ₫";
}

function truncate(str, len) {
    if (!str) return "";
    return str.length > len ? str.slice(0, len) + "…" : str;
}

function esc(str) {
    return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

/* ── INJECT CSS ── */
function injectIncomeCSS() {
    if (document.getElementById("income-style")) return;
    const style = document.createElement("style");
    style.id = "income-style";
    style.textContent = `
        #incomePanel { padding: 20px 0; }
        .income-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 0 4px 16px;
        }
        .income-header h2 { font-size: 1.25rem; font-weight: 800; color: #1e1b4b; margin: 0; }
        .income-refresh-btn {
            padding: 8px 18px; background: #6366f1; color: #fff;
            border: none; border-radius: 8px; cursor: pointer; font-size: 0.88rem; font-weight: 600;
        }
        .income-refresh-btn:hover { background: #4f46e5; }

        /* KPI */
        .income-kpi-row {
            display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px;
        }
        @media(max-width:700px){ .income-kpi-row { grid-template-columns: repeat(2,1fr); } }
        .kpi-card {
            background: #fff; border-radius: 14px; padding: 20px 18px;
            box-shadow: 0 2px 12px #6366f115; text-align: center;
            border: 1.5px solid #e0e7ff;
        }
        .kpi-loading { color: #aaa; font-size: 0.9rem; }
        .kpi-icon   { font-size: 1.8rem; margin-bottom: 6px; }
        .kpi-value  { font-size: 1.3rem; font-weight: 800; color: #1e1b4b; margin-bottom: 4px; }
        .kpi-label  { font-size: 0.8rem; color: #888; font-weight: 500; }

        /* Charts */
        .income-charts-row {
            display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-bottom: 24px;
        }
        @media(max-width:700px){ .income-charts-row { grid-template-columns: 1fr; } }
        .chart-box {
            background: #fff; border-radius: 14px; padding: 20px;
            box-shadow: 0 2px 12px #6366f115; border: 1.5px solid #e0e7ff;
        }
        .chart-box h3 { font-size: 0.92rem; font-weight: 700; color: #444; margin: 0 0 14px; }
        .chart-box canvas { max-height: 260px; }

        /* Table */
        .income-table-wrap {
            background: #fff; border-radius: 14px;
            box-shadow: 0 2px 12px #6366f115; border: 1.5px solid #e0e7ff;
            overflow: hidden;
        }
        .event-row { cursor: pointer; border-bottom: 1px solid #f0f0f0; transition: background .15s; }
        .event-row:hover { background: #f5f3ff; }
        .detail-row { border-bottom: 1px solid #f0f0f0; }
        .expand-icon { font-size: 0.7rem; color: #6366f1; margin-right: 6px; transition: transform .2s; }
        .expand-hint {
            font-size: 0.78rem; color: #6366f1; background: #ede9fe;
            padding: 3px 10px; border-radius: 20px; font-weight: 600;
        }
        .sold-badge {
            display: inline-block; background: #dbeafe; color: #1d4ed8;
            padding: 3px 10px; border-radius: 20px; font-size: 0.82rem; font-weight: 700;
        }
        .sold-total { background: #ede9fe; color: #5b21b6; }
        .progress-wrap {
            height: 8px; background: #e5e7eb; border-radius: 99px; overflow: hidden;
        }
        .progress-bar {
            height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6);
            border-radius: 99px; transition: width .4s;
        }
    `;
    document.head.appendChild(style);
}