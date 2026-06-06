// ── QR THANH TOÁN ─────────────────────────────────────────
// Ghi đè finalConfirmBuy để hiện QR trước khi mua
function finalConfirmBuy() {
    const items = CartModel.getItems();
    if (!items.length) {
        EventView.showVoucherMsg("Vui lòng chọn ít nhất 1 vé.", "err");
        return;
    }

    // Lấy maCongTy: ưu tiên từ currentEvent, nếu không có thì fetch từ getById
    const _showQROrBuy = (maCongTy) => {
        if (!maCongTy) {
            confirmBuy();
            return;
        }
        EventService.getOrganizer(maCongTy)
            .then(org => {
                if (org?.maQR) {
                    _showQRPayModal(org.maQR);
                } else if (org?.soTaiKhoan || org?.stk) {
                    const stk      = org.soTaiKhoan  || org.stk  || "";
                    const nganHang = org.maNganHang   || org.bank || "";
                    const tenChu   = org.tenCongTy    || org.tenNguoiDaiDien || "";
                    const amount  = encodeURIComponent(finalTotal);
                    const addInfo = encodeURIComponent(`Mua ve ${currentEvent?.tenSuKien || ""}`);
                    const accName = encodeURIComponent(tenChu);
                    const vietQrUrl = `https://img.vietqr.io/image/${nganHang}-${stk}-compact2.png?amount=${amount}&addInfo=${addInfo}&accountName=${accName}`;
                    _showQRPayModal(vietQrUrl);
                } else {
                    confirmBuy();
                }
            })
            .catch(() => confirmBuy());
    };

    // FIX: currentEvent từ allEvents (getAll) có thể không có maCongTy
    // → fetch chi tiết sự kiện trước để lấy maCongTy chắc chắn
    if (currentEvent?.maCongTy) {
        // Đã có sẵn → dùng luôn
        _showQROrBuy(currentEvent.maCongTy);
    } else if (currentEvent?.maSuKien) {
        // Chưa có → fetch detail
        EventService.getById(currentEvent.maSuKien)
            .then(detail => {
                // Cập nhật luôn vào currentEvent để lần sau không cần fetch lại
                if (detail?.maCongTy) currentEvent.maCongTy = detail.maCongTy;
                _showQROrBuy(detail?.maCongTy || null);
            })
            .catch(() => confirmBuy());
    } else {
        confirmBuy();
    }
}

function _showQRPayModal(qrPath) {
    document.getElementById("qrPayImg").src = qrPath;
    document.getElementById("qrPayTotal").textContent =
        finalTotal.toLocaleString("vi-VN") + " ₫";
    document.getElementById("qrPayMsg").textContent = "";
    document.getElementById("qrPayMsg").className = "buy-msg";

    const overlay = document.getElementById("qrPayOverlay");
    const modal   = document.getElementById("qrPayModal");
    overlay.style.display = "block";
    modal.style.display   = "block";
    requestAnimationFrame(() => modal.classList.add("open"));
}

function closeQRPayModal() {
    const overlay = document.getElementById("qrPayOverlay");
    const modal   = document.getElementById("qrPayModal");
    modal.classList.remove("open");
    setTimeout(() => {
        overlay.style.display = "none";
        modal.style.display   = "none";
    }, 220);
}

function confirmAfterQR() {
    const btn = document.getElementById("confirmAfterQRBtn");
    btn.disabled = true;
    btn.textContent = "Đang xử lý...";

    const qrMsg = document.getElementById("qrPayMsg");
    qrMsg.textContent = "⏳ Đang xử lý...";
    qrMsg.className = "buy-msg";

    const items = CartModel.getItems();
    const maVoucher = document.getElementById("voucherInput")?.value.trim() || null;

    const _normaliseType2 = (loaiVe) => {
        const u = (loaiVe || '').toUpperCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return u.includes('VIP') ? 'vip' : 'normal';
    };

    // FIX: dùng _layout giống confirmBuy() gốc, không hardcode 'C'
    const _layout = (window._seatState && window._seatState.layout) || 'rect';
    const selectedSeats = (window._selectedSeats || []).map(seatId => {
        const zoneChar = seatId.charAt(0).toUpperCase();
        let isVip;
        if (_layout === 'circle') {
            isVip = zoneChar <= 'D';
        } else {
            isVip = zoneChar <= 'C';
        }
        const allT    = window._currentTickets || [];
        const vipT    = allT.find(t => _normaliseType2(t.loaiVe) === 'vip');
        const normalT = allT.find(t => _normaliseType2(t.loaiVe) === 'normal');
        const matchT  = isVip ? (vipT || allT[0]) : (normalT || allT[0]);
        return { khuVuc: seatId, maVe: matchT?.maVe };
    });

    OrderService.purchase({
        maTaiKhoan: currentUser.maTaiKhoan,
        maSuKien:   currentEvent.maSuKien,
        maVoucher:  maVoucher || null,
        items,
        ghes:       selectedSeats,
    })
    .then(data => {
        qrMsg.textContent = `🎉 Mua thành công! Mã HĐ: #${data.maHoaDon}`;
        qrMsg.className = "buy-msg ok";
        CartModel.reset();
        window._selectedSeats = [];
        setTimeout(() => {
            closeQRPayModal();
            closeVoucherModal();
            loadAllEvents();
        }, 2200);
    })
    .catch(err => {
        qrMsg.textContent = `❌ ${err.message}`;
        qrMsg.className = "buy-msg err";
        btn.disabled = false;
        btn.textContent = "✅ Đã thanh toán";
    });
}