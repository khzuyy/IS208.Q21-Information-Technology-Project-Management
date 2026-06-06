package com.example.ticket.repository;

import com.example.ticket.model.KhachHang;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface KhachHangRepository extends JpaRepository<KhachHang, Long> {
    // BUG FIX: thiếu method này → compile error trong TaiKhoanServiceImpl.delete()
    Optional<KhachHang> findByMaTaiKhoan(Long maTaiKhoan);
    Optional<KhachHang> findFirstByMaTaiKhoan(Long maTaiKhoan);
    
}