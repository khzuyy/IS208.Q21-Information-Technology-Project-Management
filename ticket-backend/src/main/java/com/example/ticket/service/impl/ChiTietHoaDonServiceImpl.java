package com.example.ticket.service.impl;

import com.example.ticket.dto.request.ChiTietHoaDonRequest;
import com.example.ticket.dto.response.ChiTietHoaDonResponse;
import com.example.ticket.model.ChiTietHoaDon;
import com.example.ticket.model.ChiTietHoaDonID;
import com.example.ticket.repository.ChiTietHoaDonRepository;
import com.example.ticket.service.ChiTietHoaDonService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ChiTietHoaDonServiceImpl implements ChiTietHoaDonService {

    private final ChiTietHoaDonRepository chiTietHoaDonRepository;

    public ChiTietHoaDonServiceImpl(ChiTietHoaDonRepository chiTietHoaDonRepository) {
        this.chiTietHoaDonRepository = chiTietHoaDonRepository;
    }

    private ChiTietHoaDonResponse mapToResponse(ChiTietHoaDon ct) {
        ChiTietHoaDonResponse response = new ChiTietHoaDonResponse();
        response.setMaVe(ct.getId().getMaVe());
        response.setMaHoaDon(ct.getId().getMaHoaDon());
        response.setDonGia(ct.getDonGia());
        response.setSoLuong(ct.getSoLuong());
        return response;
    }

    @Override
    public List<ChiTietHoaDonResponse> getAll() {
        return chiTietHoaDonRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public ChiTietHoaDonResponse create(ChiTietHoaDonRequest request) {
        ChiTietHoaDonID id = new ChiTietHoaDonID(request.getMaVe(), request.getMaHoaDon());

        ChiTietHoaDon ct = new ChiTietHoaDon();
        ct.setId(id);
        ct.setDonGia(request.getDonGia());
        ct.setSoLuong(request.getSoLuong());

        return mapToResponse(chiTietHoaDonRepository.save(ct));
    }
}
