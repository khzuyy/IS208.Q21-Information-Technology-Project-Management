/* ==========================================================
   js/customer/customerController.js
   ========================================================== */

const currentUser = JSON.parse(localStorage.getItem("user"));

// ── STATE ────────────────────────────────────────────────
let allEvents             = [];
let allVouchersForEvent   = [];
window.currentEvent = null;   // expose để patch script truy cập
let _purchasedTicketTypes = [];
window.finalTotal = 0;            // expose để patch script truy cập

// ── KHỞI ĐỘNG ────────────────────────────────────────────
window.addEventListener("DOMContentLoaded", () => {
    if (!currentUser) { window.location.href = "loginpopup.html"; return; }
    const el = document.getElementById("welcomeName");
    if (el) el.textContent = currentUser.tenDangNhap || "bạn";
    loadAllEvents();
    // Load sẵn vé đã mua để lọc khi mở modal (không cần chờ vào tab Vé của tôi)
    loadMyTicketsSilent();
});

// ── TAB ──────────────────────────────────────────────────
function onTabSwitch(tabName) {
    if (tabName === "myTickets") loadMyTickets();
}
const _showTab = showTab;
window.showTab = (name) => _showTab(name, onTabSwitch);

// Load ngầm vé đã mua để lọc trong modal mua vé
function loadMyTicketsSilent() {
    if (!currentUser?.maTaiKhoan) return;
    OrderService.getByCustomer(currentUser.maTaiKhoan)
        .then(orders => {
            // Dùng biến riêng để không ghi đè allMyTickets của tab "Vé của tôi"
            _purchasedTicketTypes = orders.flatMap(o =>
                (o.tickets || []).map(t => ({
                    maSuKien: o.maSuKien,
                    loaiVe:   t.loaiVe || "",
                }))
            );
        })
        .catch(() => { /* Lỗi load ngầm — bỏ qua, không ảnh hưởng UI */ });
}

// ── SỰ KIỆN ─────────────────────────────────────────────
function loadAllEvents() {
    EventService.getAll()
        .then(data => {
            allEvents = data;
            EventView.renderEvents(data, "openBuyModal");
            data.forEach(sk => loadEventMeta(sk));
        })
        .catch(err => {
            document.getElementById("eventGrid").innerHTML = errorState(err.message);
        });
}

function loadEventMeta(sk) {
    EventService.getTicketsByEvent(sk.maSuKien)
        .then(tickets => EventView.updatePriceStock(sk.maSuKien, tickets))
        .catch(() => {});

    const loadOrg = (maCongTy) =>
        EventService.getOrganizer(maCongTy)
            .then(org => EventView.updateOrganizerCard(sk.maSuKien, org))
            .catch(() => {});

    if (sk.maCongTy) {
        loadOrg(sk.maCongTy);
    } else {
        EventService.getById(sk.maSuKien)
            .then(detail => { if (detail?.maCongTy) loadOrg(detail.maCongTy); })
            .catch(() => {});
    }

    // Địa điểm tổ chức
    const loadVenue = (maDiaDiem) =>
        EventService.getDiaDiem(maDiaDiem)
            .then(dd => EventView.updateVenueCard(sk.maSuKien, dd))
            .catch(() => {});

    if (sk.maDiaDiem) {
        loadVenue(sk.maDiaDiem);
    } else {
        EventService.getById(sk.maSuKien)
            .then(detail => { if (detail?.maDiaDiem) loadVenue(detail.maDiaDiem); })
            .catch(() => {});
    }
}

function applyEventFilter() {
    const kw   = document.getElementById("filterEvent").value.trim().toLowerCase();
    const sort = document.getElementById("filterSort").value;
    let list   = allEvents.filter(sk => sk.tenSuKien.toLowerCase().includes(kw));
    if (sort === "asc")  list.sort((a, b) => new Date(a.thoiGianBatDau) - new Date(b.thoiGianBatDau));
    if (sort === "desc") list.sort((a, b) => new Date(b.thoiGianBatDau) - new Date(a.thoiGianBatDau));
    EventView.renderEvents(list, "openBuyModal");
}

function onGlobalSearch() {
    document.getElementById("filterEvent").value = document.getElementById("globalSearch").value;
    applyEventFilter();
    showTab("events");
}

// ── MODAL MUA VÉ ─────────────────────────────────────────
function openBuyModal(maSuKien) {
    const sk = allEvents.find(e => e.maSuKien === maSuKien);
    if (!sk) return;
    currentEvent = sk;
    window._currentMaSuKien = maSuKien;   // expose để seatHoldPatch đọc

    // Nếu đang có session giữ vé còn hạn cho sự kiện này → restore thẳng vào voucher modal
    if (window._seatHoldTryRestore && window._seatHoldTryRestore(maSuKien)) return;

    CartModel.reset();
    EventView.openBuyModal(sk);

    Promise.all([
        EventService.getTicketsByEvent(maSuKien),
        EventService.getVouchersByEvent(maSuKien),
    ]).then(([tickets, vouchers]) => {
        // ── Lọc bỏ loại vé user đã mua cho sự kiện này ──────────────
        // _purchasedTicketTypes được load ngầm khi khởi động
        // Mỗi phần tử có dạng { maSuKien, loaiVe, ... }
        const purchasedLoaiVe = new Set(
            _purchasedTicketTypes
                .filter(t => String(t.maSuKien) === String(maSuKien))
                .map(t => (t.loaiVe || "").trim().toLowerCase())
                .filter(Boolean)
        );

        const availableTickets = purchasedLoaiVe.size > 0
            ? tickets.filter(ve => !purchasedLoaiVe.has((ve.loaiVe || "").trim().toLowerCase()))
            : tickets;
        // ─────────────────────────────────────────────────────────────

        CartModel.setTickets(availableTickets);
        window._currentTickets = availableTickets;   // lưu để dùng khi map ghế → maVe
        EventView.renderModalTickets(availableTickets, CartModel, "changeQty", "inputQty");
        EventView.renderTotal(CartModel.getSubtotal(), 0);
        allVouchersForEvent = vouchers;
        EventView.renderVoucherList(vouchers, "selectVoucher");
    }).catch(err => {
        document.getElementById("modalTicketList").innerHTML =
            `<p style="color:#dc2626;text-align:center">${err.message}</p>`;
    });
}

function closeBuyModal() { EventView.closeBuyModal(); }

function changeQty(maVe, delta, maxConLai) {
    const next = CartModel.changeQty(maVe, delta, maxConLai);
    EventView.syncQtyInput(maVe, next);
    EventView.syncQtyButtons(maVe, next, maxConLai);
    EventView.renderTotal(CartModel.getSubtotal(), CartModel.getDiscount());
}

function inputQty(maVe, maxConLai) {
    const input = document.getElementById(`qty-${maVe}`);
    const next  = CartModel.setQty(maVe, parseInt(input.value) || 0, maxConLai);
    input.value = next;
    EventView.syncQtyButtons(maVe, next, maxConLai);
    EventView.renderTotal(CartModel.getSubtotal(), CartModel.getDiscount());
}

// ── VOUCHER — mở seat map trước ──────────────────────────
function openVoucherModal() {
    const items = CartModel.getItems();
    if (!items.length) {
        EventView.showBuyMsg("Vui lòng chọn ít nhất 1 vé.", "err");
        return;
    }

    // Chuẩn hoá: 'VIP' → 'vip', 'Thường'/'THUONG'/... → 'normal'
    const _normaliseType = (loaiVe) => {
        const u = (loaiVe || '').toUpperCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // bỏ dấu
        if (u.includes('VIP')) return 'vip';
        if (u.includes('THUONG') || u.includes('THUỜNG') || u.includes('THUONG')) return 'normal';
        return null; // loại không hợp lệ
    };

    const sanitizedItems = items.filter(it => _normaliseType(it.loaiVe) !== null);
    if (sanitizedItems.length !== items.length) {
        EventView.showBuyMsg('Chỉ hỗ trợ vé VIP hoặc Thường.', 'err');
        return;
    }

    const totalQty  = sanitizedItems.reduce((s, it) => s + (it.soLuong || 0), 0) || 1;
    const eventName = document.getElementById("modalEventName")?.textContent || "";
    const eventDate = document.getElementById("modalEventDate")?.textContent || "";

    // Đóng buy modal → load ghế đã đặt → mở seat map
    EventView.closeBuyModal();

    _loadBookedSeatsAndOpenMap(eventName, eventDate, totalQty);
}

// Load ghế đã đặt từ API rồi mới mở sơ đồ
function _loadBookedSeatsAndOpenMap(eventName, eventDate, totalQty) {
    apiFetch(`/ghe/sukien/${currentEvent.maSuKien}`)
        .then(bookedSeats => {
            // bookedSeats: [{ khuVuc:"A1", maVe:5, trangThai:"da_dat", ... }]
            // Backend Ghe entity dùng field "khuVuc" (không phải "khuVuc")
            const bookedSet = new Set(
                bookedSeats.map(g => g.khuVuc).filter(Boolean)
            );
            openSeatModal(eventName, eventDate, totalQty, bookedSet);
        })
        .catch(() => {
            // Nếu API lỗi vẫn mở sơ đồ, chỉ không biết ghế nào đã đặt
            openSeatModal(eventName, eventDate, totalQty, new Set());
        });
}

function _proceedToVoucherModal() {
    const subtotal = CartModel.getSubtotal();
    const discount = CartModel.getDiscount();
    finalTotal = subtotal * (1 - discount / 100);
    document.getElementById("voucherFinalPrice").textContent =
        finalTotal.toLocaleString("vi-VN") + " ₫";

    EventView.renderVoucherList(allVouchersForEvent, "selectVoucher");
    const vld = document.getElementById("voucherListDrop");
    if (vld) vld.style.display = allVouchersForEvent.length ? "block" : "none";

    const vi = document.getElementById("voucherInput");
    const vm = document.getElementById("voucherMsg");
    if (vi) vi.value = "";
    if (vm) { vm.textContent = ""; vm.className = "buy-msg"; }

    const overlay = document.getElementById("voucherOverlay");
    const modal   = document.getElementById("voucherModal");
    overlay.style.display = "block";
    modal.style.display   = "block";
    requestAnimationFrame(() => modal.classList.add("open"));
}

function closeVoucherModal() {
    // seatHoldPatch sẽ wrap hàm này — chỉ cần đóng UI ở đây
    const overlay = document.getElementById("voucherOverlay");
    const modal   = document.getElementById("voucherModal");
    modal.classList.remove("open");
    setTimeout(() => {
        overlay.style.display = "none";
        modal.style.display   = "none";
    }, 220);
}

/** Quay lại từ voucherModal: hủy giữ vé rồi đóng. */
function closeVoucherModalBack() {
    if (typeof window.seatHoldGoBack === 'function') {
        window.seatHoldGoBack('closeVoucherModal');
    } else {
        closeVoucherModal();
    }
}

function finalConfirmBuy() { confirmBuy(); }

function filterVoucherList() {
    const kw = document.getElementById("voucherInput").value.trim().toLowerCase();
    const filtered = allVouchersForEvent.filter(v => v.maCode.toLowerCase().includes(kw));
    EventView.renderVoucherList(filtered, "selectVoucher");
    const vld = document.getElementById("voucherListDrop");
    if (vld) vld.style.display = "block";
}

function selectVoucher(maCode) {
    document.getElementById("voucherInput").value = maCode;
    applyVoucher();
}

function applyVoucher() {
    const code = document.getElementById("voucherInput").value.trim();
    if (!code) { EventView.showVoucherMsg("Vui lòng nhập mã voucher", "err"); return; }
    EventView.showVoucherMsg("Đang kiểm tra...", "");
    EventService.getVoucherByCode(code, currentEvent.maSuKien)
        .then(v => {
            CartModel.setDiscount(v.mucKhuyenMai || 0);
            const subtotal = CartModel.getSubtotal();
            finalTotal = Math.round(subtotal * (1 - CartModel.getDiscount() / 100));
            document.getElementById("voucherFinalPrice").textContent =
                finalTotal.toLocaleString("vi-VN") + " ₫";
            EventView.showVoucherMsg(`✅ Giảm ${CartModel.getDiscount()}%`, "ok");
        })
        .catch(err => {
            CartModel.setDiscount(0);
            finalTotal = CartModel.getSubtotal();
            document.getElementById("voucherFinalPrice").textContent =
                finalTotal.toLocaleString("vi-VN") + " ₫";
            EventView.showVoucherMsg(`❌ ${err.message}`, "err");
        });
}

// ── XÁC NHẬN MUA — gửi kèm ghế ──────────────────────────
function confirmBuy() {
    const items = CartModel.getItems();
    if (!items.length) { EventView.showBuyMsg("Vui lòng chọn ít nhất 1 vé.", "err"); return; }

    const maVoucher = document.getElementById("voucherInput")?.value.trim() || null;

    // Ghế đã chọn: mỗi seatId là "A1", "B3"...
    // Hàng A-C → VIP, D-J → Thường
    // Tìm maVe phù hợp từ items đã chọn theo loaiVe
    const _normaliseType2 = (loaiVe) => {
        const u = (loaiVe || '').toUpperCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return u.includes('VIP') ? 'vip' : 'normal';
    };
    // Rect layout: A-C = VIP, D-F = Normal
    // Circle layout: A-D = VIP, E-H = Normal
    const _layout = (window._seatState && window._seatState.layout) || 'rect';
    const selectedSeats = (window._selectedSeats || []).map(seatId => {
        const zoneChar = seatId.charAt(0).toUpperCase();
        let isVip;
        if (_layout === 'circle') {
            isVip = zoneChar <= 'D'; // A,B,C,D = VIP; E,F,G,H = Normal
        } else {
            isVip = zoneChar <= 'C'; // A,B,C = VIP; D,E,F = Normal
        }
        const allT = window._currentTickets || [];
        const vipT    = allT.find(t => _normaliseType2(t.loaiVe) === 'vip');
        const normalT = allT.find(t => _normaliseType2(t.loaiVe) === 'normal');
        const matchT  = isVip ? (vipT || allT[0]) : (normalT || allT[0]);
        return {
            khuVuc: seatId,
            maVe:   matchT?.maVe,
        };
    });

    const btn = document.getElementById("confirmBuyBtn");
    if (btn) { btn.disabled = true; btn.textContent = "Đang xử lý..."; }

    OrderService.purchase({
        maTaiKhoan: currentUser.maTaiKhoan,
        maSuKien:   currentEvent.maSuKien,
        maVoucher:  maVoucher || null,
        items,
        ghes: selectedSeats,   // MỚI: gửi danh sách ghế lên backend
    })
    .then(data => {
        EventView.showVoucherMsg(`🎉 Mua thành công! Mã HĐ: #${data.maHoaDon}`, "ok");
        CartModel.reset();
        window._selectedSeats = [];
        setTimeout(() => { closeVoucherModal(); loadAllEvents(); }, 2200);
    })
    .catch(err => EventView.showVoucherMsg(err.message, "err"))
    .finally(() => {
        if (btn) { btn.disabled = false; btn.textContent = "Thanh toán"; }
    });
}