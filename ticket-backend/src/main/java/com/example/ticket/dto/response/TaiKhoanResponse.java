package com.example.ticket.dto.response;

public class TaiKhoanResponse {

    private Long maTaiKhoan;

    private String tenDangNhap;

    private String loaiTaiKhoan;
    private String trangThai;

    public Long getMaTaiKhoan() {
        return maTaiKhoan;
    }

    public void setMaTaiKhoan(
        Long maTaiKhoan
    ) {
        this.maTaiKhoan = maTaiKhoan;
    }

    public String getTenDangNhap() {
        return tenDangNhap;
    }

    public void setTenDangNhap(
        String tenDangNhap
    ) {
        this.tenDangNhap = tenDangNhap;
    }

    public String getLoaiTaiKhoan() {
        return loaiTaiKhoan;
    }

    public void setLoaiTaiKhoan(
        String loaiTaiKhoan
    ) {
        this.loaiTaiKhoan = loaiTaiKhoan;
    }
    
    public String getTrangThai()               { return trangThai; }
    public void   setTrangThai(String v)       { this.trangThai = v; }
}