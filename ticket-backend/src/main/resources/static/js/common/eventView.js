/* ==========================================================
   js/customer/eventView.js  (View)
   Render danh sách sự kiện, modal mua vé, modal hoàn vé.
   Phụ thuộc: common/helpers.js, common/ui.js
   ========================================================== */

const EventView = {
    /* ── DANH SÁCH SỰ KIỆN ─────────────────────────────── */

    renderEvents(data, onBuy) {
        const grid = document.getElementById("eventGrid");
        if (!data.length) {
            grid.innerHTML = emptyState("🎪", "Không tìm thấy sự kiện nào.");
            return;
        }
        grid.innerHTML = data.map((sk, idx) => `
            <div class="event-card-customer" style="animation-delay:${idx * 0.06}s">
                <div class="card-color-bar"></div>
                <div class="card-body">
                    <h3 class="card-event-name">${escHtml(sk.tenSuKien)}</h3>
                    <div id="org-${sk.maSuKien}" class="card-organizer">
                        <span style="color:#ccc;font-size:0.78rem">🏢 Đang tải...</span>
                    </div>
                    <div id="venue-${sk.maSuKien}" class="card-organizer">
                        <span style="color:#ccc;font-size:0.78rem">📍 Đang tải...</span>
                    </div>
                    <p class="card-event-desc">${escHtml(sk.moTa || "Không có mô tả")}</p>
                    <div class="card-dates">
                        <span class="date-badge">📅 ${formatDate(sk.thoiGianBatDau)}</span>
                        <span class="date-badge">🏁 ${formatDate(sk.thoiGianKetThuc)}</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div>
                        <span class="ticket-count-badge" id="min-price-${sk.maSuKien}">Đang tải...</span>
                        <span id="stock-badge-${sk.maSuKien}" style="display:block;font-size:.75rem;color:#aaa;margin-top:2px"></span>
                    </div>
                    <button class="buy-btn" onclick="${onBuy}(${sk.maSuKien})">Mua vé</button>
                </div>
            </div>`).join("");
    },

    updateOrganizerCard(maSuKien, org) {
        const el = document.getElementById(`org-${maSuKien}`);
        if (!el || !org) return;
        el.innerHTML = `
            <span style="font-size:.8rem;color:#0d9488;font-weight:600">🏢 ${escHtml(org.tenCongTy || "—")}</span>
            ${org.tenNguoiDaiDien ? `<span style="font-size:.75rem;color:#888"> · ${escHtml(org.tenNguoiDaiDien)}</span>` : ""}`;
    },

    updateVenueCard(maSuKien, diaDiem) {
        const el = document.getElementById(`venue-${maSuKien}`);
        if (!el) return;
        if (!diaDiem) {
            el.innerHTML = '';
            return;
        }
        el.innerHTML =
            `<span style="font-size:.8rem;color:#555;font-weight:600">📍 ${escHtml(diaDiem.tenDiaDiem || "—")}</span>` +
            (diaDiem.diaChi ? `<span style="font-size:.75rem;color:#888"> · ${escHtml(diaDiem.diaChi)}</span>` : "");
    },

    updatePriceStock(maSuKien, tickets) {
        const priceEl = document.getElementById(`min-price-${maSuKien}`);
        const stockEl = document.getElementById(`stock-badge-${maSuKien}`);
        if (priceEl) {
            priceEl.textContent = tickets.length
                ? "Từ " + formatPrice(Math.min(...tickets.map(v => v.gia)))
                : "Liên hệ";
        }
        if (stockEl && tickets.length) {
            const totalConLai  = tickets.reduce((s, v) => s + (v.conLai  ?? 0), 0);
            const totalSoLuong = tickets.reduce((s, v) => s + (v.soLuong ?? 0), 0);
            if (totalSoLuong > 0) {
                if (totalConLai === 0)
                    stockEl.innerHTML = `<span style="color:#dc2626;font-weight:700">Hết vé</span>`;
                else if (totalConLai <= 10)
                    stockEl.innerHTML = `<span style="color:#ea580c;font-weight:700">🔥 Còn ${totalConLai} vé</span>`;
                else
                    stockEl.textContent = `Còn ${totalConLai.toLocaleString("vi-VN")} vé`;
            }
        }
    },

    /* ── MODAL MUA VÉ ───────────────────────────────────── */

    /**
     * @param {object} sk           - Sự kiện
     * @param {object|null} diaDiem - Địa điểm (có sucChua, loaiSoDo, tenDiaDiem).
     *                                Truyền null nếu không có / chưa load được.
     */
    openBuyModal(sk, diaDiem) {
        document.getElementById("buyMsg").textContent = "";
        document.getElementById("buyMsg").className   = "buy-msg";
        const vi = document.getElementById("voucherInput");  if (vi) vi.value = "";
        const vm = document.getElementById("voucherMsg");    if (vm) { vm.textContent = ""; vm.className = "buy-msg"; }
        const vld = document.getElementById("voucherListDrop"); if (vld) vld.style.display = "none";

        document.getElementById("modalEventName").textContent = sk.tenSuKien;
        document.getElementById("modalEventDate").textContent = `📅 ${formatDate(sk.thoiGianBatDau)} → ${formatDate(sk.thoiGianKetThuc)}`;

        // ── Hiển thị địa điểm + sức chứa + loại sơ đồ ghế ──────────────────────
        const venueEl = document.getElementById("modalVenueInfo");
        if (venueEl) {
            if (diaDiem) {
                const layoutIcon = diaDiem.loaiSoDo === "Hình tròn" ? "⭕" : "▭";
                venueEl.innerHTML =
                    `<span style="font-size:.82rem;color:#0d9488;font-weight:600">` +
                    `📍 ${escHtml(diaDiem.tenDiaDiem || "—")}</span>` +
                    `<span style="font-size:.78rem;color:#888;margin-left:8px">` +
                    `${layoutIcon} ${escHtml(diaDiem.loaiSoDo || "")}` +
                    `${diaDiem.sucChua ? ` · Sức chứa: <strong>${diaDiem.sucChua.toLocaleString("vi-VN")}</strong> chỗ` : ""}` +
                    `</span>`;
                venueEl.style.display = "block";
            } else {
                venueEl.style.display = "none";
            }
        }

        // Lưu thông tin địa điểm vào dataset để renderModalTickets dùng khi tính max ghế
        const buyModal = document.getElementById("buyModal");
        if (buyModal) {
            buyModal.dataset.sucChua   = diaDiem?.sucChua   ?? "";
            buyModal.dataset.loaiSoDo  = diaDiem?.loaiSoDo  ?? "";
            buyModal.dataset.maDiaDiem = diaDiem?.maDiaDiem ?? "";
        }

        document.getElementById("modalTicketList").innerHTML  = `<div class="loading-state"><div class="spinner"></div><p>Đang tải vé...</p></div>`;
        openModal("buyModal", "buyOverlay");
    },

    closeBuyModal() { closeModal("buyModal", "buyOverlay"); },

    /**
     * @param {Array}  tickets       - Danh sách vé của sự kiện
     * @param {object} cartModel     - Giỏ hàng hiện tại
     * @param {string} onChangeQty   - Tên hàm xử lý nút ± (dùng trong onclick string)
     * @param {string} onInputQty    - Tên hàm xử lý input trực tiếp
     * @param {number|null} sucChua  - Sức chứa địa điểm; dùng làm trần max khi conLai = null.
     *                                 Nếu null → fallback về 9999 (không giới hạn).
     */
    renderModalTickets(tickets, cartModel, onChangeQty, onInputQty, sucChua) {
        const list         = document.getElementById("modalTicketList");
        const voucherRow   = document.getElementById("voucherRow");
        const modalSummary = document.getElementById("modalSummary");

        // Đọc sucChua từ dataset nếu caller không truyền (backward-compat)
        if (sucChua == null) {
            const stored = document.getElementById("buyModal")?.dataset.sucChua;
            sucChua = stored ? Number(stored) : null;
        }

        if (!tickets.length) {
            list.innerHTML = emptyState("😔", "Sự kiện này chưa có vé nào.");
            if (voucherRow)   voucherRow.style.display   = "none";
            if (modalSummary) modalSummary.style.display = "none";
            return;
        }

        const hasAvailable = tickets.some(v => v.conLai == null || v.conLai > 0);
        if (voucherRow)   voucherRow.style.display   = hasAvailable ? "block" : "none";
        if (modalSummary) modalSummary.style.display = hasAvailable ? "flex"  : "none";

        list.innerHTML = tickets.map(ve => {
            const conLai  = ve.conLai  ?? null;
            const soLuong = ve.soLuong ?? null;
            const daBan   = ve.daBan   ?? null;
            // capacity = soLuong của loại vé này (KHÔNG dùng sucChua toàn sân làm capacity từng khu)
            const capacity = soLuong ?? null;
            const pct     = capacity != null && capacity > 0 && daBan != null ? Math.round((daBan / capacity) * 100) : null;
            const lowStock = conLai != null && conLai > 0 && conLai <= 10;
            const soldOut  = conLai != null && conLai === 0 && capacity != null && capacity > 0;
            const dis = soldOut ? "disabled" : "";
            // max số lượng mua: ưu tiên conLai → soLuong của khu → fallback 9999
            const max = conLai ?? soLuong ?? 9999;

            return `
            <div class="modal-ticket-row" style="${soldOut ? "opacity:.65" : ""}">
                <div class="modal-ticket-info" style="flex:1">
                    <div style="display:flex;align-items:center;gap:8px">
                        <div class="modal-ticket-name">${escHtml(ve.tenVe)}</div>
                        ${soldOut ? '<span style="background:#fee2e2;color:#dc2626;font-size:.7rem;font-weight:700;padding:2px 8px;border-radius:20px">HẾT VÉ</span>' : ""}
                    </div>
                    <div class="modal-ticket-type">${escHtml(ve.loaiVe || "")}</div>
                    <div style="display:flex;gap:7px;flex-wrap:wrap;margin-top:7px;align-items:center">
                        ${capacity != null ? chip(capacity.toLocaleString("vi-VN") + " chỗ", "#e0f2fe", "#0369a1") : ""}
                        ${daBan   != null ? chip("Đã bán: " + daBan.toLocaleString("vi-VN"), "#f3f4f6", "#555") : ""}
                        ${conLai  != null
                            ? lowStock
                                ? chip("🔥 Còn " + conLai, "#fff7ed", "#ea580c")
                                : chip("✅ Còn " + conLai.toLocaleString("vi-VN"), "#dcfce7", "#15803d")
                            : ""}
                    </div>
                    ${pct != null ? `
                    <div style="background:#f3f4f6;border-radius:20px;height:4px;margin-top:8px;overflow:hidden;max-width:220px">
                        <div style="width:${pct}%;height:100%;background:${pct >= 90 ? "#ef4444" : pct >= 60 ? "#f59e0b" : "#3cdbd8"};border-radius:20px;transition:width .4s"></div>
                    </div>` : ""}
                </div>
                <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;min-width:120px">
                    <div class="modal-ticket-price-tag">${formatPrice(ve.gia)}</div>
                    <div class="qty-control">
                        <button class="qty-btn" id="qty-minus-${ve.maVe}" onclick="${onChangeQty}(${ve.maVe},-1,${max})" ${dis} disabled>−</button>
                        <input type="number" min="0" max="${max}" value="0"
                               class="qty-input" id="qty-${ve.maVe}" ${dis}
                               oninput="${onInputQty}(${ve.maVe},${max})">
                        <button class="qty-btn" id="qty-plus-${ve.maVe}" onclick="${onChangeQty}(${ve.maVe},1,${max})" ${dis}>+</button>
                    </div>
                </div>
            </div>`;
        }).join("");
    },

    syncQtyInput(maVe, value) {
        const input = document.getElementById(`qty-${maVe}`);
        if (input) input.value = value;
    },

    syncQtyButtons(maVe, qty, max) {
        const btnMinus = document.getElementById(`qty-minus-${maVe}`);
        const btnPlus  = document.getElementById(`qty-plus-${maVe}`);
        if (btnMinus) btnMinus.disabled = qty <= 0;
        if (btnPlus)  btnPlus.disabled  = qty >= max;
    },

    renderTotal(subtotal, discount) {
        const el = document.getElementById("totalPrice");
        if (!el) return;
        if (discount > 0) {
            const sau = Math.round(subtotal * (1 - discount / 100));
            el.innerHTML = `
                <span style="text-decoration:line-through;color:#aaa;font-weight:400">${formatPrice(subtotal)}</span>
                &nbsp;→&nbsp;<span style="color:#e55">${formatPrice(sau)}</span>
                <span style="font-size:.8rem;color:#e55;font-weight:600"> (-${discount}%)</span>`;
        } else {
            el.textContent = formatPrice(subtotal);
        }
    },

    showBuyMsg(text, type) {
        const el = document.getElementById("buyMsg");
        el.textContent = text;
        el.className   = "buy-msg " + type;
    },

    showVoucherMsg(text, type) {
        const el = document.getElementById("voucherMsg");
        el.textContent = text;
        el.className   = "buy-msg " + type;
    },

    /* ── VOUCHER DROPDOWN ───────────────────────────────── */

    renderVoucherList(vouchers, onSelectFn) {
        const el = document.getElementById("voucherListDrop");
        if (!vouchers.length) {
            el.innerHTML = `<div style="padding:20px;text-align:center;color:#aaa;font-size:.85rem">Không có voucher khả dụng</div>`;
            return;
        }
        const selected = document.getElementById("voucherInput")?.value.trim() || "";
        el.innerHTML = vouchers.map(v => `
            <div class="voucher-item${v.maCode === selected ? ' selected' : ''}"
                 onclick="${onSelectFn}('${v.maCode}')">
                <div>
                    <div class="voucher-code">${v.maCode}</div>
                    <div class="voucher-desc">${v.tenVoucher || ''}</div>
                </div>
                <div class="voucher-badge">-${v.mucKhuyenMai}%</div>
            </div>
        `).join("");
    },

    /* ── MODAL THANH TOÁN ───────────────────────────────── */

    openPaymentModal() {
        closeModal("buyModal", "buyOverlay");
        openModal("paymentModal", "paymentOverlay");
        document.getElementById("bankSection").style.display = "none";
        document.getElementById("cashSection").style.display = "none";
        document.getElementById("paymentMsg").textContent    = "";
    },

    closePaymentModal() { closeModal("paymentModal", "paymentOverlay"); },

    showPaymentSection(method) {
        document.getElementById("bankSection").style.display = method === "Chuyển khoản ngân hàng" ? "block" : "none";
        document.getElementById("cashSection").style.display = method === "Tiền mặt"    ? "block" : "none";
    },

    showPaymentMsg(text) {
        document.getElementById("paymentMsg").textContent = text;
    },

    getCashReceive() {
        return Number(document.getElementById("cashReceive").value) || 0;
    },

    showCashBack(amount) {
        document.getElementById("cashBack").value = amount > 0 ? formatPrice(amount) : "0 ₫";
    },

    /* ── MODAL HOÀN VÉ ──────────────────────────────────── */

    openHoanVeModal(maVe, maHoaDon, soLuongMua, tenVe) {
        document.getElementById("hoanVeInfo").textContent      = `Vé: ${tenVe} — HĐ #${maHoaDon} — Đã mua: ${soLuongMua}`;
        document.getElementById("hoanQtyDisplay").textContent  = 1;
        document.getElementById("hoanQtyMax").textContent      = `(tối đa ${soLuongMua})`;
        document.getElementById("hoanLyDo").value              = "";
        document.getElementById("hoanVeMsg").textContent       = "";
        document.getElementById("hoanVeMsg").className         = "buy-msg";
        openModal("hoanVeModal", "hoanVeOverlay");
    },

    closeHoanVeModal() { closeModal("hoanVeModal", "hoanVeOverlay"); },

    setHoanQtyDisplay(qty) {
        document.getElementById("hoanQtyDisplay").textContent = qty;
    },

    getHoanLyDo() {
        return document.getElementById("hoanLyDo").value.trim();
    },

    showHoanVeMsg(text, type) {
        const el = document.getElementById("hoanVeMsg");
        el.textContent = text;
        el.className   = "buy-msg " + type;
    },

    setHoanBtnState(loading) {
        const btn = document.getElementById("confirmHoanBtn");
        btn.disabled    = loading;
        btn.textContent = loading ? "Đang xử lý..." : "Xác nhận hoàn vé";
    },
};