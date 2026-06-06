package com.example.ticket.service.impl;

import com.example.ticket.dto.request.SuKienRequest;
import com.example.ticket.dto.response.SuKienResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.model.NhaToChuc;
import com.example.ticket.model.SuKien;
import com.example.ticket.repository.NhaToChucRepository;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.repository.VeRepository;
import com.example.ticket.service.SuKienService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional(readOnly = true)
public class SuKienServiceImpl implements SuKienService {

    private final SuKienRepository    suKienRepository;
    private final NhaToChucRepository nhaToChucRepository;
    private final VeRepository        veRepository;

    public SuKienServiceImpl(SuKienRepository suKienRepository,
                             NhaToChucRepository nhaToChucRepository,
                             VeRepository veRepository) {
        this.suKienRepository    = suKienRepository;
        this.nhaToChucRepository = nhaToChucRepository;
        this.veRepository        = veRepository;
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private NhaToChuc findNhaToChuc(Long maTaiKhoan) {
        return nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy nhà tổ chức"));
    }

    private SuKien findSuKien(Long id) {
        return suKienRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sự kiện"));
    }

    private void validateThoiGian(SuKienRequest request) {
        if (request.getThoiGianKetThuc().isBefore(request.getThoiGianBatDau())) {
            throw new BadRequestException("Thời gian kết thúc phải sau thời gian bắt đầu");
        }
    }

    /**
     * Tính trạng thái sự kiện dựa vào ngày hiện tại:
     *   - "Sắp diễn ra"  : hôm nay < batDau
     *   - "Đang tổ chức" : batDau <= hôm nay <= ketThuc
     *   - "Đã tổ chức"   : hôm nay > ketThuc
     */
    private String computeTrangThai(SuKien s) {
        LocalDate today = LocalDate.now();
        if (s.getThoiGianBatDau() == null || s.getThoiGianKetThuc() == null)
            return "Chờ duyệt"; // không có ngày → coi như chưa duyệt
        if (today.isBefore(s.getThoiGianBatDau())) return "Sắp diễn ra";
        if (today.isAfter(s.getThoiGianKetThuc()))  return "Đã tổ chức";
        return "Đang tổ chức";
    }

    private SuKienResponse mapToResponse(SuKien s) {
        SuKienResponse r = new SuKienResponse();
        r.setMaSuKien(s.getMaSuKien());
        r.setTenSuKien(s.getTenSuKien());
        r.setMoTa(s.getMoTa());
        r.setMaDiaDiem(s.getMaDiaDiem());
        r.setThoiGianBatDau(s.getThoiGianBatDau());
        r.setThoiGianKetThuc(s.getThoiGianKetThuc());
        r.setMaCongTy(s.getMaCongTy());

        String tt = s.getTrangThai();
        // Chỉ khi "Hoạt động" mới tính theo ngày
        // Tất cả trạng thái khác (Chờ duyệt, Từ chối, Vi phạm, Ẩn) giữ nguyên
        if ("Hoạt động".equals(tt)) {
            r.setTrangThai(computeTrangThai(s));
        } else {
            r.setTrangThai(tt);
        }
        return r;
    }

    // ── queries ──────────────────────────────────────────────────────────────

    /**
     * Dùng cho trang khách hàng (index + loginCustomer):
     * CHỈ trả về sự kiện chưa kết thúc (Sắp diễn ra + Đang tổ chức).
     * Sự kiện đã kết thúc bị ẩn khỏi khách hàng.
     */
    @Override
    public List<SuKienResponse> getAll() {
        LocalDate today = LocalDate.now();
        return suKienRepository.findAll().stream()
                .filter(s -> {
                    // Chỉ hiển thị sự kiện "Hoạt động" cho khách hàng/nhân viên
                    String tt = s.getTrangThai();
                    if (!"Hoạt động".equals(tt)) return false;
                    return s.getThoiGianKetThuc() == null || !s.getThoiGianKetThuc().isBefore(today);
                })
                .map(this::mapToResponse)
                .toList();
    }

    /** Dùng cho admin: trả về TẤT CẢ sự kiện kể cả vi phạm/ẩn */
    @Override
    public List<SuKienResponse> getAllForAdmin() {
        return suKienRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public SuKienResponse getById(Long id) {
        return mapToResponse(findSuKien(id));
    }

    /**
     * Dùng cho creator: trả về TẤT CẢ sự kiện (kể cả đã kết thúc),
     * kèm trangThai để creator có thể phân nhóm thành tabs.
     */
    @Override
    public List<SuKienResponse> getByCreator(Long maTaiKhoan) {
        NhaToChuc ntc = findNhaToChuc(maTaiKhoan);
        Long maCongTy = ntc.getMaCongTy();
        if (maCongTy == null) return List.of();

        return suKienRepository.findByMaCongTy(maCongTy)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // ── commands ─────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public SuKienResponse create(SuKienRequest request) {
        if (request.getMaTaiKhoan() == null)
            throw new BadRequestException("Thiếu thông tin tài khoản");

        if (request.getMaDiaDiem() == null)
            throw new BadRequestException("Phải chọn địa điểm");

        if (request.getTenSuKien() == null || request.getTenSuKien().isBlank())
            throw new BadRequestException("Tên sự kiện không được để trống");

        validateThoiGian(request);

        NhaToChuc ntc = findNhaToChuc(request.getMaTaiKhoan());
        if (ntc.getMaCongTy() == null)
            throw new BadRequestException("Nhà tổ chức chưa được gán công ty. Vui lòng cập nhật thông tin trước.");

        SuKien suKien = new SuKien();
        suKien.setTenSuKien(request.getTenSuKien().trim());
        suKien.setMoTa(request.getMoTa());
        suKien.setThoiGianBatDau(request.getThoiGianBatDau());
        suKien.setThoiGianKetThuc(request.getThoiGianKetThuc());
        suKien.setMaDiaDiem(request.getMaDiaDiem());
        suKien.setMaCongTy(ntc.getMaCongTy());
        suKien.setTrangThai("Chờ duyệt"); // chờ admin duyệt trước khi hiển thị

        try {
            return mapToResponse(suKienRepository.save(suKien));
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Sự kiện đã tồn tại hoặc dữ liệu không hợp lệ");
        }
    }

    @Override
    @Transactional
    public SuKienResponse update(Long id, SuKienRequest request) {
        validateThoiGian(request);
        SuKien existing = findSuKien(id);
        existing.setMaDiaDiem(request.getMaDiaDiem());
        existing.setTenSuKien(request.getTenSuKien());
        existing.setMoTa(request.getMoTa());
        existing.setThoiGianBatDau(request.getThoiGianBatDau());
        existing.setThoiGianKetThuc(request.getThoiGianKetThuc());

        try {
            return mapToResponse(suKienRepository.save(existing));
        } catch (DataIntegrityViolationException e) {
            throw new BadRequestException("Sự kiện đã tồn tại");
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        SuKien sk = findSuKien(id);
        if (!veRepository.findByMaSuKien(id).isEmpty())
            throw new BadRequestException("Không thể xóa sự kiện đang có vé. Hãy xóa vé trước.");
        suKienRepository.delete(sk);
    }

    // ── admin actions ────────────────────────────────────────────────────────

    @Override
    @Transactional
    public void hide(Long id) {
        SuKien sk = findSuKien(id);
        sk.setTrangThai("Ẩn");
        suKienRepository.save(sk);
    }

    @Override
    @Transactional
    public void unhide(Long id) {
        SuKien sk = findSuKien(id);
        sk.setTrangThai("Hoạt động");
        suKienRepository.save(sk);
    }

    @Override
    @Transactional
    public void markViolation(Long id) {
        SuKien sk = findSuKien(id);
        sk.setTrangThai("Vi phạm");
        
        suKienRepository.save(sk);
        // TODO: gửi thông báo cho nhà tổ chức (email hoặc notification)
    }

    @Override
    @Transactional
    public void clearViolation(Long id) {
        SuKien sk = findSuKien(id);
        sk.setTrangThai("Hoạt động");
        suKienRepository.save(sk);
    }

    @Override
    @Transactional
    public void approve(Long id) {
        SuKien sk = findSuKien(id);
        sk.setTrangThai("Hoạt động");
        suKienRepository.save(sk);
    }

    @Override
    @Transactional
    public void reject(Long id) {
        SuKien sk = findSuKien(id);
        sk.setTrangThai("Từ chối");
        
        suKienRepository.save(sk);
        // TODO: gửi thông báo cho nhà tổ chức
    }
}