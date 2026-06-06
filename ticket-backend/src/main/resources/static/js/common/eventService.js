/* ==========================================================
   js/customer/eventService.js  (Model)
   Giao tiếp API liên quan đến sự kiện, vé, voucher, đơn hàng.
   Phụ thuộc: common/api.js
   ========================================================== */

const EventService = {
    getAll() {
        return apiFetch("/sukien");
    },

    getById(maSuKien) {
        return apiFetch(`/sukien/${maSuKien}`);
    },

    getTicketsByEvent(maSuKien) {
        return apiFetch(`/ve/sukien/${maSuKien}`);
    },

    getVouchersByEvent(maSuKien) {
        return apiFetch(`/voucher/sukien/${maSuKien}`);
    },

    getVoucherByCode(code, maSuKien) {
        return apiFetch(`/voucher/code/${encodeURIComponent(code)}/sukien/${maSuKien}`);
    },

    getOrganizer(maCongTy) {
        return apiFetch(`/nhatochuc/${maCongTy}`);
    },

    /**
     * Lấy danh sách ghế đã được đặt của một sự kiện.
     * Trả về mảng các mã ghế (vd: ["A1", "B3", "C5"]).
     */
    getBookedSeats(maSuKien) {
        return apiFetch(`/sukien/${maSuKien}/ghe-da-dat`);
    },
    /**
     * Lấy thông tin một địa điểm theo mã — dùng để đọc loaiSoDo trước khi mở seat map.
     * Trả về object DiaDiem, trong đó có trường loaiSoDo ("Hình chữ nhật" | "Hình tròn").
     */
    getDiaDiem(maDiaDiem) {
        return apiFetch(`/diadiem/${maDiaDiem}`);
    },

    /**
     * Lấy thông tin địa điểm của một sự kiện.
     * Tiện ích gộp: lấy sự kiện → đọc maDiaDiem → lấy DiaDiem.
     * Trả về { sucChua, loaiSoDo, tenDiaDiem, ... } hoặc null nếu không có địa điểm.
     */
    async getVenueForEvent(maSuKien) {
        const sk = await apiFetch(`/sukien/${maSuKien}`);
        if (!sk?.maDiaDiem) return null;
        return apiFetch(`/diadiem/${sk.maDiaDiem}`);
    },
};

const OrderService = {
    /**
     * Tạo hoá đơn + chi tiết hóa đơn khi bán vé trực tiếp.
     * maTaiKhoan để null — backend tự tạo KhachHang rỗng.
     */
    purchase(body) {
        return apiFetch("/hoadon/mua", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },

    /**
     * Lấy toàn bộ vé đã bán — dùng cho tab "Vé đã bán" của nhân viên.
     */
    getAll() {
        return apiFetch("/hoadon/tatca");
    },

    /**
     * Lấy vé đã bán theo nhân viên — dùng cho tab "Vé đã bán" của nhân viên.
     */
    getByEmployee(maNhanVien) {
        return apiFetch(`/hoadon/nhanvien/${maNhanVien}`);
    },

    /**
     * Lấy vé theo khách hàng — dùng nếu cần lọc riêng.
     */
    getByCustomer(maTaiKhoan) {
        return apiFetch(`/hoadon/khachhang/${maTaiKhoan}`);
    },

    /**
     * Tạo thanh toán với phương thức cụ thể.
     */
    createPayment(body) {
        return apiFetch("/thanhtoan", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },

    requestRefund(body) {
        return apiFetch("/hoanve", {
            method: "POST",
            body: JSON.stringify(body),
        });
    },
};