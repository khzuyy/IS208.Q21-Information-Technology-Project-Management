package com.example.ticket.controller;

import com.example.ticket.dto.request.SuKienRequest;
import com.example.ticket.dto.response.SuKienResponse;
import com.example.ticket.repository.GheRepository;
import com.example.ticket.service.SuKienService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/sukien")
public class SuKienController {

    private final SuKienService suKienService;
    private final GheRepository gheRepository;

    public SuKienController(SuKienService suKienService,
                            GheRepository gheRepository) {
        this.suKienService = suKienService;
        this.gheRepository = gheRepository;
    }

    @GetMapping
    public ResponseEntity<List<SuKienResponse>> getAll() {
        return ResponseEntity.ok(suKienService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SuKienResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(suKienService.getById(id));
    }

    @GetMapping("/creator/{maTaiKhoan}")
    public ResponseEntity<List<SuKienResponse>> getByCreator(@PathVariable Long maTaiKhoan) {
        return ResponseEntity.ok(suKienService.getByCreator(maTaiKhoan));
    }

    @PostMapping
    public ResponseEntity<SuKienResponse> create(@RequestBody SuKienRequest request) {
        return ResponseEntity.ok(suKienService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SuKienResponse> update(
            @PathVariable Long id,
            @RequestBody SuKienRequest request) {
        return ResponseEntity.ok(suKienService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        suKienService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Trả về danh sách mã ghế đã đặt của một sự kiện.
     * Ví dụ: GET /api/sukien/1/ghe-da-dat → ["A1", "A2", "B5"]
     */
    @GetMapping("/{id}/ghe-da-dat")
    public ResponseEntity<List<String>> getBookedSeats(@PathVariable Long id) {
        List<String> booked = gheRepository.findBookedSeatsByMaSuKien(id);
        return ResponseEntity.ok(booked);
    }

    // ── Admin endpoints ───────────────────────────────────────────────────────

    /** GET /api/sukien/admin — tất cả sự kiện kể cả vi phạm/ẩn (dành cho admin) */
    @GetMapping("/admin")
    public ResponseEntity<List<SuKienResponse>> getAllForAdmin() {
        return ResponseEntity.ok(suKienService.getAllForAdmin());
    }

    /** PUT /api/sukien/{id}/hide — ẩn sự kiện */
    @PutMapping("/{id}/hide")
    public ResponseEntity<Void> hide(@PathVariable Long id) {
        suKienService.hide(id);
        return ResponseEntity.ok().build();
    }

    /** PUT /api/sukien/{id}/unhide — hiện lại sự kiện */
    @PutMapping("/{id}/unhide")
    public ResponseEntity<Void> unhide(@PathVariable Long id) {
        suKienService.unhide(id);
        return ResponseEntity.ok().build();
    }

    /** PUT /api/sukien/{id}/violation — đánh vi phạm + ẩn khỏi khách hàng */
    @PutMapping("/{id}/violation")
    public ResponseEntity<Void> markViolation(@PathVariable Long id) {
        suKienService.markViolation(id);
        return ResponseEntity.ok().build();
    }

    /** PUT /api/sukien/{id}/clearviolation — xoá vi phạm, cho hoạt động lại */
    @PutMapping("/{id}/clearviolation")
    public ResponseEntity<Void> clearViolation(@PathVariable Long id) {
        suKienService.clearViolation(id);
        return ResponseEntity.ok().build();
    }

    /** PUT /api/sukien/{id}/approve — duyệt sự kiện */
    @PutMapping("/{id}/approve")
    public ResponseEntity<Void> approve(@PathVariable Long id) {
        suKienService.approve(id);
        return ResponseEntity.ok().build();
    }

    /** PUT /api/sukien/{id}/reject — từ chối sự kiện */
    @PutMapping("/{id}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long id) {
        suKienService.reject(id);
        return ResponseEntity.ok().build();
    }
}