package com.example.ticket.model;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@Table(name = "SUKIEN")
public class SuKien {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sukien_seq")
    @SequenceGenerator(name = "sukien_seq", sequenceName = "SUKIEN_SEQ", allocationSize = 1)
    @Column(name = "MASUKIEN")
    private Long maSuKien;

    @Column(name = "TENSUKIEN", nullable = false)
    private String tenSuKien;

    @Column(name = "MOTA")
    private String moTa;

    @Column(name = "THOIGIANBATDAU")
    private LocalDate thoiGianBatDau;

    @Column(name = "THOIGIANKETTHUC")
    private LocalDate thoiGianKetThuc;

    @Column(name = "MACONGTY")
    private Long maCongTy;

    /** Địa điểm tổ chức — liên kết tới DiaDiem.maDiaDiem */
    @Column(name = "MADIADIEM")
    private Long maDiaDiem;

    /**
     * Trạng thái admin quản lý: "Hoạt động" | "Vi phạm" | "Ẩn"
     * Mặc định "Hoạt động" khi tạo mới.
     */
    @Column(name = "TRANGTHAI")
    private String trangThai = "Hoạt động";

    public SuKien() {}

    public Long getMaSuKien() { return maSuKien; }
    public void setMaSuKien(Long maSuKien) { this.maSuKien = maSuKien; }

    public String getTenSuKien() { return tenSuKien; }
    public void setTenSuKien(String tenSuKien) { this.tenSuKien = tenSuKien; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public LocalDate getThoiGianBatDau() { return thoiGianBatDau; }
    public void setThoiGianBatDau(LocalDate thoiGianBatDau) { this.thoiGianBatDau = thoiGianBatDau; }

    public LocalDate getThoiGianKetThuc() { return thoiGianKetThuc; }
    public void setThoiGianKetThuc(LocalDate thoiGianKetThuc) { this.thoiGianKetThuc = thoiGianKetThuc; }

    public Long getMaCongTy() { return maCongTy; }
    public void setMaCongTy(Long maCongTy) { this.maCongTy = maCongTy; }

    public Long getMaDiaDiem() { return maDiaDiem; }
    public void setMaDiaDiem(Long maDiaDiem) { this.maDiaDiem = maDiaDiem; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }
}