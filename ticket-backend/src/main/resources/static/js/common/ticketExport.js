/* ==========================================================
   js/common/ticketExport.js
   Dùng chung cho cả trang nhân viên lẫn khách hàng.
   Cung cấp:
     - openHoaDonDetail(group)  — mở modal chi tiết hóa đơn
     - exportTickets(group)     — xuất vé ra cửa sổ in
   ========================================================== */

(function () {

    /* ── INJECT MODAL VÀO DOM (1 lần) ───────────────────── */
    function _injectModal() {
        if (document.getElementById("hdDetailModal")) return;
        document.body.insertAdjacentHTML("beforeend", `
            <div id="hdDetailOverlay" style="
                display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);
                z-index:9000;backdrop-filter:blur(3px);"
                onclick="window._closeHoaDonDetail()">
            </div>
            <div id="hdDetailModal" style="
                display:none;position:fixed;top:50%;left:50%;
                transform:translate(-50%,-50%);
                background:#fff;border-radius:20px;
                box-shadow:0 20px 60px rgba(0,0,0,.2);
                width:min(680px,96vw);max-height:90vh;
                overflow-y:auto;z-index:9001;padding:32px;">
                <button onclick="window._closeHoaDonDetail()" style="
                    position:absolute;top:16px;right:16px;background:none;
                    border:none;font-size:1.4rem;cursor:pointer;color:#888;
                    line-height:1;">✕</button>
                <div id="hdDetailContent"></div>
            </div>
        `);
    }

    /* ── ĐỊNH NGHĨA SƠ ĐỒ ───────────────────────────────── */
    // Rect: 6 khu A-F (A/B/C = VIP, D/E/F = Thường)
    const RECT_ZONES = [
        { id: 'A', sub: 'Trái',  type: 'VIP'    },
        { id: 'B', sub: 'Giữa',  type: 'VIP'    },
        { id: 'C', sub: 'Phải',  type: 'VIP'    },
        { id: 'D', sub: 'Trái',  type: 'Thường' },
        { id: 'E', sub: 'Giữa',  type: 'Thường' },
        { id: 'F', sub: 'Phải',  type: 'Thường' },
    ];
    // Circle: 8 khu A-H (A-D = VIP, E-H = Thường)
    const CIRCLE_ZONES = [
        { id: 'A', dir: 'Tây Bắc',  type: 'VIP'    },
        { id: 'B', dir: 'Đông Bắc', type: 'VIP'    },
        { id: 'C', dir: 'Đông Nam', type: 'VIP'    },
        { id: 'D', dir: 'Tây Nam',  type: 'VIP'    },
        { id: 'E', dir: 'Tây Bắc',  type: 'Thường' },
        { id: 'F', dir: 'Đông Bắc', type: 'Thường' },
        { id: 'G', dir: 'Đông Nam', type: 'Thường' },
        { id: 'H', dir: 'Tây Nam',  type: 'Thường' },
    ];

    /* khuVuc lưu trong DB chỉ là chữ cái đơn: "A", "B", ... */
    function _zoneOf(seatId) {
        return String(seatId || '').trim().toUpperCase() || null;
    }

    function _resolveLayout(loaiSoDo) {
        if (!loaiSoDo) return 'rect';
        const n = String(loaiSoDo).trim().toUpperCase();
        return (n.includes('TRON') || n.includes('TRÒN') || n === 'CIRCLE')
            ? 'circle' : 'rect';
    }

    /* ── FETCH loaiSoDo từ sukien → diadiem ──────────────── */
    async function _fetchLoaiSoDo(maSuKien) {
        if (!maSuKien) return '';
        try {
            const sk = await apiFetch(`/sukien/${maSuKien}`);
            // loaiSoDo có thể nằm thẳng trên sukien hoặc trong object diaDiem
            const fromSk = sk.loaiSoDo || sk.LoaiSoDo || '';
            if (fromSk) return fromSk;

            const maDiaDiem = sk.maDiaDiem || sk.MaDiaDiem;
            if (!maDiaDiem) return '';

            const dd = await apiFetch(`/diadiem/${maDiaDiem}`);
            return dd.loaiSoDo || dd.LoaiSoDo || dd.loaisodo || '';
        } catch {
            return '';
        }
    }

    /* ── LẤY GHẾ ĐÃ ĐẶT TỪ API ─────────────────────────── */
    async function _fetchBookedSeats(maSuKien) {
        if (!maSuKien) return new Set();
        try {
            const data = await apiFetch(`/sukien/${maSuKien}/ghe-da-dat`);
            // API trả mảng string hoặc object; khuVuc là chữ cái đơn
            return new Set((data || []).map(g =>
                typeof g === 'string' ? g.trim().toUpperCase()
                    : (g.khuVuc || g.maGhe || g.seatId || g.id || '')
                        .toString().trim().toUpperCase()
            ).filter(Boolean));
        } catch {
            return new Set();
        }
    }

    /* ── LẤY TẤT CẢ KHU VỰC TRONG VÉ ───────────────────── */
    function _getAllMySeats(group) {
        const seats = new Set();
        (group.tickets || []).forEach(ve => {
            _parseSeatList(ve).forEach(s => seats.add(s));
        });
        return seats;
    }

    /* ── BUILD SƠ ĐỒ RECT (modal) ───────────────────────── */
    function _buildRectMapHtml(mySeats, takenSeats) {
        const sections = [
            { label: '🌟 Khu VIP',    zones: ['A','B','C'] },
            { label: '🔵 Khu Thường', zones: ['D','E','F'] },
        ];
        let html = `<div class="sm-wrap">
            <div class="sm-screen">🎭 SÂN KHẤU / MÀN HÌNH CHIẾU</div>`;
        sections.forEach(sec => {
            html += `<div class="sm-sec-title">${sec.label}</div>
                     <div class="sm-zone-row">`;
            sec.zones.forEach(zid => {
                const zDef  = RECT_ZONES.find(z => z.id === zid);
                const isMine   = mySeats.has(zid);
                const isBooked = !isMine && takenSeats.has(zid);
                const type  = zDef ? zDef.type : 'Thường';
                let cls = `sm-zone-card sm-zone-${type}`;
                if (isMine)        cls += ' sm-zone-mine';
                else if (isBooked) cls += ' sm-zone-booked';
                html += `<div class="${cls}">
                    <div class="sm-zone-label">${zid}</div>
                    <div class="sm-zone-sub">${zDef ? zDef.sub : ''}</div>
                    ${isMine   ? `<div class="sm-zone-badge">Ghế của bạn</div>` : ''}
                    ${isBooked ? `<div class="sm-zone-badge sm-zone-badge-booked">Đã đặt</div>` : ''}
                </div>`;
            });
            html += `</div>`;
        });
        html += `<div class="sm-legend">
            <span class="sm-dot sm-zone-mine"></span> Ghế của bạn &nbsp;
            <span class="sm-dot sm-zone-booked"></span> Đã đặt &nbsp;
            <span class="sm-dot sm-zone-vip"></span> VIP trống &nbsp;
            <span class="sm-dot sm-zone-normal"></span> Thường trống
        </div></div>`;
        return html;
    }

    /* ── BUILD SƠ ĐỒ CIRCLE (modal) SVG ─────────────────── */
    function _buildCircleMapHtml(mySeats, takenSeats) {
        const quadrants = [
            { id:'A', type:'VIP',    s:200, e:270, r1:65,  r2:100 },
            { id:'B', type:'VIP',    s:290, e:360, r1:65,  r2:100 },
            { id:'C', type:'VIP',    s:20,  e:90,  r1:65,  r2:100 },
            { id:'D', type:'VIP',    s:110, e:180, r1:65,  r2:100 },
            { id:'E', type:'Thường', s:200, e:270, r1:110, r2:150 },
            { id:'F', type:'Thường', s:290, e:360, r1:110, r2:150 },
            { id:'G', type:'Thường', s:20,  e:90,  r1:110, r2:150 },
            { id:'H', type:'Thường', s:110, e:180, r1:110, r2:150 },
        ];
        function arc(cx,cy,r1,r2,sD,eD){
            const toR=d=>d*Math.PI/180;
            const s=toR(sD),e=toR(eD),lg=(eD-sD)>180?1:0;
            return `M${cx+r2*Math.cos(s)},${cy+r2*Math.sin(s)}`
                 + ` A${r2},${r2} 0 ${lg},1 ${cx+r2*Math.cos(e)},${cy+r2*Math.sin(e)}`
                 + ` L${cx+r1*Math.cos(e)},${cy+r1*Math.sin(e)}`
                 + ` A${r1},${r1} 0 ${lg},0 ${cx+r1*Math.cos(s)},${cy+r1*Math.sin(s)}Z`;
        }
        const cx=180, cy=180;
        let paths = `<ellipse cx="${cx}" cy="${cy}" rx="52" ry="38"
                       fill="#ffb3c1" stroke="#e05080" stroke-width="2"/>
                     <text x="${cx}" y="${cy-4}" text-anchor="middle"
                       font-size="11" fill="#c0355a" font-weight="bold">Sân khấu</text>
                     <text x="${cx}" y="${cy+9}" text-anchor="middle"
                       font-size="9" fill="#c0355a">Màn hình chiếu</text>`;
        quadrants.forEach(q => {
            const isMine   = mySeats.has(q.id);
            const isBooked = !isMine && takenSeats.has(q.id);
            const fill   = isMine   ? '#81c784'
                         : isBooked ? '#e0e0e0'
                         : q.type === 'VIP' ? '#f7d060' : '#7ec8f7';
            const stroke = isMine   ? '#388e3c'
                         : isBooked ? '#bbb'
                         : q.type === 'VIP' ? '#c98f00' : '#2176c7';
            const txtC   = isMine   ? '#14532d'
                         : isBooked ? '#999'
                         : q.type === 'VIP' ? '#6b4800' : '#0d3c6e';
            const mid = ((q.s + q.e) / 2) * Math.PI / 180;
            const mr  = (q.r1 + q.r2) / 2;
            const lx  = cx + mr * Math.cos(mid);
            const ly  = cy + mr * Math.sin(mid);
            const zDef = CIRCLE_ZONES.find(z => z.id === q.id);
            paths += `<path d="${arc(cx,cy,q.r1,q.r2,q.s,q.e)}"
                        fill="${fill}" stroke="${stroke}" stroke-width="2"/>
                      <text x="${lx}" y="${ly-4}" text-anchor="middle"
                        font-size="12" font-weight="bold" fill="${txtC}">${q.id}</text>
                      <text x="${lx}" y="${ly+8}" text-anchor="middle"
                        font-size="8" fill="${txtC}">${zDef ? zDef.dir : ''}</text>`;
            if (isMine) {
                const bx = cx + q.r2 * Math.cos(mid);
                const by = cy + q.r2 * Math.sin(mid);
                paths += `<circle cx="${bx}" cy="${by}" r="9"
                            fill="#388e3c" stroke="#fff" stroke-width="1.5"/>
                          <text x="${bx}" y="${by+4}" text-anchor="middle"
                            font-size="9" fill="#fff" font-weight="bold">✓</text>`;
            }
        });
        return `<div class="sm-wrap">
            <svg viewBox="0 0 360 360"
                 style="width:100%;max-width:300px;display:block;margin:0 auto">${paths}</svg>
            <div class="sm-legend" style="justify-content:center">
                <span class="sm-dot sm-zone-mine"></span> Ghế của bạn &nbsp;
                <span class="sm-dot sm-zone-booked"></span> Đã đặt &nbsp;
                <span class="sm-dot sm-zone-vip"></span> VIP trống &nbsp;
                <span class="sm-dot sm-zone-normal"></span> Thường trống
            </div>
        </div>`;
    }

    /* ── BUILD SƠ ĐỒ RECT (in) ──────────────────────────── */
    function _buildRectMapPrint(mySeats, takenSeats) {
        const sections = [
            { label: '🌟 Khu VIP',    zones: ['A','B','C'] },
            { label: '🔵 Khu Thường', zones: ['D','E','F'] },
        ];
        let html = `<div class="sm-wrap-print">
            <div class="sm-screen-print">🎭 SÂN KHẤU / MÀN HÌNH CHIẾU</div>`;
        sections.forEach(sec => {
            html += `<div style="font-size:.62rem;font-weight:700;color:#555;margin:6px 0 3px">${sec.label}</div>
                     <div style="display:flex;gap:5px;margin-bottom:4px">`;
            sec.zones.forEach(zid => {
                const zDef   = RECT_ZONES.find(z => z.id === zid);
                const type   = zDef ? zDef.type : 'Thường';
                const isMine   = mySeats.has(zid);
                const isBooked = !isMine && takenSeats.has(zid);
                const bg     = isMine   ? '#81c784'
                             : isBooked ? '#e0e0e0'
                             : type === 'VIP' ? '#f7d060' : '#7ec8f7';
                const border = isMine   ? '#388e3c'
                             : isBooked ? '#bbb'
                             : type === 'VIP' ? '#c98f00' : '#2176c7';
                const txtC   = isMine   ? '#14532d'
                             : isBooked ? '#999'
                             : type === 'VIP' ? '#6b4800' : '#0d3c6e';
                html += `<div style="flex:1;min-height:52px;border-radius:8px;background:${bg};
                              border:2px solid ${border};display:flex;flex-direction:column;
                              align-items:center;justify-content:center;gap:2px;padding:4px">
                    <div style="font-size:.85rem;font-weight:800;color:${txtC}">${zid}</div>
                    <div style="font-size:.5rem;color:${txtC}">${zDef ? zDef.sub : ''}</div>
                    ${isMine ? `<div style="font-size:.48rem;font-weight:700;background:#15803d;
                        color:#fff;border-radius:4px;padding:1px 4px;margin-top:1px">Ghế bạn</div>` : ''}
                </div>`;
            });
            html += `</div>`;
        });
        html += `<div class="sm-legend-print">
            <span class="sm-dot-print" style="background:#81c784;border:1px solid #388e3c"></span> Ghế của bạn &nbsp;
            <span class="sm-dot-print" style="background:#e0e0e0;border:1px solid #bbb"></span> Đã đặt &nbsp;
            <span class="sm-dot-print" style="background:#f7d060;border:1px solid #c98f00"></span> VIP &nbsp;
            <span class="sm-dot-print" style="background:#7ec8f7;border:1px solid #2176c7"></span> Thường
        </div></div>`;
        return html;
    }

    /* ── BUILD SƠ ĐỒ CIRCLE (in) SVG ───────────────────── */
    function _buildCircleMapPrint(mySeats, takenSeats) {
        const quadrants = [
            { id:'A', type:'VIP',    s:200, e:270, r1:55,  r2:85  },
            { id:'B', type:'VIP',    s:290, e:360, r1:55,  r2:85  },
            { id:'C', type:'VIP',    s:20,  e:90,  r1:55,  r2:85  },
            { id:'D', type:'VIP',    s:110, e:180, r1:55,  r2:85  },
            { id:'E', type:'Thường', s:200, e:270, r1:92,  r2:128 },
            { id:'F', type:'Thường', s:290, e:360, r1:92,  r2:128 },
            { id:'G', type:'Thường', s:20,  e:90,  r1:92,  r2:128 },
            { id:'H', type:'Thường', s:110, e:180, r1:92,  r2:128 },
        ];
        function arc(cx,cy,r1,r2,sD,eD){
            const toR=d=>d*Math.PI/180;
            const s=toR(sD),e=toR(eD),lg=(eD-sD)>180?1:0;
            return `M${cx+r2*Math.cos(s)},${cy+r2*Math.sin(s)}`
                 + ` A${r2},${r2} 0 ${lg},1 ${cx+r2*Math.cos(e)},${cy+r2*Math.sin(e)}`
                 + ` L${cx+r1*Math.cos(e)},${cy+r1*Math.sin(e)}`
                 + ` A${r1},${r1} 0 ${lg},0 ${cx+r1*Math.cos(s)},${cy+r1*Math.sin(s)}Z`;
        }
        const cx=150, cy=150;
        let paths = `<ellipse cx="${cx}" cy="${cy}" rx="44" ry="32"
                       fill="#ffb3c1" stroke="#e05080" stroke-width="1.5"/>
                     <text x="${cx}" y="${cy-3}" text-anchor="middle"
                       font-size="10" fill="#c0355a" font-weight="bold">Sân khấu</text>
                     <text x="${cx}" y="${cy+8}" text-anchor="middle"
                       font-size="7.5" fill="#c0355a">Màn hình</text>`;
        quadrants.forEach(q => {
            const isMine   = mySeats.has(q.id);
            const isBooked = !isMine && takenSeats.has(q.id);
            const fill   = isMine   ? '#81c784'
                         : isBooked ? '#e0e0e0'
                         : q.type === 'VIP' ? '#f7d060' : '#7ec8f7';
            const stroke = isMine   ? '#388e3c'
                         : isBooked ? '#bbb'
                         : q.type === 'VIP' ? '#c98f00' : '#2176c7';
            const txtC   = isMine   ? '#14532d'
                         : isBooked ? '#999'
                         : q.type === 'VIP' ? '#6b4800' : '#0d3c6e';
            const mid = ((q.s + q.e) / 2) * Math.PI / 180;
            const mr  = (q.r1 + q.r2) / 2;
            const lx  = cx + mr * Math.cos(mid);
            const ly  = cy + mr * Math.sin(mid);
            const zDef = CIRCLE_ZONES.find(z => z.id === q.id);
            paths += `<path d="${arc(cx,cy,q.r1,q.r2,q.s,q.e)}"
                        fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>
                      <text x="${lx}" y="${ly-3}" text-anchor="middle"
                        font-size="11" font-weight="bold" fill="${txtC}">${q.id}</text>
                      <text x="${lx}" y="${ly+7}" text-anchor="middle"
                        font-size="7" fill="${txtC}">${zDef ? zDef.dir : ''}</text>`;
            if (isMine) {
                const bx = cx + q.r2 * Math.cos(mid);
                const by = cy + q.r2 * Math.sin(mid);
                paths += `<circle cx="${bx}" cy="${by}" r="8"
                            fill="#388e3c" stroke="#fff" stroke-width="1.5"/>
                          <text x="${bx}" y="${by+3}" text-anchor="middle"
                            font-size="8" fill="#fff" font-weight="bold">✓</text>`;
            }
        });
        return `<div class="sm-wrap-print">
            <svg viewBox="0 0 300 300"
                 style="width:100%;max-width:260px;display:block;margin:0 auto">${paths}</svg>
            <div class="sm-legend-print">
                <span class="sm-dot-print" style="background:#81c784;border:1px solid #388e3c"></span> Ghế của bạn &nbsp;
                <span class="sm-dot-print" style="background:#e0e0e0;border:1px solid #bbb"></span> Đã đặt &nbsp;
                <span class="sm-dot-print" style="background:#f7d060;border:1px solid #c98f00"></span> VIP &nbsp;
                <span class="sm-dot-print" style="background:#7ec8f7;border:1px solid #2176c7"></span> Thường
            </div>
        </div>`;
    }

    /* ── DISPATCH: chọn đúng hàm theo loaiSoDo ──────────── */
    function _buildSeatMapHtml(mySeats, takenSeats, loaiSoDo) {
        return _resolveLayout(loaiSoDo) === 'circle'
            ? _buildCircleMapHtml(mySeats, takenSeats)
            : _buildRectMapHtml(mySeats, takenSeats);
    }
    function _buildSeatMapHtmlRaw(mySeats, takenSeats, loaiSoDo) {
        return _resolveLayout(loaiSoDo) === 'circle'
            ? _buildCircleMapPrint(mySeats, takenSeats)
            : _buildRectMapPrint(mySeats, takenSeats);
    }

    /* ── CSS SƠ ĐỒ GHẾ (modal) ──────────────────────────── */
    const SEAT_CSS = `
        .sm-wrap{margin:14px 0 6px}
        .sm-screen{text-align:center;background:linear-gradient(180deg,#555,#888);
            color:#fff;border-radius:8px 8px 0 0;padding:7px;font-size:.7rem;
            font-weight:700;letter-spacing:1px;margin-bottom:14px}
        .sm-sec-title{font-size:.75rem;font-weight:700;color:#555;margin:8px 0 5px;letter-spacing:.5px}
        .sm-zone-row{display:flex;gap:8px;margin-bottom:8px}
        .sm-zone-card{flex:1;min-height:72px;border-radius:10px;border:2px solid transparent;
            display:flex;flex-direction:column;align-items:center;justify-content:center;
            gap:3px;padding:8px 4px}
        .sm-zone-vip{background:linear-gradient(135deg,#fff8d6,#f7d060);border-color:#c98f00}
        .sm-zone-normal{background:linear-gradient(135deg,#dff0fb,#7ec8f7);border-color:#2176c7}
        .sm-zone-mine{background:linear-gradient(135deg,#c8f0cb,#81c784)!important;border-color:#388e3c!important}
        .sm-zone-booked{background:#f3f4f6!important;border-color:#d1d5db!important;opacity:.6}
        .sm-zone-label{font-size:.95rem;font-weight:800;color:#333}
        .sm-zone-sub{font-size:.58rem;font-weight:600;color:#666}
        .sm-zone-badge{font-size:.58rem;font-weight:700;background:#15803d;color:#fff;
            border-radius:8px;padding:1px 6px;margin-top:2px}
        .sm-zone-badge-booked{background:#9ca3af}
        .sm-legend{display:flex;align-items:center;flex-wrap:wrap;gap:10px;
            margin-top:10px;font-size:.72rem;color:#666}
        .sm-dot{display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:middle}
        .sm-dot.sm-zone-mine{background:#81c784;border:1px solid #388e3c}
        .sm-dot.sm-zone-booked{background:#e0e0e0;border:1px solid #bbb}
        .sm-dot.sm-zone-vip{background:#f7d060;border:1px solid #c98f00}
        .sm-dot.sm-zone-normal{background:#7ec8f7;border:1px solid #2176c7}
    `;
    function _injectSeatCSS() {
        if (document.getElementById("_smCSS")) return;
        const s = document.createElement("style");
        s.id = "_smCSS"; s.textContent = SEAT_CSS;
        document.head.appendChild(s);
    }

    /* ── RENDER NÚT XUẤT VÉ ─────────────────────────────── */
    function _renderExportBtn(ve, group) {
        const soLuong = ve.soLuong || 0;
        const daHoan  = ve.soLuongHoan || 0;
        const conLai  = Math.max(0, soLuong - daHoan);
        const cacheKey = `hd_${group.maHoaDon}`;

        if (ve.trangThaiHoan === "approved" && conLai === 0) {
            const hoanLabel = daHoan > 0 ? daHoan + " vé" : "";
            return `<span style="margin-top:6px;display:inline-block;padding:5px 14px;
                         background:#d1fae5;color:#065f46;border-radius:20px;
                         font-size:.78rem;font-weight:700;font-family:'Inter',sans-serif">
                        💚 Đã hoàn ${hoanLabel}
                    </span>`;
        }
        const label = (ve.trangThaiHoan === "approved" && daHoan > 0)
            ? `🎫 Xuất vé còn lại (${conLai})` : "🎫 Xuất vé";
        const badge = (ve.trangThaiHoan === "approved" && daHoan > 0)
            ? `<span style="margin-top:6px;display:inline-block;padding:3px 10px;
                    background:#d1fae5;color:#065f46;border-radius:20px;
                    font-size:.72rem;font-weight:700;font-family:'Inter',sans-serif">
                    💚 Hoàn ${daHoan}/${soLuong} vé
                </span>` : "";
        // Dùng cache key thay vì nhúng JSON vào onclick
        return badge + `<button
            onclick="(function(){var g=window._ticketExportCache&&window._ticketExportCache.get('${cacheKey}');if(g)window.exportTickets(g,${ve.maVe});})()"
            style="margin-top:6px;padding:5px 14px;background:#0d9488;color:#fff;
                   border:none;border-radius:20px;font-size:.78rem;font-weight:700;
                   cursor:pointer;font-family:'Inter',sans-serif">
            ${label}
        </button>`;
    }

    /* ── RENDER NÚT XUẤT TẤT CẢ VÉ ─────────────────────── */
    function _renderExportAllBtn(group) {
        const totalConLai = group.tickets.reduce((sum, v) => {
            const sl = v.soLuong || 0;
            if (v.trangThaiHoan === "approved")
                return sum + Math.max(0, sl - (v.soLuongHoan || sl));
            return sum + sl;
        }, 0);
        if (totalConLai === 0) return "";
        const cacheKey = `hd_${group.maHoaDon}`;
        return `<div style="text-align:center">
                    <button onclick="(function(){var g=window._ticketExportCache&&window._ticketExportCache.get('${cacheKey}');if(g)window.exportTickets(g,null);})()"
                        style="padding:11px 28px;background:#0d9488;color:#fff;border:none;
                               border-radius:12px;font-size:.95rem;font-weight:700;cursor:pointer;
                               font-family:'Inter',sans-serif;width:100%">
                        🎫 Xuất tất cả vé còn hiệu lực (${totalConLai})
                    </button>
                </div>`;
    }

    /* ── MỞ MODAL CHI TIẾT HÓA ĐƠN ─────────────────────── */
    window.openHoaDonDetail = async function (group) {
        _injectModal();
        _injectSeatCSS();

        // Lưu vào cache để nút xuất vé trong modal dùng lại
        if (!window._ticketExportCache) window._ticketExportCache = new Map();
        window._ticketExportCache.set(`hd_${group.maHoaDon}`, group);

        const fmt = n => Number(n || 0).toLocaleString("vi-VN") + " ₫";
        const fmtDate = v => {
            if (!v) return "—";
            if (Array.isArray(v)) {
                const [y, m, d] = v;
                return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
            }
            const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString("vi-VN");
        };
        const showDiscount = group.thanhTienGoc && group.thanhTien &&
                             group.thanhTien < group.thanhTienGoc;

        const rows = group.tickets.map(ve => {
            const seatLabel = _formatSeatLabel(ve);
            return `
            <div style="display:flex;justify-content:space-between;align-items:flex-start;
                        padding:12px 0;border-bottom:1px solid #f0f0f0;gap:12px;flex-wrap:wrap">
                <div>
                    <div style="font-weight:700;color:#1a1a2e;font-size:.95rem">${_esc(ve.tenVe || "—")}</div>
                    <div style="font-size:.8rem;color:#888;margin-top:3px">
                        ${_esc(ve.loaiVe || "—")} · SL: <strong>${ve.soLuong}</strong>
                        · ${fmt(ve.gia)}/vé
                    </div>
                    ${seatLabel ? `
                    <div style="margin-top:5px;display:inline-flex;align-items:center;gap:5px;
                                 background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
                                 padding:3px 9px;font-size:.78rem;font-weight:700;color:#15803d">
                        💺 Khu: ${_esc(seatLabel)}
                    </div>` : ""}
                </div>
                <div style="text-align:right">
                    <div style="font-weight:700;font-size:1rem">${fmt(ve.gia * ve.soLuong)}</div>
                    ${_renderExportBtn(ve, group)}
                </div>
            </div>`;
        }).join("");

        // Fetch loaiSoDo từ sukien → diadiem, và bookedSeats song song
        const mySeats = _getAllMySeats(group);
        const [bookedSeats, loaiSoDo] = await Promise.all([
            _fetchBookedSeats(group.maSuKien),
            _fetchLoaiSoDo(group.maSuKien),
        ]);
        mySeats.forEach(s => bookedSeats.add(s));

        const seatMapHtml = mySeats.size > 0
            ? `<div style="margin-bottom:18px">
                <div style="font-weight:700;font-size:.9rem;color:#1a1a2e;margin-bottom:6px">
                    🗺️ Sơ đồ ghế ngồi
                </div>
                ${_buildSeatMapHtml(mySeats, bookedSeats, loaiSoDo)}
               </div>` : "";

        document.getElementById("hdDetailContent").innerHTML = `
            <div style="text-align:center;margin-bottom:20px">
                <div style="font-size:1.8rem">🧾</div>
                <h2 style="margin:4px 0;font-size:1.2rem;font-family:'Inter',sans-serif">
                    Chi tiết hóa đơn #${group.maHoaDon}
                </h2>
                <p style="color:#888;font-size:.85rem;margin:0">
                    📅 ${fmtDate(group.ngayMua)} &nbsp;·&nbsp; 📍 ${_esc(group.tenSuKien || "—")}
                </p>
            </div>
            <div style="background:#f9fafb;border-radius:12px;padding:14px;margin-bottom:18px;
                        font-size:.85rem;color:#555;display:flex;justify-content:space-between;
                        flex-wrap:wrap;gap:8px">
                <div>Tổng gốc: <strong style="color:#1a1a2e">${fmt(group.thanhTienGoc || group.thanhTien)}</strong></div>
                ${showDiscount ? `<div style="color:#16a34a">Sau giảm giá: <strong>${fmt(group.thanhTien)}</strong></div>` : ""}
                <div>Thanh toán: <strong style="color:#dc2626;font-size:1rem">${fmt(group.thanhTien)}</strong></div>
            </div>
            <div style="margin-bottom:18px">${rows}</div>
            ${seatMapHtml}
            ${_renderExportAllBtn(group)}
        `;
        document.getElementById("hdDetailOverlay").style.display = "block";
        document.getElementById("hdDetailModal").style.display   = "block";
    };

    window._closeHoaDonDetail = function () {
        document.getElementById("hdDetailOverlay").style.display = "none";
        document.getElementById("hdDetailModal").style.display   = "none";
    };

    /* ── XUẤT VÉ RA CỬA SỔ IN ───────────────────────────── */
    window.exportTickets = async function (group, filterMaVe) {
        const tickets = filterMaVe != null
            ? group.tickets.filter(v => v.maVe == filterMaVe)
            : group.tickets;

        const fmtDate = v => {
            if (!v) return "—";
            if (Array.isArray(v)) {
                const [y, m, d] = v;
                return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
            }
            const d = new Date(v); return isNaN(d) ? v : d.toLocaleDateString("vi-VN");
        };
        const fmt = n => Number(n || 0).toLocaleString("vi-VN") + " ₫";

        // Fetch loaiSoDo từ sukien → diadiem, và bookedSeats song song
        const [bookedSeats, loaiSoDo] = await Promise.all([
            _fetchBookedSeats(group.maSuKien),
            _fetchLoaiSoDo(group.maSuKien),
        ]);
        const allGroupSeats = _getAllMySeats(group);
        allGroupSeats.forEach(s => bookedSeats.add(s));

        const cards = tickets.flatMap(ve => {
            const gheConLai = (ve.gheList || []).filter(g => g.trangThai !== "da_hoan");
            if (gheConLai.length === 0) {
                // Fallback: vé không có gheList (dữ liệu cũ) — xuất 1 tấm không có QR thật
                return [_buildTicketCard(ve, group,
                    { khuVuc: _formatSeatLabel(ve), qrToken: `NO-QR-${ve.maVe}` },
                    fmtDate, fmt, bookedSeats, loaiSoDo)];
            }
            // Mỗi ghế = 1 tấm vé riêng với qrToken thật từ DB
            return gheConLai.map(gheInfo =>
                _buildTicketCard(ve, group, gheInfo, fmtDate, fmt, bookedSeats, loaiSoDo)
            );
        }).join("");

        // Sơ đồ tổng quan: dùng tất cả khu trong hóa đơn
        const groupSeatSet = _getAllMySeats({ tickets });
        const overviewMapHtml = groupSeatSet.size > 0
            ? `<div class="overview-map">
                <h3 style="text-align:center;margin:0 0 8px;font-size:.95rem;color:#555">
                    🗺️ Sơ đồ ghế — Tất cả vé trong hóa đơn #${group.maHoaDon}
                </h3>
                ${_buildSeatMapHtmlRaw(groupSeatSet, bookedSeats, loaiSoDo)}
               </div>` : "";

        const win = window.open("", "_blank", "width=700,height=600");
        if (!win) {
            alert("Trình duyệt đang chặn popup. Vui lòng click vào biểu tượng 🚫 trên thanh địa chỉ và cho phép popup từ trang này.");
            return;
        }
        win.document.write(`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Vé — ${_escRaw(group.tenSuKien || "Sự kiện")}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#f0f4f8; padding:24px; }
  .page-title { text-align:center; font-size:1.1rem; color:#555; margin-bottom:24px; font-weight:600; letter-spacing:.5px; }
  .ticket-wrap { break-inside:avoid; margin-bottom:24px; }
  .ticket { width:100%; max-width:620px; margin:0 auto; background:#fff; border-radius:18px; box-shadow:0 4px 20px rgba(0,0,0,.12); overflow:hidden; display:flex; flex-direction:column; }
  .ticket-header { background:linear-gradient(135deg,#0d9488,#0f766e); color:#fff; padding:22px 28px 18px; }
  .ticket-header .event-name { font-size:1.3rem; font-weight:800; line-height:1.3; margin-bottom:6px; }
  .ticket-header .event-dates { font-size:.82rem; opacity:.85; display:flex; gap:16px; flex-wrap:wrap; }
  .ticket-body { padding:20px 28px; display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap; }
  .ticket-info { flex:1; min-width:200px; }
  .info-row { margin-bottom:10px; }
  .info-label { font-size:.72rem; color:#888; font-weight:700; text-transform:uppercase; letter-spacing:.5px; margin-bottom:2px; }
  .info-value { font-size:.95rem; color:#1a1a2e; font-weight:600; }
  .info-value.seat-value { display:inline-flex; align-items:center; gap:6px; background:#f0fdf4; border:1.5px solid #bbf7d0; border-radius:10px; padding:4px 12px; color:#15803d; font-size:1rem; font-weight:800; letter-spacing:.5px; }
  .ticket-qr { display:flex; flex-direction:column; align-items:center; gap:8px; min-width:100px; }
  .qr-box { width:90px; height:90px; border:2px solid #e5e7eb; border-radius:10px; overflow:hidden; background:#fff; display:flex; align-items:center; justify-content:center; }
  .qr-box img, .qr-box canvas { width:86px !important; height:86px !important; display:block; }
  .ticket-id { font-size:.7rem; color:#888; font-family:monospace; text-align:center; }
  .ticket-footer { border-top:2px dashed #e5e7eb; padding:12px 28px; background:#fafafa; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; }
  .ticket-footer .price { font-size:1.2rem; font-weight:800; color:#0d9488; }
  .ticket-footer .badge { background:#dcfce7; color:#15803d; font-size:.75rem; font-weight:700; padding:4px 12px; border-radius:20px; }
  .serial { font-size:.72rem; color:#aaa; }
  .seat-map-section { padding:14px 28px 18px; border-top:1px dashed #e5e7eb; }
  .seat-map-title { font-size:.78rem; font-weight:700; color:#555; margin-bottom:8px; text-align:center; }
  .sm-screen-print { text-align:center; background:linear-gradient(180deg,#555,#888); color:#fff; border-radius:6px 6px 0 0; padding:5px; font-size:.62rem; font-weight:700; letter-spacing:1px; margin-bottom:8px; max-width:300px; margin-left:auto; margin-right:auto; }
  .sm-legend-print { display:flex; align-items:center; flex-wrap:wrap; gap:8px; margin-top:6px; font-size:.62rem; color:#666; justify-content:center; }
  .sm-dot-print { display:inline-block; width:10px; height:10px; border-radius:2px; vertical-align:middle; }
  .overview-map { max-width:620px; margin:0 auto 28px; background:#fff; border-radius:14px; padding:20px 24px; box-shadow:0 4px 16px rgba(0,0,0,.1); }
  @media print {
      body { background:#fff; padding:0; }
      .page-title { display:none; }
      .ticket-wrap { page-break-after:always; margin:0; }
      .ticket { box-shadow:none; border:1px solid #e5e7eb; }
      .overview-map { box-shadow:none; border:1px solid #e5e7eb; page-break-after:always; }
  }
</style>
</head>
<body>
<div class="page-title">🎫 Vé sự kiện — In hoặc lưu PDF</div>
${overviewMapHtml}
${cards}
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
<script>
  document.querySelectorAll('.qr-box[id^="qr-"]').forEach(function(el) {
    var code = el.id.replace('qr-', '');
    new QRCode(el, { text: code, width: 86, height: 86, colorDark: '#0f766e', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M });
  });
  setTimeout(() => window.print(), 800);
<\/script>
</body>
</html>`);
        win.document.close();
    };

    /* ── BUILD 1 TẤM VÉ (mỗi ghế = 1 tấm, QR là token thật từ DB) ── */
    function _buildTicketCard(ve, group, gheInfo, fmtDate, fmt, bookedSeats, loaiSoDo) {
        // gheInfo = { maGhe, khuVuc, trangThai, qrToken }
        const qrToken   = gheInfo.qrToken || `NO-QR-${ve.maVe}`;
        const seatLabel = String(gheInfo.khuVuc || '').trim().toUpperCase();
        const mySeatSet = seatLabel ? new Set([seatLabel]) : new Set();

        const seatRow = seatLabel ? `
                    <div class="info-row">
                        <div class="info-label">💺 Khu ghế</div>
                        <div class="info-value seat-value">Khu ${_escRaw(seatLabel)}</div>
                    </div>` : "";

        const seatMapSection = mySeatSet.size > 0 ? `
            <div class="seat-map-section">
                <div class="seat-map-title">🗺️ Vị trí ghế của bạn</div>
                ${_buildSeatMapHtmlRaw(mySeatSet, bookedSeats, loaiSoDo)}
            </div>` : "";

        return `
        <div class="ticket-wrap">
          <div class="ticket">
            <div class="ticket-header">
                <div class="event-name">${_escRaw(group.tenSuKien || "Sự kiện")}</div>
                <div class="event-dates">
                    <span>📅 Bắt đầu: ${fmtDate(group.thoiGianBatDau || ve.thoiGianBatDau)}</span>
                    <span>🏁 Kết thúc: ${fmtDate(group.thoiGianKetThuc || ve.thoiGianKetThuc)}</span>
                </div>
            </div>
            <div class="ticket-body">
                <div class="ticket-info">
                    <div class="info-row">
                        <div class="info-label">Loại vé</div>
                        <div class="info-value">${_escRaw(ve.tenVe || "—")}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Phân loại</div>
                        <div class="info-value">${_escRaw(ve.loaiVe || "—")}</div>
                    </div>
                    ${seatRow}
                    <div class="info-row">
                        <div class="info-label">Mã hóa đơn</div>
                        <div class="info-value">#${group.maHoaDon}</div>
                    </div>
                    <div class="info-row">
                        <div class="info-label">Ngày mua</div>
                        <div class="info-value">${fmtDate(group.ngayMua)}</div>
                    </div>
                </div>
                <div class="ticket-qr">
                    <div class="qr-box" id="qr-${_esc(qrToken)}"></div>
                    <div class="ticket-id" style="max-width:110px;word-break:break-all">${_escRaw(qrToken)}</div>
                </div>
            </div>
            ${seatMapSection}
            <div class="ticket-footer">
                <div>
                    <div class="price">${fmt(ve.gia)}</div>
                    <div class="serial">HĐ #${group.maHoaDon} · Vé #${ve.maVe} · Ghế ${_escRaw(seatLabel || "—")}</div>
                </div>
                <span class="badge">✅ ĐÃ THANH TOÁN</span>
            </div>
          </div>
        </div>`;
    }

    /* ── HELPERS GHẾ ─────────────────────────────────────── */
    function _parseSeatList(ve) {
        // khuVuc lưu chỉ là chữ cái đơn: "A", "B", ...
        const raw = ve.gheDat ?? ve.khuVuc ?? ve.soGhe ?? ve.gheSo ?? null;
        if (!raw) return [];
        if (Array.isArray(raw)) return raw.map(s => String(s).trim().toUpperCase()).filter(Boolean);
        if (typeof raw === "string")
            return raw.split(",").map(s => s.trim().toUpperCase()).filter(Boolean);
        return [String(raw).trim().toUpperCase()];
    }

    function _formatSeatLabel(ve) {
        const list = _parseSeatList(ve);
        return list.length ? list.join(", ") : "";
    }

    /* ── ESCAPE HELPERS ──────────────────────────────────── */
    function _esc(s) {
        return String(s || "")
            .replace(/&/g,"&amp;").replace(/</g,"&lt;")
            .replace(/>/g,"&gt;").replace(/"/g,"&quot;");
    }
    function _escRaw(s) {
        return String(s || "")
            .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
    }

})();