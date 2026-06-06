package com.example.ticket.model;

import java.time.LocalDate;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@Table(name = "VOUCHER")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "voucher_seq")
    @SequenceGenerator(name = "voucher_seq", sequenceName = "VOUCHER_SEQ", allocationSize = 1)
    private Long maVoucher;

    private String maCode;
    private String danhSachSuKien;
    private Long mucKhuyenMai;
    private Integer soLuong;
    private String trangThai;
    private Integer luotSuDung;
    private Long maCongTy;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;

    public Voucher() {}

    public Long getMaVoucher() { return maVoucher; }
    public void setMaVoucher(Long maVoucher) { this.maVoucher = maVoucher; }

    public String getMaCode() { return maCode; }
    public void setMaCode(String maCode) { this.maCode = maCode; }

    public Long getMucKhuyenMai() { return mucKhuyenMai; }
    public void setMucKhuyenMai(Long mucKhuyenMai) { this.mucKhuyenMai = mucKhuyenMai; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }

    public Integer getLuotSuDung() { return luotSuDung; }
    public void setLuotSuDung(Integer luotSuDung) { this.luotSuDung = luotSuDung; }

    public Long getMaCongTy() { return maCongTy; }
    public void setMaCongTy(Long maCongTy) { this.maCongTy = maCongTy; }

    public LocalDate getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public LocalDate getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }
    
    public String getDanhSachSuKien() { return danhSachSuKien; }
    public void setDanhSachSuKien(String v) { this.danhSachSuKien = v; }
    
    public boolean isApDungChoSuKien(Long maSuKien) {
    if (danhSachSuKien == null || danhSachSuKien.isBlank()) return false;
        for (String id : danhSachSuKien.split(",")) {
            if (id.trim().equals(String.valueOf(maSuKien))) return true;
        }
        return false;
    }
}