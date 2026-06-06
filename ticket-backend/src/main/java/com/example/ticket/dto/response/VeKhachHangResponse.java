package com.example.ticket.dto.response;

import java.time.LocalDate;
import java.util.List;

/** Trả về cho tab "Vé của tôi" — gộp thông tin Ve + SuKien + HoaDon */
public class VeKhachHangResponse {

    private Long         maVe;
    private String       tenVe;
    private String       loaiVe;
    private Long       gia;
    private String       trangThai;
    private String       tenSuKien;
    private LocalDate    thoiGianBatDau;
    private LocalDate    thoiGianKetThuc;
    private Long         maHoaDon;
    private LocalDate    ngayMua;
    private int          soLuong;
    private Long         thanhTien;
    private Long         thanhTienGoc;
    private String       trangThaiHoan;
    private int          soLuongHoan;
    private List<String> gheDat;
    private Long         maSuKien;
    private List<GheInfo> gheList; 


    // getter/setter


    // ── GheInfo ──────────────────────────────────────────
    public static class GheInfo {
        private Long   maGhe;
        private String khuVuc;
        private String trangThai;
        private String qrToken;   

        public Long   getMaGhe()             { return maGhe; }
        public void   setMaGhe(Long v)       { this.maGhe = v; }
        public String getKhuVuc()            { return khuVuc; }
        public void   setKhuVuc(String v)    { this.khuVuc = v; }
        public String getTrangThai()         { return trangThai; }
        public void   setTrangThai(String v) { this.trangThai = v; }
        public String getQrToken() { return qrToken; }
        public void setQrToken(String qrToken) { this.qrToken = qrToken; }
    }

    // ── getters / setters cũ giữ nguyên ──────────────────
    public Long      getMaVe()                      { return maVe; }
    public void      setMaVe(Long v)                { this.maVe = v; }
    public String    getTenVe()                     { return tenVe; }
    public void      setTenVe(String v)             { this.tenVe = v; }
    public String    getLoaiVe()                    { return loaiVe; }
    public void      setLoaiVe(String v)            { this.loaiVe = v; }
    public Long    getGia()                       { return gia; }
    public void      setGia(Long v)               { this.gia = v; }
    public String    getTrangThai()                 { return trangThai; }
    public void      setTrangThai(String v)         { this.trangThai = v; }
    public String    getTenSuKien()                 { return tenSuKien; }
    public void      setTenSuKien(String v)         { this.tenSuKien = v; }
    public LocalDate getThoiGianBatDau()            { return thoiGianBatDau; }
    public void      setThoiGianBatDau(LocalDate v) { this.thoiGianBatDau = v; }
    public LocalDate getThoiGianKetThuc()           { return thoiGianKetThuc; }
    public void      setThoiGianKetThuc(LocalDate v){ this.thoiGianKetThuc = v; }
    public Long      getMaHoaDon()                  { return maHoaDon; }
    public void      setMaHoaDon(Long v)            { this.maHoaDon = v; }
    public LocalDate getNgayMua()                   { return ngayMua; }
    public void      setNgayMua(LocalDate v)        { this.ngayMua = v; }
    public int       getSoLuong()                   { return soLuong; }
    public void      setSoLuong(int v)              { this.soLuong = v; }
    public Long      getThanhTien()                 { return thanhTien; }
    public void      setThanhTien(Long v)           { this.thanhTien = v; }
    public Long      getThanhTienGoc()              { return thanhTienGoc; }
    public void      setThanhTienGoc(Long v)        { this.thanhTienGoc = v; }
    public String    getTrangThaiHoan()             { return trangThaiHoan; }
    public void      setTrangThaiHoan(String v)     { this.trangThaiHoan = v; }
    public int       getSoLuongHoan()               { return soLuongHoan; }
    public void      setSoLuongHoan(int v)          { this.soLuongHoan = v; }
    public List<String> getGheDat()                 { return gheDat; }
    public void      setGheDat(List<String> v)      { this.gheDat = v; }
    public Long      getMaSuKien()                  { return maSuKien; }
    public void      setMaSuKien(Long v)            { this.maSuKien = v; }
    public List<GheInfo> getGheList()               { return gheList; } // ✅ thêm mới
    public void      setGheList(List<GheInfo> v)    { this.gheList = v; } // ✅ thêm mới

}