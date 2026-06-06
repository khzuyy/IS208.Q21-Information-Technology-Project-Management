package com.example.ticket.repository;

import com.example.ticket.model.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import jakarta.persistence.LockModeType;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    List<Voucher> findByMaCongTy(Long maCongTy);
    Optional<Voucher> findByMaCode(String maCode);
    
    @Modifying
    @Query(value = "DELETE FROM VOUCHER WHERE MACONGTY = :id", nativeQuery = true)
    void deleteByMaCongTy(@Param("id") Long id);
    
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select v from Voucher v where v.maCode = :code")
    Optional<Voucher> findByCodeWithLock(@Param("code") String code);
}