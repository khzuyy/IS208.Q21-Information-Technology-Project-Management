package com.example.ticket.dto.request;

public class VeRequest {

    private String tenVe;
    private String loaiVe;
    private Long gia;
    private String trangThai;
    private String moTa;
    private Long   maSuKien;
    private int    soLuong;  // tổng vé niêm yết
    private int    daBan;    // số vé đã bán

    public String getTenVe() { return tenVe; }
    public void setTenVe(String tenVe) { this.tenVe = tenVe; }

    public String getLoaiVe() { return loaiVe; }
    public void setLoaiVe(String loaiVe) { this.loaiVe = loaiVe; }

    public Long getGia() { return gia; }
    public void setGia(Long gia) { this.gia = gia; }

    public String getTrangThai() { return trangThai; }
    public void setTrangThai(String trangThai) { this.trangThai = trangThai; }

    public String getMoTa() { return moTa; }
    public void setMoTa(String moTa) { this.moTa = moTa; }

    public Long getMaSuKien() { return maSuKien; }
    public void setMaSuKien(Long maSuKien) { this.maSuKien = maSuKien; }

    public int getSoLuong() { return soLuong; }
    public void setSoLuong(int soLuong) { this.soLuong = soLuong; }

    public int getDaBan() { return daBan; }
    public void setDaBan(int daBan) { this.daBan = daBan; }
}