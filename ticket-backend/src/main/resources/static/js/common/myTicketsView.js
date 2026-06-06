/* ==========================================================
   js/customer/myTicketsView.js  (View)
   Render tab "Vé của tôi" — danh sách hoá đơn + filter.
   Phụ thuộc: common/helpers.js
   ========================================================== */

// Tính doanh thu đúng của 1 loại vé: gia × soLuong, trừ voucher phân bổ theo tỉ lệ
// thanhTienGocHD  = tổng (gia × soLuong) tất cả vé trong HĐ (chưa voucher)
// ve.thanhTienGoc = backend trả tổng HĐ chưa voucher (dùng để tính giamHD)
// ve.thanhTien    = backend trả tổng HĐ sau voucher
function _calcVeRevenue(ve, thanhTienGocHD) {
    const giaTien    = (ve.gia || 0) * (ve.soLuong || 0);
    const gocHoaDon  = thanhTienGocHD || giaTien;
    // giamHD = tổng HĐ gốc - tổng HĐ sau voucher (backend trả giống nhau cho mọi vé trong HĐ)
    const sauHoaDon  = ve.thanhTien    != null ? ve.thanhTien    : giaTien;
    const giamHoaDon = gocHoaDon - sauHoaDon;
    if (giamHoaDon <= 0 || gocHoaDon <= 0) return giaTien;
    const giamVe = Math.round(giamHoaDon * giaTien / gocHoaDon);
    return giaTien - giamVe;
}

const MyTicketsView = {
    // Cache group object theo maHoaDon — tránh JSON inject vào onclick
    _cache: new Map(),

    showLoading() {
        document.getElementById("myTicketsList").innerHTML =
            `<div class="loading-state"><div class="spinner"></div><p>Đang tải...</p></div>`;
    },

    showError(msg) {
        document.getElementById("myTicketsList").innerHTML = errorState(msg);
    },

    render(allMyTickets, activeFilter, onFilter, onHoanVe) {
        const container = document.getElementById("myTicketsList");
        this._cache.clear();

        const counts = {
            all:      allMyTickets.length,
            normal:   allMyTickets.filter(v => !v.trangThaiHoan).length,
            pending:  allMyTickets.filter(v => v.trangThaiHoan === "pending").length,
            approved: allMyTickets.filter(v => v.trangThaiHoan === "approved").length,
            rejected: allMyTickets.filter(v => v.trangThaiHoan === "rejected").length,
        };

        // Filter bar — dùng data-filter + bind sau khi render (tránh inject function)
        const filterBar = `<div class="my-filter-bar" id="myFilterBar">${[
            { key: "all",      label: "🎫 Tất cả",          cnt: counts.all },
            { key: "normal",   label: "✅ Đã thanh toán",   cnt: counts.normal },
            { key: "pending",  label: "⏳ Đang chờ hoàn",   cnt: counts.pending },
            { key: "approved", label: "💚 Hoàn thành công", cnt: counts.approved },
            { key: "rejected", label: "❌ Hoàn thất bại",   cnt: counts.rejected },
        ].map(t => `<button class="my-filter-btn ${activeFilter === t.key ? "active" : ""}"
            data-filter="${t.key}">
            ${t.label}${t.cnt > 0 ? ` <span class="filter-count">${t.cnt}</span>` : ""}
        </button>`).join("")}</div>`;

        let filtered = allMyTickets;
        if (activeFilter !== "all") {
            filtered = allMyTickets.filter(v =>
                activeFilter === "normal" ? !v.trangThaiHoan : v.trangThaiHoan === activeFilter
            );
        }

        if (!filtered.length) {
            container.innerHTML = filterBar + emptyState(
                "🎫",
                activeFilter === "all" ? "Bạn chưa có vé nào." : "Không có vé trong mục này."
            );
            this._bindFilterBar(onFilter);
            return;
        }


        // Gom theo hoá đơn
        const groups = new Map();
        filtered.forEach(ve => {
            if (!groups.has(ve.maHoaDon)) {
                groups.set(ve.maHoaDon, {
                    maHoaDon: ve.maHoaDon, ngayMua: ve.ngayMua, tenSuKien: ve.tenSuKien,
                    maSuKien: ve.maSuKien, thoiGianBatDau: ve.thoiGianBatDau,
                    thoiGianKetThuc: ve.thoiGianKetThuc, tickets: [],
                    maVoucher:  ve.maVoucher  || ve.MaVoucher  || null,
                    tenVoucher: ve.tenVoucher || ve.TenVoucher || null,
                    loaiGiam:   ve.loaiGiam   || ve.LoaiGiam   || null, // "%" hoặc "fixed"
                    giaTriGiam: ve.giaTriGiam || ve.GiaTriGiam || null, // % hoặc số tiền
                });
            }
            groups.get(ve.maHoaDon).tickets.push(ve);
        });

        // Backend trả thanhTien = tổng cả HĐ và thanhTienGoc = tổng HĐ chưa voucher
        // (giống nhau cho mọi row trong cùng 1 HĐ) → lấy từ row đầu tiên làm đại diện
        // rồi tính lại phân bổ voucher theo tỉ lệ gia × soLuong của từng loại vé
        groups.forEach(g => {
            const first  = g.tickets[0] || {};
            // tổng gốc HĐ (chưa voucher) — backend trả giống nhau cho mọi row
            const gocHD  = first.thanhTienGoc != null ? first.thanhTienGoc
                         : g.tickets.reduce((s, v) => s + (v.gia || 0) * (v.soLuong || 0), 0);
            // tổng sau voucher — backend trả giống nhau cho mọi row
            const sauHD  = first.thanhTien != null ? first.thanhTien : gocHD;
            const giamHD = gocHD - sauHD;  // tổng giảm của cả HĐ

            // tổng (gia × soLuong) tính lại từ chi tiết (dùng làm mẫu phân bổ)
            const tongGia = g.tickets.reduce((s, v) => s + (v.gia || 0) * (v.soLuong || 0), 0);

            g.thanhTienGoc = tongGia;
            g.thanhTien    = giamHD > 0 && tongGia > 0
                ? g.tickets.reduce((s, v) => {
                    const giaTien = (v.gia || 0) * (v.soLuong || 0);
                    return s + giaTien - Math.round(giamHD * giaTien / tongGia);
                  }, 0)
                : tongGia;
        });

        const blocksHtml = [...groups.values()].map((g, idx) => {
            // Lưu vào cache để onclick lấy lại bằng key thay vì JSON trong HTML
            const cacheKey = `hd_${g.maHoaDon}`;
            this._cache.set(cacheKey, g);

            const hasPending  = g.tickets.some(v => v.trangThaiHoan === "pending");
            const hasRejected = g.tickets.some(v => v.trangThaiHoan === "rejected");
            const hasApproved = g.tickets.some(v => v.trangThaiHoan === "approved");

            const totalConLai = g.tickets.reduce((sum, v) => {
                const soLuong = v.soLuong || 0;
                if (v.trangThaiHoan === "approved") {
                    const daHoan = v.soLuongHoan || soLuong;
                    return sum + Math.max(0, soLuong - daHoan);
                }
                return sum + soLuong;
            }, 0);

            const hdBadge = hasPending  ? `<span class="hd-badge badge-pending">⏳ Có yêu cầu đang chờ</span>`
                          : hasRejected ? `<span class="hd-badge badge-rejected">❌ Có hoàn bị từ chối</span>`
                          : hasApproved && totalConLai === 0 ? `<span class="hd-badge badge-approved">💚 Đã hoàn toàn bộ</span>`
                          : hasApproved ? `<span class="hd-badge badge-approved">💚 Một phần đã hoàn</span>`
                          : `<span class="hd-badge badge-paid">✅ Đã thanh toán</span>`;

            const showDiscount = g.thanhTienGoc && g.thanhTien && g.thanhTien < g.thanhTienGoc;
            const priceHtml = showDiscount
                ? `<span class="hd-price-old">${formatPrice(g.thanhTienGoc)}</span><span class="hd-price-new">${formatPrice(g.thanhTien)}</span>`
                : `<span class="hd-price-new">${formatPrice(g.thanhTien || 0)}</span>`;

            const rows = g.tickets.map(ve => `
                <div class="ticket-line ${ve.trangThaiHoan ? "ticket-line-hoan" : ""}">
                    <div class="ticket-line-left">
                        <span class="ticket-line-icon">🎟️</span>
                        <div class="ticket-line-info">
                            <div class="ticket-line-name">${escHtml(ve.tenVe || "—")}</div>
                            <div class="ticket-line-meta">
                                ${escHtml(ve.loaiVe || "—")} · SL: <strong>${ve.soLuong}</strong>
                                ${ve.trangThaiHoan === "approved" && ve.soLuongHoan
                                    ? ` · Hoàn: <strong style="color:#dc2626">${ve.soLuongHoan}</strong>` : ""}
                                · ${formatPrice(ve.gia)}/vé
                            </div>
                        </div>
                    </div>
                    <div class="ticket-line-right">
                        <div class="ticket-line-subtotal">${formatPrice(ve.gia * ve.soLuong)}</div>
                        ${this._buildHoanSection(ve, onHoanVe, cacheKey)}
                    </div>
                </div>`).join("");

            const exportBtn = totalConLai > 0
                ? `<button class="export-ticket-btn"
                      data-action="export-group" data-key="${cacheKey}">🖨️ Xuất vé</button>`
                : "";

            return `<div class="hoadon-block" style="animation-delay:${idx * 0.07}s;cursor:pointer"
                        data-action="open-detail" data-key="${cacheKey}">
                <div class="hoadon-header">
                    <div class="hoadon-header-left">
                        <span class="hoadon-num">Hóa đơn #${g.maHoaDon}</span>
                        <span class="hoadon-date">📅 ${formatDate(g.ngayMua)}</span>
                        <span class="hoadon-event">📍 ${escHtml(g.tenSuKien || "—")}</span>
                    </div>
                    <div class="hoadon-header-right">${hdBadge}<div class="hoadon-total">${priceHtml}</div>${exportBtn}</div>
                </div>
                <div class="ticket-lines">${rows}</div>
            </div>`;
        }).join("");

        container.innerHTML = filterBar + blocksHtml;
        this._bindFilterBar(onFilter);
        this._bindActions(onHoanVe);
        this._injectCSS();
    },

    // Bind filter bar buttons
    _bindFilterBar(onFilter) {
        document.querySelectorAll("#myFilterBar .my-filter-btn").forEach(btn => {
            btn.addEventListener("click", () => onFilter(btn.dataset.filter));
        });
    },

    // Bind tất cả action trong container bằng event delegation
    _bindActions(onHoanVe) {
        const container = document.getElementById("myTicketsList");
        container.addEventListener("click", e => {
            // Xuất vé cả nhóm
            const exportGroupBtn = e.target.closest("[data-action='export-group']");
            if (exportGroupBtn) {
                e.stopPropagation();
                const g = this._cache.get(exportGroupBtn.dataset.key);
                if (g) exportTickets(g);
                return;
            }

            // Xuất vé đơn lẻ
            const exportSingleBtn = e.target.closest("[data-action='export-single']");
            if (exportSingleBtn) {
                e.stopPropagation();
                const g = this._cache.get(exportSingleBtn.dataset.key);
                const maVe = Number(exportSingleBtn.dataset.mave);
                if (g) exportTickets(g, maVe);
                return;
            }

            // Mở modal chọn ghế để hoàn
            const hoanBtn = e.target.closest("[data-action='hoan-ve']");
            if (hoanBtn) {
                e.stopPropagation();
                const { mave, mahoadon, tenveSafe, masukien } = hoanBtn.dataset;
                MyTicketsView.openChonGheModal(
                    Number(mave), Number(mahoadon), decodeURIComponent(tenveSafe), onHoanVe,
                    masukien ? Number(masukien) : null   // truyền maSuKien để fetch địa điểm
                );
                return;
            }

            // Mở detail hóa đơn (click cả block)
            const block = e.target.closest("[data-action='open-detail']");
            if (block && !e.target.closest("button")) {
                const g = this._cache.get(block.dataset.key);
                if (g) window.openHoaDonDetail(g);
            }
        }, { capture: false });
    },

    /**
     * Build phần hoàn vé / badge cho từng dòng vé.
     * Dùng data-* thay vì inline JSON/function để tránh XSS.
     */
    _buildHoanSection(ve, onHoanVe, cacheKey) {
        const soLuong = ve.soLuong || 0;
        const daHoan  = ve.soLuongHoan || 0;
        const conLai  = Math.max(0, soLuong - daHoan);

        const exportSingle = conLai > 0
            ? `<button class="export-single-btn"
                  data-action="export-single"
                  data-key="${cacheKey}"
                  data-mave="${ve.maVe}">
                  🎫 Xuất vé${conLai < soLuong ? ` (${conLai})` : ""}
               </button>`
            : "";

        if (ve.trangThaiHoan === "approved") {
            if (conLai === 0)
                return `<span class="hoan-badge hoan-approved">💚 Đã hoàn ${daHoan > 0 ? daHoan + " vé" : ""}</span>`;
            // Hoàn một phần — vẫn còn ghế chưa hoàn → cho phép hoàn tiếp
            return `
                <span class="hoan-badge hoan-approved">💚 Hoàn ${daHoan} / ${soLuong} vé</span>
                <button class="hoan-ve-btn"
                    data-action="hoan-ve"
                    data-mave="${ve.maVe}"
                    data-mahoadon="${ve.maHoaDon}"
                    data-masukien="${ve.maSuKien || ""}"
                    data-tenve-safe="${encodeURIComponent(ve.tenVe || "")}">
                    🔄 Hoàn thêm (${conLai} còn lại)
                </button>
                ${exportSingle}`;
        }

        if (ve.trangThaiHoan === "pending") {
            return `<span class="hoan-badge hoan-pending">⏳ Chờ duyệt (${daHoan > 0 ? daHoan : "?"} vé)</span>
                    ${exportSingle}`;
        }

        if (ve.trangThaiHoan === "rejected") {
            return `
                <span class="hoan-badge hoan-rejected">❌ Bị từ chối</span>
                <button class="hoan-ve-btn"
                    data-action="hoan-ve"
                    data-mave="${ve.maVe}"
                    data-mahoadon="${ve.maHoaDon}"
                    data-masukien="${ve.maSuKien || ""}"
                    data-tenve-safe="${encodeURIComponent(ve.tenVe || "")}">
                    🔄 Gửi lại
                </button>
                ${exportSingle}`;
        }

        // Chưa hoàn → nút hoàn vé + nút xuất vé
        return `
            <button class="hoan-ve-btn"
                data-action="hoan-ve"
                data-mave="${ve.maVe}"
                data-mahoadon="${ve.maHoaDon}"
                    data-masukien="${ve.maSuKien || ""}"
                data-tenve-safe="${encodeURIComponent(ve.tenVe || "")}">
                🔄 Hoàn vé
            </button>
            ${exportSingle}`;
    },

    /**
     * Mở modal chọn ghế cụ thể trước khi gửi yêu cầu hoàn.
     * Đồng thời fetch thông tin địa điểm của vé để lấy loaiSoDo và sucChua,
     * giúp hiển thị đúng layout và giới hạn số ghế có thể chọn.
     *
     * @param {number} maVe
     * @param {number} maHoaDon
     * @param {string} tenVe
     * @param {Function} onHoanVe
     * @param {number|null} maSuKien - Truyền thêm để fetch địa điểm qua EventService.getVenueForEvent
     */
    openChonGheModal(maVe, maHoaDon, tenVe, onHoanVe, maSuKien) {
        // Xóa modal cũ nếu có
        document.getElementById("chonGheModal")?.remove();

        const modal = document.createElement("div");
        modal.id = "chonGheModal";
        modal.className = "cgm-overlay";
        modal.innerHTML = `
            <div class="cgm-box">
                <div class="cgm-header">
                    <div>
                        <div class="cgm-title">🔄 Chọn ghế muốn hoàn</div>
                        <div class="cgm-sub">${escHtml(tenVe)}</div>
                        <div id="cgmVenueInfo" style="font-size:.76rem;color:#0d9488;margin-top:4px;font-weight:600"></div>
                    </div>
                    <button class="cgm-close" id="cgmClose">✕</button>
                </div>
                <div class="cgm-body" id="cgmBody">
                    <div class="cgm-loading"><div class="spinner"></div><p>Đang tải ghế...</p></div>
                </div>
                <div class="cgm-footer">
                    <span class="cgm-selected-count" id="cgmCount">Chưa chọn ghế nào</span>
                    <div style="display:flex;gap:8px">
                        <button class="cgm-btn-cancel" id="cgmCancel">Hủy</button>
                        <button class="cgm-btn-submit" id="cgmSubmit" disabled>Tiếp tục →</button>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);

        const close = () => modal.remove();
        document.getElementById("cgmClose").onclick  = close;
        document.getElementById("cgmCancel").onclick = close;
        modal.addEventListener("click", e => { if (e.target === modal) close(); });

        // Fetch ghế + địa điểm song song
        const ghePromise    = fetch(`${BASE_URL}/ghe?maVe=${maVe}&maHoaDon=${maHoaDon}`).then(r => r.json());
        const venuePromise  = maSuKien
            ? (typeof EventService !== "undefined"
                ? EventService.getVenueForEvent(maSuKien)
                : fetch(`${BASE_URL}/sukien/${maSuKien}`)
                    .then(r => r.json())
                    .then(sk => sk?.maDiaDiem
                        ? fetch(`${BASE_URL}/diadiem/${sk.maDiaDiem}`).then(r => r.json())
                        : null))
            : Promise.resolve(null);

        Promise.allSettled([ghePromise, venuePromise]).then(([gheResult, venueResult]) => {
            // ── Thông tin địa điểm ──────────────────────────────────────────────
            const diaDiem   = venueResult.status === "fulfilled" ? venueResult.value : null;
            const sucChua   = diaDiem?.sucChua   ?? null;
            const loaiSoDo  = diaDiem?.loaiSoDo  ?? null;
            const tenDD     = diaDiem?.tenDiaDiem ?? null;

            const venueInfoEl = document.getElementById("cgmVenueInfo");
            if (venueInfoEl && diaDiem) {
                const layoutIcon = loaiSoDo === "Hình tròn" ? "⭕" : "▭";
                venueInfoEl.textContent =
                    `📍 ${tenDD || "—"}  ${layoutIcon} ${loaiSoDo || ""}` +
                    (sucChua ? `  · Sức chứa: ${sucChua.toLocaleString("vi-VN")} chỗ` : "");
            }

            // ── Danh sách ghế ───────────────────────────────────────────────────
            const body = document.getElementById("cgmBody");
            if (gheResult.status === "rejected" || !gheResult.value) {
                body.innerHTML = `<div class="cgm-empty" style="color:#e55">Không thể tải danh sách ghế.</div>`;
                return;
            }
            const gheList = gheResult.value;

            if (!gheList.length) {
                body.innerHTML = `<div class="cgm-empty">Không còn ghế nào có thể hoàn.</div>`;
                return;
            }

            // Nhóm theo khuVuc để hiển thị rõ hơn
            const byKhu = new Map();
            gheList.forEach(g => {
                const khu = g.khuVuc || "Khu vực khác";
                if (!byKhu.has(khu)) byKhu.set(khu, []);
                byKhu.get(khu).push(g);
            });

            // Cảnh báo sức chứa nếu số ghế vượt quá sucChua (data inconsistency)
            const availableCount = gheList.filter(g => g.trangThai !== "da_hoan").length;
            let warningHtml = "";
            if (sucChua != null && availableCount > sucChua) {
                warningHtml = `<div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:.78rem;color:#92400e">
                    ⚠️ Số ghế hiện tại (${availableCount}) vượt sức chứa địa điểm (${sucChua.toLocaleString("vi-VN")}). Vui lòng liên hệ quản trị viên.
                </div>`;
            }

            body.innerHTML = warningHtml + [...byKhu.entries()].map(([khu, ghes]) => `
                <div class="cgm-khu">
                    <div class="cgm-khu-label">${escHtml(khu)}</div>
                    <div class="cgm-ghe-grid">
                        ${ghes.map(g => {
                            const daHoan = g.trangThai === "da_hoan";
                            return `<button
                                class="cgm-ghe-btn${daHoan ? " cgm-ghe-hoan" : ""}"
                                data-maghe="${g.maGhe}"
                                ${daHoan ? "disabled title='Ghế đã được hoàn'" : ""}
                            >#${g.maGhe}${daHoan ? " ✓" : ""}</button>`;
                        }).join("")}
                    </div>
                </div>`).join("");

            // Toggle chọn ghế — giới hạn không vượt sucChua nếu có
            const selectedIds = new Set();
            const submitBtn   = document.getElementById("cgmSubmit");
            const countLabel  = document.getElementById("cgmCount");

            body.querySelectorAll(".cgm-ghe-btn:not([disabled])").forEach(btn => {
                btn.addEventListener("click", () => {
                    const id = Number(btn.dataset.maghe);
                    if (selectedIds.has(id)) {
                        selectedIds.delete(id);
                        btn.classList.remove("cgm-ghe-selected");
                    } else {
                        // Giới hạn số ghế chọn tối đa = sucChua (nếu có)
                        if (sucChua != null && selectedIds.size >= sucChua) {
                            countLabel.textContent = `⚠️ Tối đa ${sucChua} ghế (sức chứa địa điểm)`;
                            return;
                        }
                        selectedIds.add(id);
                        btn.classList.add("cgm-ghe-selected");
                    }
                    const n = selectedIds.size;
                    countLabel.textContent = n > 0
                        ? `Đã chọn ${n} ghế${sucChua != null ? ` / ${sucChua}` : ""}`
                        : "Chưa chọn ghế nào";
                    submitBtn.disabled = n === 0;
                });
            });

            // Tiếp tục → mở form nhập lý do rồi submit
            submitBtn.onclick = () => {
                if (!selectedIds.size) return;
                this._showLyDoForm([...selectedIds], maVe, maHoaDon, tenVe, onHoanVe, modal);
            };
        });
    },

    /** Bước 2: nhập lý do rồi gọi onHoanVe */
    _showLyDoForm(maGheList, maVe, maHoaDon, tenVe, onHoanVe, modal) {
        const body = modal.querySelector(".cgm-body");
        body.innerHTML = `
            <div style="padding:8px 0">
                <div class="cgm-khu-label" style="margin-bottom:8px">
                    Ghế đã chọn: <strong>${maGheList.join(", ")}</strong>
                </div>
                <label class="cgm-label">Lý do hoàn vé</label>
                <textarea id="cgmLyDo" class="cgm-textarea"
                    placeholder="Nhập lý do (không bắt buộc)..." rows="3"></textarea>
            </div>`;

        const footer  = modal.querySelector(".cgm-footer");
        const submit  = footer.querySelector(".cgm-btn-submit");
        const countLb = footer.querySelector(".cgm-selected-count");
        countLb.textContent = `${maGheList.length} ghế được chọn`;
        submit.disabled     = false;
        submit.textContent  = "Gửi yêu cầu hoàn";

        submit.onclick = () => {
            const lyDo = document.getElementById("cgmLyDo").value.trim();
            modal.remove();
            // onHoanVe nhận thêm mảng maGheList và lyDo
            onHoanVe(maVe, maHoaDon, maGheList, lyDo, tenVe);
        };
    },

    _injectCSS() {
        if (document.getElementById("my-ticket-style")) return;
        const s = document.createElement("style");
        s.id = "my-ticket-style";
        s.textContent = `
        .my-filter-bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
        .my-filter-btn{display:flex;align-items:center;gap:6px;padding:8px 16px;border-radius:20px;border:1.5px solid #e0e0e0;background:#f8f9fb;font-size:.83rem;font-weight:600;color:#666;cursor:pointer;font-family:'Inter',sans-serif;transition:.18s}
        .my-filter-btn:hover{border-color:#0d9488;color:#0d9488}
        .my-filter-btn.active{background:#0d9488;border-color:#0d9488;color:#fff}
        .filter-count{background:rgba(0,0,0,.12);font-size:.75rem;font-weight:700;padding:1px 7px;border-radius:20px;min-width:20px;text-align:center}
        .my-filter-btn.active .filter-count{background:rgba(255,255,255,.25)}
        .hoadon-block{background:#fff;border-radius:18px;box-shadow:0 2px 12px rgba(0,0,0,.07);overflow:hidden;margin-bottom:18px;animation:fadeUp .4s ease both}
        .hoadon-header{display:flex;align-items:flex-start;justify-content:space-between;padding:18px 22px 14px;flex-wrap:wrap;gap:10px;border-bottom:1px solid #f0f0f0;background:#fafafa}
        .hoadon-header-left{display:flex;flex-direction:column;gap:4px}
        .hoadon-num{font-size:1rem;font-weight:800;color:#1a1a2e;font-family:'Inter',sans-serif}
        .hoadon-date,.hoadon-event{font-size:.82rem;color:#888;font-family:'Inter',sans-serif}
        .hoadon-event{color:#555;font-weight:600}
        .hoadon-header-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px}
        .hoadon-total{display:flex;align-items:baseline;gap:8px}
        .hd-price-old{font-size:.82rem;color:#bbb;text-decoration:line-through;font-family:'Inter',sans-serif}
        .hd-price-new{font-size:1.15rem;font-weight:800;color:#0d9488;font-family:'Inter',sans-serif}
        .hd-badge{font-size:.75rem;font-weight:700;padding:4px 12px;border-radius:20px;font-family:'Inter',sans-serif}
        .badge-paid{background:#dcfce7;color:#15803d}.badge-pending{background:#fef3c7;color:#92400e}
        .badge-rejected{background:#fee2e2;color:#991b1b}.badge-approved{background:#d1fae5;color:#065f46}
        .ticket-lines{padding:0 22px 6px}
        .ticket-line{display:flex;align-items:flex-start;justify-content:space-between;padding:14px 0;border-bottom:1px solid #f5f5f5;gap:12px;flex-wrap:wrap}
        .ticket-line:last-child{border-bottom:none}
        .ticket-line-hoan{background:#fffbf0;border-radius:10px;padding:14px 12px;margin:4px -12px}
        .ticket-line-left{display:flex;align-items:flex-start;gap:12px;flex:1}
        .ticket-line-icon{font-size:1.5rem;min-width:28px}
        .ticket-line-name{font-size:.95rem;font-weight:700;color:#1a1a2e;font-family:'Inter',sans-serif;margin-bottom:3px}
        .ticket-line-meta{font-size:.8rem;color:#888;font-family:'Inter',sans-serif}
        .ticket-line-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;min-width:120px}
        .ticket-line-subtotal{font-size:1rem;font-weight:700;color:#1a1a2e;font-family:'Inter',sans-serif}
        .hoan-badge{font-size:.75rem;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block;font-family:'Inter',sans-serif}
        .hoan-approved{background:#d1fae5;color:#065f46}.hoan-pending{background:#fef3c7;color:#92400e}.hoan-rejected{background:#fee2e2;color:#991b1b}
        .hoan-ve-btn{background:#f59e0b;color:#fff;border:none;border-radius:10px;padding:5px 12px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:.18s;white-space:nowrap}
        .hoan-ve-btn:hover{background:#d97706}
        .export-ticket-btn{background:#0d9488;color:#fff;border:none;border-radius:12px;padding:6px 14px;font-size:.78rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:.18s;white-space:nowrap}
        .export-ticket-btn:hover{background:#0f766e}
        .export-single-btn{background:#6366f1;font-size:.74rem;padding:5px 11px;border-radius:10px;border:none;color:#fff;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:.18s;white-space:nowrap}
        .export-single-btn:hover{background:#4f46e5}

        /* ── Modal chọn ghế ── */
        .cgm-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px}
        .cgm-box{background:#fff;border-radius:20px;width:100%;max-width:520px;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.18);overflow:hidden}
        .cgm-header{display:flex;align-items:flex-start;justify-content:space-between;padding:20px 22px 14px;border-bottom:1px solid #f0f0f0}
        .cgm-title{font-size:1.05rem;font-weight:800;color:#1a1a2e;font-family:'Inter',sans-serif}
        .cgm-sub{font-size:.82rem;color:#888;margin-top:3px;font-family:'Inter',sans-serif}
        .cgm-close{background:none;border:none;font-size:1.1rem;cursor:pointer;color:#aaa;padding:4px 8px;border-radius:8px}
        .cgm-close:hover{background:#f3f4f6;color:#333}
        .cgm-body{flex:1;overflow-y:auto;padding:16px 22px}
        .cgm-loading{text-align:center;padding:40px 0;color:#888}
        .cgm-empty{text-align:center;padding:40px 0;color:#aaa;font-size:.9rem}
        .cgm-khu{margin-bottom:18px}
        .cgm-khu-label{font-size:.78rem;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;font-family:'Inter',sans-serif}
        .cgm-ghe-grid{display:flex;flex-wrap:wrap;gap:8px}
        .cgm-ghe-btn{padding:7px 13px;border-radius:10px;border:1.5px solid #e0e0e0;background:#f8f9fb;font-size:.82rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;transition:.15s;color:#444}
        .cgm-ghe-btn:hover:not([disabled]){border-color:#0d9488;color:#0d9488;background:#f0fdfb}
        .cgm-ghe-btn.cgm-ghe-selected{background:#0d9488;border-color:#0d9488;color:#fff}
        .cgm-ghe-btn.cgm-ghe-hoan{background:#f3f4f6;color:#bbb;border-color:#e5e7eb;cursor:not-allowed;text-decoration:line-through}
        .cgm-footer{display:flex;align-items:center;justify-content:space-between;padding:14px 22px;border-top:1px solid #f0f0f0;background:#fafafa;gap:12px;flex-wrap:wrap}
        .cgm-selected-count{font-size:.83rem;color:#666;font-family:'Inter',sans-serif;font-weight:600}
        .cgm-btn-cancel{padding:8px 18px;border-radius:10px;border:1.5px solid #e0e0e0;background:#fff;font-size:.83rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;color:#555}
        .cgm-btn-cancel:hover{border-color:#aaa}
        .cgm-btn-submit{padding:8px 20px;border-radius:10px;border:none;background:#0d9488;color:#fff;font-size:.83rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:.18s}
        .cgm-btn-submit:hover:not([disabled]){background:#0f766e}
        .cgm-btn-submit[disabled]{background:#ccc;cursor:not-allowed}
        .cgm-label{display:block;font-size:.82rem;font-weight:600;color:#555;margin-bottom:6px;font-family:'Inter',sans-serif}
        .cgm-textarea{width:100%;border:1.5px solid #e0e0e0;border-radius:10px;padding:10px 12px;font-size:.85rem;font-family:'Inter',sans-serif;resize:vertical;outline:none;box-sizing:border-box}
        .cgm-textarea:focus{border-color:#0d9488}`;
        document.head.appendChild(s);
    },
};
// ── Fix: định nghĩa openHoaDonDetail bị thiếu ──────────────
window.openHoaDonDetail = function(g) {
    document.getElementById("hoaDonDetailOverlay")?.remove();

    const giamHD = (g.thanhTienGoc || 0) - (g.thanhTien || 0);

    // Dòng voucher — hiển thị chi tiết nếu có
    let voucherHtml = "";
    if (giamHD > 0) {
        const tenV      = g.tenVoucher || g.maVoucher || null;
        const loai      = (g.loaiGiam  || "").toString().trim();
        const giaTriRaw = g.giaTriGiam;

        // Mô tả mức giảm: ưu tiên loaiGiam + giaTriGiam, fallback sang số tiền thực tế
        let mucGiamText = "";
        if (giaTriRaw != null && giaTriRaw > 0) {
            if (loai === "%" || loai.toLowerCase() === "phan_tram" || loai.toLowerCase() === "phantram") {
                mucGiamText = `${giaTriRaw}% → tiết kiệm ${formatPrice(giamHD)}`;
            } else {
                mucGiamText = `giảm ${formatPrice(giaTriRaw)}`;
            }
        } else {
            mucGiamText = `tiết kiệm ${formatPrice(giamHD)}`;
        }

        voucherHtml = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;padding:10px 0;border-bottom:1px solid #f5f5f5;font-family:'Inter',sans-serif;font-size:.88rem">
            <span style="color:#888;font-weight:600">Voucher</span>
            <span style="text-align:right">
                ${tenV ? `<span style="background:#fef3c7;color:#92400e;font-weight:700;padding:2px 8px;border-radius:6px;font-size:.8rem;margin-right:6px">${escHtml(tenV)}</span>` : ""}
                <span style="color:#dc2626;font-weight:700">−${formatPrice(giamHD)}</span>
                <div style="font-size:.76rem;color:#aaa;margin-top:2px">${mucGiamText}</div>
            </span>
        </div>`;
    }

    const showDiscount = giamHD > 0;
    const priceHtml = showDiscount
        ? `<span style="text-decoration:line-through;color:#bbb;font-size:.85rem;margin-right:6px">${formatPrice(g.thanhTienGoc)}</span><span style="color:#0d9488;font-size:1.1rem;font-weight:800">${formatPrice(g.thanhTien)}</span>`
        : `<span style="color:#0d9488;font-size:1.1rem;font-weight:800">${formatPrice(g.thanhTien || 0)}</span>`;

    const ticketRows = (g.tickets || []).map(ve => `
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f5f5f5;font-size:.88rem;font-family:'Inter',sans-serif">
            <span>🎟️ ${escHtml(ve.tenVe || ve.loaiVe || "—")} × ${ve.soLuong}</span>
            <span style="font-weight:700">${formatPrice((ve.gia || 0) * (ve.soLuong || 0))}</span>
        </div>`).join("");

    const overlay = document.createElement("div");
    overlay.id = "hoaDonDetailOverlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px";

    overlay.innerHTML = `
        <div style="background:#fff;border-radius:20px;width:100%;max-width:520px;max-height:88vh;display:flex;flex-direction:column;box-shadow:0 8px 40px rgba(0,0,0,.22);overflow:hidden">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:20px 22px 14px;border-bottom:1px solid #f0f0f0;background:#fafafa">
                <div>
                    <div style="font-size:1.05rem;font-weight:800;color:#1a1a2e;font-family:'Inter',sans-serif">🧾 Hóa đơn #${g.maHoaDon}</div>
                    <div style="font-size:.82rem;color:#888;margin-top:3px;font-family:'Inter',sans-serif">📅 ${formatDate(g.ngayMua)}</div>
                </div>
                <button id="_hdCloseX" style="background:none;border:none;font-size:1.1rem;cursor:pointer;color:#aaa;padding:4px 8px;border-radius:8px">✕</button>
            </div>
            <div style="flex:1;overflow-y:auto;padding:18px 22px">
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f5f5f5;font-family:'Inter',sans-serif;font-size:.88rem">
                    <span style="color:#888;font-weight:600">Sự kiện</span>
                    <span style="font-weight:700;text-align:right">${escHtml(g.tenSuKien || "—")}</span>
                </div>
                <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f5f5f5;font-family:'Inter',sans-serif;font-size:.88rem">
                    <span style="color:#888;font-weight:600">Thời gian</span>
                    <span style="font-weight:700">${formatDate(g.thoiGianBatDau) || "—"}</span>
                </div>
                ${voucherHtml}
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f5f5f5;font-family:'Inter',sans-serif;font-size:.88rem">
                    <span style="color:#888;font-weight:600">Tổng tiền</span>
                    <span>${priceHtml}</span>
                </div>
                <div style="background:#f8f9fb;border-radius:12px;padding:12px 14px;margin-top:12px">
                    <div style="font-size:.78rem;font-weight:700;color:#0d9488;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;font-family:'Inter',sans-serif">Chi tiết vé</div>
                    ${ticketRows}
                </div>
            </div>
            <div style="padding:14px 22px;border-top:1px solid #f0f0f0;background:#fafafa;text-align:right">
                <button id="_hdCloseBtn" style="padding:9px 24px;border-radius:10px;border:1.5px solid #e0e0e0;background:#fff;font-size:.85rem;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;color:#555">Đóng</button>
            </div>
        </div>`;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector("#_hdCloseX").onclick   = close;
    overlay.querySelector("#_hdCloseBtn").onclick = close;
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });
};