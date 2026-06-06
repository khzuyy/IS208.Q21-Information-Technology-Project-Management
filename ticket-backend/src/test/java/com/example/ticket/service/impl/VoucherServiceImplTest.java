package com.example.ticket.service.impl;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.ticket.dto.response.VoucherResponse;
import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.Voucher;
import com.example.ticket.repository.VoucherRepository;

@ExtendWith(MockitoExtension.class)
class VoucherServiceImplTest {

    @Mock
    private VoucherRepository voucherRepository;

    @InjectMocks
    private VoucherServiceImpl voucherService;

    @Test
    void getById_Success() {
        Long id = 1L;
        Voucher voucher = new Voucher();
        voucher.setMaVoucher(id);
        voucher.setMaCode("UIT50");
        voucher.setMucKhuyenMai(50L);
        voucher.setTrangThai("active");

        when(voucherRepository.findById(id)).thenReturn(Optional.of(voucher));

        VoucherResponse result = voucherService.getById(id);

        assertNotNull(result);
        assertEquals("UIT50", result.getMaCode());
        assertEquals(50L, result.getMucKhuyenMai());
        verify(voucherRepository, times(1)).findById(id);
    }

    @Test
    void getById_NotFound_ThrowsException() {
        Long id = 999L;
        when(voucherRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> voucherService.getById(id));
        verify(voucherRepository, times(1)).findById(id);
    }

    @Test
    void getByCode_Success() {
        String code = "SPRING20";
        Voucher voucher = new Voucher();
        voucher.setMaVoucher(2L);
        voucher.setMaCode(code);
        voucher.setMucKhuyenMai(20L);
        voucher.setTrangThai("active");

        when(voucherRepository.findByMaCode(code)).thenReturn(Optional.of(voucher));

        VoucherResponse result = voucherService.getByCode(code);

        assertNotNull(result);
        assertEquals(code, result.getMaCode());
        assertEquals(20L, result.getMucKhuyenMai());
        verify(voucherRepository, times(1)).findByMaCode(code);
    }

    @Test
    void getByCode_NotFound_ThrowsException() {
        String code = "INVALID_CODE";
        when(voucherRepository.findByMaCode(code)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> voucherService.getByCode(code));
        verify(voucherRepository, times(1)).findByMaCode(code);
    }
}
