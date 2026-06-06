package com.example.ticket.controller;

import com.example.ticket.dto.request.HoanVeRequest;
import com.example.ticket.dto.response.HoanVeResponse;
import com.example.ticket.service.HoanVeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/hoanve")
public class HoanVeController {

    private final HoanVeService service;

    public HoanVeController(HoanVeService service) {
        this.service = service;
    }

    /** Khách hàng gửi yêu cầu hoàn — mỗi ghế = 1 row HOANVE */
    @PostMapping
    public ResponseEntity<List<HoanVeResponse>> hoanVe(@RequestBody HoanVeRequest request) {
        return ResponseEntity.ok(service.hoanVe(request));
    }

    /** Nhà tổ chức lấy danh sách yêu cầu hoàn của sự kiện mình */
    @GetMapping("/creator/{maTaiKhoan}")
    public ResponseEntity<List<HoanVeResponse>> getByCreator(@PathVariable Long maTaiKhoan) {
        return ResponseEntity.ok(service.getByCreator(maTaiKhoan));
    }

    /** Nhà tổ chức duyệt hoặc từ chối: body { "trangThai": "approved" | "rejected" } */
    @PutMapping("/{maHoanVe}/duyet")
    public ResponseEntity<HoanVeResponse> duyet(
            @PathVariable Long maHoanVe,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(service.duyetHoanVe(maHoanVe, body.get("trangThai")));
    }
}