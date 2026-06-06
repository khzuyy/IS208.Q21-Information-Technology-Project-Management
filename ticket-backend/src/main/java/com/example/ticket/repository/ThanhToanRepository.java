package com.example.ticket.repository;

import com.example.ticket.model.ThanhToan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ThanhToanRepository extends JpaRepository<ThanhToan, Long> {
    @Modifying
    @Query(value = "DELETE FROM THANHTOAN WHERE MAHOADON IN " +
                "(SELECT MAHOADON FROM HOADON WHERE MAKHACHHANG = :id)", 
        nativeQuery = true)
    void deleteByHoaDon_MaKhachHang(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM THANHTOAN WHERE MAHOADON IN " +
                "(SELECT MAHOADON FROM HOADON WHERE MAVOUCHER IN " +
                "(SELECT MAVOUCHER FROM VOUCHER WHERE MACONGTY = :id))", 
        nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);
}