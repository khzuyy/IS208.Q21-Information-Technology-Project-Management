package com.example.ticket.service;

import java.util.List;

import com.example.ticket.dto.request.VeRequest;
import com.example.ticket.dto.response.VeResponse;

public interface VeService {
    List<VeResponse> getAll();
    VeResponse getById(Long id);
    List<VeResponse> getBySuKien(Long maSuKien);
    List<VeResponse> getByCreator(Long maTaiKhoan);
    VeResponse create(VeRequest request);
    VeResponse update(Long id, VeRequest request);
    boolean checkLoaiVeExists(Long maSuKien, String loaiVe);
    void delete(Long id);

    // ── FIX: Quản lý số lượng vé đã bán ─────────────────────────────────────

    /**
     * Tăng daBan khi mua vé thành công.
     * Dùng pessimistic lock để tránh oversell khi nhiều người mua cùng lúc.
     *
     * @param maVe     ID vé cần trừ
     * @param soLuong  Số lượng vé mua
     * @throws com.example.ticket.exception.BadRequestException nếu còn lại < soLuong
     */
    void decreaseDaBan(Long maVe, int soLuong);

    /**
     * Giảm daBan khi duyệt hoàn vé thành công.
     * Đảm bảo daBan không xuống dưới 0.
     *
     * @param maVe    ID vé cần hoàn
     * @param soLuong Số lượng vé hoàn
     */
    void increaseDaBan(Long maVe, int soLuong);
}