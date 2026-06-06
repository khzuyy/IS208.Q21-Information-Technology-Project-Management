package com.example.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "THANHTOAN")
public class ThanhToan {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "thanhtoan_seq")
    @SequenceGenerator(name = "thanhtoan_seq", sequenceName = "THANHTOAN_SEQ", allocationSize = 1)
    private Long maThanhToan;

    private String        trangThai;
    private Long          soTien;
    private LocalDateTime thoiGian;
    private String        phuongThuc;
    private Long          maHoaDon;   

    public Long          getMaThanhToan()              { return maThanhToan; }
    public void          setMaThanhToan(Long v)        { this.maThanhToan = v; }
    public String        getTrangThai()                { return trangThai; }
    public void          setTrangThai(String v)        { this.trangThai = v; }
    public Long          getSoTien()                   { return soTien; }
    public void          setSoTien(Long v)             { this.soTien = v; }
    public LocalDateTime getThoiGian()                 { return thoiGian; }
    public void          setThoiGian(LocalDateTime v)  { this.thoiGian = v; }
    public String        getPhuongThuc()               { return phuongThuc; }
    public void          setPhuongThuc(String v)       { this.phuongThuc = v; }
    public Long          getMaHoaDon()                 { return maHoaDon; }
    public void          setMaHoaDon(Long v)           { this.maHoaDon = v; }
}