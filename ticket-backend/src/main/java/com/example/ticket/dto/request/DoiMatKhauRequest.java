package com.example.ticket.dto.request;

public class DoiMatKhauRequest {

    private String matKhauCu;
    private String matKhauMoi;
    private String xacNhanMatKhau;

    public String getMatKhauCu()              { return matKhauCu; }
    public void setMatKhauCu(String v)        { this.matKhauCu = v; }
    public String getMatKhauMoi()             { return matKhauMoi; }
    public void setMatKhauMoi(String v)       { this.matKhauMoi = v; }
    public String getXacNhanMatKhau()         { return xacNhanMatKhau; }
    public void setXacNhanMatKhau(String v)   { this.xacNhanMatKhau = v; }
}