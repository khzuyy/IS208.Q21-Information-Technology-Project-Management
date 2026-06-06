package com.example.ticket.dto.response;

import java.time.LocalDate;

public class HoanVeResponse {
    private Long      maHoanVe;
    private Long      maHoaDon;
    private Long      maGhe;
    private String    khuVuc;
    private String    tenVe;
    private String    tenSuKien;
    private String    tenKhachHang;
    private LocalDate thoiGianHoan;
    private String    lyDoHoan;
    private String    trangThaiHoan;

    public Long getMaHoanVe()                { return maHoanVe; }
    public void setMaHoanVe(Long v)          { this.maHoanVe = v; }
    public Long getMaHoaDon()                { return maHoaDon; }
    public void setMaHoaDon(Long v)          { this.maHoaDon = v; }
    public Long getMaGhe()                   { return maGhe; }
    public void setMaGhe(Long v)             { this.maGhe = v; }
    public String getKhuVuc()                { return khuVuc; }
    public void setKhuVuc(String v)          { this.khuVuc = v; }
    public String getTenVe()                 { return tenVe; }
    public void setTenVe(String v)           { this.tenVe = v; }
    public String getTenSuKien()             { return tenSuKien; }
    public void setTenSuKien(String v)       { this.tenSuKien = v; }
    public String getTenKhachHang()          { return tenKhachHang; }
    public void setTenKhachHang(String v)    { this.tenKhachHang = v; }
    public LocalDate getThoiGianHoan()       { return thoiGianHoan; }
    public void setThoiGianHoan(LocalDate v) { this.thoiGianHoan = v; }
    public String getLyDoHoan()              { return lyDoHoan; }
    public void setLyDoHoan(String v)        { this.lyDoHoan = v; }
    public String getTrangThaiHoan()         { return trangThaiHoan; }
    public void setTrangThaiHoan(String v)   { this.trangThaiHoan = v; }
}