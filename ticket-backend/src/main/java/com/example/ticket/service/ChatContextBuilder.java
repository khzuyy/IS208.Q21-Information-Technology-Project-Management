package com.example.ticket.service;

import com.example.ticket.model.HoaDon;
import com.example.ticket.model.SuKien;
import com.example.ticket.model.Ve;
import com.example.ticket.repository.HoaDonRepository;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.repository.VeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Lấy dữ liệu thật từ DB và format thành text để inject vào system prompt
 * trước khi gọi Gemini — giúp chatbot biết sự kiện, vé, đơn hàng thực tế.
 */
@Service
public class ChatContextBuilder {

    private static final Logger log = LoggerFactory.getLogger(ChatContextBuilder.class);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final int MAX_HOADON = 5;

    @Autowired private SuKienRepository suKienRepository;
    @Autowired private VeRepository     veRepository;
    @Autowired private HoaDonRepository hoaDonRepository;

    /**
     * Tạo toàn bộ context để gắn vào system prompt.
     *
     * @param maKhachHang null nếu user chưa đăng nhập
     */
    public String buildContext(Long maKhachHang) {
        StringBuilder ctx = new StringBuilder();
        ctx.append("\n\n--- DỮ LIỆU HỆ THỐNG (thời gian thực) ---\n");
        ctx.append(buildSuKienContext());
        if (maKhachHang != null) {
            ctx.append(buildHoaDonContext(maKhachHang));
        } else {
            ctx.append("\n[Khách chưa đăng nhập — không có thông tin đơn hàng]\n");
        }
        ctx.append("--- HẾT DỮ LIỆU ---\n");
        return ctx.toString();
    }

    // -------------------------------------------------------------------------

    private String buildSuKienContext() {
        try {
            List<SuKien> danhSach = suKienRepository.findUpcomingActive(LocalDate.now());

            if (danhSach.isEmpty()) {
                return "\n[Hiện không có sự kiện nào sắp diễn ra]\n";
            }

            StringBuilder sb = new StringBuilder();
            sb.append("\nSỰ KIỆN SẮP DIỄN RA (").append(danhSach.size()).append(" sự kiện):\n");
            for (SuKien sk : danhSach) {
                sb.append(formatSuKien(sk));
            }
            return sb.toString();

        } catch (Exception e) {
            log.error("Lỗi load sự kiện cho chatbot context", e);
            return "\n[Không thể tải danh sách sự kiện]\n";
        }
    }

    private String formatSuKien(SuKien sk) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("• [ID:%d] %s\n", sk.getMaSuKien(), sk.getTenSuKien()));

        String batDau  = sk.getThoiGianBatDau()  != null ? sk.getThoiGianBatDau().format(DATE_FMT)  : "?";
        String ketThuc = sk.getThoiGianKetThuc() != null ? sk.getThoiGianKetThuc().format(DATE_FMT) : "?";
        sb.append(String.format("  Thời gian: %s → %s\n", batDau, ketThuc));

        if (sk.getMoTa() != null && !sk.getMoTa().isBlank()) {
            String moTaNgan = sk.getMoTa().length() > 100
                    ? sk.getMoTa().substring(0, 100) + "..." : sk.getMoTa();
            sb.append(String.format("  Mô tả: %s\n", moTaNgan));
        }

        // Các loại vé còn bán của sự kiện
        List<Ve> danhSachVe = veRepository.findByMaSuKienAndConVe(sk.getMaSuKien());
        if (!danhSachVe.isEmpty()) {
            sb.append("  Loại vé còn bán:\n");
            for (Ve ve : danhSachVe) {
                sb.append(String.format(
                        "    - %s (%s): %,.0f VNĐ — còn %d/%d vé\n",
                        ve.getTenVe(),
                        ve.getLoaiVe() != null ? ve.getLoaiVe() : "Thường",
                        ve.getGia() != null ? ve.getGia().doubleValue() : 0,
                        ve.getConLai(),
                        ve.getSoLuong()
                ));
            }
        } else {
            sb.append("  Vé: Hết vé hoặc chưa mở bán\n");
        }

        return sb.toString();
    }

    private String buildHoaDonContext(Long maKhachHang) {
        try {
            List<HoaDon> hoaDons = hoaDonRepository.findRecentByKhachHang(maKhachHang, MAX_HOADON);

            if (hoaDons.isEmpty()) {
                return "\n[Khách hàng này chưa có đơn hàng nào]\n";
            }

            StringBuilder sb = new StringBuilder();
            sb.append("\nĐƠN HÀNG GẦN ĐÂY CỦA KHÁCH (").append(hoaDons.size()).append(" đơn):\n");
            for (HoaDon hd : hoaDons) {
                sb.append(String.format(
                        "• Mã đơn: #%d | Ngày: %s | Tổng: %,.0f VNĐ | Trạng thái: %s\n",
                        hd.getMaHoaDon(),
                        hd.getNgayLap() != null ? hd.getNgayLap().format(DATE_FMT) : "?",
                        hd.getThanhTien() != null ? hd.getThanhTien().doubleValue() : 0,
                        translateTrangThai(hd.getTrangThai())
                ));
            }
            return sb.toString();

        } catch (Exception e) {
            log.error("Lỗi load hóa đơn cho chatbot context, maKhachHang={}", maKhachHang, e);
            return "\n[Không thể tải lịch sử đơn hàng]\n";
        }
    }

    private String translateTrangThai(String trangThai) {
        if (trangThai == null) return "Không rõ";
        return switch (trangThai) {
            case "DA_HUY"                    -> "Đã hủy";
            case "DA_THANH_TOAN", "PAID"     -> "Đã thanh toán";
            case "CHO_THANH_TOAN", "PENDING" -> "Chờ thanh toán";
            case "HOAN_TIEN"                 -> "Đã hoàn tiền";
            default                          -> trangThai;
        };
    }
}