package com.example.ticket.model;

import jakarta.persistence.*;

@Entity
@Table(name = "KHACHHANG")
public class KhachHang {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "kh_seq")
    @SequenceGenerator(name = "kh_seq", sequenceName = "KHACHHANG_SEQ", allocationSize = 1)
    private Long maKhachHang;

    private String tenKhachHang;
    private String email;
    private String soDienThoai;
    private Long maTaiKhoan;

    public KhachHang() {}

    public Long getMaKhachHang() {
        return maKhachHang;
    }

    public void setMaKhachHang(Long maKhachHang) {
        this.maKhachHang = maKhachHang;
    }

    public String getTenKhachHang() {
        return tenKhachHang;
    }

    public void setTenKhachHang(String tenKhachHang) {
        this.tenKhachHang = tenKhachHang;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSoDienThoai() {
        return soDienThoai;
    }

    public void setSoDienThoai(String soDienThoai) {
        this.soDienThoai = soDienThoai;
    }

    public Long getMaTaiKhoan() {
        return maTaiKhoan;
    }

    public void setMaTaiKhoan(Long maTaiKhoan) {
        this.maTaiKhoan = maTaiKhoan;
    }
}
