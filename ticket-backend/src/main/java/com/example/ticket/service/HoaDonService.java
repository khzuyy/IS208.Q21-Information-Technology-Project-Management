package com.example.ticket.service;

import java.util.List;

import com.example.ticket.dto.request.CheckInRequest;
import com.example.ticket.dto.response.CheckInResponse;
import com.example.ticket.dto.request.MuaVeRequest;
import com.example.ticket.dto.response.MuaVeResponse;
import com.example.ticket.dto.response.VeKhachHangResponse;
public interface HoaDonService {

    // ── Mua vé online (khách hàng tự mua) ────────────────────────────────────
    MuaVeResponse muaVe(MuaVeRequest request);

    // ── Nhân viên bán vé tại quầy (bắt buộc có maNhanVien) ───────────────────
    MuaVeResponse muaVeNhanVien(MuaVeRequest request);

    // ── Tra cứu ───────────────────────────────────────────────────────────────
    List<VeKhachHangResponse> getVeByKhachHang(Long maTaiKhoan);
    List<VeKhachHangResponse> getAllVe();
    List<VeKhachHangResponse> getVeByNhanVien(Long maNhanVien);

    CheckInResponse checkIn(CheckInRequest request);
}
