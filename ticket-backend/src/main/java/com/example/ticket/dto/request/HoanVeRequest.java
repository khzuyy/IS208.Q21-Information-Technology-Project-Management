package com.example.ticket.dto.request;

import java.util.List;

public class HoanVeRequest {
    private Long       maHoaDon;
    private List<Long> maGheList;   // mỗi phần tử → 1 row HOANVE
    private String     lyDoHoan;    // dùng chung cho tất cả ghế trong batch

    public Long getMaHoaDon()              { return maHoaDon; }
    public void setMaHoaDon(Long v)        { this.maHoaDon = v; }
    public List<Long> getMaGheList()       { return maGheList; }
    public void setMaGheList(List<Long> v) { this.maGheList = v; }
    public String getLyDoHoan()            { return lyDoHoan; }
    public void setLyDoHoan(String v)      { this.lyDoHoan = v; }
}