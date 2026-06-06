package com.example.ticket.service.impl;

import com.example.ticket.dto.request.HoanVeRequest;
import com.example.ticket.dto.response.HoanVeResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.*;
import com.example.ticket.repository.*;
import com.example.ticket.service.HoanVeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class HoanVeServiceImpl implements HoanVeService {

    private static final String GHE_DA_HOAN  = "da_hoan";
    private static final String HOAN_PENDING  = "pending";
    private static final String HOAN_APPROVED = "approved";
    private static final String HOAN_REJECTED = "rejected";

    private final HoanVeRepository    hoanVeRepository;
    private final HoaDonRepository    hoaDonRepository;
    private final NhaToChucRepository nhaToChucRepository;
    private final VeRepository        veRepository;
    private final SuKienRepository    suKienRepository;
    private final KhachHangRepository khachHangRepository;
    private final GheRepository       gheRepository;

    public HoanVeServiceImpl(HoanVeRepository hoanVeRepository,
                             HoaDonRepository hoaDonRepository,
                             NhaToChucRepository nhaToChucRepository,
                             VeRepository veRepository,
                             SuKienRepository suKienRepository,
                             KhachHangRepository khachHangRepository,
                             GheRepository gheRepository) {
        this.hoanVeRepository    = hoanVeRepository;
        this.hoaDonRepository    = hoaDonRepository;
        this.nhaToChucRepository = nhaToChucRepository;
        this.veRepository        = veRepository;
        this.suKienRepository    = suKienRepository;
        this.khachHangRepository = khachHangRepository;
        this.gheRepository       = gheRepository;
    }

    // ── Khách gửi yêu cầu hoàn ───────────────────────────────────────────────

    @Override
    public List<HoanVeResponse> hoanVe(HoanVeRequest request) {

        hoaDonRepository.findById(request.getMaHoaDon())
                .orElseThrow(() -> new NotFoundException(
                        "Không tìm thấy hóa đơn #" + request.getMaHoaDon()));

        List<Long> maGheList = request.getMaGheList();
        if (maGheList == null || maGheList.isEmpty())
            throw new BadRequestException("Phải chọn ít nhất 1 ghế để hoàn");

        List<Ghe> gheList = gheRepository.findAllById(maGheList);

        // Validate tồn tại
        Set<Long> found = gheList.stream().map(Ghe::getMaGhe).collect(Collectors.toSet());
        List<Long> notFound = maGheList.stream().filter(id -> !found.contains(id)).toList();
        if (!notFound.isEmpty())
            throw new BadRequestException("Không tìm thấy ghế: " + notFound);

        // Validate thuộc đúng hóa đơn
        List<Long> wrongHd = gheList.stream()
                .filter(g -> !request.getMaHoaDon().equals(g.getMaHoaDon()))
                .map(Ghe::getMaGhe).toList();
        if (!wrongHd.isEmpty())
            throw new BadRequestException("Ghế không thuộc hóa đơn này: " + wrongHd);

        // Validate chưa hoàn
        List<Long> daHoan = gheList.stream()
                .filter(g -> GHE_DA_HOAN.equalsIgnoreCase(g.getTrangThai()))
                .map(Ghe::getMaGhe).toList();
        if (!daHoan.isEmpty())
            throw new BadRequestException("Ghế đã được hoàn rồi: " + daHoan);

        // Validate chưa có pending
        List<Long> dangPending = hoanVeRepository.findByMaGheIn(maGheList).stream()
                .filter(hv -> HOAN_PENDING.equalsIgnoreCase(hv.getTrangThaiHoan()))
                .map(HoanVe::getMaGhe).toList();
        if (!dangPending.isEmpty())
            throw new BadRequestException("Ghế đang chờ duyệt hoàn: " + dangPending);

        // Insert 1 row mỗi ghế
        String lyDo = (request.getLyDoHoan() != null && !request.getLyDoHoan().isBlank())
                ? request.getLyDoHoan().trim() : "Không có lý do";
        LocalDate now = LocalDate.now();

        List<HoanVe> saved = maGheList.stream().map(maGhe -> {
            HoanVe hv = new HoanVe();
            hv.setMaHoaDon(request.getMaHoaDon());
            hv.setMaGhe(maGhe);
            hv.setThoiGianHoan(now);
            hv.setLyDoHoan(lyDo);
            hv.setTrangThaiHoan(HOAN_PENDING);
            return hoanVeRepository.save(hv);
        }).toList();

        // Build response — chỉ cần thông tin cơ bản khi mới tạo
        return saved.stream().map(hv -> {
            Ghe ghe = gheList.stream()
                    .filter(g -> g.getMaGhe().equals(hv.getMaGhe()))
                    .findFirst().orElse(null);
            HoanVeResponse r = new HoanVeResponse();
            r.setMaHoanVe(hv.getMaHoanVe());
            r.setMaHoaDon(hv.getMaHoaDon());
            r.setMaGhe(hv.getMaGhe());
            r.setKhuVuc(ghe != null ? ghe.getKhuVuc() : "—");
            r.setThoiGianHoan(hv.getThoiGianHoan());
            r.setLyDoHoan(hv.getLyDoHoan());
            r.setTrangThaiHoan(hv.getTrangThaiHoan());
            return r;
        }).toList();
    }

    // ── NTC xem danh sách ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<HoanVeResponse> getByCreator(Long maTaiKhoan) {
        NhaToChuc ntc = nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhà tổ chức"));

        List<HoanVe> list = hoanVeRepository.findByMaCongTy(ntc.getMaCongTy());
        if (list.isEmpty()) return List.of();

        return list.stream().map(hv -> buildFullResponse(hv)).toList();
    }

    // ── NTC duyệt / từ chối ──────────────────────────────────────────────────

    @Override
    public HoanVeResponse duyetHoanVe(Long maHoanVe, String trangThai) {
        if (!HOAN_APPROVED.equalsIgnoreCase(trangThai)
                && !HOAN_REJECTED.equalsIgnoreCase(trangThai))
            throw new BadRequestException("Trạng thái phải là 'approved' hoặc 'rejected'");

        HoanVe hv = hoanVeRepository.findById(maHoanVe)
                .orElseThrow(() -> new NotFoundException(
                        "Không tìm thấy yêu cầu hoàn #" + maHoanVe));

        if (!HOAN_PENDING.equalsIgnoreCase(hv.getTrangThaiHoan()))
            throw new BadRequestException("Yêu cầu này đã được xử lý rồi");

        hv.setTrangThaiHoan(trangThai.toLowerCase());
        hoanVeRepository.save(hv);

        if (HOAN_APPROVED.equalsIgnoreCase(trangThai)) {
            // Đặt ghế = da_hoan
            gheRepository.findByIdWithLock(hv.getMaGhe()).ifPresent(ghe -> {
                ghe.setTrangThai(GHE_DA_HOAN);
                gheRepository.save(ghe);

                // Giảm daBan của Ve đúng 1
                veRepository.findByIdWithLock(ghe.getMaVe()).ifPresent(ve -> {
                    ve.setDaBan(Math.max(0, ve.getDaBan() - 1));
                    veRepository.save(ve);
                });
            });
        }

        return buildFullResponse(hv);
    }

    // ── Helper build response đầy đủ ─────────────────────────────────────────

    private HoanVeResponse buildFullResponse(HoanVe hv) {
        Ghe       ghe = gheRepository.findById(hv.getMaGhe()).orElse(null);
        Ve        ve  = ghe != null ? veRepository.findById(ghe.getMaVe()).orElse(null) : null;
        SuKien    sk  = ve  != null ? suKienRepository.findById(ve.getMaSuKien()).orElse(null) : null;
        HoaDon    hd  = hoaDonRepository.findById(hv.getMaHoaDon()).orElse(null);
        KhachHang kh  = hd  != null ? khachHangRepository.findById(hd.getMaKhachHang()).orElse(null) : null;

        HoanVeResponse r = new HoanVeResponse();
        r.setMaHoanVe(hv.getMaHoanVe());
        r.setMaHoaDon(hv.getMaHoaDon());
        r.setMaGhe(hv.getMaGhe());
        r.setKhuVuc(ghe != null ? ghe.getKhuVuc()          : "—");
        r.setTenVe(ve   != null ? ve.getTenVe()             : "—");
        r.setTenSuKien(sk != null ? sk.getTenSuKien()      : "—");
        r.setTenKhachHang(kh != null ? kh.getTenKhachHang(): "—");
        r.setThoiGianHoan(hv.getThoiGianHoan());
        r.setLyDoHoan(hv.getLyDoHoan());
        r.setTrangThaiHoan(hv.getTrangThaiHoan());
        return r;
    }
}