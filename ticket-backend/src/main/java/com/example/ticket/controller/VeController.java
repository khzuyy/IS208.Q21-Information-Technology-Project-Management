package com.example.ticket.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.ticket.dto.request.VeRequest;
import com.example.ticket.dto.response.VeResponse;
import com.example.ticket.service.VeService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/ve")
public class VeController {

    private final VeService veService;

    public VeController(VeService veService) {
        this.veService = veService;
    }

    @GetMapping
    public ResponseEntity<List<VeResponse>> getAll() {
        return ResponseEntity.ok(veService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(veService.getById(id));
    }

    @GetMapping("/sukien/{maSuKien}")
    public ResponseEntity<List<VeResponse>> getBySuKien(@PathVariable Long maSuKien) {
        return ResponseEntity.ok(veService.getBySuKien(maSuKien));
    }

    @PostMapping
    public ResponseEntity<VeResponse> create(@RequestBody VeRequest request) {
        return ResponseEntity.ok(veService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VeResponse> update(
            @PathVariable Long id,
            @RequestBody VeRequest request) {
        return ResponseEntity.ok(veService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        veService.delete(id);
        return ResponseEntity.noContent().build();
    }
    // VeController.java

    @GetMapping("/creator/{maTaiKhoan}")
    public ResponseEntity<List<VeResponse>> getByCreator(
        @PathVariable Long maTaiKhoan
    ) {
        return ResponseEntity.ok(
            veService.getByCreator(maTaiKhoan)
        );
    }

    @GetMapping("/check-type")
    public ResponseEntity<Map<String, Boolean>> checkLoaiVeExists(
            @RequestParam Long maSuKien,
            @RequestParam String loaiVe) {
        boolean exists = veService.checkLoaiVeExists(maSuKien, loaiVe);
        return ResponseEntity.ok(Map.of("exists", exists));
    }

    /**
     * Giảm số vé còn lại khi mua thành công.
     * Gọi từ frontend sau khi OrderService.purchase / hoadon/nhanvien/mua thành công.
     * PATCH /api/ve/{id}/decrease-daban?soLuong=N
     */
    @PatchMapping("/{id}/decrease-daban")
    public ResponseEntity<Void> decreaseDaBan(
            @PathVariable Long id,
            @RequestParam int soLuong) {
        veService.decreaseDaBan(id, soLuong);
        return ResponseEntity.noContent().build();
    }
}