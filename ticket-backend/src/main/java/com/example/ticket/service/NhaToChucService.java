package com.example.ticket.service;

import com.example.ticket.model.NhaToChuc;

public interface NhaToChucService {
    NhaToChuc getById(Long maCongTy);
    NhaToChuc getByMaTaiKhoan(Long maTaiKhoan);
}