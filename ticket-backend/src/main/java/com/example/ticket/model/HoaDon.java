package com.example.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "HOADON")
public class HoaDon {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hoadon_seq")
    @SequenceGenerator(name = "hoadon_seq", sequenceName = "HOADON_SEQ", allocationSize = 1)
    private Long maHoaDon;

    private LocalDate ngayLap;
    private String trangThai;
    private Long thanhTien;
    private Long maKhachHang;
    private Long maNhanVien;
    private Long maVoucher;

    public Long getMaHoaDon() {
        return maHoaDon;
    }

    public void setMaHoaDon(Long maHoaDon) {
        this.maHoaDon = maHoaDon;
    }

    public LocalDate getNgayLap() {
        return ngayLap;
    }

    public void setNgayLap(LocalDate ngayLap) {
        this.ngayLap = ngayLap;
    }

    public String getTrangThai() {
        return trangThai;
    }

    public void setTrangThai(String trangThai) {
        this.trangThai = trangThai;
    }

    public Long getThanhTien() {
        return thanhTien;
    }

    public void setThanhTien(Long thanhTien) {
        this.thanhTien = thanhTien;
    }
    
    public Long getMaKhachHang(){
        return maKhachHang;
    }
    
    public void setMaKhachHang(Long maKhachHang){
        this.maKhachHang = maKhachHang;
    }
    
    public Long getMaNhanVien(){
        return maNhanVien;
    }

    public void setMaNhanVien(Long maNhanVien){
        this.maNhanVien = maNhanVien;
    }
    public Long getMaVoucher() {
        return maVoucher;
    }

    public void setMaVoucher(Long maVoucher) {
        this.maVoucher = maVoucher;
    }
}
