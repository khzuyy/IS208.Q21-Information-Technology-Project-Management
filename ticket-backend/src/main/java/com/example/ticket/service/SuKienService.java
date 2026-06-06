package com.example.ticket.service;

import java.util.List;

import com.example.ticket.dto.request.SuKienRequest;
import com.example.ticket.dto.response.SuKienResponse;

public interface SuKienService {

    List<SuKienResponse> getAll();
    SuKienResponse getById(Long id);
    SuKienResponse create(SuKienRequest request);
    SuKienResponse update(Long id, SuKienRequest request);
    List<SuKienResponse> getAllForAdmin();
    List<SuKienResponse> getByCreator(Long maTaiKhoan);

    void hide(Long id);
    void unhide(Long id);
    void markViolation(Long id);
    void clearViolation(Long id);
    void approve(Long id);
    void reject(Long id);
    void delete(Long id);
   
}