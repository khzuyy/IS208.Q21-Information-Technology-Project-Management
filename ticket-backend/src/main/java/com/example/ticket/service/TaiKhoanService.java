package com.example.ticket.service;

import com.example.ticket.dto.request.*;
import com.example.ticket.dto.response.*;

import java.util.List;

public interface TaiKhoanService {
    LoginResponse login(LoginRequest request);
    void register(RegisterRequest request);
    TaiKhoanResponse getById(Long id);
    List<TaiKhoanResponse> getAll();
    TaiKhoanResponse update(Long id, UpdateTaiKhoanRequest request);
    void delete(Long id);
    void forgetPassword(String tenDangNhap);

    void doiMatKhau(Long id, DoiMatKhauRequest request);
    HoSoResponse getHoSo(Long id);
    HoSoResponse updateHoSo(Long id, HoSoRequest request);

    void block(Long id);
    void unblock(Long id);
    void resetPassword(Long id, String matKhauMoi);
    void changeRole(Long id, String loaiTaiKhoan);
}