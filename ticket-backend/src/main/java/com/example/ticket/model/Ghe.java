package com.example.ticket.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

@Entity
@Table(name = "GHE")
public class Ghe {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "ghe_seq")
    @SequenceGenerator(name = "ghe_seq", sequenceName = "GHE_SEQ", allocationSize = 1)
    @Column(name = "MAGHE")
    private Long maGhe;

    @Column(name = "KHUVUC")
    private String khuVuc;      // "A1", "B3", "C10"...

    @Column(name = "TRANGTHAI")
    private String trangThai;   // "da_dat"

    @Column(name = "MAVE")
    private Long maVe;

    @Column(name = "MAHOADON")
    private Long maHoaDon;

    @Column(name = "QR_TOKEN")
    private String qrToken;

    public Long   getMaGhe()               { return maGhe; }
    public void   setMaGhe(Long v)         { this.maGhe = v; }
    public String getKhuVuc()              { return khuVuc; }
    public void   setKhuVuc(String v)      { this.khuVuc = v; }
    public String getTrangThai()           { return trangThai; }
    public void   setTrangThai(String v)   { this.trangThai = v; }
    public Long   getMaVe()                { return maVe; }
    public void   setMaVe(Long v)          { this.maVe = v; }
    public Long   getMaHoaDon()            { return maHoaDon; }
    public void   setMaHoaDon(Long v)      { this.maHoaDon = v; }
    public String getQrToken()             { return qrToken; }
    public void   setQrToken(String v)     { this.qrToken = v; }
}