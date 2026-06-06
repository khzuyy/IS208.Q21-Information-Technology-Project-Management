package com.example.ticket.dto.request;

public class LoginRequest {

    private String tenDangNhap;

    private String matKhau;

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

}