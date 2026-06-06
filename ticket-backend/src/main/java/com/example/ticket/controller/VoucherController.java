package com.example.ticket.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ticket.dto.request.VoucherRequest;
import com.example.ticket.dto.response.VoucherResponse;
import com.example.ticket.service.VoucherService;

/**
 * Controller class to handle all API operations relating to vouchers.
 * Provides endpoints for retrieving, creating, updating, deleting, and using vouchers.
 */
@RestController
@RequestMapping("/api/voucher")
@CrossOrigin(origins = "*")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    /**
     * Look up voucher details by its unique string code.
     * Used mainly for discount preview on the frontend application.
     *
     * @param maCode the unique code of the voucher
     * @param maSuKien the ID of the event to check application for
     * @return the details of the voucher wrapped in ResponseEntity
     */
    @GetMapping("/code/{maCode}")
    public ResponseEntity<VoucherResponse> getByCode(@PathVariable String maCode) {
        return ResponseEntity.ok(voucherService.getByCode(maCode));
    }

    /**
     * Get list of all vouchers created by a specific event organizer.
     *
     * @param maTaiKhoan the account ID of the event organizer
     * @return list of matching VoucherResponse wrapped in ResponseEntity
     */
    @GetMapping("/creator/{maTaiKhoan}")
    public ResponseEntity<List<VoucherResponse>> getByCreator(
            @PathVariable Long maTaiKhoan) {
        return ResponseEntity.ok(voucherService.getByCreator(maTaiKhoan));
    }

    /**
     * Get details of a single voucher by its primary database identifier (ID).
     *
     * @param id the database ID of the voucher
     * @return the details of the voucher wrapped in ResponseEntity
     */
    @GetMapping("/{id}")
    public ResponseEntity<VoucherResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.getById(id));
    }

    /**
     * Create a new voucher for the system.
     *
     * @param request the request body containing voucher information
     * @return the created VoucherResponse wrapped in ResponseEntity
     */
    @PostMapping
    public ResponseEntity<VoucherResponse> create(
            @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.create(request));
    }

    /**
     * Update an existing voucher.
     *
     * @param id the database ID of the voucher to update
     * @param request the updated voucher details
     * @return the updated VoucherResponse wrapped in ResponseEntity
     */
    @PutMapping("/{id}")
    public ResponseEntity<VoucherResponse> update(
            @PathVariable Long id,
            @RequestBody VoucherRequest request) {
        return ResponseEntity.ok(voucherService.update(id, request));
    }

    /**
     * Delete a voucher from the database.
     *
     * @param id the database ID of the voucher to delete
     * @return empty response body with HTTP Status 204 (No Content)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        voucherService.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    /**
     * Get all active vouchers applicable to a specific event ID.
     * Primarily used to populate voucher selection dropdowns on the frontend.
     *
     * @param maSuKien the ID of the event
     * @return list of applicable VoucherResponse wrapped in ResponseEntity
     */
    @GetMapping("/sukien/{maSuKien}")
    public ResponseEntity<List<VoucherResponse>> getBySuKien(@PathVariable Long maSuKien) {
        return ResponseEntity.ok(voucherService.getBySuKien(maSuKien));
    }

    /**
     * Get a voucher by its code and verify if it can be applied to a specific event.
     *
     * @param maCode the unique code of the voucher
     * @param maSuKien the ID of the event
     * @return the matching VoucherResponse wrapped in ResponseEntity
     */
    @GetMapping("/code/{maCode}/sukien/{maSuKien}")
    public ResponseEntity<VoucherResponse> getByCodeAndSuKien(
            @PathVariable String maCode, @PathVariable Long maSuKien) {
        return ResponseEntity.ok(voucherService.getByCodeAndSuKien(maCode, maSuKien));
    }

    /**
     * Increment usage of a voucher and update its active/inactive status if usage limits are met.
     * Called when a customer or employee completes a checkout using the voucher.
     *
     * @param id the database ID of the voucher to use
     * @return the updated VoucherResponse wrapped in ResponseEntity
     */
    @PatchMapping("/{id}/use")
    public ResponseEntity<VoucherResponse> useVoucher(@PathVariable Long id) {
        return ResponseEntity.ok(voucherService.useVoucher(id));
    }
}