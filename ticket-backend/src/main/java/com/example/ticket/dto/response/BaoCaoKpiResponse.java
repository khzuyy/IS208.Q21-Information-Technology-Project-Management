package com.example.ticket.dto.response;

import java.util.List;

/**
 * Payload trả về sau khi lưu báo cáo KPI.
 * Frontend dùng dữ liệu này để tạo file Excel tải về.
 */
public class BaoCaoKpiResponse {

    private Long   maNhanVien;
    private String tenNhanVien;
    private String ngayXuat;
    private long   tongDoanhThu;
    private int    tongVeDaBan;
    private int    tongVeTon;
    private String ngayBatDau;
    private String ngayKetThuc;
    private List<ChiTietNgay>   chiTietNgay;
    private List<ChiTietHoaDon> chiTietHoaDon;

    // ── Inner: chi tiết từng ngày ──────────────────────────────────────────
    public static class ChiTietNgay {
        private String ngay;
        private int    soVe;
        private long   doanhThu;
        private int    soHoaDon;

        public ChiTietNgay() {}
        public ChiTietNgay(String ngay, int soVe, long doanhThu, int soHoaDon) {
            this.ngay = ngay; this.soVe = soVe;
            this.doanhThu = doanhThu; this.soHoaDon = soHoaDon;
        }
        public String getNgay()     { return ngay; }
        public void   setNgay(String v)     { ngay = v; }
        public int    getSoVe()     { return soVe; }
        public void   setSoVe(int v)        { soVe = v; }
        public long   getDoanhThu() { return doanhThu; }
        public void   setDoanhThu(long v)   { doanhThu = v; }
        public int    getSoHoaDon() { return soHoaDon; }
        public void   setSoHoaDon(int v)    { soHoaDon = v; }
    }

    // ── Inner: chi tiết từng hóa đơn ──────────────────────────────────────
    public static class ChiTietHoaDon {
        private Long   maHoaDon;
        private String ngayMua;
        private String tenVe;
        private String loaiVe;
        private int    soLuong;
        private long   gia;
        private long   thanhTien;
        private String trangThaiHoan;

        public ChiTietHoaDon() {}
        public ChiTietHoaDon(Long maHoaDon, String ngayMua, String tenVe,
                              String loaiVe, int soLuong, long gia,
                              long thanhTien, String trangThaiHoan) {
            this.maHoaDon = maHoaDon; this.ngayMua = ngayMua;
            this.tenVe = tenVe; this.loaiVe = loaiVe; this.soLuong = soLuong;
            this.gia = gia; this.thanhTien = thanhTien; this.trangThaiHoan = trangThaiHoan;
        }
        public Long   getMaHoaDon()        { return maHoaDon; }
        public void   setMaHoaDon(Long v)  { maHoaDon = v; }
        public String getNgayMua()         { return ngayMua; }
        public void   setNgayMua(String v) { ngayMua = v; }
        public String getTenVe()           { return tenVe; }
        public void   setTenVe(String v)   { tenVe = v; }
        public String getLoaiVe()          { return loaiVe; }
        public void   setLoaiVe(String v)  { loaiVe = v; }
        public int    getSoLuong()         { return soLuong; }
        public void   setSoLuong(int v)    { soLuong = v; }
        public long   getGia()             { return gia; }
        public void   setGia(long v)       { gia = v; }
        public long   getThanhTien()       { return thanhTien; }
        public void   setThanhTien(long v) { thanhTien = v; }
        public String getTrangThaiHoan()        { return trangThaiHoan; }
        public void   setTrangThaiHoan(String v){ trangThaiHoan = v; }
    }

    // ── Constructor & getters/setters ─────────────────────────────────────
    public BaoCaoKpiResponse() {}
    public BaoCaoKpiResponse(Long maNhanVien, String tenNhanVien, String ngayXuat,
                              long tongDoanhThu, int tongVeDaBan, int tongVeTon,
                              String ngayBatDau, String ngayKetThuc,
                              List<ChiTietNgay> chiTietNgay,
                              List<ChiTietHoaDon> chiTietHoaDon) {
        this.maNhanVien   = maNhanVien;   this.tenNhanVien   = tenNhanVien;
        this.ngayXuat     = ngayXuat;     this.tongDoanhThu  = tongDoanhThu;
        this.tongVeDaBan  = tongVeDaBan;  this.tongVeTon     = tongVeTon;
        this.ngayBatDau   = ngayBatDau;   this.ngayKetThuc   = ngayKetThuc;
        this.chiTietNgay  = chiTietNgay;  this.chiTietHoaDon = chiTietHoaDon;
    }

    public Long   getMaNhanVien()                        { return maNhanVien; }
    public void   setMaNhanVien(Long v)                  { maNhanVien = v; }
    public String getTenNhanVien()                       { return tenNhanVien; }
    public void   setTenNhanVien(String v)               { tenNhanVien = v; }
    public String getNgayXuat()                          { return ngayXuat; }
    public void   setNgayXuat(String v)                  { ngayXuat = v; }
    public long   getTongDoanhThu()                      { return tongDoanhThu; }
    public void   setTongDoanhThu(long v)                { tongDoanhThu = v; }
    public int    getTongVeDaBan()                       { return tongVeDaBan; }
    public void   setTongVeDaBan(int v)                  { tongVeDaBan = v; }
    public int    getTongVeTon()                         { return tongVeTon; }
    public void   setTongVeTon(int v)                    { tongVeTon = v; }
    public String getNgayBatDau()                        { return ngayBatDau; }
    public void   setNgayBatDau(String v)                { ngayBatDau = v; }
    public String getNgayKetThuc()                       { return ngayKetThuc; }
    public void   setNgayKetThuc(String v)               { ngayKetThuc = v; }
    public List<ChiTietNgay>   getChiTietNgay()          { return chiTietNgay; }
    public void   setChiTietNgay(List<ChiTietNgay> v)    { chiTietNgay = v; }
    public List<ChiTietHoaDon> getChiTietHoaDon()        { return chiTietHoaDon; }
    public void   setChiTietHoaDon(List<ChiTietHoaDon> v){ chiTietHoaDon = v; }
}