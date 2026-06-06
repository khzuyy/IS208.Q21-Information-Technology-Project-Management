package com.example.ticket.service.impl;

import com.example.ticket.dto.request.ThanhToanRequest;
import com.example.ticket.dto.response.ThanhToanResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.HoaDon;
import com.example.ticket.model.ThanhToan;
import com.example.ticket.repository.HoaDonRepository;
import com.example.ticket.repository.ThanhToanRepository;
import com.example.ticket.service.ThanhToanService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional(readOnly = true)
public class ThanhToanServiceImpl implements ThanhToanService {

    private final ThanhToanRepository thanhToanRepository;
    private final HoaDonRepository    hoaDonRepository;

    public ThanhToanServiceImpl(ThanhToanRepository thanhToanRepository,
                                HoaDonRepository hoaDonRepository) {
        this.thanhToanRepository = thanhToanRepository;
        this.hoaDonRepository    = hoaDonRepository;
    }

    @Override
    @Transactional
    public ThanhToanResponse create(ThanhToanRequest request) {
        // 1. Validate
        if (request.getMaHoaDon() == null) {
            throw new BadRequestException("Thiếu maHoaDon");
        }
        if (request.getPhuongThuc() == null || request.getPhuongThuc().isBlank()) {
            throw new BadRequestException("Thiếu phuongThuc thanh toán");
        }

        // 2. Kiểm tra hóa đơn tồn tại
        HoaDon hoaDon = hoaDonRepository.findById(request.getMaHoaDon())
                .orElseThrow(() -> new NotFoundException(
                    "Không tìm thấy hóa đơn ID: " + request.getMaHoaDon()));

        // 3. Tạo bản ghi ThanhToan
        ThanhToan tt = new ThanhToan();
        tt.setMaHoaDon(request.getMaHoaDon());
        tt.setPhuongThuc(request.getPhuongThuc());
        tt.setSoTien(request.getSoTien() != null ? request.getSoTien() : hoaDon.getThanhTien());
        tt.setTrangThai(request.getTrangThai() != null ? request.getTrangThai() : "THANH_CONG");
        tt.setThoiGian(LocalDateTime.now());
        ThanhToan saved = thanhToanRepository.save(tt);

        // 4. Map response
        ThanhToanResponse res = new ThanhToanResponse();
        res.setMaThanhToan(saved.getMaThanhToan());
        res.setMaHoaDon(saved.getMaHoaDon());
        res.setPhuongThuc(saved.getPhuongThuc());
        res.setSoTien(saved.getSoTien());
        res.setTrangThai(saved.getTrangThai());
        res.setThoiGian(saved.getThoiGian());
        return res;
    }
}