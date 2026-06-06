package com.example.ticket.service;

import java.util.List;
import java.util.Optional;

import com.example.ticket.model.DiaDiem;

public interface DiaDiemService {
    List<DiaDiem> getAll();
    Optional<DiaDiem> getById(Long maDiaDiem);
}