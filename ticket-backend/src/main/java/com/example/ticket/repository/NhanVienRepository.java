package com.example.ticket.repository;

import com.example.ticket.model.NhanVien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, Long> {
    // BUG FIX: thiếu method này → compile error trong TaiKhoanServiceImpl.delete()
    Optional<NhanVien> findByMaTaiKhoan(Long maTaiKhoan);
}