package com.example.ticket.service.impl;

import com.example.ticket.model.DiaDiem;
import com.example.ticket.repository.DiaDiemRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiaDiemServiceImplTest {

    @Mock
    private DiaDiemRepository diaDiemRepository;

    @InjectMocks
    private DiaDiemServiceImpl diaDiemService;

    @Test
    void getAll_Success() {
        DiaDiem dd1 = new DiaDiem();
        dd1.setMaDiaDiem(1L);
        dd1.setTenDiaDiem("Nhà hát Lớn");

        DiaDiem dd2 = new DiaDiem();
        dd2.setMaDiaDiem(2L);
        dd2.setTenDiaDiem("Sân vận động Mỹ Đình");

        when(diaDiemRepository.findAll()).thenReturn(Arrays.asList(dd1, dd2));

        List<DiaDiem> result = diaDiemService.getAll();

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("Nhà hát Lớn", result.get(0).getTenDiaDiem());
        assertEquals("Sân vận động Mỹ Đình", result.get(1).getTenDiaDiem());
        verify(diaDiemRepository, times(1)).findAll();
    }

    @Test
    void getById_Success() {
        Long id = 1L;
        DiaDiem dd = new DiaDiem();
        dd.setMaDiaDiem(id);
        dd.setTenDiaDiem("Nhà thi đấu Phú Thọ");

        when(diaDiemRepository.findById(id)).thenReturn(Optional.of(dd));

        Optional<DiaDiem> result = diaDiemService.getById(id);

        assertTrue(result.isPresent());
        assertEquals("Nhà thi đấu Phú Thọ", result.get().getTenDiaDiem());
        verify(diaDiemRepository, times(1)).findById(id);
    }

    @Test
    void getById_NotFound() {
        Long id = 999L;
        when(diaDiemRepository.findById(id)).thenReturn(Optional.empty());

        Optional<DiaDiem> result = diaDiemService.getById(id);

        assertFalse(result.isPresent());
        verify(diaDiemRepository, times(1)).findById(id);
    }
}
