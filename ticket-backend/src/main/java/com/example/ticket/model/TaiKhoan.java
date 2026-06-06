package com.example.ticket.model;

import jakarta.persistence.*;

@Entity
@Table(name = "TAIKHOAN")
public class TaiKhoan {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "tk_seq")
    @SequenceGenerator(name = "tk_seq", sequenceName = "TAIKHOAN_SEQ", allocationSize = 1)
    private Long maTaiKhoan;

    private String tenTaiKhoan;
    private String loaiTaiKhoan;
    private String matKhau;

    @Column(name = "TRANGTHAI")
    private String trangThai; // "active" | "blocked"

    public TaiKhoan() {}

    public Long   getMaTaiKhoan()              { return maTaiKhoan; }
    public void   setMaTaiKhoan(Long v)        { this.maTaiKhoan = v; }
    public String getTenTaiKhoan()             { return tenTaiKhoan; }
    public void   setTenTaiKhoan(String v)     { this.tenTaiKhoan = v; }
    public String getLoaiTaiKhoan()            { return loaiTaiKhoan; }
    public void   setLoaiTaiKhoan(String v)    { this.loaiTaiKhoan = v; }
    public String getMatKhau()                 { return matKhau; }
    public void   setMatKhau(String v)         { this.matKhau = v; }
    public String getTrangThai()               { return trangThai; }
    public void   setTrangThai(String v)       { this.trangThai = v; }

    @Override
    public String toString() {
        return "TaiKhoan{maTaiKhoan=" + maTaiKhoan
                + ", tenTaiKhoan='" + tenTaiKhoan + "'"
                + ", loaiTaiKhoan='" + loaiTaiKhoan + "'"
                + ", trangThai='" + trangThai + "'}";
    }
}