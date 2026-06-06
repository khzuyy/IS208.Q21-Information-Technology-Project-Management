package com.example.ticket.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ticket.dto.response.DoanhThuResponse;
import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.ChiTietHoaDon;
import com.example.ticket.model.Ghe;
import com.example.ticket.model.HoaDon;
import com.example.ticket.model.NhaToChuc;
import com.example.ticket.model.SuKien;
import com.example.ticket.model.Ve;
import com.example.ticket.repository.ChiTietHoaDonRepository;
import com.example.ticket.repository.GheRepository;
import com.example.ticket.repository.HoaDonRepository;
import com.example.ticket.repository.HoanVeRepository;
import com.example.ticket.repository.NhaToChucRepository;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.repository.VeRepository;
import com.example.ticket.service.DoanhThuService;

@Service
@Transactional(readOnly = true)
public class DoanhThuServiceImpl implements DoanhThuService {

    private final NhaToChucRepository     nhaToChucRepository;
    private final SuKienRepository        suKienRepository;
    private final VeRepository            veRepository;
    private final ChiTietHoaDonRepository chiTietHoaDonRepository;
    private final HoaDonRepository        hoaDonRepository;
    private final HoanVeRepository        hoanVeRepository;
    private final GheRepository           gheRepository;   // ← THÊM để resolve maGhe→maVe

    public DoanhThuServiceImpl(NhaToChucRepository nhaToChucRepository,
                               SuKienRepository suKienRepository,
                               VeRepository veRepository,
                               ChiTietHoaDonRepository chiTietHoaDonRepository,
                               HoaDonRepository hoaDonRepository,
                               HoanVeRepository hoanVeRepository,
                               GheRepository gheRepository) {
        this.nhaToChucRepository     = nhaToChucRepository;
        this.suKienRepository        = suKienRepository;
        this.veRepository            = veRepository;
        this.chiTietHoaDonRepository = chiTietHoaDonRepository;
        this.hoaDonRepository        = hoaDonRepository;
        this.hoanVeRepository        = hoanVeRepository;
        this.gheRepository           = gheRepository;
    }

    @Override
    public List<DoanhThuResponse> getDoanhThuByCreator(Long maTaiKhoan) {

        NhaToChuc ntc = nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhà tổ chức"));

        List<SuKien> suKiens = suKienRepository.findByMaCongTy(ntc.getMaCongTy());
        if (suKiens.isEmpty()) return List.of();

        List<Long> maSuKienIds = suKiens.stream().map(SuKien::getMaSuKien).toList();
        List<Ve>   allVes      = veRepository.findByMaSuKienIn(maSuKienIds);
        Map<Long, List<Ve>> vesBySuKien = allVes.stream()
                .collect(Collectors.groupingBy(Ve::getMaSuKien));

        List<Long> maVeIds = allVes.stream().map(Ve::getMaVe).toList();
        List<ChiTietHoaDon> allChiTiet = maVeIds.isEmpty()
                ? List.of()
                : chiTietHoaDonRepository.findByIdMaVeIn(maVeIds);
        Map<Long, List<ChiTietHoaDon>> chiTietByVe = allChiTiet.stream()
                .collect(Collectors.groupingBy(ct -> ct.getId().getMaVe()));

        List<Long> maHoaDonIds = allChiTiet.stream()
                .map(ct -> ct.getId().getMaHoaDon()).distinct().toList();
        Map<Long, HoaDon> hoaDonMap = maHoaDonIds.isEmpty() ? Map.of()
                : hoaDonRepository.findAllById(maHoaDonIds)
                        .stream().collect(Collectors.toMap(HoaDon::getMaHoaDon, h -> h));

        // Load ghế thuộc các hóa đơn liên quan → build maGhe → maVe
        Map<Long, Long> gheToVeMap = maHoaDonIds.isEmpty() ? Map.of()
                : gheRepository.findByMaHoaDonIn(maHoaDonIds).stream()
                        .filter(g -> g.getMaGhe() != null && g.getMaVe() != null)
                        .collect(Collectors.toMap(Ghe::getMaGhe, Ghe::getMaVe, (a, b) -> a));

        // HoanVe approved: đếm số ghế hoàn per "maHoaDon_maVe"
        // Mỗi row HoanVe = 1 ghế approved → count = số vé hoàn
        Map<String, Integer> hoanMap = new HashMap<>(); // "maHoaDon_maVe" → số ghế approved
        if (!maHoaDonIds.isEmpty()) {
            hoanVeRepository.findByMaHoaDonIn(maHoaDonIds).stream()
                    .filter(hv -> "approved".equalsIgnoreCase(hv.getTrangThaiHoan()))
                    .forEach(hv -> {
                        Long maVe = gheToVeMap.get(hv.getMaGhe());
                        if (maVe == null) return;
                        String key = hv.getMaHoaDon() + "_" + maVe;
                        hoanMap.merge(key, 1, Integer::sum);
                    });
        }

        return suKiens.stream().map(sk -> {
            List<Ve> ves = vesBySuKien.getOrDefault(sk.getMaSuKien(), List.of());

            List<DoanhThuResponse.LoaiVeStats> chiTietLoaiVe = ves.stream().map(ve -> {
                List<ChiTietHoaDon> ctList = chiTietByVe.getOrDefault(ve.getMaVe(), List.of());

                int tongBan  = ctList.stream().mapToInt(ChiTietHoaDon::getSoLuong).sum();
                int tongHoan = ctList.stream().mapToInt(ct -> {
                    String key = ct.getId().getMaHoaDon() + "_" + ve.getMaVe();
                    return hoanMap.getOrDefault(key, 0);
                }).sum();
                int daBan = Math.max(0, tongBan - tongHoan);

                Map<Long, List<ChiTietHoaDon>> chiTietByHoaDon = ctList.stream()
                        .collect(Collectors.groupingBy(ct -> ct.getId().getMaHoaDon()));

                long doanhThuVe = ctList.stream().mapToLong(ct -> {
                    Long   hdId     = ct.getId().getMaHoaDon();
                    HoaDon hd       = hoaDonMap.get(hdId);
                    String key      = hdId + "_" + ve.getMaVe();
                    int    soHoan   = hoanMap.getOrDefault(key, 0);
                    int    soConLai = Math.max(0, ct.getSoLuong() - soHoan);

                    if (hd == null) return ct.getDonGia() * (long) soConLai;
                    if (hd.getMaVoucher() == null) return ct.getDonGia() * (long) soConLai;
                    if (ct.getSoLuong() == 0) return 0L;

                    List<ChiTietHoaDon> tatCaDong = chiTietByHoaDon.getOrDefault(hdId, List.of());
                    long tongGoc = tatCaDong.stream()
                            .mapToLong(c -> c.getDonGia() * c.getSoLuong()).sum();
                    if (tongGoc == 0) return 0L;

                    Long tiLe         = (Long)(ct.getDonGia() * ct.getSoLuong()) / tongGoc;
                    long   doanhThuDong = Math.round(tiLe * hd.getThanhTien());
                    long   giaHoanMoiVe = Math.round((Long) doanhThuDong / ct.getSoLuong());
                    return Math.max(0, doanhThuDong - giaHoanMoiVe * soHoan);
                }).sum();

                DoanhThuResponse.LoaiVeStats stats = new DoanhThuResponse.LoaiVeStats();
                stats.setMaVe(ve.getMaVe());
                stats.setTenVe(ve.getTenVe());
                stats.setLoaiVe(ve.getLoaiVe());
                stats.setGia(ve.getGia());
                stats.setDaBan(daBan);
                stats.setDoanhThu(doanhThuVe);
                return stats;
            }).toList();

            long tongDoanhThu = chiTietLoaiVe.stream()
                    .mapToLong(DoanhThuResponse.LoaiVeStats::getDoanhThu).sum();
            int tongVeDaBan = chiTietLoaiVe.stream()
                    .mapToInt(DoanhThuResponse.LoaiVeStats::getDaBan).sum();
            int tongVeTongSo = ves.stream().mapToInt(ve -> {
                List<ChiTietHoaDon> ctList = chiTietByVe.getOrDefault(ve.getMaVe(), List.of());
                return ctList.stream().mapToInt(ChiTietHoaDon::getSoLuong).sum();
            }).sum();

            DoanhThuResponse res = new DoanhThuResponse();
            res.setMaSuKien(sk.getMaSuKien());
            res.setTenSuKien(sk.getTenSuKien());
            res.setThoiGianBatDau(sk.getThoiGianBatDau()   != null ? sk.getThoiGianBatDau().toString()  : null);
            res.setThoiGianKetThuc(sk.getThoiGianKetThuc() != null ? sk.getThoiGianKetThuc().toString() : null);
            res.setTongDoanhThu(tongDoanhThu);
            res.setTongVeDaBan(tongVeDaBan);
            res.setTongVeTongSo(tongVeTongSo);
            res.setChiTietLoaiVe(chiTietLoaiVe);
            return res;
        }).toList();
    }
}