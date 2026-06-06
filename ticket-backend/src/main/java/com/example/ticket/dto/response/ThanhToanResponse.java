package com.example.ticket.dto.response;

import java.time.LocalDateTime;

public class ThanhToanResponse {

    private Long          maThanhToan;
    private Long          maHoaDon;
    private String        phuongThuc;
    private Long          soTien;
    private String        trangThai;
    private LocalDateTime thoiGian;

    public Long          getMaThanhToan()              { return maThanhToan; }
    public void          setMaThanhToan(Long v)        { this.maThanhToan = v; }
    public Long          getMaHoaDon()                 { return maHoaDon; }
    public void          setMaHoaDon(Long v)           { this.maHoaDon = v; }
    public String        getPhuongThuc()               { return phuongThuc; }
    public void          setPhuongThuc(String v)       { this.phuongThuc = v; }
    public Long          getSoTien()                   { return soTien; }
    public void          setSoTien(Long v)             { this.soTien = v; }
    public String        getTrangThai()                { return trangThai; }
    public void          setTrangThai(String v)        { this.trangThai = v; }
    public LocalDateTime getThoiGian()                 { return thoiGian; }
    public void          setThoiGian(LocalDateTime v)  { this.thoiGian = v; }
}