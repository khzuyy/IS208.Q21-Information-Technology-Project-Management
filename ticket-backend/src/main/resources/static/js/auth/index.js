/* ==========================================================
   js/index.js  —  Trang landing (index.html)
   Phụ thuộc: js/common/api.js (BASE_URL), js/common/ui.js (openPopup)
   ========================================================== */

let allEvents = [];
let activeCat = "";
const ACCENT_CLASSES = ["", "accent-b", "accent-c", "accent-d"];

/* ──────────────────────────────────────────
   BOOT
────────────────────────────────────────── */
window.addEventListener("DOMContentLoaded", () => {
  // Đã đăng nhập → redirect đúng trang
  const raw = localStorage.getItem("user");
  if (raw) {
    try {
      const u = JSON.parse(raw);
      if (u.loaiTaiKhoan === "Khách hàng") { window.location.href = "loginCustomer.html"; return; }
      if (u.loaiTaiKhoan === "Nhà tổ chức")  { window.location.href = "loginCreator.html";  return; }
      if (u.loaiTaiKhoan === "Nhân viên") { window.location.href = "loginEmployee.html"; return; }
      if (u.loaiTaiKhoan === "Quản lý")    { window.location.href = "loginAdmin.html";     return; }
    } catch (e) {}
  }
  loadEvents();
});

/* ──────────────────────────────────────────
   LOAD SỰ KIỆN
────────────────────────────────────────── */
function loadEvents() {
  fetch(`${BASE_URL}/sukien`)
    .then(res => {
      if (!res.ok) throw new Error("Không lấy được sự kiện");
      return res.json();
    })
    .then(data => {
      allEvents = data;
      const stat = document.getElementById("statEvents");
      if (stat) stat.textContent = data.length + "+";
      renderEvents(data);
    })
    .catch(err => {
      document.getElementById("eventGrid").innerHTML = emptyState("⚠️", err.message);
    });
}

/* ──────────────────────────────────────────
   FILTER & SORT
────────────────────────────────────────── */
function applyFilter() {
  const kw   = document.getElementById("searchInput").value.trim().toLowerCase();
  const sort = document.getElementById("sortSelect").value;

  let list = allEvents.filter(sk => {
    const matchKw  = sk.tenSuKien.toLowerCase().includes(kw) ||
                     (sk.moTa || "").toLowerCase().includes(kw);
    const matchCat = !activeCat ||
                     (sk.moTa || "").toLowerCase().includes(activeCat) ||
                     sk.tenSuKien.toLowerCase().includes(activeCat);
    return matchKw && matchCat;
  });

  if (sort === "asc")  list.sort((a, b) => new Date(a.thoiGianBatDau) - new Date(b.thoiGianBatDau));
  if (sort === "desc") list.sort((a, b) => new Date(b.thoiGianBatDau) - new Date(a.thoiGianBatDau));

  renderEvents(list);
}

function filterByCategory(btn, cat) {
  activeCat = cat;
  document.querySelectorAll(".cat-chip").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  applyFilter();
}

function onHeaderSearch() {
  const val = document.getElementById("headerSearch").value;
  document.getElementById("searchInput").value = val;
  applyFilter();
  scrollToEvents();
}

function scrollToEvents() {
  document.getElementById("eventsSection").scrollIntoView({ behavior: "smooth" });
}

/* ──────────────────────────────────────────
   RENDER
────────────────────────────────────────── */
function renderEvents(data) {
  const grid = document.getElementById("eventGrid");

  if (data.length === 0) {
    grid.innerHTML = emptyState("🎪", "Không tìm thấy sự kiện nào.");
    return;
  }

  grid.innerHTML = data.map((sk, idx) => {
    const accent = ACCENT_CLASSES[idx % ACCENT_CLASSES.length];
    return `
      <div class="pub-event-card" style="animation-delay:${idx * 0.07}s">
        <div class="card-accent ${accent}"></div>
        <div class="pub-card-body">
          <span class="pub-card-tag">🎪 Sự kiện</span>
          <h3 class="pub-card-name">${esc(sk.tenSuKien)}</h3>
          <p class="pub-card-desc">${esc(sk.moTa || "Không có mô tả")}</p>
          <div class="pub-card-dates">
            <div class="pub-date-row">
              <span class="pub-date-icon">📅</span>
              <span>Bắt đầu: <strong>${fmtDate(sk.thoiGianBatDau)}</strong></span>
            </div>
            <div class="pub-date-row">
              <span class="pub-date-icon">🏁</span>
              <span>Kết thúc: <strong>${fmtDate(sk.thoiGianKetThuc)}</strong></span>
            </div>
            <div class="pub-date-row" id="venue-${sk.maSuKien}">
              <span class="pub-date-icon">📍</span>
              <span style="color:#aaa;font-size:.78rem">Đang tải...</span>
            </div>
          </div>
        </div>
        <div class="pub-card-footer">
          <div>
            <span class="pub-price-from">Từ</span>
            <span class="pub-price-val" id="price-${sk.maSuKien}">Đang tải...</span>
          </div>
          <button class="pub-buy-btn" onclick="requireLogin()">Mua vé</button>
        </div>
      </div>`;
  }).join("");

  // Tải giá vé thấp nhất + địa điểm cho từng sự kiện
  data.forEach(sk => { loadMinPrice(sk.maSuKien); loadVenue(sk); });
}

function loadMinPrice(maSuKien) {
  fetch(`${BASE_URL}/ve/sukien/${maSuKien}`)
    .then(r => r.ok ? r.json() : [])
    .then(tickets => {
      const el = document.getElementById(`price-${maSuKien}`);
      if (!el) return;
      if (!tickets || tickets.length === 0) {
        el.textContent = "Liên hệ";
        return;
      }
      const min = Math.min(...tickets.map(v => v.gia));
      el.textContent = fmtPrice(min);
    })
    .catch(() => {
      const el = document.getElementById(`price-${maSuKien}`);
      if (el) el.textContent = "—";
    });
}

function loadVenue(sk) {
  const el = document.getElementById(`venue-${sk.maSuKien}`);
  if (!el) return;

  const render = (dd) => {
    if (!dd || !dd.tenDiaDiem) { el.style.display = "none"; return; }
    el.innerHTML =
      `<span class="pub-date-icon">📍</span>` +
      `<span>${esc(dd.tenDiaDiem)}${dd.diaChi ? ` · <span style="color:#aaa">${esc(dd.diaChi)}</span>` : ""}</span>`;
  };

  if (sk.maDiaDiem) {
    fetch(`${BASE_URL}/diadiem/${sk.maDiaDiem}`)
      .then(r => r.ok ? r.json() : null)
      .then(render)
      .catch(() => { el.style.display = "none"; });
  } else {
    fetch(`${BASE_URL}/sukien/${sk.maSuKien}`)
      .then(r => r.ok ? r.json() : null)
      .then(detail => {
        if (!detail?.maDiaDiem) { el.style.display = "none"; return; }
        return fetch(`${BASE_URL}/diadiem/${detail.maDiaDiem}`)
          .then(r => r.ok ? r.json() : null)
          .then(render);
      })
      .catch(() => { el.style.display = "none"; });
  }
}

function requireLogin() {
  openPopup(); // từ ui.js
}

/* ──────────────────────────────────────────
   HELPERS
────────────────────────────────────────── */
function fmtDate(val) {
  if (!val) return "—";
  if (Array.isArray(val)) {
    const [y, m, d] = val;
    return `${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
  }
  const d = new Date(val);
  return isNaN(d) ? val : d.toLocaleDateString("vi-VN");
}

function fmtPrice(n) {
  return Number(n).toLocaleString("vi-VN") + " ₫";
}

function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function emptyState(icon, msg) {
  return `<div class="empty-state">
    <div class="empty-icon">${icon}</div>
    <p>${esc(msg)}</p>
  </div>`;
}