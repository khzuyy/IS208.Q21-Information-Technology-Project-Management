package com.example.ticket.repository;

import com.example.ticket.model.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    List<HoaDon> findByMaKhachHang(Long maKhachHang);

    // Dùng cho tính doanh thu: lấy tất cả hóa đơn của nhiều khách hàng cùng lúc
    List<HoaDon> findByMaKhachHangIn(List<Long> maKhachHangIds);
    List<HoaDon> findByMaNhanVienOrderByNgayLapDesc(Long maNhanVien);
    // Lấy tất cả hóa đơn đã dùng voucher — để trừ đúng doanh thu
    @Query("SELECT h FROM HoaDon h WHERE h.maVoucher IS NOT NULL AND h.maVoucher IN :maVoucherIds")
    List<HoaDon> findByMaVoucherIn(@Param("maVoucherIds") List<Long> maVoucherIds);
    List<HoaDon> findByMaNhanVien(Long maNhanVien);

    @Modifying
    @Query(value = "DELETE FROM HOADON WHERE MAKHACHHANG = :id", nativeQuery = true)
    void deleteByMaKhachHang(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM HOADON WHERE MAVOUCHER IN " +
                "(SELECT MAVOUCHER FROM VOUCHER WHERE MACONGTY = :id)", 
        nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);

    @Modifying
    @Query(value = "UPDATE HOADON SET MANHANVIEN = NULL WHERE MANHANVIEN = :id", 
        nativeQuery = true)
    void clearNhanVien(@Param("id") Long id);

    @Query("""
            SELECT COALESCE(SUM(hd.thanhTien), 0)
            FROM   HoaDon hd
            WHERE  hd.maNhanVien = :maNhanVien
            AND    hd.ngayLap    = :ngay
            AND    (hd.trangThai IS NULL OR hd.trangThai <> 'DA_HUY')
           """)
    Long sumDoanhThuByNhanVienAndNgay(@Param("maNhanVien") Long maNhanVien,
                                      @Param("ngay")       LocalDate ngay);

    /**
     * N hóa đơn gần nhất của khách (chưa bị hủy) — dùng cho chatbot context.
     * Dùng LIMIT trong native query vì JPQL không hỗ trợ LIMIT trực tiếp
     * trên một số DB (Oracle). Nếu dùng MySQL/PostgreSQL thì JPQL LIMIT OK.
     */
    @Query(value = """
            SELECT * FROM HOADON
            WHERE MAKHACHHANG = :maKhachHang
              AND (TRANGTHAI IS NULL OR TRANGTHAI <> 'DA_HUY')
            ORDER BY NGAYLAP DESC
            FETCH FIRST :limit ROWS ONLY
            """, nativeQuery = true)
    List<HoaDon> findRecentByKhachHang(
            @Param("maKhachHang") Long maKhachHang,
            @Param("limit") int limit
    );
}