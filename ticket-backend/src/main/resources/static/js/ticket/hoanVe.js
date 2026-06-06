
function validateLoaiVe(value){
    return value === "VIP" || value === "Thường";
}

function loadHoanVe() {
    clearContent();
    const container = document.getElementById("hoanVeList");
    container.innerHTML = `<div style="text-align:center;padding:40px;color:#888"><div class="spinner" style="margin:0 auto 12px"></div><p>Đang tải...</p></div>`;

    const user = JSON.parse(localStorage.getItem("user"));
    fetch(`${BASE_URL}/hoanve/creator/${user.maTaiKhoan}`)
        .then(r => r.json())
        .then(data => {
            if (!data.length) {
                container.innerHTML = `<div style="text-align:center;padding:60px 20px;color:#888">
                    <div style="font-size:3rem;margin-bottom:16px">✅</div>
                    <p>Chưa có yêu cầu hoàn vé nào.</p></div>`;
                return;
            }

            const statusLabel = { pending: "⏳ Chờ duyệt", approved: "✅ Đã duyệt", rejected: "❌ Từ chối" };
            const statusColor = { pending: "#f59e0b", approved: "#10b981", rejected: "#ef4444" };

            container.innerHTML = `
                <h2 style="padding:20px 24px 8px;font-size:1.1rem;font-weight:700;color:#333">🔄 Yêu cầu hoàn vé</h2>
                <table style="width:100%;border-collapse:collapse;font-size:0.88rem">
                    <thead>
                        <tr style="background:#f3f4f6;color:#555;text-align:left">
                            <th style="padding:10px 16px">#</th>
                            <th style="padding:10px 16px">Sự kiện</th>
                            <th style="padding:10px 16px">Vé</th>
                            <th style="padding:10px 16px">Khách hàng</th>
                            <th style="padding:10px 16px">SL hoàn</th>
                            <th style="padding:10px 16px">Lý do</th>
                            <th style="padding:10px 16px">Ngày yêu cầu</th>
                            <th style="padding:10px 16px">Trạng thái</th>
                            <th style="padding:10px 16px">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(hv => `
                            <tr style="border-bottom:1px solid #eee" id="row-${hv.maHoanVe}">
                                <td style="padding:10px 16px;color:#aaa">#${hv.maHoanVe}</td>
                                <td style="padding:10px 16px;font-weight:600">${hv.tenSuKien}</td>
                                <td style="padding:10px 16px">${hv.tenVe}</td>
                                <td style="padding:10px 16px">${hv.tenKhachHang || "—"}</td>
                                <td style="padding:10px 16px;text-align:center">${hv.soLuongHoan}</td>
                                <td style="padding:10px 16px;color:#666;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${hv.lyDoHoan || ''}">${hv.lyDoHoan || "—"}</td>
                                <td style="padding:10px 16px">${hv.thoiGianHoan ? (Array.isArray(hv.thoiGianHoan) ? hv.thoiGianHoan.join("-") : hv.thoiGianHoan) : "—"}</td>
                                <td style="padding:10px 16px">
                                    <span style="padding:3px 10px;border-radius:20px;font-size:0.8rem;font-weight:600;background:${(statusColor[hv.trangThaiHoan]||'#888')}22;color:${statusColor[hv.trangThaiHoan]||'#888'}">
                                        ${statusLabel[hv.trangThaiHoan] || hv.trangThaiHoan}
                                    </span>
                                </td>
                                <td style="padding:10px 16px">
                                    ${hv.trangThaiHoan === 'pending' ? `
                                        <button onclick="duyetHoanVe(${hv.maHoanVe},'approved')" style="padding:5px 12px;background:#10b981;color:#fff;border:none;border-radius:6px;cursor:pointer;margin-right:6px;font-size:0.82rem;font-weight:600">Duyệt</button>
                                        <button onclick="duyetHoanVe(${hv.maHoanVe},'rejected')" style="padding:5px 12px;background:#ef4444;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:0.82rem;font-weight:600">Từ chối</button>
                                    ` : `<span style="color:#aaa;font-size:0.82rem">Đã xử lý</span>`}
                                </td>
                            </tr>`).join("")}
                    </tbody>
                </table>`;
        })
        .catch(() => {
            container.innerHTML = `<div style="text-align:center;padding:40px;color:#e55">Không thể tải danh sách hoàn vé.</div>`;
        });
}

function duyetHoanVe(maHoanVe, trangThai) {
    fetch(`${BASE_URL}/hoanve/${maHoanVe}/duyet`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trangThai })
    })
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .then(() => loadHoanVe())
    .catch(() => alert("Có lỗi xảy ra, vui lòng thử lại."));
}