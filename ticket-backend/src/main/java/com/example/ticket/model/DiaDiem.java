package com.example.ticket.model;

import jakarta.persistence.*;

@Entity
@Table(name = "DIADIEM")
public class DiaDiem {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "diadiem_seq")
    @SequenceGenerator(name = "diadiem_seq", sequenceName = "DIADIEM_SEQ", allocationSize = 1)
    private Long maDiaDiem;

    private String tenDiaDiem;
    private String diaChi;
    private int sucChua;

    @Column(name = "LOAISODO")
    private String loaiSoDo = "Hình chữ nhật";

    public Long getMaDiaDiem() { return maDiaDiem; }
    public void setMaDiaDiem(Long maDiaDiem) { this.maDiaDiem = maDiaDiem; }

    public String getTenDiaDiem() { return tenDiaDiem; }
    public void setTenDiaDiem(String tenDiaDiem) { this.tenDiaDiem = tenDiaDiem; }

    public String getDiaChi() { return diaChi; }
    public void setDiaChi(String diaChi) { this.diaChi = diaChi; }

    public int getSucChua() { return sucChua; }
    public void setSucChua(int sucChua) { this.sucChua = sucChua; }

    public String getLoaiSoDo() { return loaiSoDo; }
    public void setLoaiSoDo(String loaiSoDo) { this.loaiSoDo = loaiSoDo; }
}