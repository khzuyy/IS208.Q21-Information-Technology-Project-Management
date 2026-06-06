package com.example.ticket.dto.request;

/**
 * Frontend gửi lên sau khi có maHoaDon.
 * phuongThuc: "TIEN_MAT" | "CHUYEN_KHOAN"
 * trangThai:  "THANH_CONG" | "DANG_XU_LY"
 */
public class ThanhToanRequest {

    private Long   maHoaDon;
    private String phuongThuc;
    private Long   soTien;
    private String trangThai;

    public Long   getMaHoaDon()              { return maHoaDon; }
    public void   setMaHoaDon(Long v)        { this.maHoaDon = v; }
    public String getPhuongThuc()            { return phuongThuc; }
    public void   setPhuongThuc(String v)    { this.phuongThuc = v; }
    public Long   getSoTien()                { return soTien; }
    public void   setSoTien(Long v)          { this.soTien = v; }
    public String getTrangThai()             { return trangThai; }
    public void   setTrangThai(String v)     { this.trangThai = v; }
}