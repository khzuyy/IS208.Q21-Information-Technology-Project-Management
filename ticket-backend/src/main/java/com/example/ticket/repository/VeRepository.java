package com.example.ticket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.ticket.model.Ve;

import jakarta.persistence.LockModeType;

@Repository
public interface VeRepository extends JpaRepository<Ve, Long> {

    List<Ve> findByMaSuKien(Long maSuKien);
    List<Ve> findByTrangThai(String trangThai);
    List<Ve> findByMaSuKienIn(List<Long> maSuKienIds);
    boolean existsByTenVeAndMaSuKien(String tenVe, Long maSuKien);
    boolean existsByLoaiVeAndMaSuKien(String loaiVe, Long maSuKien);

    /**
     * Lock nhiều vé cùng lúc — dùng khi cần validate batch trước khi mua.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Ve v where v.maVe in :ids")
    List<Ve> findAllByIdWithLock(@Param("ids") List<Long> ids);

    /**
     * Lock 1 vé — dùng trong decreaseDaBan / increaseDaBan.
     * PESSIMISTIC_WRITE đảm bảo chỉ 1 transaction được đọc-ghi tại 1 thời điểm,
     * tránh oversell race condition.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Ve v where v.maVe = :id")
    Optional<Ve> findByIdWithLock(@Param("id") Long id);

    @Modifying
    @Query(value = "DELETE FROM VE WHERE MASUKIEN IN " +
                   "(SELECT MASUKIEN FROM SUKIEN WHERE MACONGTY = :id)",
           nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);

    /**
     * Tổng số vé còn tồn (dùng cho dashboard KPI).
     */
    @Query(value = "SELECT SUM(SOLUONG - DABAN) FROM VE WHERE SOLUONG > DABAN",
           nativeQuery = true)
    Integer sumVeTon();

     /**
     * Vé còn bán (soLuong > daBan) của một sự kiện — dùng cho chatbot context.
     * Sắp xếp theo giá tăng dần để AI hiển thị vé rẻ nhất trước.
     */
    @Query("""
            SELECT v FROM Ve v
            WHERE v.maSuKien = :maSuKien
              AND v.soLuong > v.daBan
              AND (v.trangThai IS NULL OR v.trangThai <> 'Ngừng bán')
            ORDER BY v.gia ASC
            """)
    List<Ve> findByMaSuKienAndConVe(@Param("maSuKien") Long maSuKien);
}