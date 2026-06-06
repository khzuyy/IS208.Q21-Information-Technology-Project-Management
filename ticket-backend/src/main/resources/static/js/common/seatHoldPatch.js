/* ==========================================================
   seatHoldPatch.js  — v2.1
   Tích hợp "giữ ghế" in-memory + đếm ngược thanh toán.

   TÍNH NĂNG:
     1. Khi khách chọn ghế → gọi API giữ ghế ngay lập tức.
     2. Khi bấm "Tiếp tục →" (confirmSeatSelection) → hiển thị
        đồng hồ đếm ngược 10 phút trên mọi modal thanh toán.
     3. Hết giờ → tự động hủy giữ, đóng modal, thông báo.
     4. Ghế người khác đang giữ → hiện như "đã đặt" (không chọn được).
     5. Đóng modal mà chưa mua → tự động hủy giữ.
     6. Số ghế tối đa mỗi khu đọc từ backend (soLuong vé thực tế).

   CÁCH DÙNG:
     Thêm vào cuối <body> của loginCustomer.html và loginEmployee.html,
     SAU tất cả script khác:
       <script src="js/seatHoldPatch.js"></script>

   KHÔNG sửa bất kỳ file nào khác.
   ========================================================== */

(function () {
    'use strict';

    // ══════════════════════════════════════════════════════════════════
    //  CẤU HÌNH
    // ══════════════════════════════════════════════════════════════════

    const BASE            = typeof BASE_URL !== 'undefined' ? BASE_URL : '/api';
    const HOLD_MINUTES    = 10;          // thời gian giữ ghế (phút)
    const WARN_SECONDS    = 60;          // cảnh báo khi còn ít hơn N giây
    const TIMER_ID        = 'seatHoldCountdown';  // id phần tử DOM đồng hồ

    // ══════════════════════════════════════════════════════════════════
    //  STATE
    // ══════════════════════════════════════════════════════════════════

    /** khuVuc mà user NÀY đang giữ trong phiên hiện tại. */
    const _myHeldSeats = new Set();

    /** khuVuc đang bị người KHÁC giữ (fetch khi mở modal). */
    let _othersHeldSeats = new Set();

    /** Trạng thái: đã confirm chọn ghế (đang trong luồng thanh toán). */
    let _confirmed = false;

    /** intervalId của đồng hồ đếm ngược. */
    let _timerInterval = null;

    /** Thời điểm hết hạn (Date). */
    let _expiresAt = null;

    // ══════════════════════════════════════════════════════════════════
    //  HELPERS
    // ══════════════════════════════════════════════════════════════════

    function _currentMaSuKien() {
        // Ưu tiên: window._currentMaSuKien (gán bởi controller bridge)
        // Dự phòng: window.currentEvent?.maSuKien
        return window._currentMaSuKien ?? window.currentEvent?.maSuKien ?? null;
    }

    function _currentUser() {
        return window.currentUser ?? JSON.parse(localStorage.getItem('user') || 'null');
    }

    function _apiPut(path) {
        return fetch(BASE + path, { method: 'PUT' }).catch(() => {});
    }

    /**
     * Chuyển internal seat ID → khuVuc gửi lên backend.
     * Rect layout:  "R_A1" → rawId "A1"
     * Circle layout: "A1"  → "A1"
     */
    function _toKhuVuc(internalId) {
        if (!internalId) return internalId;
        const state = window._seatState;
        if (internalId.startsWith('R_') && state?.seats) {
            const seat = state.seats.find(s => s.id === internalId);
            if (seat) return seat.rawId;
            return internalId.slice(2);
        }
        return internalId;
    }

    // ══════════════════════════════════════════════════════════════════
    //  HOLD / UNHOLD API
    // ══════════════════════════════════════════════════════════════════

    function _holdSeat(khuVuc) {
        const maSuKien = _currentMaSuKien();
        const user     = _currentUser();
        if (!maSuKien || !user) return;
        _myHeldSeats.add(khuVuc);
        _apiPut(`/ghe/giu?maSuKien=${maSuKien}&khuVuc=${encodeURIComponent(khuVuc)}&maTaiKhoan=${user.maTaiKhoan}`);
    }

    function _unholdSeat(khuVuc) {
        const maSuKien = _currentMaSuKien();
        const user     = _currentUser();
        if (!maSuKien || !user) return;
        _myHeldSeats.delete(khuVuc);
        _apiPut(`/ghe/huy-giu?maSuKien=${maSuKien}&khuVuc=${encodeURIComponent(khuVuc)}&maTaiKhoan=${user.maTaiKhoan}`);
    }

    function _unholdAll() {
        const seats = Array.from(_myHeldSeats);
        seats.forEach(s => _unholdSeat(s));
        _myHeldSeats.clear();
    }

    // ══════════════════════════════════════════════════════════════════
    //  DIFF: so sánh trước/sau toggle → hold/unhold đúng ghế
    // ══════════════════════════════════════════════════════════════════

    function _diffAndSync(before, after) {
        const added   = [...after].filter(id => !before.has(id));
        const removed = [...before].filter(id => !after.has(id));
        added.forEach(id   => _holdSeat(_toKhuVuc(id)));
        removed.forEach(id => _unholdSeat(_toKhuVuc(id)));
    }

    // ══════════════════════════════════════════════════════════════════
    //  ĐỒNG HỒ ĐẾM NGƯỢC
    // ══════════════════════════════════════════════════════════════════

    /** CSS cho widget đồng hồ + toast notification (inject một lần). */
    function _injectTimerStyles() {
        if (document.getElementById('seatHoldTimerStyle')) return;
        const style = document.createElement('style');
        style.id = 'seatHoldTimerStyle';
        style.textContent = `
            /* ── Đồng hồ đếm ngược ── */
            #${TIMER_ID} {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 6px 14px;
                border-radius: 99px;
                font-size: .82rem;
                font-weight: 700;
                letter-spacing: .3px;
                transition: background .3s, color .3s;
                white-space: nowrap;
                user-select: none;
            }
            #${TIMER_ID}.htc-normal {
                background: #fff8e1;
                color: #7a5c00;
                border: 1.5px solid #f7d060;
            }
            #${TIMER_ID}.htc-warn {
                background: #fff0f0;
                color: #b91c1c;
                border: 1.5px solid #fca5a5;
                animation: htcPulse .8s ease-in-out infinite;
            }
            @keyframes htcPulse {
                0%, 100% { opacity: 1; }
                50%       { opacity: .6; }
            }
            .seatHoldTimerBar {
                display: block;
                width: 100%;
                height: 3px;
                background: #e5e7eb;
                border-radius: 99px;
                overflow: hidden;
                margin-top: 2px;
            }
            .seatHoldTimerBar-fill {
                height: 100%;
                border-radius: 99px;
                transition: width .9s linear, background .3s;
            }

            /* ── Toast hết giờ ── */
            #seatExpiredToast {
                position: fixed;
                top: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(-120px);
                z-index: 99999;
                background: #fff;
                border-radius: 18px;
                box-shadow: 0 12px 40px rgba(0,0,0,.22), 0 2px 8px rgba(0,0,0,.10);
                padding: 0;
                width: min(420px, 92vw);
                overflow: hidden;
                transition: transform .38s cubic-bezier(.34,1.56,.64,1), opacity .3s;
                opacity: 0;
                pointer-events: none;
            }
            #seatExpiredToast.set-visible {
                transform: translateX(-50%) translateY(0);
                opacity: 1;
                pointer-events: auto;
            }
            #seatExpiredToast.set-hide {
                transform: translateX(-50%) translateY(-120px);
                opacity: 0;
                pointer-events: none;
            }
            .set-bar {
                height: 5px;
                background: linear-gradient(90deg, #ef4444, #f97316);
                width: 100%;
            }
            .set-body {
                padding: 20px 22px 18px;
            }
            .set-icon-row {
                display: flex;
                align-items: flex-start;
                gap: 14px;
            }
            .set-icon {
                font-size: 2rem;
                line-height: 1;
                flex-shrink: 0;
                margin-top: 2px;
            }
            .set-text h3 {
                margin: 0 0 4px;
                font-size: 1rem;
                font-weight: 800;
                color: #1a1a2e;
                line-height: 1.3;
            }
            .set-text p {
                margin: 0 0 14px;
                font-size: .84rem;
                color: #555;
                line-height: 1.5;
            }
            .set-btn {
                display: inline-block;
                padding: 9px 22px;
                border-radius: 10px;
                background: linear-gradient(135deg, #ef4444, #dc2626);
                color: #fff;
                font-weight: 700;
                font-size: .88rem;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(220,38,38,.35);
                transition: opacity .15s;
            }
            .set-btn:hover { opacity: .88; }
            .set-progress {
                height: 3px;
                background: #fee2e2;
                margin-top: 14px;
                border-radius: 99px;
                overflow: hidden;
            }
            .set-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #ef4444, #f97316);
                border-radius: 99px;
                transition: width .1s linear;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Tạo (hoặc lấy lại) phần tử đồng hồ #seatHoldCountdown.
     * Có thể gọi nhiều lần — luôn trả về cùng element.
     */
    function _getOrCreateTimerEl() {
        let el = document.getElementById(TIMER_ID);
        if (!el) {
            el = document.createElement('div');
            el.id = TIMER_ID;
        }
        return el;
    }

    /**
     * Chèn đồng hồ vào trong một modal (theo selector container).
     * Nếu modal không tồn tại hoặc đã có đồng hồ → bỏ qua.
     */
    function _insertTimerIntoModal(modalId, insertBeforeSelector) {
        const modal = document.getElementById(modalId);
        if (!modal || !modal.style.display || modal.style.display === 'none') return;

        const timerEl = _getOrCreateTimerEl();
        // Nếu đồng hồ đã trong modal này → không chèn lại
        if (modal.contains(timerEl)) return;

        let anchor = insertBeforeSelector ? modal.querySelector(insertBeforeSelector) : null;
        if (anchor) {
            modal.insertBefore(timerEl, anchor);
        } else {
            // Chèn sau thẻ h2 đầu tiên
            const h2 = modal.querySelector('h2');
            if (h2 && h2.nextSibling) {
                modal.insertBefore(timerEl, h2.nextSibling);
            } else {
                modal.appendChild(timerEl);
            }
        }
    }

    /** Cập nhật nội dung + class của đồng hồ. */
    function _updateTimerDisplay(secondsLeft) {
        const el = document.getElementById(TIMER_ID);
        if (!el) return;

        const totalSecs  = HOLD_MINUTES * 60;
        const pct        = Math.max(0, secondsLeft / totalSecs * 100);
        const mins       = Math.floor(secondsLeft / 60);
        const secs       = secondsLeft % 60;
        const timeStr    = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        const isWarn     = secondsLeft < WARN_SECONDS;
        const barColor   = isWarn ? '#ef4444' : (pct > 50 ? '#22c55e' : '#f59e0b');

        el.className     = isWarn ? 'htc-warn' : 'htc-normal';
        el.innerHTML     = `
            ⏱ Ghế được giữ trong: <strong>${timeStr}</strong>
            <span class="seatHoldTimerBar">
                <span class="seatHoldTimerBar-fill"
                      style="width:${pct}%;background:${barColor}"></span>
            </span>
        `;

        // Cố gắng đặt đồng hồ vào modal đang hiển thị
        _tryAttachTimer();
    }

    /**
     * Tìm modal đang mở và chèn đồng hồ vào.
     * Thứ tự ưu tiên: voucherModal → qrPayModal → paymentModal → seatModal
     */
    function _tryAttachTimer() {
        const candidates = [
            { id: 'voucherModal',  before: 'hr.modal-divider' },
            { id: 'qrPayModal',    before: null },
            { id: 'paymentModal',  before: null },
        ];
        for (const { id, before } of candidates) {
            const m = document.getElementById(id);
            if (m && m.style.display !== 'none') {
                _insertTimerIntoModal(id, before);
                return;
            }
        }
    }

    /** Bắt đầu đồng hồ đếm ngược. */
    function _startTimer() {
        _stopTimer();
        _injectTimerStyles();
        _confirmed  = true;
        _expiresAt  = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

        _updateTimerDisplay(HOLD_MINUTES * 60);

        _timerInterval = setInterval(() => {
            const secondsLeft = Math.max(0, Math.round((_expiresAt - Date.now()) / 1000));
            _updateTimerDisplay(secondsLeft);

            if (secondsLeft <= 0) {
                _stopTimer();
                _onTimerExpired();
            }
        }, 1000);
    }

    /** Dừng đồng hồ và xóa element. */
    function _stopTimer() {
        if (_timerInterval) {
            clearInterval(_timerInterval);
            _timerInterval = null;
        }
        _confirmed = false;
        _expiresAt  = null;
        const el = document.getElementById(TIMER_ID);
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    /** Xử lý khi đồng hồ hết giờ. */
    function _onTimerExpired() {
        _unholdAll();

        // Đóng tất cả modal đang mở
        const modalClosers = [
            'closeQRPayModal', 'closeVoucherModal',
            'closePaymentModal', 'closeSeatModal', 'closeBuyModal',
        ];
        for (const fn of modalClosers) {
            if (typeof window[fn] === 'function') {
                try { window[fn](); } catch (_) {}
            }
        }

        // Hiện toast đẹp thay vì alert()
        setTimeout(_showExpiredToast, 120);
    }

    /**
     * Toast thông báo hết giờ giữ ghế.
     * Tự động biến mất sau AUTO_CLOSE_MS, hoặc đóng khi bấm nút.
     */
    function _showExpiredToast() {
        _injectTimerStyles(); // đảm bảo CSS đã có

        const AUTO_CLOSE_MS = 6000; // tự đóng sau 6 giây

        // Tạo toast nếu chưa có
        let toast = document.getElementById('seatExpiredToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'seatExpiredToast';
            toast.innerHTML = `
                <div class="set-bar"></div>
                <div class="set-body">
                    <div class="set-icon-row">
                        <div class="set-icon">⏰</div>
                        <div class="set-text">
                            <h3>Hết thời gian giữ ghế</h3>
                            <p>Ghế đã được giải phóng sau 10 phút.<br>Vui lòng quay lại và chọn ghế mới.</p>
                            <button class="set-btn" onclick="document.getElementById('seatExpiredToast').classList.add('set-hide')">
                                Đã hiểu
                            </button>
                            <div class="set-progress">
                                <div class="set-progress-fill" id="setProgressFill" style="width:100%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(toast);
        }

        // Hiện toast
        toast.classList.remove('set-hide');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => toast.classList.add('set-visible'));
        });

        // Thanh tiến trình tự thu lại
        const fill = document.getElementById('setProgressFill');
        const startTime = Date.now();
        const progressInterval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const pct = Math.max(0, 100 - (elapsed / AUTO_CLOSE_MS * 100));
            if (fill) fill.style.width = pct + '%';
            if (elapsed >= AUTO_CLOSE_MS) {
                clearInterval(progressInterval);
                toast.classList.add('set-hide');
            }
        }, 80);
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: toggleRectZone
    // ══════════════════════════════════════════════════════════════════

    function _patchToggleRectZone() {
        if (typeof window.toggleRectZone !== 'function') return;
        const _orig = window.toggleRectZone;
        window.toggleRectZone = function (rowId, type) {
            const before = new Set(window._seatState?.selected);
            _orig(rowId, type);
            const after  = new Set(window._seatState?.selected);
            _diffAndSync(before, after);
        };
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: toggleZone (circle)
    // ══════════════════════════════════════════════════════════════════

    function _patchToggleZone() {
        if (typeof window.toggleZone !== 'function') return;
        const _orig = window.toggleZone;
        window.toggleZone = function (zoneId, type) {
            const before = new Set(window._seatState?.selected);
            _orig(zoneId, type);
            const after  = new Set(window._seatState?.selected);
            _diffAndSync(before, after);
        };
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: confirmSeatSelection → bắt đầu đếm ngược
    // ══════════════════════════════════════════════════════════════════

    function _patchConfirmSeatSelection() {
        if (typeof window.confirmSeatSelection !== 'function') return;
        const _orig = window.confirmSeatSelection;
        window.confirmSeatSelection = function () {
            _orig();
            // Sau khi gốc chạy xong, kiểm tra đã chọn đủ ghế chưa
            // (_selectedSeats được gán bởi hàm gốc)
            const sel = window._selectedSeats;
            if (sel && sel.length > 0) {
                // Bắt đầu đồng hồ 10 phút kể từ đây
                _startTimer();
                // Đợi modal tiếp theo mở rồi chèn đồng hồ vào
                setTimeout(_tryAttachTimer, 150);
                setTimeout(_tryAttachTimer, 400); // retry nếu modal có animation
            }
        };
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: closeSeatModal → hủy hold nếu chưa confirm
    // ══════════════════════════════════════════════════════════════════

    function _patchCloseSeatModal() {
        if (typeof window.closeSeatModal !== 'function') return;
        const _orig = window.closeSeatModal;
        window.closeSeatModal = function () {
            if (!_confirmed) {
                // Chưa qua bước confirm → hủy hold
                _unholdAll();
                _stopTimer();
            }
            _orig();
        };
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: closeVoucherModal → hủy hold nếu chưa mua
    // ══════════════════════════════════════════════════════════════════

    function _patchCloseVoucherModal() {
        if (typeof window.closeVoucherModal !== 'function') return;
        const _orig = window.closeVoucherModal;
        window.closeVoucherModal = function () {
            if (_myHeldSeats.size > 0) {
                _unholdAll();
                _stopTimer();
            }
            _orig();
        };
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: closeQRPayModal → hủy hold nếu chưa mua
    // ══════════════════════════════════════════════════════════════════

    function _patchCloseQRPayModal() {
        if (typeof window.closeQRPayModal !== 'function') return;
        const _orig = window.closeQRPayModal;
        window.closeQRPayModal = function () {
            if (_myHeldSeats.size > 0) {
                _unholdAll();
                _stopTimer();
            }
            _orig();
        };
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: closePaymentModal (employee) → hủy hold nếu chưa mua
    // ══════════════════════════════════════════════════════════════════

    function _patchClosePaymentModal() {
        if (typeof window.closePaymentModal !== 'function') return;
        const _orig = window.closePaymentModal;
        window.closePaymentModal = function () {
            if (_myHeldSeats.size > 0) {
                _unholdAll();
                _stopTimer();
            }
            _orig();
        };
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: mua thành công → dừng đồng hồ, clear held set
    //  Hook vào CartModel.reset() — gọi sau mọi loại thanh toán thành công
    // ══════════════════════════════════════════════════════════════════

    function _patchCartModelReset() {
        if (!window.CartModel || typeof window.CartModel.reset !== 'function') return;
        const _orig = window.CartModel.reset.bind(window.CartModel);
        window.CartModel.reset = function () {
            // Thanh toán thành công: ghế đã được ghi DA_DAT trên server
            // → không cần gọi huy-giu, chỉ dừng đồng hồ + clear state
            _myHeldSeats.clear();
            _stopTimer();
            _orig();
        };
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: mở voucherModal / qrPayModal / paymentModal → chèn đồng hồ
    //  (cần retry vì các modal có thể dùng animation delay)
    // ══════════════════════════════════════════════════════════════════

    function _patchModalOpeners() {
        // Danh sách hàm mở modal cần chèn đồng hồ vào
        const openers = [
            'openVoucherModal', '_proceedToVoucherModal',
            'openQRPayModal',   '_openPaymentModal',
            'finalConfirmBuy',
        ];
        openers.forEach(name => {
            if (typeof window[name] !== 'function') return;
            const _orig = window[name];
            window[name] = function (...args) {
                const result = _orig(...args);
                if (_confirmed) {
                    setTimeout(_tryAttachTimer, 100);
                    setTimeout(_tryAttachTimer, 350);
                }
                return result;
            };
        });
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: openSeatModal → merge ghế người khác giữ vào bookedSet
    // ══════════════════════════════════════════════════════════════════

    function _patchOpenSeatModal() {
        if (typeof window.openSeatModal !== 'function') return;
        const _orig = window.openSeatModal;
        window.openSeatModal = function (eventName, eventDate, requiredSeats, bookedSet, loaiSoDo) {
            // Reset state khi mở modal mới
            _myHeldSeats.clear();
            _confirmed = false;
            _stopTimer();

            // Merge ghế người khác đang giữ → hiện như "đã đặt"
            const mergedBooked = new Set(bookedSet || []);
            _othersHeldSeats.forEach(s => mergedBooked.add(s));

            _orig(eventName, eventDate, requiredSeats, mergedBooked, loaiSoDo);
        };
    }

    // ══════════════════════════════════════════════════════════════════
    //  FETCH ghế người khác đang giữ trước khi mở seat modal
    //  Hook vào _loadBookedSeatsAndOpenMap (nếu có) hoặc openVoucherModal
    // ══════════════════════════════════════════════════════════════════

    /**
     * Fetch /api/ghe/dang-giu?maSuKien=X rồi cập nhật _othersHeldSeats.
     * Gọi callback sau khi fetch xong (dù thành công hay thất bại).
     */
    function _fetchOthersHeld(maSuKien, callback) {
        fetch(`${BASE}/ghe/dang-giu?maSuKien=${maSuKien}`)
            .then(r => r.ok ? r.json() : [])
            .then(heldList => {
                _othersHeldSeats = new Set(
                    (heldList || []).filter(s => !_myHeldSeats.has(s))
                );
            })
            .catch(() => { _othersHeldSeats = new Set(); })
            .finally(() => { if (typeof callback === 'function') callback(); });
    }

    function _patchLoadBookedSeats() {
        if (typeof window._loadBookedSeatsAndOpenMap !== 'function') return;
        const _orig = window._loadBookedSeatsAndOpenMap;
        window._loadBookedSeatsAndOpenMap = function (eventName, eventDate, totalQty) {
            const maSuKien = _currentMaSuKien();
            if (!maSuKien) { _orig(eventName, eventDate, totalQty); return; }
            _fetchOthersHeld(maSuKien, () => _orig(eventName, eventDate, totalQty));
        };
    }

    // ══════════════════════════════════════════════════════════════════
    //  PATCH: openVoucherModal (override đã được gán bởi controller bridge)
    //  → fetch ghế đang giữ nếu _loadBookedSeatsAndOpenMap không được dùng
    // ══════════════════════════════════════════════════════════════════

    function _patchOpenVoucherModalForHeld() {
        // Đợi sau khi controller bridge đã override xong
        setTimeout(() => {
            const _prevOV = window.openVoucherModal;
            if (typeof _prevOV !== 'function') return;
            window.openVoucherModal = function (...args) {
                const maSuKien = _currentMaSuKien();
                if (maSuKien && _othersHeldSeats.size === 0) {
                    // Fetch trước rồi mới mở
                    _fetchOthersHeld(maSuKien, () => _prevOV(...args));
                } else {
                    _prevOV(...args);
                }
            };
        }, 500); // chờ DOMContentLoaded handlers của controller bridge xong
    }

    // ══════════════════════════════════════════════════════════════════
    //  Hủy hold khi user thoát/reload trang (beforeunload)
    // ══════════════════════════════════════════════════════════════════

    window.addEventListener('beforeunload', () => {
        if (_myHeldSeats.size === 0) return;
        const maSuKien = _currentMaSuKien();
        const user     = _currentUser();
        if (!maSuKien || !user) return;
        _myHeldSeats.forEach(khuVuc => {
            navigator.sendBeacon(
                `${BASE}/ghe/huy-giu?maSuKien=${maSuKien}&khuVuc=${encodeURIComponent(khuVuc)}&maTaiKhoan=${user.maTaiKhoan}`
            );
        });
    });

    // ══════════════════════════════════════════════════════════════════
    //  KHỞI ĐỘNG
    // ══════════════════════════════════════════════════════════════════

    function _init() {
        _patchToggleRectZone();
        _patchToggleZone();
        _patchConfirmSeatSelection();     // ← MỚI: bắt đầu đếm ngược khi confirm ghế
        _patchCloseSeatModal();
        _patchCloseVoucherModal();
        _patchCloseQRPayModal();
        _patchClosePaymentModal();        // ← MỚI: employee payment modal
        _patchCartModelReset();
        _patchModalOpeners();             // ← MỚI: chèn đồng hồ vào modal thanh toán
        _patchLoadBookedSeats();
        _patchOpenSeatModal();
        _patchOpenVoucherModalForHeld();
        console.log('[seatHoldPatch v2.1] ✅ Giữ ghế + đếm ngược + toast đã kích hoạt');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }

})();