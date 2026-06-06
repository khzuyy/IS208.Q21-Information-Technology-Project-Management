/* =========================
   LOAD SỰ KIỆN VÀO DROPDOWN
========================= */

window.addEventListener("DOMContentLoaded", function () {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginpopup.html";
        return;
    }

    fetch(`${BASE_URL}/sukien/creator/${currentUser.maTaiKhoan}`)
    .then(response => {
        if (!response.ok) throw new Error("Không lấy được sự kiện");
        return response.json();
    })
    .then(data => {
        const select = document.getElementById("danhSachSuKien");
        if (data.length === 0) {
            select.innerHTML = `<option value="">-- Chưa có sự kiện nào --</option>`;
            return;
        }
        data.forEach(sk => {
            const opt = document.createElement("option");
            opt.value = sk.maSuKien;
            opt.textContent = sk.tenSuKien;
            select.appendChild(opt);
        });
    })
    .catch(error => {
        alert(error.message);
    });

});

/* =========================
   TẠO KHUYẾN MÃI
========================= */

function createVoucher() {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginpopup.html";
        return;
    }

    const maCode       = document.getElementById("maCode").value.trim();
    // FIX: parse sang số thay vì để string → backend không bị lỗi validate
    const mucKhuyenMai = parseFloat(document.getElementById("mucKhuyenMai").value);
    const soLuong  = parseInt(document.getElementById("soLuong").value);
    const ngayBatDau   = document.getElementById("ngayBatDau").value;
    const ngayKetThuc  = document.getElementById("ngayKetThuc").value;

    // FIX: lấy các option đã chọn từ multi-select
    const selectedOptions = Array.from(document.getElementById("danhSachSuKien").selectedOptions);
    const danhSachSuKien  = selectedOptions.map(o => o.value).join(",");

    if (!maCode || isNaN(mucKhuyenMai) || isNaN(soLuong) || !ngayBatDau || !ngayKetThuc) {
        alert("Vui lòng nhập đầy đủ thông tin");
        return;
    }

    if (danhSachSuKien === "") {
        alert("Vui lòng chọn ít nhất 1 sự kiện");
        return;
    }

    if (ngayKetThuc < ngayBatDau) {
        alert("Ngày kết thúc phải sau ngày bắt đầu");
        return;
    }

    fetch(`${BASE_URL}/voucher`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            maCode,
            mucKhuyenMai,   // number
            soLuong,     // number
            ngayBatDau,
            ngayKetThuc,
            danhSachSuKien, // "1,2,3"
            maTaiKhoan: currentUser.maTaiKhoan
        })
    })
    .then(async response => {
        const text = await response.text();
        if (!response.ok) throw new Error(text);
        return JSON.parse(text);
    })
    .then(() => {
        alert("Tạo khuyến mãi thành công");
        window.location.href = "loginCreator.html";
    })
    .catch(error => {
        alert(error.message);
    });
}

function goBack() {
    window.location.href = "loginCreator.html";
}