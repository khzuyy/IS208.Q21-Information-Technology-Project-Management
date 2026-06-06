package com.example.ticket.model;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class ChiTietHoaDonID implements Serializable {

    private long maVe;
    private long maHoaDon;

    public ChiTietHoaDonID() {}

    public ChiTietHoaDonID(long maVe, long maHoaDon) {
        this.maVe = maVe;
        this.maHoaDon = maHoaDon;
    }

    public long getMaVe() {
        return maVe;
    }

    public void setMaVe(long maVe) {
        this.maVe = maVe;
    }

    public long getMaHoaDon() {
        return maHoaDon;
    }

    public void setMaHoaDon(long maHoaDon) {
        this.maHoaDon = maHoaDon;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ChiTietHoaDonID)) return false;
        ChiTietHoaDonID that = (ChiTietHoaDonID) o;
        return maVe == that.maVe && maHoaDon == that.maHoaDon;
    }

    @Override
    public int hashCode() {
        return Objects.hash(maVe, maHoaDon);
    }
}
