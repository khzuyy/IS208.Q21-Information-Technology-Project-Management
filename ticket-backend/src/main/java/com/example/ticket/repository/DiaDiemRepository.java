package com.example.ticket.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.ticket.model.DiaDiem;

@Repository
public interface DiaDiemRepository extends JpaRepository<DiaDiem, Long> {
}