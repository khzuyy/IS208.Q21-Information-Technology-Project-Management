package com.example.ticket.dto.response;

import java.time.LocalDate;

public class HoSoResponse {

    private Long   maTaiKhoan;
    private String tenDangNhap;
    private String loaiTaiKhoan;

    // KhachHang
    private String tenKhachHang;

    // NhaToChuc
    private String tenCongTy;
    private String tenNguoiDaiDien;
    private String diaChi;   
    private String    maQR;
    
    // NhanVien
    private String tenNhanVien;
    private LocalDate ngayVaoLam;
            
    // Chung
    private String email;
    private String soDienThoai;

    public Long   getMaTaiKhoan()             { return maTaiKhoan; }
    public void   setMaTaiKhoan(Long v)       { this.maTaiKhoan = v; }
    public String getTenDangNhap()            { return tenDangNhap; }
    public void   setTenDangNhap(String v)    { this.tenDangNhap = v; }
    public String getLoaiTaiKhoan()           { return loaiTaiKhoan; }
    public void   setLoaiTaiKhoan(String v)   { this.loaiTaiKhoan = v; }
    public String getTenKhachHang()           { return tenKhachHang; }
    public void   setTenKhachHang(String v)   { this.tenKhachHang = v; }
    public String getTenCongTy()              { return tenCongTy; }
    public void   setTenCongTy(String v)      { this.tenCongTy = v; }
    public String getTenNguoiDaiDien()        { return tenNguoiDaiDien; }
    public void   setTenNguoiDaiDien(String v){ this.tenNguoiDaiDien = v; }
    public String getDiaChi()                 { return diaChi; }
    public void   setDiaChi(String v)         { this.diaChi = v; }
    public String getEmail()                  { return email; }
    public void   setEmail(String v)          { this.email = v; }
    public String getSoDienThoai()            { return soDienThoai; }
    public void   setSoDienThoai(String v)    { this.soDienThoai = v; }
    public String getTenNhanVien()            { return tenNhanVien; }
    public void setTenNhanVien(String v)      { this.tenNhanVien = v; }
    public LocalDate getNgayVaoLam()          { return ngayVaoLam; }
    public void setNgayVaoLam(LocalDate v)    { this.ngayVaoLam = v; }
    public String    getMaQR()                    { return maQR; }
    public void      setMaQR(String v)            { this.maQR = v; }
}