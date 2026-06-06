package com.example.ticket.dto.response;

import java.util.List;

public class DoanhThuResponse {

    private Long   maSuKien;
    private String tenSuKien;
    private String thoiGianBatDau;
    private String thoiGianKetThuc;

    private long   tongDoanhThu;     // tổng thanhTien các hóa đơn thuộc sự kiện
    private int    tongVeDaBan;      // tổng soLuong trong ChiTietHoaDon
    private int    tongVeTongSo;     // tổng vé phát hành (tất cả loại vé của sự kiện)

    private List<LoaiVeStats> chiTietLoaiVe;

    public static class LoaiVeStats {
        private Long   maVe;
        private String tenVe;
        private String loaiVe;
        private Long gia;
        private int    daBan;
        private long   doanhThu;

        public Long   getMaVe()          { return maVe; }
        public void   setMaVe(Long v)    { this.maVe = v; }
        public String getTenVe()         { return tenVe; }
        public void   setTenVe(String v) { this.tenVe = v; }
        public String getLoaiVe()        { return loaiVe; }
        public void   setLoaiVe(String v){ this.loaiVe = v; }
        public Long getGia()           { return gia; }
        public void   setGia(Long v)   { this.gia = v; }
        public int    getDaBan()         { return daBan; }
        public void   setDaBan(int v)    { this.daBan = v; }
        public long   getDoanhThu()      { return doanhThu; }
        public void   setDoanhThu(long v){ this.doanhThu = v; }
    }

    public Long   getMaSuKien()                         { return maSuKien; }
    public void   setMaSuKien(Long v)                   { this.maSuKien = v; }
    public String getTenSuKien()                        { return tenSuKien; }
    public void   setTenSuKien(String v)                { this.tenSuKien = v; }
    public String getThoiGianBatDau()                   { return thoiGianBatDau; }
    public void   setThoiGianBatDau(String v)           { this.thoiGianBatDau = v; }
    public String getThoiGianKetThuc()                  { return thoiGianKetThuc; }
    public void   setThoiGianKetThuc(String v)          { this.thoiGianKetThuc = v; }
    public long   getTongDoanhThu()                     { return tongDoanhThu; }
    public void   setTongDoanhThu(long v)               { this.tongDoanhThu = v; }
    public int    getTongVeDaBan()                      { return tongVeDaBan; }
    public void   setTongVeDaBan(int v)                 { this.tongVeDaBan = v; }
    public int    getTongVeTongSo()                     { return tongVeTongSo; }
    public void   setTongVeTongSo(int v)                { this.tongVeTongSo = v; }
    public List<LoaiVeStats> getChiTietLoaiVe()         { return chiTietLoaiVe; }
    public void   setChiTietLoaiVe(List<LoaiVeStats> v) { this.chiTietLoaiVe = v; }
}