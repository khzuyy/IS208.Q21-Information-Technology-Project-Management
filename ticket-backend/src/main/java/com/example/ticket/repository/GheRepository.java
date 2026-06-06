package com.example.ticket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ticket.model.Ghe;

import jakarta.persistence.LockModeType;
public interface GheRepository extends JpaRepository<Ghe, Long> {

    /** Lấy tất cả ghế đã đặt theo danh sách maVe */
    @Query("SELECT g FROM Ghe g WHERE g.maVe IN :maVeList")
    List<Ghe> findByMaVeIn(@Param("maVeList") List<Long> maVeList);
    List<Ghe> findByMaVe(Long maVe);
    /** Lấy ghế theo danh sách maHoaDon — dùng trong buildResponseList */
    @Query("SELECT g FROM Ghe g WHERE g.maHoaDon IN :maHoaDonList")
    List<Ghe> findByMaHoaDonIn(@Param("maHoaDonList") List<Long> maHoaDonList);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT g FROM Ghe g WHERE g.maGhe = :maGhe")
    Optional<Ghe> findByIdWithLock(@Param("maGhe") Long maGhe);
    /**
     * Kiểm tra ghế bị conflict: khuVuc đó đã tồn tại trong các maVe thuộc cùng sự kiện.
     * Dùng trong muaVe() trước khi lưu để tránh 2 người đặt cùng ghế.
     */
    @Query("SELECT g FROM Ghe g WHERE g.khuVuc IN :khuVucList AND g.maVe IN :maVeList AND g.trangThai <> 'da_hoan'")
    List<Ghe> findConflict(@Param("khuVucList") List<String> khuVucList,
                           @Param("maVeList") List<Long> maVeList);
    @Query("""
        SELECT g.khuVuc
        FROM Ghe g
        JOIN Ve v ON g.maVe = v.maVe
        WHERE v.maSuKien = :maSuKien
          AND g.trangThai = 'da_dat'
        """)
    List<String> findBookedSeatsByMaSuKien(@Param("maSuKien") Long maSuKien);

    @Query("SELECT g FROM Ghe g WHERE g.maHoaDon = :maHoaDon ORDER BY g.khuVuc, g.maGhe")
    List<Ghe> findByMaHoaDon(@Param("maHoaDon") Long maHoaDon);
    
    @Query("SELECT g FROM Ghe g WHERE g.maVe = :maVe AND g.maHoaDon = :maHoaDon")
    List<Ghe> findByMaVeAndMaHoaDon(@Param("maVe") Long maVe,
                                     @Param("maHoaDon") Long maHoaDon);
    
    @Query("SELECT g FROM Ghe g WHERE g.khuVuc = :khuVuc AND g.maVe = :maVe AND g.trangThai = :trangThai AND ROWNUM = 1")
    Optional<Ghe> findByKhuVucAndMaVeAndTrangThai(@Param("khuVuc") String khuVuc,
                                               @Param("maVe") Long maVe,
                                               @Param("trangThai") String trangThai);

    @Modifying
    @Query(value = "DELETE FROM GHE WHERE MAHOADON IN " +
                "(SELECT MAHOADON FROM HOADON WHERE MAKHACHHANG = :id)", 
        nativeQuery = true)
    void deleteByHoaDon_MaKhachHang(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM GHE WHERE MAHOADON IN " +
                "(SELECT MAHOADON FROM HOADON WHERE MAVOUCHER IN " +
                "(SELECT MAVOUCHER FROM VOUCHER WHERE MACONGTY = :id))", 
        nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);

    Optional<Ghe> findByQrToken(String qrToken);
}