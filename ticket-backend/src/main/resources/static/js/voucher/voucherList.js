let allVouchers = [];

function loadVouchers() {

    clearContent();

    const voucherList = document.getElementById("voucherList");

    voucherList.innerHTML = `
        <div class="top-actions">
            <button class="create-btn" onclick="openCreateVoucher()">Tạo khuyến mãi</button>
        </div>
        <div class="filter-panel">
            <input type="text" id="filterMaCode"    placeholder="Tìm theo mã code..."     oninput="applyVoucherFilter()" />
            <input type="text" id="filterTenSuKien" placeholder="Tìm theo sự kiện..."     oninput="applyVoucherFilter()" />
        </div>
        <div id="voucherContent"></div>
    `;

    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (!currentUser) {
        alert("Vui lòng đăng nhập");
        window.location.href = "loginpopup.html";
        return;
    }

    fetch(`${BASE_URL}/voucher/creator/${currentUser.maTaiKhoan}`)
    .then(response => {
        if (!response.ok) throw new Error("Không lấy được khuyến mãi");
        return response.json();
    })
    .then(data => {
        allVouchers = data;
        renderVouchers(data);
    })
    .catch(error => {
        alert(error.message);
    });
}

function applyVoucherFilter() {
    const maCode    = document.getElementById("filterMaCode").value.trim().toLowerCase();
    const tenSuKien = document.getElementById("filterTenSuKien").value.trim().toLowerCase();

    const filtered = allVouchers.filter(v => {
        const matchMaCode = v.maCode.toLowerCase().includes(maCode);
        // FIX: filter theo tất cả sự kiện trong tenSuKienList thay vì chỉ tenSuKien đơn
        const danhSachTen = v.tenSuKienList && v.tenSuKienList.length > 0
            ? v.tenSuKienList.join(" ").toLowerCase()
            : "";
        const matchSuKien = danhSachTen.includes(tenSuKien);
        return matchMaCode && matchSuKien;
    });

    renderVouchers(filtered);
}

function renderVouchers(data) {

    const container = document.getElementById("voucherContent");
    if (!container) return;

    if (data.length === 0) {
        container.innerHTML = "<p>Không có khuyến mãi nào</p>";
        return;
    }

    let html = "";
    data.forEach(v => {
        // FIX: dùng tenSuKienList để hiển thị tất cả sự kiện áp dụng
        const suKienHtml = (v.tenSuKienList && v.tenSuKienList.length > 0)
            ? v.tenSuKienList.map(ten => `<span class="tag-sukien">${ten}</span>`).join(" ")
            : "<em>Chưa gán sự kiện</em>";

        html += `
            <div class="ticket-card">
                <p><strong>Mã code: ${v.maCode}</strong></p>
                <p>Sự kiện áp dụng: ${suKienHtml}</p>
                <p>Mức giảm: ${v.mucKhuyenMai}%</p>
                <p>Lượt sử dụng: <strong>${v.luotSuDung}</strong> / ${v.soLuong} lượt</p>
                <p>Trạng thái: <span class="${v.trangThai === 'active' ? 'status-active' : 'status-inactive'}">${v.trangThai === 'active' ? 'Đang hoạt động' : 'Ngừng hoạt động'}</span></p>
                <p>Từ: ${v.ngayBatDau} → ${v.ngayKetThuc}</p>
                <div class="event-actions">
                    <button class="edit-btn"   onclick="editVoucher(${v.maVoucher})">Chỉnh sửa</button>
                    <button class="delete-btn" onclick="deleteVoucher(${v.maVoucher})">Xóa</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function editVoucher(maVoucher) {
    window.location.href = `editVoucher.html?id=${maVoucher}`;
}

function deleteVoucher(maVoucher) {

    if (!confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return;

    fetch(`${BASE_URL}/voucher/${maVoucher}`, { method: "DELETE" })
    .then(response => {
        if (!response.ok) throw new Error("Xóa thất bại");
        alert("Xóa khuyến mãi thành công");
        loadVouchers();
    })
    .catch(error => {
        alert(error.message);
    });
}

function openCreateVoucher() {
    window.location.href = "taoKhuyenMai.html";
}