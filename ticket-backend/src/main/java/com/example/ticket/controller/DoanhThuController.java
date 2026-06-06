package com.example.ticket.controller;

import com.example.ticket.dto.response.DoanhThuResponse;
import com.example.ticket.service.DoanhThuService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/doanhthu")
public class DoanhThuController {

    private final DoanhThuService doanhThuService;

    public DoanhThuController(DoanhThuService doanhThuService) {
        this.doanhThuService = doanhThuService;
    }

    /**
     * Lấy doanh thu theo từng sự kiện của creator.
     * GET /api/doanhthu/creator/{maTaiKhoan}
     */
    @GetMapping("/creator/{maTaiKhoan}")
    public ResponseEntity<List<DoanhThuResponse>> getByCreator(@PathVariable Long maTaiKhoan) {
        return ResponseEntity.ok(doanhThuService.getDoanhThuByCreator(maTaiKhoan));
    }
}