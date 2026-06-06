function login() {

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    if (username === "" || password === "") {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    fetch(`${BASE_URL}/taikhoan/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tenDangNhap: username,
            matKhau: password
        })
    })

    .then(async response => {
        if (!response.ok) {
            const message = await response.text();
            throw new Error(message);
        }
        return response.json();
    })

    .then(data => {
        localStorage.setItem("user", JSON.stringify(data));

        if (data.loaiTaiKhoan === "Khách hàng") {
            window.parent.location.href = "loginCustomer.html";
        } else if (data.loaiTaiKhoan === "Nhà tổ chức") {
            window.parent.location.href = "loginCreator.html";
        } else if (data.loaiTaiKhoan === "Nhân viên") {
            window.parent.location.href = "loginEmployee.html";
        } else {
            window.parent.location.href = "loginAdmin.html";
        }
    })

    .catch(error => {
        alert(error.message);
    });
}
