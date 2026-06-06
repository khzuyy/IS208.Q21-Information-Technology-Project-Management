package com.example.ticket.service;

import com.example.ticket.dto.request.ThanhToanRequest;
import com.example.ticket.dto.response.ThanhToanResponse;

public interface ThanhToanService {
    ThanhToanResponse create(ThanhToanRequest request);
}