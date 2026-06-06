package com.example.ticket.repository;

import com.example.ticket.model.BaoCao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BaoCaoRepository extends JpaRepository<BaoCao, Long> {

    // Tìm báo cáo theo nhân viên + ngày (để tránh tạo trùng)
    Optional<BaoCao> findByMaNhanVienAndNgayBatDauAndNgayKetThuc(
            Long maNhanVien, LocalDate ngayBatDau, LocalDate ngayKetThuc);

    // Lấy tất cả báo cáo của một nhân viên, sắp xếp mới nhất trước
    List<BaoCao> findByMaNhanVienOrderByNgayBatDauDesc(Long maNhanVien);

    // Lấy báo cáo trong khoảng thời gian của nhân viên
    @Query("SELECT b FROM BaoCao b WHERE b.maNhanVien = :maNV " +
           "AND b.ngayBatDau >= :from AND b.ngayKetThuc <= :to " +
           "ORDER BY b.ngayBatDau DESC")
    List<BaoCao> findByNhanVienAndRange(@Param("maNV")   Long maNhanVien,
                                        @Param("from")   LocalDate from,
                                        @Param("to")     LocalDate to);

    @Modifying
    @Query(value = "DELETE FROM BAOCAO WHERE MANHANVIEN = :id", nativeQuery = true)
    void deleteByMaNhanVien(@Param("id") Long id);
}
 