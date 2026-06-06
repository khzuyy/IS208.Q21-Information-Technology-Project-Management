package com.example.ticket.dto.response;

import java.time.LocalDate;
import java.util.List;
public class VoucherResponse {

    private Long maVoucher;
    private String maCode;
    private Long mucKhuyenMai;
    private String trangThai;
    private Integer luotSuDung;
    private Integer soLuong;
    private Long maCongTy;
    private Long maSuKien;
    private String tenSuKien;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private String danhSachSuKien;
    private List<String> tenSuKienList; // để frontend hiển thị tên
    
    public String getDanhSachSuKien() { return danhSachSuKien; }
    public void setDanhSachSuKien(String v) { this.danhSachSuKien = v; }
    
    public List<String> getTenSuKienList() { return tenSuKienList; }
    public void setTenSuKienList(List<String> v) { this.tenSuKienList = v; }
    
    public Long getMaVoucher() { return maVoucher; }
    public void setMaVoucher(Long maVoucher) { this.maVoucher = maVoucher; }

    public String getMaCode() { return maCode; }
    public void setMaCode(String maCode) { this.maCode = maCode; }

    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }

    public Long getMucKhuyenMai() { return mucKhuyenMai; }
    public void setMucKhuyenMai(Long mucKhuyenMai) { this.mucKhuyenMai = mucKhuyenMai; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public Integer getLuotSuDung() { return luotSuDung; }
    public void setLuotSuDung(Integer luotSuDung) { this.luotSuDung = luotSuDung; }

    public Long getMaCongTy() { return maCongTy; }
    public void setMaCongTy(Long maCongTy) { this.maCongTy = maCongTy; }

    public Long getMaSuKien() { return maSuKien; }
    public void setMaSuKien(Long maSuKien) { this.maSuKien = maSuKien; }

    public String getTenSuKien() { return tenSuKien; }
    public void setTenSuKien(String tenSuKien) { this.tenSuKien = tenSuKien; }

    public LocalDate getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public LocalDate getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }
}
