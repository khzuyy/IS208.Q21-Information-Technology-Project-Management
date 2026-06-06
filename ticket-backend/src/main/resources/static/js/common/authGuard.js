/* ==========================================================
   js/common/authGuard.js
   1. Redirect nếu chưa đăng nhập
   2. Redirect sang hoSo.html nếu chưa điền đầy đủ thông tin
      (bao gồm ảnh QR cho Nhà tổ chức)
   ========================================================== */
(function () {
  const raw = localStorage.getItem("user");
  if (!raw) {
    window.location.href = "loginpopup.html";
    return;
  }

  const user = JSON.parse(raw);

  // Nếu đang ở trang hoSo.html rồi thì không redirect nữa (tránh vòng lặp)
  if (window.location.pathname.endsWith("hoSo.html")) return;

  // Chỉ check với 3 loại cần điền hồ sơ
  const loaiCanCheck = ["Khách hàng", "Nhà tổ chức", "Nhân viên"];
  if (!loaiCanCheck.includes(user.loaiTaiKhoan)) return;

  // Gọi API kiểm tra hồ sơ
  fetch(`${BASE_URL}/taikhoan/${user.maTaiKhoan}/ho-so`)
    .then(res => res.json())
    .then(data => {
      if (!isHoSoDayDu(user.loaiTaiKhoan, data)) {
        alert("⚠️ Vui lòng điền đầy đủ thông tin hồ sơ trước khi sử dụng!");
        window.location.href = "hoSo.html";
      }
    })
    .catch(() => {}); // lỗi mạng → bỏ qua, không chặn user
})();

// Kiểm tra hồ sơ đã điền đủ chưa
function isHoSoDayDu(loai, data) {
  if (loai === "Khách hàng") {
    return !!(data.tenKhachHang && data.email && data.soDienThoai);
  }
  if (loai === "Nhà tổ chức") {
    // ✅ Bắt buộc có ảnh QR thanh toán
    return !!(
      data.tenCongTy &&
      data.tenNguoiDaiDien &&
      data.email &&
      data.soDienThoai &&
      data.maQR
    );
  }
  if (loai === "Nhân viên") {
    return !!(data.tenNhanVien && data.email && data.soDienThoai);
  }
  return true;
}