package com.example.ticket.service.impl;

import com.example.ticket.dto.response.GheHoldResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.service.GheHoldRegistry;
import com.example.ticket.service.GheService;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class GheServiceImpl implements GheService {

    private final GheHoldRegistry holdRegistry;

    public GheServiceImpl(GheHoldRegistry holdRegistry) {
        this.holdRegistry = holdRegistry;
    }

    // ── giữ ghế ───────────────────────────────────────────────────────────────

    /**
     * Giữ ghế theo khuVuc (không cần ghế tồn tại trong DB).
     *
     * Logic:
     *  1. Ghế đang bị người KHÁC giữ (còn hạn) → ném lỗi 400
     *  2. Còn lại (trống / chính mình đang giữ) → ghi / gia hạn hold
     */
    @Override
    public GheHoldResponse giuGhe(Long maSuKien, String khuVuc, Long maTaiKhoan) {
        if (holdRegistry.isDangGiuBoiNguoiKhac(maSuKien, khuVuc, maTaiKhoan)) {
            throw new BadRequestException(
                    "Ghế " + khuVuc + " đang được khách khác giữ, vui lòng chọn ghế khác");
        }

        holdRegistry.giuGhe(maSuKien, khuVuc, maTaiKhoan);

        GheHoldRegistry.HoldInfo info = holdRegistry.getHoldInfo(maSuKien, khuVuc);
        return new GheHoldResponse(
                khuVuc, maSuKien, maTaiKhoan,
                "DANG_GIU",
                info != null ? info.hetHan() : null
        );
    }

    // ── hủy giữ ghế ──────────────────────────────────────────────────────────

    @Override
    public GheHoldResponse huyGiuGhe(Long maSuKien, String khuVuc, Long maTaiKhoan) {
        holdRegistry.huyGiu(maSuKien, khuVuc);
        return new GheHoldResponse(khuVuc, maSuKien, maTaiKhoan, "TRONG", null);
    }

    // ── query ─────────────────────────────────────────────────────────────────

    /**
     * Trả Set<String> gồm các khuVuc ("A1", "B3"...) đang bị giữ trong sự kiện.
     * Frontend dùng trực tiếp để merge vào bookedSet khi render sơ đồ.
     */
    @Override
    public Set<String> getDanhSachDangGiu(Long maSuKien) {
        return holdRegistry.getDangGiuBySuKien(maSuKien);
    }
}