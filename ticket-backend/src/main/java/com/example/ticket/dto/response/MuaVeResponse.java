package com.example.ticket.dto.response;

import java.time.LocalDate;
import java.util.List;

public class MuaVeResponse {

    private Long      maHoaDon;
    private LocalDate ngayLap;
    private Long      thanhTienGoc;   // trước giảm giá
    private Long      thanhTienSau;   // sau giảm giá
    private Long    phanTramGiam;   // % voucher (null nếu không dùng)
    private String    trangThai;
    private List<ChiTietHoaDonResponse> chiTiet;

    public Long      getMaHoaDon()               { return maHoaDon; }
    public void      setMaHoaDon(Long v)          { this.maHoaDon = v; }
    public LocalDate getNgayLap()                 { return ngayLap; }
    public void      setNgayLap(LocalDate v)      { this.ngayLap = v; }
    public Long      getThanhTienGoc()            { return thanhTienGoc; }
    public void      setThanhTienGoc(Long v)      { this.thanhTienGoc = v; }
    public Long      getThanhTienSau()            { return thanhTienSau; }
    public void      setThanhTienSau(Long v)      { this.thanhTienSau = v; }
    public Long    getPhanTramGiam()            { return phanTramGiam; }
    public void      setPhanTramGiam(Long v)    { this.phanTramGiam = v; }
    public String    getTrangThai()               { return trangThai; }
    public void      setTrangThai(String v)       { this.trangThai = v; }
    public List<ChiTietHoaDonResponse> getChiTiet() { return chiTiet; }
    public void      setChiTiet(List<ChiTietHoaDonResponse> v) { this.chiTiet = v; }
}