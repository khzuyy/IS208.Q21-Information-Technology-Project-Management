package com.example.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "NHANVIEN")
public class NhanVien {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "nhanvien_seq")
    @SequenceGenerator(name = "nhanvien_seq", sequenceName = "NHANVIEN_SEQ", allocationSize = 1)
    private Long maNhanVien;

    private String tenNhanVien;
    private String email;
    private String soDienThoai;
    private LocalDate ngayVaoLam;
    
    private Long maTaiKhoan;
    public Long getMaNhanVien() {
        return maNhanVien;
    }

    public void setMaNhanVien(Long maNhanVien) {
        this.maNhanVien = maNhanVien;
    }

    public String getTenNhanVien() {
        return tenNhanVien;
    }

    public void setTenNhanVien(String tenNhanVien) {
        this.tenNhanVien = tenNhanVien;
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

    public LocalDate getNgayVaoLam() {
        return ngayVaoLam;
    }

    public void setNgayVaoLam(LocalDate ngayVaoLam) {
        this.ngayVaoLam = ngayVaoLam;
    }
    
    public Long getMaTaiKhoan() {
        return maTaiKhoan;
    }

    public void setMaTaiKhoan(Long maTaiKhoan) {
        this.maTaiKhoan = maTaiKhoan;
    }
}
