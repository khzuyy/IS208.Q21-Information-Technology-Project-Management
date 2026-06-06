package com.example.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "HOANVE")
public class HoanVe {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "hoanve_seq")
    @SequenceGenerator(name = "hoanve_seq", sequenceName = "HOANVE_SEQ", allocationSize = 1)
    @Column(name = "MaHoanVe")
    private Long maHoanVe;

    @Column(name = "MaHoaDon")
    private Long maHoaDon;

    @Column(name = "MaGhe")
    private Long maGhe;

    @Column(name = "ThoiGianHoan")
    private LocalDate thoiGianHoan;

    @Column(name = "LyDoHoan")
    private String lyDoHoan;

    @Column(name = "TrangThaiHoan")
    private String trangThaiHoan;

    // getters / setters
    public Long getMaHoanVe()                { return maHoanVe; }
    public void setMaHoanVe(Long v)          { this.maHoanVe = v; }
    public Long getMaHoaDon()                { return maHoaDon; }
    public void setMaHoaDon(Long v)          { this.maHoaDon = v; }
    public Long getMaGhe()                   { return maGhe; }
    public void setMaGhe(Long v)             { this.maGhe = v; }
    public LocalDate getThoiGianHoan()       { return thoiGianHoan; }
    public void setThoiGianHoan(LocalDate v) { this.thoiGianHoan = v; }
    public String getLyDoHoan()              { return lyDoHoan; }
    public void setLyDoHoan(String v)        { this.lyDoHoan = v; }
    public String getTrangThaiHoan()         { return trangThaiHoan; }
    public void setTrangThaiHoan(String v)   { this.trangThaiHoan = v; }
}