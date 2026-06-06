package com.example.ticket.service.impl;

import com.example.ticket.dto.response.BaoCaoKpiResponse;
import com.example.ticket.dto.response.VeKhachHangResponse;
import com.example.ticket.model.BaoCao;
import com.example.ticket.repository.BaoCaoRepository;
import com.example.ticket.repository.HoaDonRepository;
import com.example.ticket.service.BaoCaoService;
import com.example.ticket.service.HoaDonService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BaoCaoServiceImpl implements BaoCaoService {

    private final BaoCaoRepository baoCaoRepo;
    private final HoaDonRepository hoaDonRepo;
    private final HoaDonService    hoaDonService;

    public BaoCaoServiceImpl(BaoCaoRepository baoCaoRepo,
                              HoaDonRepository hoaDonRepo,
                              HoaDonService hoaDonService) {
        this.baoCaoRepo   = baoCaoRepo;
        this.hoaDonRepo   = hoaDonRepo;
        this.hoaDonService = hoaDonService;
    }

    @Override
    @Transactional
    public BaoCaoKpiResponse taoVaLuuBaoCao(Long maNhanVien,
                                             LocalDate ngayBatDau,
                                             LocalDate ngayKetThuc) {

        // 1. Lấy toàn bộ hóa đơn của nhân viên
        List<VeKhachHangResponse> allOrders = hoaDonService.getVeByNhanVien(maNhanVien);

        // 2. Lọc theo khoảng thời gian
        final LocalDate from = ngayBatDau  != null ? ngayBatDau  : LocalDate.now().withDayOfMonth(1);
        final LocalDate to   = ngayKetThuc != null ? ngayKetThuc : LocalDate.now();

        List<VeKhachHangResponse> inRange = allOrders.stream()
                .filter(o -> {
                    LocalDate d = o.getNgayMua();
                    return d != null && !d.isBefore(from) && !d.isAfter(to);
                })
                .collect(Collectors.toList());

        // 3. Tính tổng
        long tongDoanhThu = inRange.stream()
                .mapToLong(o -> o.getThanhTien() != null ? o.getThanhTien() : 0L)
                .sum();

        int tongVeDaBan = inRange.stream()
                .mapToInt(VeKhachHangResponse::getSoLuong)
                .sum();

        // soVeTon = tổng tồn tất cả sự kiện liên quan (nếu không có API riêng, để 0)
        int tongVeTon = 0;

        // 4. Gom theo ngày
        Map<LocalDate, List<VeKhachHangResponse>> byDay = inRange.stream()
                .filter(o -> o.getNgayMua() != null)
                .collect(Collectors.groupingBy(VeKhachHangResponse::getNgayMua));

        List<BaoCaoKpiResponse.ChiTietNgay> chiTietNgay = byDay.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> {
                    List<VeKhachHangResponse> list = e.getValue();
                    long rev  = list.stream().mapToLong(o -> o.getThanhTien() != null ? o.getThanhTien() : 0L).sum();
                    int  soVe = list.stream().mapToInt(VeKhachHangResponse::getSoLuong).sum();
                    int  soHD = list.size();
                    return new BaoCaoKpiResponse.ChiTietNgay(e.getKey().toString(), soVe, rev, soHD);
                })
                .collect(Collectors.toList());

        // 5. Chi tiết hóa đơn
        List<BaoCaoKpiResponse.ChiTietHoaDon> chiTietHoaDon = inRange.stream()
                .map(o -> new BaoCaoKpiResponse.ChiTietHoaDon(
                        o.getMaHoaDon(),
                        o.getNgayMua() != null ? o.getNgayMua().toString() : "",
                        o.getTenVe(),
                        o.getLoaiVe(),
                        o.getSoLuong(),
                        (long) o.getGia(),
                        o.getThanhTien() != null ? o.getThanhTien() : 0L,
                        o.getTrangThaiHoan()
                ))
                .collect(Collectors.toList());

        // 6. Lưu vào DB (BAOCAO)
        BaoCao entity = new BaoCao();
        entity.setMaNhanVien(maNhanVien);
        entity.setNgayBatDau(from);
        entity.setNgayKetThuc(to);
        entity.setDoanhThu(tongDoanhThu);
        entity.setSoVeDaBan(tongVeDaBan);
        entity.setSoVeTon(tongVeTon);
        baoCaoRepo.save(entity);

        // 7. Trả về payload
        return new BaoCaoKpiResponse(
                maNhanVien,
                "",                        // tenNhanVien — frontend truyền sẵn
                LocalDate.now().toString(),
                tongDoanhThu,
                tongVeDaBan,
                tongVeTon,
                from.toString(),
                to.toString(),
                chiTietNgay,
                chiTietHoaDon
        );
    }
}