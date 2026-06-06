package com.example.ticket.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ticket.dto.request.DoiMatKhauRequest;
import com.example.ticket.dto.request.HoSoRequest;
import com.example.ticket.dto.request.LoginRequest;
import com.example.ticket.dto.request.RegisterRequest;
import com.example.ticket.dto.request.UpdateTaiKhoanRequest;
import com.example.ticket.dto.response.HoSoResponse;
import com.example.ticket.dto.response.LoginResponse;
import com.example.ticket.dto.response.TaiKhoanResponse;
import com.example.ticket.service.TaiKhoanService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/taikhoan")
public class TaiKhoanController {

    private final TaiKhoanService service;

    public TaiKhoanController(TaiKhoanService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<TaiKhoanResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaiKhoanResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(service.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<Void> register(@RequestBody RegisterRequest request) {
        service.register(request);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaiKhoanResponse> update(
            @PathVariable Long id,
            @RequestBody UpdateTaiKhoanRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forget-password")
    public ResponseEntity<String> forgetPassword(@RequestBody LoginRequest request) {
        service.forgetPassword(request.getTenDangNhap());
        return ResponseEntity.ok("Mật khẩu đã được đặt lại về 123456. Vui lòng đổi mật khẩu sau khi đăng nhập.");
    }

    @PostMapping("/{id}/doi-mat-khau")
    public ResponseEntity<Void> doiMatKhau(
            @PathVariable Long id,
            @RequestBody DoiMatKhauRequest request) {
        service.doiMatKhau(id, request);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/ho-so")
    public ResponseEntity<HoSoResponse> getHoSo(@PathVariable Long id) {
        return ResponseEntity.ok(service.getHoSo(id));
    }

    @PutMapping("/{id}/ho-so")
    public ResponseEntity<HoSoResponse> updateHoSo(
            @PathVariable Long id,
            @RequestBody HoSoRequest request) {
        return ResponseEntity.ok(service.updateHoSo(id, request));
    }

    // ── Admin: quản lý tài khoản ─────────────────────────────────────────────

    @PutMapping("/{id}/block")
    public ResponseEntity<Void> block(
        @PathVariable Long id,
        @RequestBody(required = false) java.util.Map<String, String> body) {
            service.block(id);
            return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/unblock")
    public ResponseEntity<Void> unblock(@PathVariable Long id) {
        service.unblock(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ THÊM: endpoint reset mật khẩu cho admin
    @PutMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        service.resetPassword(id, body.get("matKhauMoi"));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<Void> changeRole(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        service.changeRole(id, body.get("loaiTaiKhoan"));
        return ResponseEntity.noContent().build();
    }
}