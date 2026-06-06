package com.example.ticket.repository;

import com.example.ticket.model.NhaToChuc;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NhaToChucRepository extends JpaRepository<NhaToChuc, Long> {
    Optional<NhaToChuc> findByMaTaiKhoan(Long maTaiKhoan);
}