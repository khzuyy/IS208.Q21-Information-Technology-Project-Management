package com.example.ticket.controller;

import com.example.ticket.dto.request.MuaVeRequest;
import com.example.ticket.dto.response.MuaVeResponse;
import com.example.ticket.dto.response.VeKhachHangResponse;
import com.example.ticket.service.HoaDonService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.ticket.dto.request.CheckInRequest;
import com.example.ticket.dto.response.CheckInResponse;

import java.util.List;

/**
 * Flow mua vé 3 bước — frontend gọi các API sẵn có theo thứ tự:
 *
 *  Bước 1 — Chọn loại vé:
 *    GET /api/ve/sukien/{maSuKien}
 *    → danh sách loại vé còn bán (active + conLai > 0)
 *
 *  Bước 2 — Chọn ghế:
 *    GET /api/ghe/sukien/{maSuKien}
 *    → danh sách ghế đã đặt (frontend tô đỏ lên sơ đồ)
 *
 *  Bước 3 — Chọn voucher (tùy chọn):
 *    GET /api/voucher/sukien/{maSuKien}
 *    → danh sách voucher active của sự kiện
 *
 *  Xác nhận — Mua vé:
 *    POST /api/hoadon/mua          ← khách hàng online
 *    POST /api/hoadon/nhanvien/mua ← nhân viên bán tại quầy (bắt buộc maNhanVien)
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/hoadon")
public class HoaDonController {

    private final HoaDonService service;

    public HoaDonController(HoaDonService service) {
        this.service = service;
    }

    // ── Khách hàng tự mua online ──────────────────────────────────────────────

    /**
     * POST /api/hoadon/mua
     *
     * Body sau khi hoàn thành 3 bước:
     * {
     *   "maTaiKhoan": 1,          // null = khách vãng lai
     *   "maNhanVien": null,
     *   "maSuKien": 5,
     *   "maVoucher": "SUMMER20",  // null = không dùng voucher
     *   "items": [
     *     { "maVe": 10, "soLuong": 2, "donGia": 500000 }
     *   ],
     *   "ghes": [
     *     { "khuVuc": "A1", "maVe": 10 },
     *     { "khuVuc": "A2", "maVe": 10 }
     *   ]
     * }
     */
    @PostMapping("/mua")
    public ResponseEntity<MuaVeResponse> muaVe(@RequestBody MuaVeRequest request) {
        return ResponseEntity.ok(service.muaVe(request));
    }

    // ── Nhân viên bán vé tại quầy ────────────────────────────────────────────

    /**
     * POST /api/hoadon/nhanvien/mua
     *
     * Giống /mua nhưng bắt buộc có maNhanVien.
     * Body ví dụ:
     * {
     *   "maTaiKhoan": 3,     // khách hàng nhân viên chọn
     *   "maNhanVien": 7,     // BẮT BUỘC
     *   "maSuKien": 5,
     *   "maVoucher": null,
     *   "items": [ { "maVe": 10, "soLuong": 1, "donGia": 500000 } ],
     *   "ghes": [ { "khuVuc": "B3", "maVe": 10 } ]
     * }
     */
    @PostMapping("/nhanvien/mua")
    public ResponseEntity<MuaVeResponse> muaVeNhanVien(@RequestBody MuaVeRequest request) {
        return ResponseEntity.ok(service.muaVeNhanVien(request));
    }

    @PostMapping("/checkin")
    public ResponseEntity<CheckInResponse> checkIn(@RequestBody CheckInRequest request) {
        return ResponseEntity.ok(service.checkIn(request));
    }

    // ── Tra cứu (giữ nguyên) ─────────────────────────────────────────────────

    @GetMapping("/khachhang/{maTaiKhoan}")
    public ResponseEntity<List<VeKhachHangResponse>> getVeByKhachHang(
            @PathVariable Long maTaiKhoan) {
        return ResponseEntity.ok(service.getVeByKhachHang(maTaiKhoan));
    }

    @GetMapping("/tatca")
    public ResponseEntity<List<VeKhachHangResponse>> getAllVe() {
        return ResponseEntity.ok(service.getAllVe());
    }

    @GetMapping("/nhanvien/{maNhanVien}")
    public ResponseEntity<List<VeKhachHangResponse>> getVeByNhanVien(
            @PathVariable Long maNhanVien) {
        return ResponseEntity.ok(service.getVeByNhanVien(maNhanVien));
    }
}
