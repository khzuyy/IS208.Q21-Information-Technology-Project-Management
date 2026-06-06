package com.example.ticket.service.impl;

import com.example.ticket.model.DiaDiem;
import com.example.ticket.repository.DiaDiemRepository;
import com.example.ticket.service.DiaDiemService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DiaDiemServiceImpl implements DiaDiemService {

    private final DiaDiemRepository diaDiemRepository;

    public DiaDiemServiceImpl(DiaDiemRepository diaDiemRepository) {
        this.diaDiemRepository = diaDiemRepository;
    }

    @Override
    public List<DiaDiem> getAll() {
        return diaDiemRepository.findAll();
    }

    @Override
    public Optional<DiaDiem> getById(Long maDiaDiem) {
        return diaDiemRepository.findById(maDiaDiem);
    }
}