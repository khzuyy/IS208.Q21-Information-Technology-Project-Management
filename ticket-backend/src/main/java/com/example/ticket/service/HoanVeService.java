package com.example.ticket.service;

import com.example.ticket.dto.request.HoanVeRequest;
import com.example.ticket.dto.response.HoanVeResponse;

import java.util.List;

public interface HoanVeService {
    List<HoanVeResponse> hoanVe(HoanVeRequest request);
    List<HoanVeResponse> getByCreator(Long maTaiKhoan);
    HoanVeResponse       duyetHoanVe(Long maHoanVe, String trangThai);
}