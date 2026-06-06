package com.example.ticket.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "BAOCAO")
public class BaoCao {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "baocao_seq")
    @SequenceGenerator(name = "baocao_seq", sequenceName = "BAOCAO_SEQ", allocationSize = 1)
    private Long maBaoCao;

    private Long doanhThu;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private int soVeDaBan;
    private int soVeTon;
    
    private Long maNhanVien;

    public Long getMaBaoCao() {
        return maBaoCao;
    }

    public void setMaBaoCao(Long maBaoCao) {
        this.maBaoCao = maBaoCao;
    }

    public Long getDoanhThu() {
        return doanhThu;
    }

    public void setDoanhThu(Long doanhThu) {
        this.doanhThu = doanhThu;
    }

    public LocalDate getNgayBatDau() {
        return ngayBatDau;
    }

    public void setNgayBatDau(LocalDate ngayBatDau) {
        this.ngayBatDau = ngayBatDau;
    }

    public LocalDate getNgayKetThuc() {
        return ngayKetThuc;
    }

    public void setNgayKetThuc(LocalDate ngayKetThuc) {
        this.ngayKetThuc = ngayKetThuc;
    }

    public int getSoVeDaBan() {
        return soVeDaBan;
    }

    public void setSoVeDaBan(int soVeDaBan) {
        this.soVeDaBan = soVeDaBan;
    }

    public int getSoVeTon() {
        return soVeTon;
    }

    public void setSoVeTon(int soVeTon) {
        this.soVeTon = soVeTon;
    }
    
    public Long getMaNhanVien(){
        return maNhanVien;
    }
    
    public void setMaNhanVien(Long maNhanVien){
        this.maNhanVien = maNhanVien;
    }
}
