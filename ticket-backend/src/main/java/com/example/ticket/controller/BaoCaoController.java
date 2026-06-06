package com.example.ticket.controller;

import com.example.ticket.dto.response.BaoCaoKpiResponse;
import com.example.ticket.service.BaoCaoService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * API báo cáo KPI nhân viên.
 *
 * POST /api/baocao/kpi/{maNhanVien}?ngayBatDau=2025-05-01&ngayKetThuc=2025-05-31
 *
 * - Lưu bản ghi vào bảng BAOCAO
 * - Trả về JSON đầy đủ để frontend tạo file Excel tải về
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/baocao")
public class BaoCaoController {

    private final BaoCaoService service;

    public BaoCaoController(BaoCaoService service) {
        this.service = service;
    }

    @PostMapping("/kpi/{maNhanVien}")
    public ResponseEntity<BaoCaoKpiResponse> xuatKpi(
            @PathVariable Long maNhanVien,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngayBatDau,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate ngayKetThuc) {

        BaoCaoKpiResponse result = service.taoVaLuuBaoCao(maNhanVien, ngayBatDau, ngayKetThuc);
        return ResponseEntity.ok(result);
    }
}