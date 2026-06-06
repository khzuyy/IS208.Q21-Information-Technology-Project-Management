package com.example.ticket.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/upload")
public class UploadController {

    // Đọc từ application.properties: app.upload.dir=./uploads
    // Nếu không khai báo thì mặc định "./uploads" (cạnh JAR hoặc cạnh project)
    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @PostMapping("/qr")
    public ResponseEntity<Map<String, String>> uploadQR(
            @RequestParam("file") MultipartFile file) throws IOException {

        // Chỉ chấp nhận ảnh
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Chỉ chấp nhận file ảnh"));
        }

        // Resolve đường dẫn tuyệt đối để luôn tìm được dù chạy IDE hay JAR
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();

        // Tạo thư mục nếu chưa có
        Files.createDirectories(uploadPath);

        // Đặt tên file unique để tránh trùng
        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
                ? original.substring(original.lastIndexOf('.'))
                : ".jpg";
        String fileName = "qr_" + UUID.randomUUID() + ext;

        // Lưu file vào thư mục ngoài JAR
        Files.copy(file.getInputStream(),
                   uploadPath.resolve(fileName),
                   StandardCopyOption.REPLACE_EXISTING);

        // Trả về đường dẫn để lưu vào DB và hiển thị frontend
        String filePath = "/uploads/" + fileName;
        return ResponseEntity.ok(Map.of("path", filePath));
    }
}