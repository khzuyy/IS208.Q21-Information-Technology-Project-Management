package com.example.ticket.service.impl;

import com.example.ticket.exception.NotFoundException;
import com.example.ticket.model.NhaToChuc;
import com.example.ticket.repository.NhaToChucRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NhaToChucServiceImplTest {

    @Mock
    private NhaToChucRepository repo;

    @InjectMocks
    private NhaToChucServiceImpl service;

    @Test
    void getById_Success() {
        Long maCongTy = 1L;
        NhaToChuc ntc = new NhaToChuc();
        ntc.setMaCongTy(maCongTy);
        ntc.setTenCongTy("UIT Event Co.");

        when(repo.findById(maCongTy)).thenReturn(Optional.of(ntc));

        NhaToChuc result = service.getById(maCongTy);

        assertNotNull(result);
        assertEquals(maCongTy, result.getMaCongTy());
        assertEquals("UIT Event Co.", result.getTenCongTy());
        verify(repo, times(1)).findById(maCongTy);
    }

    @Test
    void getById_NotFound_ThrowsException() {
        Long maCongTy = 999L;
        when(repo.findById(maCongTy)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.getById(maCongTy));
        verify(repo, times(1)).findById(maCongTy);
    }

    @Test
    void getByMaTaiKhoan_Success() {
        Long maTaiKhoan = 2L;
        NhaToChuc ntc = new NhaToChuc();
        ntc.setMaTaiKhoan(maTaiKhoan);
        ntc.setTenCongTy("Developer Inc.");

        when(repo.findByMaTaiKhoan(maTaiKhoan)).thenReturn(Optional.of(ntc));

        NhaToChuc result = service.getByMaTaiKhoan(maTaiKhoan);

        assertNotNull(result);
        assertEquals(maTaiKhoan, result.getMaTaiKhoan());
        verify(repo, times(1)).findByMaTaiKhoan(maTaiKhoan);
    }

    @Test
    void getByMaTaiKhoan_NotFound_ThrowsException() {
        Long maTaiKhoan = 999L;
        when(repo.findByMaTaiKhoan(maTaiKhoan)).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> service.getByMaTaiKhoan(maTaiKhoan));
        verify(repo, times(1)).findByMaTaiKhoan(maTaiKhoan);
    }
}
