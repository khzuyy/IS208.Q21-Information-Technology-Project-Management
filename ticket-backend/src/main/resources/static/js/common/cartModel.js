/* ==========================================================
   js/customer/cartModel.js  (Model)
   Quản lý state giỏ hàng và discount — không chạm DOM.
   ========================================================== */

const CartModel = (() => {
    let _map     = {};   // { maVe: quantity }
    let _tickets = [];   // danh sách vé của sự kiện hiện tại
    let _discount = 0;   // % giảm giá từ voucher

    return {
        reset(tickets = []) {
            _map      = {};
            _tickets  = tickets;
            _discount = 0;
        },

        setTickets(tickets) { _tickets = tickets; },
        setDiscount(pct)    { _discount = pct; },
        getDiscount()       { return _discount; },

        setQty(maVe, qty, maxConLai) {
            const clamped = Math.max(0, Math.min(qty, maxConLai));
            _map[maVe] = clamped;
            return clamped;
        },

        changeQty(maVe, delta, maxConLai) {
            const current = _map[maVe] || 0;
            return this.setQty(maVe, current + delta, maxConLai);
        },

        getQty(maVe) { return _map[maVe] || 0; },

        getItems() {
            return _tickets
                .filter(ve => (_map[ve.maVe] || 0) > 0)
                .map(ve => ({
                    maVe:    ve.maVe,
                    loaiVe:  ve.loaiVe,   
                    tenVe:   ve.tenVe,
                    soLuong: _map[ve.maVe],
                    donGia:  ve.gia,
                }));
        },

        getSubtotal() {
            return _tickets.reduce((sum, ve) => sum + (_map[ve.maVe] || 0) * ve.gia, 0);
        },

        getTotal() {
            const sub = this.getSubtotal();
            return _discount > 0 ? Math.round(sub * (1 - _discount / 100)) : sub;
        },
    };
})();