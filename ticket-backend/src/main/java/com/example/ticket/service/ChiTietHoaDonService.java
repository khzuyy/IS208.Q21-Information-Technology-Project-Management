package com.example.ticket.service;

import com.example.ticket.dto.request.ChiTietHoaDonRequest;
import com.example.ticket.dto.response.ChiTietHoaDonResponse;

import java.util.List;

public interface ChiTietHoaDonService {

    List<ChiTietHoaDonResponse> getAll();

    ChiTietHoaDonResponse create(ChiTietHoaDonRequest request);
}
