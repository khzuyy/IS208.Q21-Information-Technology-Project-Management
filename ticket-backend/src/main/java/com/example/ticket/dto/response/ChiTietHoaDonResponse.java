package com.example.ticket.dto.response;

import java.util.List;

public class ChiTietHoaDonResponse {

    private long   maVe;
    private long   maHoaDon;
    private long   donGia;
    private int    soLuong;
    private String tenVe;       // thêm để frontend hiển thị
    private String loaiVe;      // thêm để frontend hiển thị
    private List<GheInfo> gheList; // danh sách ghế kèm trạng thái

    // ── GheInfo inner class ──────────────────────────────
    public static class GheInfo {
        private Long   maGhe;
        private String khuVuc;
        private String trangThai; // "da_dat" | "da_hoan"

        public Long   getMaGhe()             { return maGhe; }
        public void   setMaGhe(Long v)       { this.maGhe = v; }
        public String getKhuVuc()            { return khuVuc; }
        public void   setKhuVuc(String v)    { this.khuVuc = v; }
        public String getTrangThai()         { return trangThai; }
        public void   setTrangThai(String v) { this.trangThai = v; }
    }

    // getters / setters
    public long   getMaVe()                      { return maVe; }
    public void   setMaVe(long v)                { this.maVe = v; }
    public long   getMaHoaDon()                  { return maHoaDon; }
    public void   setMaHoaDon(long v)            { this.maHoaDon = v; }
    public long   getDonGia()                    { return donGia; }
    public void   setDonGia(long v)              { this.donGia = v; }
    public int    getSoLuong()                   { return soLuong; }
    public void   setSoLuong(int v)              { this.soLuong = v; }
    public String getTenVe()                     { return tenVe; }
    public void   setTenVe(String v)             { this.tenVe = v; }
    public String getLoaiVe()                    { return loaiVe; }
    public void   setLoaiVe(String v)            { this.loaiVe = v; }
    public List<GheInfo> getGheList()            { return gheList; }
    public void   setGheList(List<GheInfo> v)    { this.gheList = v; }
}