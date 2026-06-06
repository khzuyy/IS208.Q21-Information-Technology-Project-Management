package com.example.ticket.service;

import com.example.ticket.dto.response.BaoCaoKpiResponse;

import java.time.LocalDate;

public interface BaoCaoService {

    /**
     * Lưu báo cáo KPI của nhân viên vào DB và trả về payload đầy đủ
     * để frontend tạo file Excel.
     *
     * POST /api/baocao/kpi/{maNhanVien}
     * Body: { "ngayBatDau": "2025-05-01", "ngayKetThuc": "2025-05-31" }  (optional)
     * → Nếu không truyền thì tự tính từ ngày đầu tháng → hôm nay.
     */
    BaoCaoKpiResponse taoVaLuuBaoCao(Long maNhanVien,
                                     LocalDate ngayBatDau,
                                     LocalDate ngayKetThuc);
}