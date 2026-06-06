package com.example.ticket.dto.request;

/**
 * Một ghế khách chọn, gửi kèm trong MuaVeRequest.
 * khuVuc: ví dụ "A1", "B5", "VIP-C3"
 * maVe:   loại vé tương ứng (VIP hoặc Thường)
 */
public class GheRequest {
    private String khuVuc;
    private Long   maVe;

    public String getKhuVuc()          { return khuVuc; }
    public void   setKhuVuc(String v)  { this.khuVuc = v; }
    public Long   getMaVe()            { return maVe; }
    public void   setMaVe(Long v)      { this.maVe = v; }
}