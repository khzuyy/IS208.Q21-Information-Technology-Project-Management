package com.example.ticket.service.impl;

import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.NhaToChuc;
import com.example.ticket.repository.NhaToChucRepository;
import com.example.ticket.service.NhaToChucService;
import org.springframework.stereotype.Service;

@Service
public class NhaToChucServiceImpl implements NhaToChucService {

    private final NhaToChucRepository repo;

    public NhaToChucServiceImpl(NhaToChucRepository repo) {
        this.repo = repo;
    }

    @Override
    public NhaToChuc getById(Long maCongTy) {
        return repo.findById(maCongTy)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhà tổ chức với mã: " + maCongTy));
    }

    @Override
    public NhaToChuc getByMaTaiKhoan(Long maTaiKhoan) {
        return repo.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhà tổ chức với tài khoản: " + maTaiKhoan));
    }
}