package com.example.ticket.service.impl;

import java.util.Arrays;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.ticket.dto.request.VoucherRequest;
import com.example.ticket.dto.response.VoucherResponse;
import com.example.ticket.exception.BadRequestException;
import com.example.ticket.exception.DuplicateResourceException;
import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.NhaToChuc;
import com.example.ticket.model.SuKien;
import com.example.ticket.model.Voucher;
import com.example.ticket.repository.NhaToChucRepository;
import com.example.ticket.repository.SuKienRepository;
import com.example.ticket.repository.VoucherRepository;
import com.example.ticket.service.VoucherService;

import jakarta.persistence.EntityNotFoundException;

@Service
@Transactional(readOnly = true)
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository   voucherRepository;
    private final NhaToChucRepository nhaToChucRepository;
    private final SuKienRepository    suKienRepository;

    public VoucherServiceImpl(VoucherRepository voucherRepository,
                              NhaToChucRepository nhaToChucRepository,
                              SuKienRepository suKienRepository) {
        this.voucherRepository   = voucherRepository;
        this.nhaToChucRepository = nhaToChucRepository;
        this.suKienRepository    = suKienRepository;
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private NhaToChuc findNhaToChuc(Long maTaiKhoan) {
        return nhaToChucRepository.findByMaTaiKhoan(maTaiKhoan)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy nhà tổ chức"));
    }

    private SuKien findSuKien(Long maSuKien) {
        return suKienRepository.findById(maSuKien)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sự kiện"));
    }

    private Voucher findVoucher(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy khuyến mãi"));
    }

    private void validateMucKhuyenMai(Long mucKhuyenMai) {
        if (mucKhuyenMai == null || mucKhuyenMai < 0 || mucKhuyenMai > 100)
            throw new BadRequestException("Mức khuyến mãi phải từ 0 đến 100");
    }

    private void validateNgay(VoucherRequest request) {
        if (request.getNgayBatDau() == null || request.getNgayKetThuc() == null)
            throw new BadRequestException("Vui lòng nhập ngày bắt đầu và kết thúc");
        if (request.getNgayKetThuc().isBefore(request.getNgayBatDau()))
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu");
    }

    // ✅ Parse "1,2,3" → List<Long>
    private List<Long> parseSuKienIds(String danhSach) {
        if (danhSach == null || danhSach.isBlank()) return List.of();
        return Arrays.stream(danhSach.split(","))
                .map(s -> Long.parseLong(s.trim()))
                .toList();
    }

    // ✅ Kiểm tra tất cả sự kiện thuộc công ty
    private void validateSuKienBelongToCompany(List<Long> ids, Long maCongTy) {
        for (Long id : ids) {
            SuKien sk = suKienRepository.findById(id)
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy sự kiện #" + id));
            if (!maCongTy.equals(sk.getMaCongTy()))
                throw new BadRequestException("Sự kiện #" + id + " không thuộc công ty của bạn");
        }
    }

    private VoucherResponse mapToResponse(Voucher v) {
        VoucherResponse r = new VoucherResponse();
        r.setMaVoucher(v.getMaVoucher());
        r.setMaCode(v.getMaCode());
        r.setMucKhuyenMai(v.getMucKhuyenMai());
        r.setTrangThai(v.getTrangThai());
        r.setLuotSuDung(v.getLuotSuDung());
        r.setMaCongTy(v.getMaCongTy());
        r.setDanhSachSuKien(v.getDanhSachSuKien());
        r.setNgayBatDau(v.getNgayBatDau());
        r.setNgayKetThuc(v.getNgayKetThuc());
        r.setSoLuong(v.getSoLuong());       // giới hạn tối đa
        r.setLuotSuDung(v.getLuotSuDung());

        // ✅ Load tên sự kiện từ danhSachSuKien
        if (v.getDanhSachSuKien() != null && !v.getDanhSachSuKien().isBlank()) {
            List<Long> ids = parseSuKienIds(v.getDanhSachSuKien());
            List<String> tenList = suKienRepository.findAllById(ids)
                    .stream().map(SuKien::getTenSuKien).toList();
            r.setTenSuKienList(tenList);
        }
        return r;
    }

    // ── queries ───────────────────────────────────────────────────────────────

    @Override
    public List<VoucherResponse> getByCreator(Long maTaiKhoan) {
        NhaToChuc ntc = findNhaToChuc(maTaiKhoan);
        List<Voucher> vouchers = voucherRepository.findByMaCongTy(ntc.getMaCongTy());
        if (vouchers.isEmpty()) return List.of();
        return vouchers.stream().map(this::mapToResponse).toList();
    }

    @Override
    public VoucherResponse getById(Long id) {
        return mapToResponse(findVoucher(id));
    }

    @Override
    public VoucherResponse getByCode(String maCode) {
        Voucher v = voucherRepository.findByMaCode(maCode.trim())
                .orElseThrow(() -> new NotFoundException("Mã voucher không tồn tại"));
        return mapToResponse(v);
    }

    // ✅ Kiểm tra voucher có áp dụng cho sự kiện không
    @Override
    public VoucherResponse getByCodeAndSuKien(String maCode, Long maSuKien) {
        Voucher v = voucherRepository.findByMaCode(maCode.trim())
                .orElseThrow(() -> new NotFoundException("Mã voucher không tồn tại"));

        if (!"active".equalsIgnoreCase(v.getTrangThai()))
            throw new BadRequestException("Voucher đã hết hạn hoặc không còn hiệu lực");

        // Kiểm tra còn lượt sử dụng không
        int luotDaDung = v.getLuotSuDung() != null ? v.getLuotSuDung() : 0;
        int soLuong    = v.getSoLuong()    != null ? v.getSoLuong()    : 0;
        if (luotDaDung >= soLuong)
            throw new BadRequestException("Voucher đã hết lượt sử dụng");

        List<Long> ids = parseSuKienIds(v.getDanhSachSuKien());
        if (!ids.contains(maSuKien))
            throw new BadRequestException("Voucher này không áp dụng cho sự kiện đang chọn");

        return mapToResponse(v);
    }

    // ✅ Lấy voucher active áp dụng cho sự kiện — dùng cho dropdown
    @Override
    public List<VoucherResponse> getBySuKien(Long maSuKien) {
        return voucherRepository.findAll().stream()
                .filter(v -> "active".equalsIgnoreCase(v.getTrangThai()))
                .filter(v -> {
                    int used = v.getLuotSuDung() != null ? v.getLuotSuDung() : 0;
                    int max  = v.getSoLuong()    != null ? v.getSoLuong()    : 0;
                    return used < max;
                })
                .filter(v -> parseSuKienIds(v.getDanhSachSuKien()).contains(maSuKien))
                .map(this::mapToResponse)
                .toList();
    }

    // ── commands ──────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public VoucherResponse create(VoucherRequest request) {
        validateMucKhuyenMai(request.getMucKhuyenMai());
        validateNgay(request);

        NhaToChuc ntc = findNhaToChuc(request.getMaTaiKhoan());

        // ✅ Validate tất cả sự kiện trong danh sách thuộc công ty này
        List<Long> suKienIds = parseSuKienIds(request.getDanhSachSuKien());
        if (suKienIds.isEmpty())
            throw new BadRequestException("Vui lòng chọn ít nhất 1 sự kiện");
        validateSuKienBelongToCompany(suKienIds, ntc.getMaCongTy());

        boolean duplicate = voucherRepository.findByMaCongTy(ntc.getMaCongTy())
                .stream().anyMatch(v -> v.getMaCode().equalsIgnoreCase(request.getMaCode()));
        if (duplicate)
            throw new DuplicateResourceException("Mã voucher đã tồn tại trong công ty");

        if (request.getSoLuong() == null || request.getSoLuong() <= 0)
            throw new BadRequestException("Số lượng lượt sử dụng phải lớn hơn 0");

        Voucher v = new Voucher();
        v.setMaCode(request.getMaCode());
        v.setMucKhuyenMai(request.getMucKhuyenMai());
        v.setTrangThai("active");
        v.setSoLuong(request.getSoLuong());   // giới hạn tối đa
        v.setLuotSuDung(0);                   // chưa dùng lần nào
        v.setMaCongTy(ntc.getMaCongTy());
        v.setDanhSachSuKien(request.getDanhSachSuKien()); // "1,2,3"
        v.setNgayBatDau(request.getNgayBatDau());
        v.setNgayKetThuc(request.getNgayKetThuc());

        return mapToResponse(voucherRepository.save(v));
    }

    @Override
    @Transactional
    public VoucherResponse update(Long id, VoucherRequest request) {
        validateMucKhuyenMai(request.getMucKhuyenMai());
        validateNgay(request);

        Voucher existing = findVoucher(id);
        NhaToChuc ntc = findNhaToChuc(request.getMaTaiKhoan());

        List<Long> suKienIds = parseSuKienIds(request.getDanhSachSuKien());
        if (suKienIds.isEmpty())
            throw new BadRequestException("Vui lòng chọn ít nhất 1 sự kiện");
        validateSuKienBelongToCompany(suKienIds, ntc.getMaCongTy());

        existing.setMaCode(request.getMaCode());
        existing.setMucKhuyenMai(request.getMucKhuyenMai());
        existing.setDanhSachSuKien(request.getDanhSachSuKien());
        existing.setNgayBatDau(request.getNgayBatDau());
        existing.setTrangThai(request.getTrangThai());
        existing.setNgayKetThuc(request.getNgayKetThuc());
        if (request.getSoLuong() != null)
            existing.setSoLuong(request.getSoLuong());

        return mapToResponse(voucherRepository.save(existing));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        voucherRepository.delete(findVoucher(id));
    }

    @Override
    @Transactional
    public VoucherResponse useVoucher(Long id) {
        Voucher v = voucherRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy voucher"));

        if (!"active".equalsIgnoreCase(v.getTrangThai()))
            throw new BadRequestException("Voucher đã ngừng hoạt động");

        int luotDaDung = v.getLuotSuDung() != null ? v.getLuotSuDung() : 0;
        int soLuong    = v.getSoLuong()    != null ? v.getSoLuong()    : 0;

        if (luotDaDung >= soLuong)
            throw new BadRequestException("Voucher đã hết lượt sử dụng");

        // Tăng lượt đã dùng
        luotDaDung++;
        v.setLuotSuDung(luotDaDung);

        // Nếu đã dùng hết → tự động ngừng hoạt động
        if (luotDaDung >= soLuong) {
            v.setTrangThai("inactive");
        }

        return mapToResponse(voucherRepository.save(v));
    }
}