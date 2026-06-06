package com.example.ticket.dto.request;

import java.time.LocalDate;

public class VoucherRequest {

    private String maCode;
    private Long mucKhuyenMai;
    private String trangThai;
    private Integer soLuong; // giới hạn lượt sử dụng tối đa
    private Long maTaiKhoan;
    private Long maSuKien;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private String danhSachSuKien; // "1,2,3"
    
    public String getDanhSachSuKien() { return danhSachSuKien; }
    public void setDanhSachSuKien(String v) { this.danhSachSuKien = v; }

    public String getMaCode() { return maCode; }
    public void setMaCode(String maCode) { this.maCode = maCode; }

    public Long getMucKhuyenMai() { return mucKhuyenMai; }
    public void setMucKhuyenMai(Long mucKhuyenMai) { this.mucKhuyenMai = mucKhuyenMai; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public Integer getSoLuong() { return soLuong; }
    public void setSoLuong(Integer soLuong) { this.soLuong = soLuong; }

    public Long getMaTaiKhoan() { return maTaiKhoan; }
    public void setMaTaiKhoan(Long maTaiKhoan) { this.maTaiKhoan = maTaiKhoan; }

    public Long getMaSuKien() { return maSuKien; }
    public void setMaSuKien(Long maSuKien) { this.maSuKien = maSuKien; }

    public LocalDate getNgayBatDau() { return ngayBatDau; }
    public void setNgayBatDau(LocalDate ngayBatDau) { this.ngayBatDau = ngayBatDau; }

    public LocalDate getNgayKetThuc() { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate ngayKetThuc) { this.ngayKetThuc = ngayKetThuc; }
}