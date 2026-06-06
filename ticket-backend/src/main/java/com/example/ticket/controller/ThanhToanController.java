package com.example.ticket.controller;

import com.example.ticket.dto.request.ThanhToanRequest;
import com.example.ticket.dto.response.ThanhToanResponse;
import com.example.ticket.service.ThanhToanService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/thanhtoan")
public class ThanhToanController {

    private final ThanhToanService service;

    public ThanhToanController(ThanhToanService service) {
        this.service = service;
    }

    /**
     * Tạo bản ghi thanh toán cho một hóa đơn.
     * Body: { maHoaDon, phuongThuc, soTien, trangThai }
     */
    @PostMapping
    public ResponseEntity<ThanhToanResponse> create(@RequestBody ThanhToanRequest request) {
        return ResponseEntity.ok(service.create(request));
    }
}