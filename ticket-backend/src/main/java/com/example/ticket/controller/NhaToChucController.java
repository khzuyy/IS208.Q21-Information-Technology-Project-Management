package com.example.ticket.controller;

import com.example.ticket.model.NhaToChuc;
import com.example.ticket.service.NhaToChucService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/nhatochuc")
public class NhaToChucController {

    private final NhaToChucService service;

    public NhaToChucController(NhaToChucService service) {
        this.service = service;
    }

    /** Lấy theo maCongTy — dùng cho trang nhà tổ chức sau login */
    @GetMapping("/{id}")
    public ResponseEntity<NhaToChuc> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    /** Lấy theo maTaiKhoan — dùng nếu frontend chỉ có maTaiKhoan */
    @GetMapping("/by-taikhoan/{maTaiKhoan}")
    public ResponseEntity<NhaToChuc> getByMaTaiKhoan(@PathVariable Long maTaiKhoan) {
        return ResponseEntity.ok(service.getByMaTaiKhoan(maTaiKhoan));
    }
}