/* ==========================================================
     js/admin — Admin Dashboard Controller
     API: BASE_URL/taikhoan, BASE_URL/sukien  (từ api.js)
  ========================================================== */

  /* ── GLOBAL STATE ── */
  let allUsersData   = [];
  let allEventsData  = [];
  let currentPage    = 'dashboard';
  let pendingAction  = null;
  let adminLogs      = JSON.parse(localStorage.getItem('adminLogs') || '[]');

  /* ── BOOT ── */
  window.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) {
      const name = user.hoTen || user.tenDangNhap || 'Admin';
      document.getElementById('avName').textContent = name;
      document.getElementById('welcomeAdmin').textContent = name;
      document.getElementById('avInitial').textContent = name.charAt(0).toUpperCase();
    }
    loadAllData();
  });

  /* ── LOAD ALL DATA ── */
  async function loadAllData() {
    await Promise.all([
      loadUsers(),
      loadEvents()
    ]);
    renderDashboard();
    renderBlockedBadge();
    renderReviewBadge();
  }

  async function refreshDashboard() {
    toast('🔄 Đang làm mới dữ liệu...', 'info');
    await loadAllData();
    toast('✅ Đã cập nhật dữ liệu mới nhất!');
  }

  /* ── LOAD USERS ── */
  async function loadUsers() {
    try {
      const data = await apiFetch('/taikhoan');
      allUsersData = Array.isArray(data) ? data : [];
    } catch (e) {
      allUsersData = [];
    }
    document.getElementById('cnt-users').textContent = allUsersData.length;
  }

  /* ── LOAD EVENTS ── */
  async function loadEvents() {
    try {
      const data = await apiFetch('/sukien/admin');
      allEventsData = Array.isArray(data) ? data : [];
    } catch (e) {
      allEventsData = [];
    }
  }

  /* ── RENDER DASHBOARD ── */
  function renderDashboard() {
    const total   = allUsersData.length;
    const blocked = allUsersData.filter(u => (u.trangThai||'active') === 'blocked').length;
    const active  = total - blocked;
    const pending = allEventsData.filter(e => e.trangThai === 'Chờ duyệt').length;
    const evTotal = allEventsData.length;

    document.getElementById('ds-total').textContent   = total;
    document.getElementById('ds-active').textContent  = active;
    document.getElementById('ds-blocked').textContent = blocked;
    document.getElementById('ds-pending').textContent = pending;
    document.getElementById('ds-events').textContent  = evTotal;

    // Recent users table
    const recentU = allUsersData.slice(-5).reverse();
    document.getElementById('recentUsers').innerHTML = `
      <table>
        <thead><tr><th>Người dùng</th><th>Loại</th><th>Trạng thái</th></tr></thead>
        <tbody>${recentU.map(u => `
          <tr>
            <td><div class="user-cell">
              <div class="uav" style="background:${roleColor(u.loaiTaiKhoan)}">${(u.tenDangNhap||'?').charAt(0)}</div>
              <div><div class="uname">${u.tenDangNhap}</div></div>
            </div></td>
            <td>${roleBadge(u.loaiTaiKhoan)}</td>
            <td>${statusBadge((u.trangThai||'active'))}</td>
          </tr>`).join('')}
        </tbody>
      </table>`;

    // Pending events
    const pendingEvs = allEventsData.filter(e => e.trangThai === 'Chờ duyệt').slice(0, 3);
    if (pendingEvs.length === 0) {
      document.getElementById('recentPending').innerHTML = `<div class="empty-state" style="padding:30px"><div class="es-icon">✅</div><p>Không có sự kiện chờ duyệt</p></div>`;
    } else {
      document.getElementById('recentPending').innerHTML = pendingEvs.map(e => `
        <div class="review-item">
          <div class="review-icon-box">🎟</div>
          <div class="review-content">
            <div class="review-title">${e.tenSuKien}</div>
            <div class="review-meta">NTC: ${e.tenNhaToChuC} · ${e.ngayToChuc}</div>
            <div class="review-actions">
              <button class="btn-action btn-green" onclick="approveEvent(${e.maSuKien})">✅ Duyệt</button>
              <button class="btn-action btn-red"   onclick="rejectEvent(${e.maSuKien})">❌ Từ chối</button>
            </div>
          </div>
        </div>`).join('');
    }
  }

  /* ── NAV BADGES ── */
  function renderBlockedBadge() {
    const n = allUsersData.filter(u => (u.trangThai||'active') === 'blocked').length;
    document.getElementById('cnt-blocked').textContent = n;
  }
  function renderReviewBadge() {
    const n = allEventsData.filter(e => e.trangThai === 'Chờ duyệt').length;
    const v = allEventsData.filter(e => ['Vi phạm','Ẩn'].includes(e.trangThai)).length;
    document.getElementById('cnt-review').textContent = n;
    document.getElementById('cnt-vio').textContent = v;
  }

  /* ── PAGE NAVIGATION ── */
  function goPage(name) {
    document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('pg-' + name).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(n => {
      if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + name + "'"))
        n.classList.add('active');
    });
    currentPage = name;
    // Lazy render
    const renders = {
      users:       () => { renderUsersTable(); },
      customers:   () => renderTypeTable('customers','Khách hàng'),
      organizers:  () => renderTypeTable('organizers','Nhà tổ chức'),
      staffs:      () => renderTypeTable('staffs','Nhân viên'),
      blocked:     renderBlockedTable,
      events:      renderEventsTable,
      review:      renderReviewPage,
      violations:  renderViolationsTable,
      reports:     loadReports,
      logs:        renderLogs,
    };
    if (renders[name]) renders[name]();
  }

  /* ══════════ USER TABLES ══════════ */

  function renderUsersTable(filter) {
    let data = allUsersData;
    const search = (document.getElementById('searchUsers')?.value || '').toLowerCase();
    const role   = document.getElementById('filterRole')?.value || '';
    const status = document.getElementById('filterStatus')?.value || '';
    if (search) data = data.filter(u => (u.tenDangNhap||'').toLowerCase().includes(search));
    if (role)   data = data.filter(u => u.loaiTaiKhoan === role);
    if (status) data = data.filter(u => u.trangThai === status);
    renderUserRows('usersBody', data, true);
  }

  function filterUsers() { renderUsersTable(); }

  function renderTypeTable(tableId, role) {
    const searchId = 'search' + tableId.charAt(0).toUpperCase() + tableId.slice(1);
    const search   = (document.getElementById(searchId)?.value || '').toLowerCase();
    let data = allUsersData.filter(u => u.loaiTaiKhoan === role);
    if (search) data = data.filter(u => (u.tenDangNhap||'').toLowerCase().includes(search));
    renderUserRows(tableId + 'Body', data, false);
  }

  function filterByType(tableId, role) { renderTypeTable(tableId, role); }

  function renderBlockedTable() {
    const data = allUsersData.filter(u => (u.trangThai||'active') === 'blocked');
    const tbody = document.getElementById('blockedBody');
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="es-icon">🎉</div><p>Không có tài khoản nào bị chặn</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(u => `
      <tr>
        <td><div class="user-cell">
          <div class="uav" style="background:${roleColor(u.loaiTaiKhoan)}">${(u.tenDangNhap||'?').charAt(0)}</div>
          <div><div class="uname">${u.tenDangNhap}</div></div>
        </div></td>
        <td>${roleBadge(u.loaiTaiKhoan)}</td>
        <td style="font-size:12px;color:var(--red)">${u.lyDoChaN||'—'}</td>
        <td style="font-size:12px;color:var(--gray3)">${u.ngayTao||'—'}</td>
        <td><div class="act-cell">
          <button class="btn-action btn-green" onclick="confirmUnblock(${u.maTaiKhoan}, '${escHtml(u.tenDangNhap)}')">✅ Bỏ chặn</button>
          <button class="btn-action btn-red"   onclick="confirmDelete(${u.maTaiKhoan}, '${escHtml(u.tenDangNhap)}', 'user')">🗑 Xoá</button>
        </div></td>
      </tr>`).join('');
  }

  /* ══════════ EVENT TABLES ══════════ */

  function renderEventsTable() {
    let data = allEventsData;
    const search = (document.getElementById('searchEvents')?.value || '').toLowerCase();
    const status = document.getElementById('filterEventStatus')?.value || '';
    if (search) data = data.filter(e => e.tenSuKien.toLowerCase().includes(search));
    if (status) data = data.filter(e => e.trangThai === status);

    const tbody = document.getElementById('eventsBody');
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="es-icon">📭</div><p>Không tìm thấy sự kiện</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(e => `
      <tr>
        <td><div class="user-cell">
          <div class="uav" style="background:var(--teal2);border-radius:6px">🎟</div>
          <div><div class="uname">${e.tenSuKien}</div></div>
        </div></td>
        <td style="font-size:12px">${e.tenNhaToChuC || '—'}</td>
        <td>${eventStatusBadge(e.trangThai)}</td>
        <td style="font-size:12px;color:var(--gray3)">${e.ngayToChuc || '—'}</td>
        <td><div class="act-cell">
          ${e.trangThai === 'Chờ duyệt'
            ? `<button class="btn-action btn-green"  onclick="approveEvent(${e.maSuKien})">✅ Duyệt</button>
               <button class="btn-action btn-orange" onclick="rejectEvent(${e.maSuKien})">❌ Từ chối</button>`
            : ''}
          ${e.trangThai !== 'Ẩn'
            ? `<button class="btn-action btn-gray"   onclick="confirmHideEvent(${e.maSuKien}, '${escHtml(e.tenSuKien)}')">🙈 Ẩn</button>`
            : `<button class="btn-action btn-teal"   onclick="unhideEvent(${e.maSuKien})">👁 Hiện</button>`}
          ${e.trangThai !== 'Vi phạm'
            ? `<button class="btn-action btn-orange" onclick="markViolation(${e.maSuKien}, '${escHtml(e.tenSuKien)}')">⚠️ Vi phạm</button>`
            : `<button class="btn-action btn-green"  onclick="clearViolation(${e.maSuKien})">✅ Xoá vi phạm</button>`}
          <button class="btn-action btn-red" onclick="confirmDelete(${e.maSuKien}, '${escHtml(e.tenSuKien)}', 'event')">🗑 Xoá</button>
        </div></td>
      </tr>`).join('');
  }

  function filterEvents() { renderEventsTable(); }

  function renderReviewPage() {
    const pending = allEventsData.filter(e => e.trangThai === 'Chờ duyệt');
    const el = document.getElementById('reviewList');
    if (!pending.length) {
      el.innerHTML = `<div class="empty-state"><div class="es-icon">🎉</div><p>Tất cả sự kiện đã được kiểm duyệt!</p></div>`;
      return;
    }
    el.innerHTML = pending.map(e => `
      <div class="review-item" id="rev-${e.maSuKien}">
        <div class="review-icon-box">🎟</div>
        <div class="review-content">
          <div class="review-title">${e.tenSuKien}</div>
          <div class="review-meta">📅 ${e.ngayToChuc} &nbsp;|&nbsp; 🏢 NTC: ${e.tenNhaToChuC}</div>
          <div class="review-actions">
            <button class="btn-action btn-green"  onclick="approveEvent(${e.maSuKien})">✅ Phê duyệt</button>
            <button class="btn-action btn-red"    onclick="rejectEvent(${e.maSuKien})">❌ Từ chối</button>
            <button class="btn-action btn-orange" onclick="markViolation(${e.maSuKien}, '${escHtml(e.tenSuKien)}')">⚠️ Đánh vi phạm</button>
          </div>
        </div>
      </div>`).join('');
  }

  function renderViolationsTable() {
    const data = allEventsData.filter(e => ['Vi phạm','Ẩn'].includes(e.trangThai));
    const tbody = document.getElementById('violationsBody');
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><div class="es-icon">✅</div><p>Không có sự kiện vi phạm</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(e => `
      <tr>
        <td><b>${e.tenSuKien}</b></td>
        <td style="font-size:12px">${e.tenNhaToChuC || '—'}</td>
        <td>${eventStatusBadge(e.trangThai)}</td>
        <td><div class="act-cell">
          ${e.trangThai === 'Vi phạm'
            ? `<button class="btn-action btn-green" onclick="clearViolation(${e.maSuKien})">✅ Xoá vi phạm</button>` : ''}
          ${e.trangThai === 'Ẩn'
            ? `<button class="btn-action btn-teal"  onclick="unhideEvent(${e.maSuKien})">👁 Hiện lại</button>` : ''}
          <button class="btn-action btn-red" onclick="confirmDelete(${e.maSuKien}, '${escHtml(e.tenSuKien)}', 'event')">🗑 Xoá vĩnh viễn</button>
        </div></td>
      </tr>`).join('');
  }

  /* ══════════ ACTIONS ══════════ */

  /* Block / Unblock user */
  function confirmBlock(id, name) {
    openConfirm({
      icon: '🚫', title: `Chặn tài khoản`,
      desc: `Bạn có chắc muốn chặn tài khoản <b>${name}</b>? Người dùng sẽ không thể đăng nhập.`,
      showReason: true,
      okClass: 'btn-confirm-red', okText: '🚫 Chặn ngay',
      onConfirm: () => blockUser(id, name)
    });
  }
async function blockUser(id, name) {
    // ✅ đọc reason TRƯỚC khi gọi API
    const reason = document.getElementById('confirmReasonInput')?.value.trim() || 'Vi phạm chính sách';
    try {
        await apiFetch(`/taikhoan/${id}/block`, {
            method: 'PUT',
            body: JSON.stringify({ lyDo: reason }) // ✅ gửi lyDo lên backend
        });
    } catch (e) { /* mock */ }
    const u = allUsersData.find(x => x.maTaiKhoan === id);
    if (u) { u.trangThai = 'blocked'; u.lyDoChaN = reason; }
    closeConfirm();
    addLog('Chặn tài khoản', name, '✅ Thành công');
    toast(`🚫 Đã chặn tài khoản ${name}`, 'warn');
    renderBlockedBadge();
    goPage(currentPage);
}

  function confirmUnblock(id, name) {
    openConfirm({
      icon: '✅', title: `Bỏ chặn tài khoản`,
      desc: `Bỏ chặn tài khoản <b>${name}</b>?`,
      okClass: 'btn-confirm-teal', okText: '✅ Bỏ chặn',
      onConfirm: () => unblockUser(id, name)
    });
  }
  async function unblockUser(id, name) {
    try { await apiFetch(`/taikhoan/${id}/unblock`, { method: 'PUT' }); } catch(e){}
    const u = allUsersData.find(x => x.maTaiKhoan === id);
    if (u) { u.trangThai = 'active'; u.lyDoChaN = ''; }
    closeConfirm();
    addLog('Bỏ chặn tài khoản', name, '✅ Thành công');
    toast(`✅ Đã bỏ chặn ${name}`);
    renderBlockedBadge();
    goPage(currentPage);
  }

  /* Delete */
  function confirmDelete(id, name, type) {
    openConfirm({
      icon: '🗑', title: `Xoá vĩnh viễn`,
      desc: `Bạn có chắc muốn <b>xoá vĩnh viễn</b> "${name}"?<br>Hành động này <b>không thể hoàn tác</b>.`,
      okClass: 'btn-confirm-red', okText: '🗑 Xoá vĩnh viễn',
      onConfirm: () => deleteItem(id, name, type)
    });
  }
  async function deleteItem(id, name, type) {
    try {
      const endpoint = type === 'user' ? `/taikhoan/${id}` : `/sukien/${id}`;
      await apiFetch(endpoint, { method: 'DELETE' });
      if (type === 'user')  allUsersData  = allUsersData.filter(x => x.maTaiKhoan !== id);
      if (type === 'event') allEventsData = allEventsData.filter(x => x.maSuKien !== id);
      closeConfirm();
      addLog('Xoá ' + (type==='user'?'tài khoản':'sự kiện'), name, '✅ Đã xoá');
      toast(`🗑 Đã xoá "${name}"`, 'warn');
      renderBlockedBadge(); renderReviewBadge();
      renderDashboard();
      goPage(currentPage);
    } catch(e) {
      closeConfirm();
      toast(`❌ Xoá thất bại: ${e.message || 'Lỗi server'}`, 'err');
    }
  }

  /* Approve / Reject events */
  async function approveEvent(id) {
    try { await apiFetch(`/sukien/${id}/approve`, { method: 'PUT' }); } catch(e){}
    const ev = allEventsData.find(e => e.maSuKien === id);
    if (ev) ev.trangThai = 'Đã duyệt';
    addLog('Phê duyệt sự kiện', ev?.tenSuKien||'#'+id, '✅ Đã duyệt');
    toast(`✅ Đã duyệt sự kiện "${ev?.tenSuKien}"`);
    renderReviewBadge(); renderDashboard();
    goPage(currentPage);
  }

  function rejectEvent(id) {
    const ev = allEventsData.find(e => e.maSuKien === id);
    openConfirm({
      icon: '❌', title: 'Từ chối sự kiện',
      desc: `Từ chối sự kiện <b>${ev?.tenSuKien}</b>? Nhà tổ chức sẽ được thông báo.`,
      showReason: true,
      okClass: 'btn-confirm-red', okText: '❌ Từ chối',
      onConfirm: async () => {
        try { await apiFetch(`/sukien/${id}/reject`, { method: 'PUT' }); } catch(e){}
        if (ev) ev.trangThai = 'Từ chối';
        closeConfirm();
        addLog('Từ chối sự kiện', ev?.tenSuKien||'#'+id, '❌ Đã từ chối');
        toast(`❌ Đã từ chối sự kiện "${ev?.tenSuKien}"`, 'err');
        renderReviewBadge(); renderDashboard();
        goPage(currentPage);
      }
    });
  }

  /* Hide / Unhide events */
  function confirmHideEvent(id, name) {
    openConfirm({
      icon: '🙈', title: 'Ẩn sự kiện',
      desc: `Ẩn sự kiện <b>${name}</b>? Sự kiện sẽ không còn hiển thị với người dùng.`,
      showReason: true,
      okClass: 'btn-confirm-red', okText: '🙈 Ẩn ngay',
      onConfirm: () => hideEvent(id, name)
    });
  }
  async function hideEvent(id, name) {
    try { await apiFetch(`/sukien/${id}/hide`, { method: 'PUT' }); } catch(e){}
    const ev = allEventsData.find(e => e.maSuKien === id);
    const reason = document.getElementById('confirmReasonInput').value.trim();
    if (ev) { ev.trangThai = 'Ẩn'; }
    closeConfirm();
    addLog('Ẩn sự kiện', name, '✅ Đã ẩn');
    toast(`🙈 Đã ẩn sự kiện "${name}"`, 'warn');
    renderReviewBadge(); goPage(currentPage);
  }
  async function unhideEvent(id) {
    try { await apiFetch(`/sukien/${id}/unhide`, { method: 'PUT' }); } catch(e){}
    const ev = allEventsData.find(e => e.maSuKien === id);
    if (ev) { ev.trangThai = 'Đã duyệt'; }
    addLog('Hiện sự kiện', ev?.tenSuKien||'#'+id, '✅ Đã hiện');
    toast(`👁 Đã hiện lại sự kiện "${ev?.tenSuKien}"`);
    renderReviewBadge(); goPage(currentPage);
  }

  /* Mark / Clear violation */
  function markViolation(id, name) {
    openConfirm({
      icon: '⚠️', title: 'Đánh dấu vi phạm',
      desc: `Đánh dấu sự kiện <b>${name}</b> vi phạm chính sách?`,
      showReason: true,
      okClass: 'btn-confirm-red', okText: '⚠️ Đánh vi phạm',
      onConfirm: async () => {
        try { await apiFetch(`/sukien/${id}/violation`, { method: 'PUT' }); } catch(e){}
        const ev = allEventsData.find(e => e.maSuKien === id);
        const reason = document.getElementById('confirmReasonInput').value.trim();
        if (ev) { ev.trangThai = 'Vi phạm'; }
        closeConfirm();
        addLog('Đánh vi phạm', name, '⚠️ Vi phạm');
        toast(`⚠️ Đã đánh vi phạm "${name}"`, 'warn');
        renderReviewBadge(); goPage(currentPage);
      }
    });
  }
  async function clearViolation(id) {
    const ev = allEventsData.find(e => e.maSuKien === id);
    try { await apiFetch(`/sukien/${id}/clearviolation`, { method: 'PUT' }); } catch(e){}
    if (ev) { ev.trangThai = 'Đã duyệt'; }
    addLog('Xoá vi phạm', ev?.tenSuKien||'#'+id, '✅ Đã xoá vi phạm');
    toast(`✅ Đã xoá vi phạm cho "${ev?.tenSuKien}"`);
    renderReviewBadge(); goPage(currentPage);
  }

  /* ══════════ REPORTS ══════════ */
  function loadReports() {
    const kh  = allUsersData.filter(u => u.loaiTaiKhoan==='Khách hàng').length;
    const ntc = allUsersData.filter(u => u.loaiTaiKhoan==='Nhà tổ chức').length;
    const nv  = allUsersData.filter(u => u.loaiTaiKhoan==='Nhân viên').length;
    const ok  = allEventsData.filter(e => e.trangThai==='Đã duyệt').length;
    const bad = allEventsData.filter(e => ['Vi phạm','Ẩn'].includes(e.trangThai)).length;
    document.getElementById('rp-kh').textContent    = kh;
    document.getElementById('rp-ntc').textContent   = ntc;
    document.getElementById('rp-nv').textContent    = nv;
    document.getElementById('rp-sk-ok').textContent = ok;
    document.getElementById('rp-sk-bad').textContent = bad;

    const total = kh + ntc + nv || 1;
    document.getElementById('reportChart').innerHTML = [
      { label:'Khách hàng',  val:kh,  color:'var(--teal)' },
      { label:'Nhà tổ chức', val:ntc, color:'var(--purple)' },
      { label:'Nhân viên',   val:nv,  color:'var(--orange)' },
    ].map(d => {
      const pct = Math.round(d.val / total * 100);
      return `
        <div style="flex:1;min-width:160px;background:var(--gray1);border-radius:10px;padding:16px 18px">
          <div style="font-size:12px;font-weight:600;color:var(--gray4);margin-bottom:8px">${d.label}</div>
          <div style="font-size:26px;font-weight:800;color:var(--gray5);margin-bottom:6px">${d.val}</div>
          <div style="height:6px;background:var(--gray2);border-radius:3px;overflow:hidden">
            <div style="height:100%;width:${pct}%;background:${d.color};border-radius:3px;transition:width .6s"></div>
          </div>
          <div style="font-size:11px;color:var(--gray3);margin-top:4px">${pct}% tổng người dùng</div>
        </div>`;
    }).join('');
  }

  /* ══════════ LOGS ══════════ */
  function addLog(action, target, result) {
    adminLogs.unshift({
      time: new Date().toLocaleString('vi-VN'),
      action, target, result
    });
    if (adminLogs.length > 100) adminLogs.pop();
    localStorage.setItem('adminLogs', JSON.stringify(adminLogs));
  }
  function renderLogs() {
    if (!adminLogs.length) {
      document.getElementById('logsBody').innerHTML = `<tr class="loading-row"><td colspan="4">Chưa có hoạt động nào.</td></tr>`;
      return;
    }
    document.getElementById('logsBody').innerHTML = adminLogs.map(l => `
      <tr>
        <td style="font-size:12px;color:var(--gray3);white-space:nowrap">${l.time}</td>
        <td><b>${l.action}</b></td>
        <td style="font-size:13px">${l.target}</td>
        <td>${l.result}</td>
      </tr>`).join('');
  }
  function clearLogs() {
    adminLogs = [];
    localStorage.removeItem('adminLogs');
    renderLogs();
    toast('🗑 Đã xoá nhật ký');
  }

  /* ══════════ CONFIRM MODAL ══════════ */
  let _onConfirm = null;
  function openConfirm({ icon, title, desc, showReason, okClass, okText, onConfirm }) {
    document.getElementById('confirmIcon').textContent = icon;
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmDesc').innerHTML = desc;
    document.getElementById('confirmReason').style.display = showReason ? 'block' : 'none';
    document.getElementById('confirmReasonInput').value = '';
    const btn = document.getElementById('confirmOkBtn');
    btn.textContent = okText;
    btn.className = `btn-action ${okClass}`;
    _onConfirm = onConfirm;
    document.getElementById('confirmOverlay').classList.add('open');
  }
  function closeConfirm() {
    document.getElementById('confirmOverlay').classList.remove('open');
    _onConfirm = null;
  }
  function confirmAction() { if (_onConfirm) _onConfirm(); }

  /* ══════════ TOAST ══════════ */
  function toast(msg, type='ok') {
    const c = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = 'toast-msg' + (type==='err' ? ' err' : type==='warn' ? ' warn' : '');
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => { el.style.opacity='0'; el.style.transition='opacity .3s'; }, 2600);
    setTimeout(() => el.remove(), 3000);
  }

  /* ══════════ GLOBAL SEARCH ══════════ */
  function globalSearchHandler() {
    const q = document.getElementById('globalSearch').value.trim().toLowerCase();
    if (!q) return;
    const matchUser  = allUsersData.find(u => (u.tenDangNhap||'').toLowerCase().includes(q));
    const matchEvent = allEventsData.find(e => e.tenSuKien.toLowerCase().includes(q));
    if (matchUser) { goPage('users'); document.getElementById('searchUsers').value = q; filterUsers(); }
    else if (matchEvent) { goPage('events'); document.getElementById('searchEvents').value = q; filterEvents(); }
    else toast(`Không tìm thấy "${q}"`, 'warn');
  }

  /* ══════════ NOTIF ══════════ */
  function showNotif() {
    const p = allEventsData.filter(e => e.trangThai === 'Chờ duyệt').length;
    const b = allUsersData.filter(u => (u.trangThai||'active') === 'blocked').length;
    toast(`🔔 ${p} sự kiện chờ duyệt · ${b} tài khoản bị chặn`);
  }

  /* ══════════ BADGE HELPERS ══════════ */
  function roleColor(role) {
    return { 'Khách hàng':'#0d9488','Nhà tổ chức':'#7c3aed','Nhân viên':'#d97706' }[role] || '#6b7280';
  }
  function roleBadge(role) {
    const map = {
      'Khách hàng' : ['badge-kh','🛒'],
      'Nhà tổ chức': ['badge-ntc','🎪'],
      'Nhân viên'  : ['badge-nv','💼'],
      'Admin'      : ['badge-admin','👑'],
    };
    const [cls, icon] = map[role] || ['badge-kh','👤'];
    return `<span class="badge ${cls}">${icon} ${role}</span>`;
  }
  function statusBadge(s) {
    if (s === 'active')  return `<span class="badge badge-active"><span class="badge-dot"></span>Hoạt động</span>`;
    if (s === 'blocked') return `<span class="badge badge-block"><span class="badge-dot"></span>Bị chặn</span>`;
    return `<span class="badge badge-hidden">${s}</span>`;
  }
  function eventStatusBadge(s) {
    const map = {
      'Đã duyệt' : 'badge-approved',
      'Chờ duyệt': 'badge-pending',
      'Ẩn'       : 'badge-hidden',
      'Vi phạm'  : 'badge-violation',
      'Từ chối'  : 'badge-block',
    };
    return `<span class="badge ${map[s]||'badge-hidden'}">${s}</span>`;
  }
  function escHtml(s) { return (s||'').replace(/'/g,"\\'").replace(/"/g,'&quot;'); }

  /* ══════════════════════════════════════════════════════════
     QUẢN LÝ TÀI KHOẢN — MỞ RỘNG
  ══════════════════════════════════════════════════════════ */

  /* ── 1. XEM CHI TIẾT TÀI KHOẢN ── */
  function viewUserDetail(id) {
    const u = allUsersData.find(x => x.maTaiKhoan === id);
    if (!u) return;

    _injectAccountModals();
    const modal   = document.getElementById('_acModal');
    const content = document.getElementById('_acContent');

    const initials = (u.tenDangNhap || '?').charAt(0).toUpperCase();
    const color    = roleColor(u.loaiTaiKhoan);

    content.innerHTML = `
      <div style="text-align:center;margin-bottom:20px">
        <div style="width:64px;height:64px;border-radius:50%;background:${color};
                    color:#fff;font-size:1.6rem;font-weight:800;display:flex;
                    align-items:center;justify-content:center;margin:0 auto 10px">
          ${initials}
        </div>
        <div style="font-size:1.1rem;font-weight:800;color:#1a1a2e">${u.tenDangNhap || '—'}</div>
        <div style="margin-top:6px">${roleBadge(u.loaiTaiKhoan)} ${statusBadge(u.trangThai||'active')}</div>
      </div>
      <div style="background:#f8f9fb;border-radius:12px;padding:16px;font-size:.88rem;display:grid;gap:10px">
        <div style="display:flex;justify-content:space-between">
          <span style="color:#888;font-weight:600">Mã tài khoản</span>
          <span style="font-weight:700">#${u.maTaiKhoan}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#888;font-weight:600">Tên đăng nhập</span>
          <span style="font-weight:700">${u.tenDangNhap || '—'}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#888;font-weight:600">Loại tài khoản</span>
          <span>${roleBadge(u.loaiTaiKhoan)}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#888;font-weight:600">Trạng thái</span>
          <span>${statusBadge(u.trangThai||'active')}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#888;font-weight:600">Ngày tạo</span>
          <span style="font-weight:700">${u.ngayTao || '—'}</span>
        </div>
        ${u.lyDoChaN ? `<div style="display:flex;justify-content:space-between">
          <span style="color:#888;font-weight:600">Lý do chặn</span>
          <span style="color:#dc2626;font-weight:600">${u.lyDoChaN}</span>
        </div>` : ''}
      </div>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap">
        ${u.loaiTaiKhoan !== 'Quản lý' ? `
          ${u.trangThai !== 'blocked'
            ? `<button class="btn-action btn-orange" style="flex:1" onclick="closeAccountModal();confirmBlock(${u.maTaiKhoan},'${escHtml(u.tenDangNhap)}')">🚫 Chặn</button>`
            : `<button class="btn-action btn-green"  style="flex:1" onclick="closeAccountModal();confirmUnblock(${u.maTaiKhoan},'${escHtml(u.tenDangNhap)}')">✅ Bỏ chặn</button>`}
          <button class="btn-action btn-red" style="flex:1" onclick="closeAccountModal();confirmDelete(${u.maTaiKhoan},'${escHtml(u.tenDangNhap)}','user')">🗑 Xoá</button>
        ` : `<div style="color:#888;font-size:.85rem;text-align:center;width:100%">👑 Không thể chặn hoặc xoá tài khoản Admin</div>`}
        <button class="btn-action btn-gray" style="flex:1" onclick="closeAccountModal()">Đóng</button>
      </div>`;

    modal.classList.add('open');
  }

  function closeAccountModal() {
    document.getElementById('_acModal')?.classList.remove('open');
  }

  /* ── 2. TẠO TÀI KHOẢN MỚI ── */
  function openCreateAccount() {
    _injectAccountModals();
    const modal   = document.getElementById('_acModal');
    const content = document.getElementById('_acContent');

    content.innerHTML = `
      <div style="font-size:1.1rem;font-weight:800;color:#1a1a2e;margin-bottom:16px">➕ Tạo tài khoản mới</div>
      <div style="display:grid;gap:12px">
        <div>
          <label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Tên đăng nhập *</label>
          <input id="_acUsername" type="text" placeholder="Nhập tên đăng nhập..."
            style="width:100%;border:1.5px solid #e0e0e0;border-radius:10px;padding:9px 12px;font-size:.9rem;box-sizing:border-box;outline:none"
            onfocus="this.style.borderColor='#0d9488'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
        <div>
          <label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Mật khẩu *</label>
          <input id="_acPassword" type="password" placeholder="Nhập mật khẩu..."
            style="width:100%;border:1.5px solid #e0e0e0;border-radius:10px;padding:9px 12px;font-size:.9rem;box-sizing:border-box;outline:none"
            onfocus="this.style.borderColor='#0d9488'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
        <div>
          <label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Loại tài khoản *</label>
          <select id="_acRole"
            style="width:100%;border:1.5px solid #e0e0e0;border-radius:10px;padding:9px 12px;font-size:.9rem;box-sizing:border-box;outline:none;background:#fff">
            <option value="Nhân viên">💼 Nhân viên</option>
            <option value="Khách hàng">🛒 Khách hàng</option>
            <option value="Nhà tổ chức">🎪 Nhà tổ chức</option>
          </select>
        </div>
        <div id="_acCreateMsg" style="font-size:.83rem;font-weight:600;min-height:20px"></div>
        <div style="display:flex;gap:8px">
          <button class="btn-action btn-cancel-m" style="flex:1" onclick="closeAccountModal()">Huỷ</button>
          <button class="btn-action btn-teal" style="flex:1" onclick="submitCreateAccount()">➕ Tạo tài khoản</button>
        </div>
      </div>`;

    modal.classList.add('open');
  }

  async function submitCreateAccount() {
    const username = document.getElementById('_acUsername').value.trim();
    const password = document.getElementById('_acPassword').value.trim();
    const role     = document.getElementById('_acRole').value;
    const msgEl    = document.getElementById('_acCreateMsg');

    if (!username || !password) {
      msgEl.style.color = '#dc2626';
      msgEl.textContent = '⚠️ Vui lòng điền đầy đủ thông tin.';
      return;
    }
    if (password.length < 6) {
      msgEl.style.color = '#dc2626';
      msgEl.textContent = '⚠️ Mật khẩu phải có ít nhất 6 ký tự.';
      return;
    }

    msgEl.style.color = '#888';
    msgEl.textContent = '⏳ Đang tạo...';

    try {
      const res = await apiFetch('/taikhoan', {
        method: 'POST',
        body: JSON.stringify({ tenDangNhap: username, matKhau: password, loaiTaiKhoan: role })
      });
      const newUser = { maTaiKhoan: res.maTaiKhoan || Date.now(), tenDangNhap: username, loaiTaiKhoan: role, trangThai: 'active', ngayTao: new Date().toLocaleDateString('vi-VN') };
      allUsersData.push(newUser);
      closeAccountModal();
      addLog('Tạo tài khoản', username, '✅ Thành công');
      toast(`✅ Đã tạo tài khoản "${username}"`);
      renderDashboard(); renderBlockedBadge();
      goPage(currentPage);
    } catch (e) {
      msgEl.style.color = '#dc2626';
      msgEl.textContent = '❌ ' + (e.message || 'Tạo tài khoản thất bại.');
    }
  }

  /* ── 3. RESET MẬT KHẨU ── */
  function openResetPassword(id, name) {
    _injectAccountModals();
    const modal   = document.getElementById('_acModal');
    const content = document.getElementById('_acContent');

    content.innerHTML = `
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:2rem;margin-bottom:8px">🔑</div>
        <div style="font-size:1.1rem;font-weight:800;color:#1a1a2e">Reset mật khẩu</div>
        <div style="font-size:.85rem;color:#888;margin-top:4px">Tài khoản: <b>${name}</b></div>
      </div>
      <div style="display:grid;gap:12px">
        <div>
          <label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Mật khẩu mới *</label>
          <input id="_acNewPwd" type="password" placeholder="Nhập mật khẩu mới..."
            style="width:100%;border:1.5px solid #e0e0e0;border-radius:10px;padding:9px 12px;font-size:.9rem;box-sizing:border-box;outline:none"
            onfocus="this.style.borderColor='#0d9488'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
        <div>
          <label style="font-size:.82rem;font-weight:600;color:#555;display:block;margin-bottom:4px">Xác nhận mật khẩu *</label>
          <input id="_acConfPwd" type="password" placeholder="Nhập lại mật khẩu..."
            style="width:100%;border:1.5px solid #e0e0e0;border-radius:10px;padding:9px 12px;font-size:.9rem;box-sizing:border-box;outline:none"
            onfocus="this.style.borderColor='#0d9488'" onblur="this.style.borderColor='#e0e0e0'" />
        </div>
        <div id="_acPwdMsg" style="font-size:.83rem;font-weight:600;min-height:20px"></div>
        <div style="display:flex;gap:8px">
          <button class="btn-action btn-cancel-m" style="flex:1" onclick="closeAccountModal()">Huỷ</button>
          <button class="btn-action btn-teal" style="flex:1" onclick="submitResetPassword(${id},'${escHtml(name)}')">🔑 Xác nhận reset</button>
        </div>
      </div>`;

    modal.classList.add('open');
  }

  async function submitResetPassword(id, name) {
    const newPwd  = document.getElementById('_acNewPwd').value.trim();
    const confPwd = document.getElementById('_acConfPwd').value.trim();
    const msgEl   = document.getElementById('_acPwdMsg');

    if (!newPwd || !confPwd) {
      msgEl.style.color = '#dc2626'; msgEl.textContent = '⚠️ Vui lòng điền đầy đủ.'; return;
    }
    if (newPwd.length < 6) {
      msgEl.style.color = '#dc2626'; msgEl.textContent = '⚠️ Mật khẩu phải ít nhất 6 ký tự.'; return;
    }
    if (newPwd !== confPwd) {
      msgEl.style.color = '#dc2626'; msgEl.textContent = '⚠️ Mật khẩu xác nhận không khớp.'; return;
    }

    msgEl.style.color = '#888'; msgEl.textContent = '⏳ Đang xử lý...';

    try {
      await apiFetch(`/taikhoan/${id}/reset-password`, {
        method: 'PUT',
        body: JSON.stringify({ matKhauMoi: newPwd })
      });
      closeAccountModal();
      addLog('Reset mật khẩu', name, '✅ Thành công');
      toast(`🔑 Đã reset mật khẩu cho "${name}"`);
    } catch (e) {
      msgEl.style.color = '#dc2626';
      msgEl.textContent = '❌ ' + (e.message || 'Reset thất bại.');
    }
  }

  /* ── 4. ĐỔI LOẠI TÀI KHOẢN (ROLE) ── */
  function openChangeRole(id, name, currentRole) {
    _injectAccountModals();
    const modal   = document.getElementById('_acModal');
    const content = document.getElementById('_acContent');

    const roles = ['Khách hàng', 'Nhà tổ chức', 'Nhân viên'];

    content.innerHTML = `
      <div style="text-align:center;margin-bottom:16px">
        <div style="font-size:2rem;margin-bottom:8px">🔄</div>
        <div style="font-size:1.1rem;font-weight:800;color:#1a1a2e">Đổi loại tài khoản</div>
        <div style="font-size:.85rem;color:#888;margin-top:4px">Tài khoản: <b>${name}</b></div>
        <div style="margin-top:6px">Hiện tại: ${roleBadge(currentRole)}</div>
      </div>
      <div style="display:grid;gap:10px;margin-bottom:16px">
        ${roles.filter(r => r !== currentRole).map(r => `
          <button onclick="submitChangeRole(${id},'${escHtml(name)}','${r}')"
            style="padding:12px 16px;border:1.5px solid #e0e0e0;border-radius:10px;
                   background:#f8f9fb;font-size:.9rem;font-weight:600;cursor:pointer;
                   text-align:left;transition:.15s"
            onmouseover="this.style.borderColor='#0d9488';this.style.background='#f0fdfb'"
            onmouseout="this.style.borderColor='#e0e0e0';this.style.background='#f8f9fb'">
            ${roleBadge(r)} → Chuyển sang <b>${r}</b>
          </button>`).join('')}
      </div>
      <button class="btn-action btn-cancel-m" style="width:100%" onclick="closeAccountModal()">Huỷ</button>`;

    modal.classList.add('open');
  }

  async function submitChangeRole(id, name, newRole) {
    try {
      await apiFetch(`/taikhoan/${id}/role`, {
        method: 'PUT',
        body: JSON.stringify({ loaiTaiKhoan: newRole })
      });
    } catch(e) { /* mock */ }
    const u = allUsersData.find(x => x.maTaiKhoan === id);
    if (u) u.loaiTaiKhoan = newRole;
    closeAccountModal();
    addLog('Đổi role', name, `✅ → ${newRole}`);
    toast(`✅ Đã đổi "${name}" → ${newRole}`);
    renderDashboard(); renderBlockedBadge();
    goPage(currentPage);
  }


  /* ── INJECT MODAL HTML (1 lần) ── */
  function _injectAccountModals() {
    if (document.getElementById('_acModal')) return;

    // Modal overlay
    const overlay = document.createElement('div');
    overlay.id = '_acModal';
    overlay.style.cssText = `
      display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);
      z-index:10000;align-items:center;justify-content:center;padding:16px;
      backdrop-filter:blur(3px)`;
    overlay.innerHTML = `
      <div style="background:#fff;border-radius:20px;width:100%;max-width:460px;
                  max-height:90vh;overflow-y:auto;padding:28px;position:relative;
                  box-shadow:0 20px 60px rgba(0,0,0,.2)">
        <button onclick="closeAccountModal()" style="position:absolute;top:14px;right:16px;
          background:none;border:none;font-size:1.2rem;cursor:pointer;color:#aaa;
          line-height:1;padding:4px 8px;border-radius:8px">✕</button>
        <div id="_acContent"></div>
      </div>`;
    overlay.addEventListener('click', e => { if (e.target === overlay) closeAccountModal(); });
    document.body.appendChild(overlay);

    // CSS cho btn-purple
    if (!document.getElementById('_acCSS')) {
      const s = document.createElement('style');
      s.id = '_acCSS';
      s.textContent = `
        #_acModal { display:none }
        #_acModal.open { display:flex }
        .btn-purple { background:#7c3aed!important;color:#fff!important }
        .btn-purple:hover { background:#6d28d9!important }
      `;
      document.head.appendChild(s);
    }
  }

  /* ── PATCH renderUserRows để thêm nút "Xem chi tiết" ── */
  function renderUserRows(tbodyId, data, showRole) {
    const tbody = document.getElementById(tbodyId);
    if (!data.length) {
      tbody.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="es-icon">😶</div><p>Không tìm thấy tài khoản nào</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(u => {
      const id = u.maTaiKhoan;
      const name = escHtml(u.tenDangNhap || '');
      const isAdmin = u.loaiTaiKhoan === 'Quản lý';
      const blockBtn = isAdmin ? '' : (
        u.trangThai !== 'blocked'
          ? `<button class="btn-action btn-orange" onclick="confirmBlock(${id}, '${name}')">🚫 Chặn</button>`
          : `<button class="btn-action btn-green"  onclick="confirmUnblock(${id}, '${name}')">✅ Bỏ chặn</button>`
      );
      const deleteBtn = isAdmin ? '' :
        `<button class="btn-action btn-red" onclick="confirmDelete(${id}, '${name}', 'user')">🗑 Xoá</button>`;
      return `
      <tr>
        <td><div class="user-cell">
          <div class="uav" style="background:${roleColor(u.loaiTaiKhoan)}">${(u.tenDangNhap||'?').charAt(0)}</div>
          <div><div class="uname">${u.tenDangNhap}</div></div>
        </div></td>
        ${showRole ? `<td>${roleBadge(u.loaiTaiKhoan)}</td>` : ''}
        <td>${statusBadge((u.trangThai||'active'))}</td>
        <td style="color:var(--gray3);font-size:12px">${u.ngayTao||'—'}</td>
        <td><div class="act-cell">
          <button class="btn-action btn-gray" onclick="viewUserDetail(${id})">👁 Chi tiết</button>
          ${blockBtn}
          ${deleteBtn}
        </div></td>
      </tr>`;
    }).join('');
  }