package com.example.ticket.controller;

import java.util.List;
import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.ticket.dto.response.GheHoldResponse;
import com.example.ticket.model.Ghe;
import com.example.ticket.model.Ve;
import com.example.ticket.repository.GheRepository;
import com.example.ticket.repository.VeRepository;
import com.example.ticket.service.GheService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ghe")
public class GheController {

    private final GheRepository gheRepository;
    private final VeRepository  veRepository;
    private final GheService    gheService;

    public GheController(GheRepository gheRepository,
                         VeRepository veRepository,
                         GheService gheService) {
        this.gheRepository = gheRepository;
        this.veRepository  = veRepository;
        this.gheService    = gheService;
    }

    // ══ ENDPOINT CŨ — GIỮ NGUYÊN ═══════════════════════════════════════════

    /**
     * Ghế đã đặt (DA_DAT) theo sự kiện — render sơ đồ ghế.
     * GET /api/ghe/sukien/{maSuKien}
     */
    @GetMapping("/sukien/{maSuKien}")
    public ResponseEntity<List<Ghe>> getGheBySuKien(@PathVariable Long maSuKien) {
        List<Long> maVeList = veRepository.findByMaSuKien(maSuKien)
                .stream().map(Ve::getMaVe).toList();
        if (maVeList.isEmpty()) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(gheRepository.findByMaVeIn(maVeList));
    }

    /**
     * GET /api/ghe?maVe=1&maHoaDon=2
     */
    @GetMapping
    public ResponseEntity<List<Ghe>> getGheByVeAndHoaDon(
            @RequestParam Long maVe,
            @RequestParam Long maHoaDon) {
        return ResponseEntity.ok(gheRepository.findByMaVeAndMaHoaDon(maVe, maHoaDon));
    }

    // ══ ENDPOINT MỚI — GIỮ GHẾ IN-MEMORY ══════════════════════════════════

    /**
     * Giữ ghế trước khi thanh toán (tối đa 10 phút).
     *
     * PUT /api/ghe/giu?maSuKien=5&khuVuc=A1&maTaiKhoan=123
     *
     * Response: { khuVuc, maSuKien, maTaiKhoan, trangThai:"DANG_GIU",
     *             thoiGianHetHan, giayConLai }
     * Lỗi 400 : ghế đang bị người khác giữ.
     */
    @PutMapping("/giu")
    public ResponseEntity<GheHoldResponse> giuGhe(
            @RequestParam Long   maSuKien,
            @RequestParam String khuVuc,
            @RequestParam Long   maTaiKhoan) {
        return ResponseEntity.ok(gheService.giuGhe(maSuKien, khuVuc, maTaiKhoan));
    }

    /**
     * Hủy giữ ghế (khách bấm hủy / đóng modal).
     *
     * PUT /api/ghe/huy-giu?maSuKien=5&khuVuc=A1&maTaiKhoan=123
     *
     */
    @PutMapping("/huy-giu")
    public ResponseEntity<GheHoldResponse> huyGiuGhe(
            @RequestParam Long   maSuKien,
            @RequestParam String khuVuc,
            @RequestParam Long   maTaiKhoan) {
        return ResponseEntity.ok(gheService.huyGiuGhe(maSuKien, khuVuc, maTaiKhoan));
    }

    /**
     * Danh sách khuVuc đang bị giữ trong sự kiện.
     * Frontend merge vào bookedSet để tô màu trên sơ đồ ghế.
     *
     * GET /api/ghe/dang-giu?maSuKien=5
     *
     * Response: ["A1", "B3", "C2", ...]
     */
    @GetMapping("/dang-giu")
    public ResponseEntity<Set<String>> getDanhSachDangGiu(
            @RequestParam Long maSuKien) {
        return ResponseEntity.ok(gheService.getDanhSachDangGiu(maSuKien));
    }
}