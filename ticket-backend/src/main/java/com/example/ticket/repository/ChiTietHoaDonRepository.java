package com.example.ticket.repository;

import com.example.ticket.model.ChiTietHoaDon;
import com.example.ticket.model.ChiTietHoaDonID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ChiTietHoaDonRepository extends JpaRepository<ChiTietHoaDon, ChiTietHoaDonID> {
    List<ChiTietHoaDon> findByIdMaHoaDon(Long maHoaDon);
    List<ChiTietHoaDon> findByIdMaHoaDonIn(List<Long> maHoaDonList);
    // Thêm: dùng cho tính doanh thu theo vé
    List<ChiTietHoaDon> findByIdMaVeIn(List<Long> maVeList);
    // Xóa theo khách hàng
    @Modifying
    @Query(value = "DELETE FROM CHITIETHOADON WHERE MAHOADON IN " +
                "(SELECT MAHOADON FROM HOADON WHERE MAKHACHHANG = :id)", 
        nativeQuery = true)
    void deleteByMaKhachHang(@Param("id") Long id);

    // Xóa theo nhà tổ chức
    @Modifying
    @Query(value = "DELETE FROM CHITIETHOADON WHERE MAHOADON IN " +
                "(SELECT MAHOADON FROM HOADON WHERE MAVOUCHER IN " +
                "(SELECT MAVOUCHER FROM VOUCHER WHERE MACONGTY = :id))", 
        nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);

        @Query("""
            SELECT COALESCE(SUM(ct.soLuong), 0)
            FROM   ChiTietHoaDon ct
            JOIN   HoaDon hd ON hd.maHoaDon = ct.id.maHoaDon
            WHERE  hd.maNhanVien = :maNhanVien
            AND    hd.ngayLap    = :ngay
            AND    (hd.trangThai IS NULL OR hd.trangThai <> 'DA_HUY')
           """)
        Integer sumSoLuongByNhanVienAndNgay(@Param("maNhanVien") Long maNhanVien,
                                            @Param("ngay")       LocalDate ngay);

        @Query("SELECT ct FROM ChiTietHoaDon ct WHERE ct.id.maHoaDon = :maHoaDon")
        List<ChiTietHoaDon> findByMaHoaDon(@Param("maHoaDon") Long maHoaDon);
}