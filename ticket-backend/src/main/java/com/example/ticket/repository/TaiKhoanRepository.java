package com.example.ticket.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.ticket.model.TaiKhoan;
import java.util.Optional;



public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Long> {
    Optional<TaiKhoan> findByTenTaiKhoan(String tenTaiKhoan);
    Optional<TaiKhoan> findByTenTaiKhoanAndMatKhau(String tenTaiKhoan, String matKhau);
}
