const params    = new URLSearchParams(window.location.search);
const maVoucher = params.get("id");

// Lưu lượt đã dùng thực tế khi load — dùng để validate khi update
let luotDaDungHienTai = 0;

/* =========================
   LOAD DỮ LIỆU
========================= */

window.addEventListener("DOMContentLoaded", function () {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginpopup.html";
        return;
    }

    // 1. Load danh sách sự kiện vào multi-select trước
    fetch(`${BASE_URL}/sukien/creator/${currentUser.maTaiKhoan}`)
    .then(response => {
        if (!response.ok) throw new Error("Không lấy được sự kiện");
        return response.json();
    })
    .then(suKiens => {
        const select = document.getElementById("danhSachSuKien");
        suKiens.forEach(sk => {
            const opt = document.createElement("option");
            opt.value = sk.maSuKien;
            opt.textContent = sk.tenSuKien;
            select.appendChild(opt);
        });

        // 2. Sau khi có dropdown, load thông tin voucher
        return fetch(`${BASE_URL}/voucher/${maVoucher}`);
    })
    .then(response => {
        if (!response.ok) throw new Error("Không lấy được khuyến mãi");
        return response.json();
    })
    .then(data => {
        document.getElementById("maCode").value       = data.maCode;
        document.getElementById("mucKhuyenMai").value = data.mucKhuyenMai;
        document.getElementById("luotSuDung").value   = data.soLuong;   // giới hạn tối đa
        document.getElementById("trangThai").value    = data.trangThai;
        document.getElementById("ngayBatDau").value   = toDateOnly(data.ngayBatDau);
        document.getElementById("ngayKetThuc").value  = toDateOnly(data.ngayKetThuc);

        // Lưu lại lượt đã dùng thực tế để validate khi update
        luotDaDungHienTai = data.luotSuDung || 0;
        document.getElementById("luotDaDung").value = luotDaDungHienTai;

        // FIX: restore các sự kiện đã chọn trong multi-select
        // danhSachSuKien trả về dạng "1,2,3"
        const selectedIds = (data.danhSachSuKien || "")
            .split(",")
            .map(s => s.trim())
            .filter(s => s !== "");

        const select = document.getElementById("danhSachSuKien");
        Array.from(select.options).forEach(opt => {
            opt.selected = selectedIds.includes(String(opt.value));
        });
    })
    .catch(error => {
        alert(error.message);
    });

});

/* =========================
   CẬP NHẬT KHUYẾN MÃI
========================= */

function updateVoucher() {

    const currentUser = JSON.parse(localStorage.getItem("user"));

    const maCode       = document.getElementById("maCode").value.trim();
    const mucKhuyenMai = parseFloat(document.getElementById("mucKhuyenMai").value);
    const soLuong      = parseInt(document.getElementById("luotSuDung").value);
    const trangThai    = document.getElementById("trangThai").value;
    const ngayBatDau   = document.getElementById("ngayBatDau").value;
    const ngayKetThuc  = document.getElementById("ngayKetThuc").value;

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

    // Lượt tối đa mới phải lớn hơn số lượt đã dùng thực tế
    if (soLuong <= luotDaDungHienTai) {
        alert(`Lượt sử dụng tối đa phải lớn hơn số lượt đã dùng hiện tại (${luotDaDungHienTai} lượt)`);
        return;
    }

    fetch(`${BASE_URL}/voucher/${maVoucher}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            maCode,
            mucKhuyenMai,
            soLuong,        // giới hạn tối đa mới
            trangThai,
            danhSachSuKien,
            ngayBatDau,
            ngayKetThuc,
            maTaiKhoan: currentUser ? currentUser.maTaiKhoan : null
        })
    })
    .then(async response => {
        const text = await response.text();
        if (!response.ok) throw new Error(text);
        return JSON.parse(text);
    })
    .then(() => {
        alert("Cập nhật khuyến mãi thành công");
        window.location.href = "loginCreator.html";
    })
    .catch(error => {
        alert(error.message);
    });
}


function toDateOnly(val) {
    if (!val) return "";
    if (Array.isArray(val)) {
        const [y, m, d] = val;
        return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    }
    const d = new Date(val);
    if (isNaN(d)) return val;
    return d.toISOString().slice(0, 10);
}

function goBack() {
    window.location.href = "loginCreator.html";
}