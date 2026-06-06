package com.example.ticket.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "VE")
public class Ve {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ve_seq")
    @SequenceGenerator(name = "ve_seq", sequenceName = "VE_SEQ", allocationSize = 1)
    private Long maVe;

    private String tenVe;
    private String loaiVe;
    private Long gia;
    private String trangThai;
    private String moTa;
    private Long   maSuKien;

    @Column(name = "SoLuong")
    private int soLuong;  // tổng số vé niêm yết

    @Column(name = "DaBan")
    private int daBan;    // số vé đã bán

    // Tính conLai động, không lưu vào DB
    @Transient
    public int getConLai() {
        return soLuong - daBan;
    }

    public Long getMaVe() { return maVe; }
    public void setMaVe(Long maVe) { this.maVe = maVe; }

    public String getTenVe() { return tenVe; }
    public void setTenVe(String tenVe) { this.tenVe = tenVe; }

    public String getLoaiVe() { return loaiVe; }
    public void setLoaiVe(String loaiVe) { this.loaiVe = loaiVe; }

    public Long getGia() { return gia; }
    public void setGia(Long gia) { this.gia = gia; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }

    public int getDaBan() { return daBan; }
    public void setDaBan(int daBan) { this.daBan = daBan; }

    public Long getMaSuKien() { return maSuKien; }
    public void setMaSuKien(Long maSuKien) { this.maSuKien = maSuKien; }
}