package com.example.ticket.dto.request;

public class RegisterRequest {

    private String tenDangNhap;

    private String matKhau;

    private String loaiTaiKhoan;

    public String getTenDangNhap() {
        return tenDangNhap;
    }

    public void setTenDangNhap(
        String tenDangNhap
    ) {
        this.tenDangNhap = tenDangNhap;
    }

    public String getMatKhau() {
        return matKhau;
    }

    public void setMatKhau(
        String matKhau
    ) {
        this.matKhau = matKhau;
    }

    public String getLoaiTaiKhoan() {
        return loaiTaiKhoan;
    }

    public void setLoaiTaiKhoan(
        String loaiTaiKhoan
    ) {
        this.loaiTaiKhoan = loaiTaiKhoan;
    }

}