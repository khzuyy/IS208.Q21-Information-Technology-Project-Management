package com.example.ticket.service;

import com.example.ticket.dto.response.DoanhThuResponse;
import java.util.List;

public interface DoanhThuService {
    List<DoanhThuResponse> getDoanhThuByCreator(Long maTaiKhoan);
}