package com.example.ticket.controller;

import com.example.ticket.model.ChiTietHoaDon;
import com.example.ticket.repository.ChiTietHoaDonRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Cung cấp API cho frontend KPI controller:
 *   GET /chitiethoadon/{maHoaDon}
 *   → trả về danh sách ChiTietHoaDon của hóa đơn đó
 */
@RestController
@RequestMapping("/chitiethoadon")
public class ChiTietHoaDonController {

    private final ChiTietHoaDonRepository repo;

    public ChiTietHoaDonController(ChiTietHoaDonRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/{maHoaDon}")
    public ResponseEntity<List<ChiTietHoaDon>> getByHoaDon(
            @PathVariable Long maHoaDon) {
        List<ChiTietHoaDon> list = repo.findByMaHoaDon(maHoaDon);
        return ResponseEntity.ok(list);
    }
}