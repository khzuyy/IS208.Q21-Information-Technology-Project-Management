-- =========================================================
-- TICKET DATABASE — Oracle SQL
-- =========================================================

-- =========================================================
-- SEQUENCES
-- =========================================================
CREATE SEQUENCE TAIKHOAN_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE NHANVIEN_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE KHACHHANG_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE NHATOCHUC_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE SUKIEN_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE VE_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE VOUCHER_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE HOADON_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE DIADIEM_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE GHE_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE THANHTOAN_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE HOANVE_SEQ START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE BAOCAO_SEQ START WITH 1 INCREMENT BY 1;

-- =========================
-- 1. TÀI KHOẢN
-- =========================
CREATE TABLE TAIKHOAN (
    MaTaiKhoan NUMBER PRIMARY KEY,
    LoaiTaiKhoan VARCHAR2(50) NOT NULL,
    MatKhau VARCHAR2(255) NOT NULL,
    TenTaiKhoan VARCHAR2(255) UNIQUE,
    TrangThai VARCHAR2(255) DEFAULT 'active',
    CONSTRAINT CK_TAIKHOAN_LOAI CHECK (LoaiTaiKhoan IN ('Nhà tổ chức','Khách hàng','Nhân viên','Quản lý')),
    CONSTRAINT CK_TAIKHOAN_TRANGTHAI CHECK (TrangThai IN ('active','blocked'))
);

-- =========================
-- 2. KHÁCH HÀNG
-- =========================
CREATE TABLE KHACHHANG (
    MaKhachHang NUMBER PRIMARY KEY,
    TenKhachHang VARCHAR2(100),
    Email VARCHAR2(100),
    SoDienThoai VARCHAR2(20),
    MaTaiKhoan NUMBER,
    CONSTRAINT fk_kh_tk FOREIGN KEY (MaTaiKhoan) REFERENCES TAIKHOAN(MaTaiKhoan)
);

-- =========================
-- 3. NHÂN VIÊN
-- =========================
CREATE TABLE NHANVIEN (
    MaNhanVien NUMBER PRIMARY KEY,
    TenNhanVien VARCHAR2(100),
    Email VARCHAR2(100),
    SoDienThoai VARCHAR2(20),
    NgayVaoLam DATE,
    MaTaiKhoan NUMBER,
    CONSTRAINT fk_nv_tk FOREIGN KEY (MaTaiKhoan) REFERENCES TAIKHOAN(MaTaiKhoan)
);

-- =========================
-- 4. NHÀ TỔ CHỨC
-- =========================
CREATE TABLE NHATOCHUC (
    MaCongTy NUMBER PRIMARY KEY,
    TenCongTy VARCHAR2(150),
    TenNguoiDaiDien VARCHAR2(100),
    DiaChi VARCHAR2(200),
    Email VARCHAR2(100),
    SoDienThoai VARCHAR2(20),
    MaTaiKhoan NUMBER,
    MaQR VARCHAR2(150),
    CONSTRAINT fk_ct_tk FOREIGN KEY (MaTaiKhoan) REFERENCES TAIKHOAN(MaTaiKhoan)
);

-- =========================
-- 5. ĐỊA ĐIỂM
-- =========================
CREATE TABLE DIADIEM (
    MaDiaDiem NUMBER PRIMARY KEY,
    TenDiaDiem VARCHAR2(100),
    DiaChi VARCHAR2(200),
    SucChua NUMBER,
    LoaiSoDo VARCHAR2(200)
);

-- =========================
-- 6. SỰ KIỆN
-- =========================
CREATE TABLE SUKIEN (
    MaSuKien NUMBER PRIMARY KEY,
    TenSuKien VARCHAR2(150) UNIQUE,
    MoTa VARCHAR2(500),
    ThoiGianBatDau DATE,
    ThoiGianKetThuc DATE,
    MaCongTy NUMBER,
    TrangThai VARCHAR2(150),
    MaDiaDiem NUMBER,
    CONSTRAINT fk_sk_dd FOREIGN KEY (MaDiaDiem) REFERENCES DIADIEM(MaDiaDiem),
    CONSTRAINT fk_sk_ct FOREIGN KEY (MaCongTy) REFERENCES NHATOCHUC(MaCongTy),
    CONSTRAINT CK_SUKIEN_TRANGTHAI CHECK (TrangThai IN ('Hoạt động','Ẩn','Vi phạm', 'Chờ duyệt', 'Từ chối'))
);


-- =========================
-- 7. VOUCHER
-- =========================
CREATE TABLE VOUCHER (
    MaVoucher NUMBER PRIMARY KEY,
    MaCode VARCHAR2(50),
    DanhSachSuKien VARCHAR2(500),
    MucKhuyenMai NUMBER,
    NgayBatDau DATE,
    NgayKetThuc DATE,
    TrangThai VARCHAR2(50),
    SoLuong NUMBER DEFAULT 0,
    LuotSuDung NUMBER,
    MaCongTy NUMBER,
    CONSTRAINT fk_vc_ct FOREIGN KEY (MaCongTy) REFERENCES NHATOCHUC(MaCongTy)
);

-- =========================
-- 8. VÉ
-- =========================
CREATE TABLE VE (
    MaVe NUMBER PRIMARY KEY,
    TenVe VARCHAR2(100),
    LoaiVe VARCHAR2(50),
    Gia NUMBER,
    SoLuong NUMBER(10,0),
    DaBan NUMBER(10,0),
    TrangThai VARCHAR2(50),
    MoTa VARCHAR2(3000),
    MaSuKien NUMBER,
    CONSTRAINT fk_ve_sk FOREIGN KEY (MaSuKien) REFERENCES SUKIEN(MaSuKien),
    CONSTRAINT CK_VE_LV CHECK (LoaiVe IN ('Thường','VIP')),
    CONSTRAINT CK_VE_TRANGTHAI CHECK (TrangThai = 'available')
);

-- =========================
-- 9. HÓA ĐƠN
-- =========================
CREATE TABLE HOADON (
    MaHoaDon NUMBER PRIMARY KEY,
    NgayLap DATE,
    TrangThai VARCHAR2(50),
    ThanhTien NUMBER,
    MaKhachHang NUMBER,
    MaNhanVien NUMBER,
    MaVoucher NUMBER,
    CONSTRAINT fk_hd_kh FOREIGN KEY (MaKhachHang) REFERENCES KHACHHANG(MaKhachHang),
    CONSTRAINT fk_hd_nv FOREIGN KEY (MaNhanVien) REFERENCES NHANVIEN(MaNhanVien),
    CONSTRAINT fk_hd_vc FOREIGN KEY (MaVoucher) REFERENCES VOUCHER(MaVoucher)
);

-- =========================
-- 10. GHẾ
-- =========================
CREATE TABLE GHE (
    MaGhe NUMBER PRIMARY KEY,
    KhuVuc VARCHAR2(50),
    TrangThai VARCHAR2(50),
    MaVe NUMBER,
    MaHoaDon NUMBER,
    QR_Token VARCHAR2(255),
    CONSTRAINT fk_ghe_mv FOREIGN KEY (MaVe) REFERENCES VE(MaVe),
    CONSTRAINT fk_ghe_hd FOREIGN KEY (MaHoaDon) REFERENCES HOADON(MaHoaDon),
    CONSTRAINT fk_ghe_dd FOREIGN KEY (MaDiaDiem) REFERENCES DIADIEM(MaDiaDiem),
    CONSTRAINT CK_GHE_TRANGTHAI CHECK (TrangThai IN ('da_dat','da_hoan', 'da_checkin'))
);

-- =========================
-- 11. CHI TIẾT HÓA ĐƠN
-- =========================
CREATE TABLE CHITIETHOADON (
    MaVe NUMBER,
    MaHoaDon NUMBER,
    DonGia NUMBER,
    SoLuong NUMBER,
    PRIMARY KEY (MaVe, MaHoaDon),
    CONSTRAINT fk_cthd_ve FOREIGN KEY (MaVe) REFERENCES VE(MaVe),
    CONSTRAINT fk_cthd_hd FOREIGN KEY (MaHoaDon) REFERENCES HOADON(MaHoaDon)
);

-- =========================
-- 12. THANH TOÁN
-- =========================
CREATE TABLE THANHTOAN (
    MaThanhToan NUMBER PRIMARY KEY,
    SoTien NUMBER,
    ThoiGian DATE,
    PhuongThuc VARCHAR2(50),
    TrangThai VARCHAR2(50),
    MaHoaDon NUMBER,
    CONSTRAINT fk_tt_hd FOREIGN KEY (MaHoaDon) REFERENCES HOADON(MaHoaDon)
);

-- =========================
-- 13. HOÀN VÉ
-- =========================
CREATE TABLE HOANVE (
    MaHoanVe NUMBER PRIMARY KEY,
    MaHoaDon NUMBER,
    MaGhe NUMBER,
    ThoiGianHoan DATE,
    LyDoHoan VARCHAR2(255),
    TrangThaiHoan VARCHAR2(50),
    CONSTRAINT fk_hv_hd FOREIGN KEY (MaHoaDon) REFERENCES HOADON(MaHoaDon),
    CONSTRAINT fk_hv_ghe FOREIGN KEY (MaGhe) REFERENCES GHE(MaGhe)
);

-- =========================
-- 14. BÁO CÁO
-- =========================
CREATE TABLE BAOCAO (
    MaBaoCao NUMBER PRIMARY KEY,
    DoanhThu NUMBER,
    NgayBatDau DATE,
    NgayKetThuc DATE,
    SoVeDaBan NUMBER,
    SoVeTon NUMBER,
    MaNhanVien NUMBER,
    CONSTRAINT fk_bc_nv FOREIGN KEY (MaNhanVien) REFERENCES NHANVIEN(MaNhanVien)
);

-- =========================================================
-- INSERT TAIKHOAN
-- =========================================================
INSERT INTO TAIKHOAN VALUES (TAIKHOAN_SEQ.NEXTVAL,'Quản lý','123456','admin','active');
INSERT INTO TAIKHOAN VALUES (TAIKHOAN_SEQ.NEXTVAL,'Nhà tổ chức','123456','concert_org','active');
INSERT INTO TAIKHOAN VALUES (TAIKHOAN_SEQ.NEXTVAL,'Nhà tổ chức','123456','music_company','active');
INSERT INTO TAIKHOAN VALUES (TAIKHOAN_SEQ.NEXTVAL,'Nhân viên','123456','staff01','active');
INSERT INTO TAIKHOAN VALUES (TAIKHOAN_SEQ.NEXTVAL,'Nhân viên','123456','staff02','active');
INSERT INTO TAIKHOAN VALUES (TAIKHOAN_SEQ.NEXTVAL,'Khách hàng','123456','khach01','active');
INSERT INTO TAIKHOAN VALUES (TAIKHOAN_SEQ.NEXTVAL,'Khách hàng','123456','khach02','active');
INSERT INTO TAIKHOAN VALUES (TAIKHOAN_SEQ.NEXTVAL,'Khách hàng','123456','khach03','active');

-- =========================================================
-- INSERT NHATOCHUC
-- =========================================================
INSERT INTO NHATOCHUC (MaCongTy,TenCongTy,TenNguoiDaiDien,DiaChi,Email,SoDienThoai,MaTaiKhoan) VALUES (NHATOCHUC_SEQ.NEXTVAL,'Sky Music','Nguyễn Văn A','TP.HCM','sky@gmail.com','0901111111',2);
INSERT INTO NHATOCHUC (MaCongTy,TenCongTy,TenNguoiDaiDien,DiaChi,Email,SoDienThoai,MaTaiKhoan) VALUES (NHATOCHUC_SEQ.NEXTVAL,'Live Event','Trần Văn B','Hà Nội','live@gmail.com','0902222222',3);

-- =========================================================
-- INSERT NHANVIEN
-- =========================================================
INSERT INTO NHANVIEN VALUES (NHANVIEN_SEQ.NEXTVAL,'Lê Minh C','staff01@gmail.com','0911111111',SYSDATE,4);
INSERT INTO NHANVIEN VALUES (NHANVIEN_SEQ.NEXTVAL,'Phạm Minh D','staff02@gmail.com','0922222222',SYSDATE,5);

-- =========================================================
-- INSERT KHACHHANG
-- =========================================================
INSERT INTO KHACHHANG VALUES (KHACHHANG_SEQ.NEXTVAL,'Nguyễn Khách 1','kh1@gmail.com','0933333333',6);
INSERT INTO KHACHHANG VALUES (KHACHHANG_SEQ.NEXTVAL,'Nguyễn Khách 2','kh2@gmail.com','0944444444',7);
INSERT INTO KHACHHANG VALUES (KHACHHANG_SEQ.NEXTVAL,'Nguyễn Khách 3','kh3@gmail.com','0955555555',8);

-- =========================================================
-- INSERT DIADIEM
-- =========================================================
INSERT INTO DIADIEM VALUES (DIADIEM_SEQ.NEXTVAL,'Sân vận động Thống Nhất','TP.HCM',20000,'Hình tròn');
INSERT INTO DIADIEM VALUES (DIADIEM_SEQ.NEXTVAL,'Nhà thi đấu Quân Khu 7','TP.HCM',15000,'Hình tròn');
INSERT INTO DIADIEM VALUES (DIADIEM_SEQ.NEXTVAL,'Trung tâm Hội nghị Quốc Gia','Hà Nội',10000,'Hình chữ nhật');

UPDATE GHE
SET TRANGTHAI = 'da_dat';
commit;
-- =========================================================
-- INSERT SUKIEN
-- =========================================================
INSERT INTO SUKIEN VALUES (SUKIEN_SEQ.NEXTVAL,'Sky Music Festival','Đêm nhạc EDM',TO_DATE('2026-06-10 18:00','YYYY-MM-DD HH24:MI'),TO_DATE('2026-06-10 23:00','YYYY-MM-DD HH24:MI'),1,'Hoạt động',1);
INSERT INTO SUKIEN VALUES (SUKIEN_SEQ.NEXTVAL,'Live Concert 2026','Ca nhạc ngoài trời',TO_DATE('2026-07-20 19:00','YYYY-MM-DD HH24:MI'),TO_DATE('2026-07-20 22:30','YYYY-MM-DD HH24:MI'),2,'Hoạt động',2);
INSERT INTO SUKIEN VALUES (SUKIEN_SEQ.NEXTVAL,'Acoustic Night','Đêm acoustic',TO_DATE('2026-08-05 18:30','YYYY-MM-DD HH24:MI'),TO_DATE('2026-08-05 21:30','YYYY-MM-DD HH24:MI'),1,'Ẩn',3);

-- =========================================================
-- INSERT VOUCHER
-- =========================================================
INSERT INTO VOUCHER VALUES (VOUCHER_SEQ.NEXTVAL,'SUMMER10','1,2',10,SYSDATE,SYSDATE+30,'active',100,0,1);
INSERT INTO VOUCHER VALUES (VOUCHER_SEQ.NEXTVAL,'VIP20','2',20,SYSDATE,SYSDATE+15,'active',50,0,2);

COMMIT;


-- Tao sequence sinh ID tu dong
CREATE SEQUENCE CHAT_MSG_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

-- Tao bang luu lich su hoi thoai chatbot
CREATE TABLE CHAT_MESSAGES (
    ID          NUMBER          PRIMARY KEY,
    SESSION_ID  VARCHAR2(100)   NOT NULL,
    USER_ID     NUMBER,
    ROLE        VARCHAR2(20)    NOT NULL,
    CONTENT     CLOB            NOT NULL,
    CREATED_AT  TIMESTAMP       DEFAULT SYSTIMESTAMP
);

CREATE INDEX IDX_CHAT_SESSION ON CHAT_MESSAGES(SESSION_ID);
CREATE INDEX IDX_CHAT_USER    ON CHAT_MESSAGES(USER_ID);
CREATE INDEX IDX_CHAT_TIME    ON CHAT_MESSAGES(CREATED_AT);