package com.example.ticket.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ticket.model.SuKien;

public interface SuKienRepository extends JpaRepository<SuKien, Long> {

    List<SuKien> findByMaCongTy(Long maCongTy);
    
    @Modifying
    @Query(value = "DELETE FROM SUKIEN WHERE MACONGTY = :id", nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);
    
    /**
     * Sự kiện đang "Hoạt động" và chưa kết thúc — dùng cho chatbot context.
     * thoiGianKetThuc >= hôm nay để vẫn hiện sự kiện đang diễn ra.
     */
    @Query("""
            SELECT s FROM SuKien s
            WHERE s.trangThai = 'Hoạt động'
              AND s.thoiGianKetThuc >= :homNay
            ORDER BY s.thoiGianBatDau ASC
            """)
    List<SuKien> findUpcomingActive(@Param("homNay") LocalDate homNay);
 
    /**
     * Tìm kiếm sự kiện theo tên — chatbot dùng khi user hỏi sự kiện cụ thể.
     */
    @Query("""
            SELECT s FROM SuKien s
            WHERE s.trangThai = 'Hoạt động'
              AND LOWER(s.tenSuKien) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY s.thoiGianBatDau ASC
            """)
    List<SuKien> searchByTen(@Param("keyword") String keyword);
}