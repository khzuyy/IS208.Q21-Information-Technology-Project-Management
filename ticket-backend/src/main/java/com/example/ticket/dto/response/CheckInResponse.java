package com.example.ticket.dto.response;

public class CheckInResponse {

    private String message;
    private String tenVe;
    private String khuVuc;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTenVe() {
        return tenVe;
    }

    public void setTenVe(String tenVe) {
        this.tenVe = tenVe;
    }

    public String getKhuVuc() {
        return khuVuc;
    }

    public void setKhuVuc(String khuVuc) {
        this.khuVuc = khuVuc;
    }
}