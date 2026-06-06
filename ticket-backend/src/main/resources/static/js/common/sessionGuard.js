/**
 * sessionGuard.js — tự động văng user ra nếu bị chặn hoặc bị xóa
 * Nhúng vào HTML SAU thẻ script khai báo BASE_URL
 */
(function () {
  const INTERVAL_MS = 10_000;

  // Tự detect BASE_URL nếu không có
  function getBaseUrl() {
    if (typeof BASE_URL !== 'undefined') return BASE_URL;
    return window.location.origin + '/api'; // fallback
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  }

  function forceLogout(msg) {
    localStorage.removeItem('user');
    alert(msg);
    // tìm trang login đúng
    const origin = window.location.origin;
    const path = window.location.pathname.replace(/\/[^/]*$/, '/');
    window.location.href = origin + path + 'index.html';
  }

  async function checkSession() {
    const user = getUser();
    if (!user) return;

    const id = user.maTaiKhoan || user.id;
    if (!id) {
      console.warn('[sessionGuard] Không tìm thấy maTaiKhoan trong localStorage:', user);
      return;
    }

    const url = `${getBaseUrl()}/taikhoan/${id}`;
    console.log('[sessionGuard] Checking:', url); // debug — xóa sau khi xác nhận hoạt động

    try {
      const res = await fetch(url);

      if (res.status === 404) {
        forceLogout('⚠️ Tài khoản của bạn đã bị xóa.');
        return;
      }

      if (!res.ok) return; // lỗi mạng tạm thời → bỏ qua

      const data = await res.json();
      if (data.trangThai === 'blocked') {
        forceLogout('🚫 Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
      }

    } catch (e) {
      console.warn('[sessionGuard] Lỗi kết nối, thử lại sau:', e.message);
    }
  }

  // Chạy ngay khi load trang
  checkSession();

  // Chạy định kỳ
  setInterval(checkSession, INTERVAL_MS);
})();