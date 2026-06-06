package com.example.ticket.repository;

import com.example.ticket.model.HoanVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface HoanVeRepository extends JpaRepository<HoanVe, Long> {

    List<HoanVe> findByMaHoaDon(Long maHoaDon);

    List<HoanVe> findByMaGhe(Long maGhe);
    List<HoanVe> findByMaHoaDonIn(List<Long> maHoaDonIds);
    List<HoanVe> findByMaGheIn(List<Long> maGheList);

    /** Tất cả yêu cầu hoàn thuộc sự kiện của nhà tổ chức */
    @Query("""
        SELECT hv FROM HoanVe hv
        JOIN Ghe g   ON g.maGhe   = hv.maGhe
        JOIN Ve  v   ON v.maVe    = g.maVe
        JOIN SuKien sk ON sk.maSuKien = v.maSuKien
        WHERE sk.maCongTy = :maCongTy
    """)
    List<HoanVe> findByMaCongTy(@Param("maCongTy") Long maCongTy);

    @Modifying
    @Query(value = "DELETE FROM HOANVE WHERE MAHOADON IN " +
                "(SELECT MAHOADON FROM HOADON WHERE MAKHACHHANG = :id)", 
        nativeQuery = true)
    void deleteByHoaDon_MaKhachHang(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM HOANVE WHERE MAHOADON IN " +
                "(SELECT MAHOADON FROM HOADON WHERE MAVOUCHER IN " +
                "(SELECT MAVOUCHER FROM VOUCHER WHERE MACONGTY = :id))", 
        nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);
}