package com.example.ticket.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@Table(name = "NHATOCHUC")
public class NhaToChuc {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ntc_seq")
    @SequenceGenerator(name = "ntc_seq", sequenceName = "NHATOCHUC_SEQ", allocationSize = 1)
    private Long maCongTy;

    private String tenCongTy;
    private String tenNguoiDaiDien;
    private String diaChi;
    private String email;
    private String soDienThoai;
    private Long maTaiKhoan;

    @Column(name = "MAQR")
    private String maQR; 

    public NhaToChuc() {}

    public Long getMaCongTy()                  { return maCongTy; }
    public void setMaCongTy(Long v)            { this.maCongTy = v; }
    public String getTenCongTy()               { return tenCongTy; }
    public void setTenCongTy(String v)         { this.tenCongTy = v; }
    public String getTenNguoiDaiDien()         { return tenNguoiDaiDien; }
    public void setTenNguoiDaiDien(String v)   { this.tenNguoiDaiDien = v; }
    public String getDiaChi()                  { return diaChi; }
    public void setDiaChi(String v)            { this.diaChi = v; }
    public String getEmail()                   { return email; }
    public void setEmail(String v)             { this.email = v; }
    public String getSoDienThoai()             { return soDienThoai; }
    public void setSoDienThoai(String v)       { this.soDienThoai = v; }
    public Long getMaTaiKhoan()                { return maTaiKhoan; }
    public void setMaTaiKhoan(Long v)          { this.maTaiKhoan = v; }
    public String getMaQR()                    { return maQR; }
    public void setMaQR(String v)              { this.maQR = v; }
}