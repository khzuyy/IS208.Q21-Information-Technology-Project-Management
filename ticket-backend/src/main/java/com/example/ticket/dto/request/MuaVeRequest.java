package com.example.ticket.dto.request;

import java.util.List;

public class MuaVeRequest {

    private Long   maTaiKhoan;
    private Long   maNhanVien;
    private Long   maSuKien;
    private String maVoucher;
    private List<ItemRequest> items;
    private List<GheRequest>  ghes;   // danh sách ghế khách chọn

    public static class ItemRequest {
        private Long   maVe;
        private int    soLuong;
        private Long donGia;

        public Long   getMaVe()           { return maVe; }
        public void   setMaVe(Long v)     { this.maVe = v; }
        public int    getSoLuong()        { return soLuong; }
        public void   setSoLuong(int v)   { this.soLuong = v; }
        public Long getDonGia()         { return donGia; }
        public void   setDonGia(Long v) { this.donGia = v; }
    }

    public static class GheRequest {
        private String khuVuc;  // "A1", "B3"...
        private Long   maVe;    // loại vé của ghế này

        public String getKhuVuc()          { return khuVuc; }
        public void   setKhuVuc(String v)  { this.khuVuc = v; }
        public Long   getMaVe()            { return maVe; }
        public void   setMaVe(Long v)      { this.maVe = v; }
    }

    public Long   getMaTaiKhoan()               { return maTaiKhoan; }
    public void   setMaTaiKhoan(Long v)         { this.maTaiKhoan = v; }
    public Long   getMaNhanVien()               { return maNhanVien; }
    public void   setMaNhanVien(Long v)         { this.maNhanVien = v; }
    public Long   getMaSuKien()                 { return maSuKien; }
    public void   setMaSuKien(Long v)           { this.maSuKien = v; }
    public String getMaVoucher()                { return maVoucher; }
    public void   setMaVoucher(String v)        { this.maVoucher = v; }
    public List<ItemRequest> getItems()         { return items; }
    public void   setItems(List<ItemRequest> v) { this.items = v; }
    public List<GheRequest>  getGhes()          { return ghes; }
    public void   setGhes(List<GheRequest> v)   { this.ghes = v; }
}