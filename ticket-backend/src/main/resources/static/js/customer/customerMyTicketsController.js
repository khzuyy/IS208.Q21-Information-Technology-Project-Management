/* ==========================================================
   js/customer/myTicketsController.js
   Quản lý tab "Vé của tôi" — dành riêng cho khách hàng.
   ========================================================== */

// ── STATE ─────────────────────────────────────────────────
let allMyTickets   = [];   // toàn bộ hóa đơn gốc
let activeMyFilter = "all";

// ── LOAD & RENDER ─────────────────────────────────────────
function loadMyTickets() {
    MyTicketsView.showLoading();
    OrderService.getByCustomer(currentUser.maTaiKhoan)
        .then(data => {
            allMyTickets   = data;
            activeMyFilter = "all";
            _resetDateFilter();
            renderMyTickets();
        })
        .catch(err => MyTicketsView.showError(err.message));
}

function applyMyTicketFilter(filter) {
    activeMyFilter = filter;
    renderMyTickets();
}

// Lọc theo ngày mua của hóa đơn
function _getDateFilteredTickets() {
    const from = document.getElementById("filterTicketFrom")?.value;
    const to   = document.getElementById("filterTicketTo")?.value;
    if (!from && !to) return allMyTickets;

    const dFrom = from ? new Date(from + "T00:00:00") : null;
    const dTo   = to   ? new Date(to   + "T23:59:59") : null;

    return allMyTickets.filter(hd => {
        const ngay = new Date(hd.ngayMua || hd.createdAt || 0);
        if (dFrom && ngay < dFrom) return false;
        if (dTo   && ngay > dTo)   return false;
        return true;
    });
}

function renderMyTickets() {
    const list = _getDateFilteredTickets();
    _updateFilterInfo(list.length, allMyTickets.length);
    MyTicketsView.render(
        list,
        activeMyFilter,
        (filter) => applyMyTicketFilter(filter),
        (maVe, maHoaDon, maGheList, lyDo, tenVe) => {
            OrderService.requestRefund({
                maHoaDon:  maHoaDon,
                maVe:      maVe,
                maGheList: maGheList,
                lyDoHoan:  lyDo || null,
            })
            .then(data => {
                alert(`✅ Yêu cầu hoàn #${data.maHoanVe} đã được ghi nhận.`);
                loadMyTickets();
            })
            .catch(err => alert(err.message));
        }
    );
}

// ── LỌC NGÀY ─────────────────────────────────────────────
function applyTicketDateFilter() {
    activeMyFilter = "all";
    renderMyTickets();
}

function clearTicketDateFilter() {
    _resetDateFilter();
    renderMyTickets();
}

function _resetDateFilter() {
    const fi = document.getElementById("filterTicketFrom");
    const ti = document.getElementById("filterTicketTo");
    if (fi) fi.value = "";
    if (ti) ti.value = "";
    const info = document.getElementById("ticketFilterInfo");
    if (info) info.style.display = "none";
}

function _updateFilterInfo(filtered, total) {
    const info = document.getElementById("ticketFilterInfo");
    if (!info) return;
    const from = document.getElementById("filterTicketFrom")?.value;
    const to   = document.getElementById("filterTicketTo")?.value;
    if (!from && !to) { info.style.display = "none"; return; }
    const fmt  = (s) => s ? new Date(s + "T00:00:00").toLocaleDateString("vi-VN") : "—";
    info.textContent   = `Hiển thị ${filtered}/${total} vé · Từ ${fmt(from)} đến ${fmt(to)}`;
    info.style.display = "block";
}

// ── HOÀN VÉ ───────────────────────────────────────────────
let hoanVeData = { maVe: null, maHoaDon: null, soLuongMua: 1, hoanQty: 1 };

function openHoanVeModal(maVe, maHoaDon, soLuongMua, tenVe) {
    hoanVeData = { maVe, maHoaDon, soLuongMua, hoanQty: 1 };
    EventView.openHoanVeModal(maVe, maHoaDon, soLuongMua, tenVe);
}

function closeHoanVeModal() { EventView.closeHoanVeModal(); }

function changeHoanQty(delta) {
    const next = hoanVeData.hoanQty + delta;
    if (next < 1 || next > hoanVeData.soLuongMua) return;
    hoanVeData.hoanQty = next;
    EventView.setHoanQtyDisplay(next);
}

function confirmHoanVe() {
    EventView.setHoanBtnState(true);
    EventView.showHoanVeMsg("", "");
    OrderService.requestRefund({
        maHoaDon:    hoanVeData.maHoaDon,
        maVe:        hoanVeData.maVe,
        soLuongHoan: hoanVeData.hoanQty,
        lyDoHoan:    EventView.getHoanLyDo() || null,
    })
    .then(data => {
        EventView.showHoanVeMsg(`✅ Yêu cầu hoàn #${data.maHoanVe} đã được ghi nhận.`, "ok");
        EventView.setHoanBtnState(false);
        setTimeout(() => { closeHoanVeModal(); loadMyTickets(); }, 2500);
    })
    .catch(err => {
        EventView.showHoanVeMsg(err.message, "err");
        EventView.setHoanBtnState(false);
    });
}