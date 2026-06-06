package com.example.ticket.service;

import com.example.ticket.dto.response.GheHoldResponse;

import java.util.Set;

public interface GheService {
    /** Giữ ghế theo KhuVuc + maSuKien (không cần maGhe). */
    GheHoldResponse giuGhe(Long maSuKien, String khuVuc, Long maTaiKhoan);

    /** Hủy giữ ghế. */
    GheHoldResponse huyGiuGhe(Long maSuKien, String khuVuc, Long maTaiKhoan);

    Set<String> getDanhSachDangGiu(Long maSuKien);
}