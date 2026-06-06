package com.example.ticket.model;

import jakarta.persistence.*;

@Entity
@Table(name = "CHITIETHOADON")
public class ChiTietHoaDon {

    @EmbeddedId
    private ChiTietHoaDonID id;

    private long donGia;
    private int soLuong;

    public ChiTietHoaDonID getId() {
        return id;
    }

    public void setId(ChiTietHoaDonID id) {
        this.id = id;
    }

    public long getDonGia() {
        return donGia;
    }

    public void setDonGia(long donGia) {
        this.donGia = donGia;
    }

    public int getSoLuong() {
        return soLuong;
    }

    public void setSoLuong(int soLuong) {
        this.soLuong = soLuong;
    }
}
