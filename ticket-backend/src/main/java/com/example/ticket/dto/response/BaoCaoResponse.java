package com.example.ticket.dto.response;

import java.time.LocalDate;

public class BaoCaoResponse {

    private Long      maBaoCao;
    private Long      maNhanVien;
    private LocalDate ngayBatDau;
    private LocalDate ngayKetThuc;
    private Long      doanhThu;
    private int       soVeDaBan;
    private int       soVeTon;

    // ── Getters / Setters ─────────────────────────────────

    public Long getMaBaoCao()               { return maBaoCao; }
    public void setMaBaoCao(Long v)         { this.maBaoCao = v; }

    public Long getMaNhanVien()             { return maNhanVien; }
    public void setMaNhanVien(Long v)       { this.maNhanVien = v; }

    public LocalDate getNgayBatDau()        { return ngayBatDau; }
    public void setNgayBatDau(LocalDate v)  { this.ngayBatDau = v; }

    public LocalDate getNgayKetThuc()       { return ngayKetThuc; }
    public void setNgayKetThuc(LocalDate v) { this.ngayKetThuc = v; }

    public Long getDoanhThu()               { return doanhThu; }
    public void setDoanhThu(Long v)         { this.doanhThu = v; }

    public int getSoVeDaBan()               { return soVeDaBan; }
    public void setSoVeDaBan(int v)         { this.soVeDaBan = v; }

    public int getSoVeTon()                 { return soVeTon; }
    public void setSoVeTon(int v)           { this.soVeTon = v; }
}