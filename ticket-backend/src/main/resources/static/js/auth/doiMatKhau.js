function doiMatKhau() {
    const matKhauCu      = document.getElementById("matKhauCu").value.trim();
    const matKhauMoi     = document.getElementById("matKhauMoi").value.trim();
    const xacNhanMatKhau = document.getElementById("xacNhanMatKhau").value.trim();
    const msg            = document.getElementById("msg");

    msg.className = "msg";
    msg.textContent = "";

    if (!matKhauCu || !matKhauMoi || !xacNhanMatKhau) {
        showMsg("Vui lòng nhập đầy đủ thông tin", "err");
        return;
    }

    if (matKhauMoi.length < 6) {
        showMsg("Mật khẩu mới phải có ít nhất 6 ký tự", "err");
        return;
    }

    if (matKhauMoi !== xacNhanMatKhau) {
        showMsg("Xác nhận mật khẩu không khớp", "err");
        return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { window.location.href = "loginpopup.html"; return; }

    const btn = document.querySelector(".btn-primary");
    btn.disabled = true;
    btn.textContent = "Đang xử lý...";

    fetch(`${BASE_URL}/taikhoan/${user.maTaiKhoan}/doi-mat-khau`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matKhauCu, matKhauMoi, xacNhanMatKhau })
    })
    .then(async res => {
        if (!res.ok) {
            const text = await res.text();
            throw new Error(text);
        }
    })
    .then(() => {
        showMsg("✅ Đổi mật khẩu thành công!", "ok");
        document.getElementById("matKhauCu").value      = "";
        document.getElementById("matKhauMoi").value     = "";
        document.getElementById("xacNhanMatKhau").value = "";
        setTimeout(goBack, 1500);
    })
    .catch(err => {
        showMsg(err.message, "err");
    })
    .finally(() => {
        btn.disabled = false;
        btn.textContent = "Xác nhận";
    });
}

function showMsg(text, type) {
    const msg = document.getElementById("msg");
    msg.textContent  = text;
    msg.className    = "msg " + type;
}

function goBack() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { window.location.href = "index.html"; return; }
    const dest = { customer: "loginCustomer.html", creator: "loginCreator.html", admin: "loginAdmin.html" };
    window.location.href = dest[user.loaiTaiKhoan] || "index.html";
}