function acceptRegister() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const role     = document.querySelector('input[name="role"]:checked');

    if (username === "" || password === "" || role === null) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    fetch(`${BASE_URL}/taikhoan/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tenDangNhap:  username,
            matKhau:      password,
            loaiTaiKhoan: role.value
        })
    })

    // FIX: backend trả 204 No Content khi thành công — không có body để đọc
    // Nếu gọi response.text() rồi JSON.parse("") → lỗi. Chỉ đọc body khi !response.ok.
    .then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Đăng ký thất bại");
        }
        alert("Đăng ký thành công");
        window.location.href = "loginpopup.html";
    })

    .catch(error => {
        alert(error.message);
    });
}