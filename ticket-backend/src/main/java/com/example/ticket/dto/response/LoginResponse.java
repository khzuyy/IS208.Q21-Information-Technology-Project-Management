package com.example.ticket.dto.response;

public class LoginResponse {

    private Long   maTaiKhoan;
    private Long   maNhanVien;   // "Nhân viên"
    private Long   maNhaToChuc;  // "Nhà tổ chức" — tức maCongTy
    private Long   maKhachHang;  // "Khách hàng"
    // Quản lý chỉ dùng maTaiKhoan, không có bảng riêng
    private String tenDangNhap;
    private String loaiTaiKhoan;

    public Long   getMaTaiKhoan()              { return maTaiKhoan; }
    public void   setMaTaiKhoan(Long v)        { this.maTaiKhoan = v; }

    public Long   getMaNhanVien()              { return maNhanVien; }
    public void   setMaNhanVien(Long v)        { this.maNhanVien = v; }

    public Long   getMaNhaToChuc()             { return maNhaToChuc; }
    public void   setMaNhaToChuc(Long v)       { this.maNhaToChuc = v; }

    public Long   getMaKhachHang()             { return maKhachHang; }
    public void   setMaKhachHang(Long v)       { this.maKhachHang = v; }

    public String getTenDangNhap()             { return tenDangNhap; }
    public void   setTenDangNhap(String v)     { this.tenDangNhap = v; }

    public String getLoaiTaiKhoan()            { return loaiTaiKhoan; }
    public void   setLoaiTaiKhoan(String v)    { this.loaiTaiKhoan = v; }
}