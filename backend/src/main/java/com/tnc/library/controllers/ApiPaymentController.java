package com.tnc.library.controllers;

import com.tnc.library.configs.VNPayConfig;
import com.tnc.library.services.PaymentService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.UnsupportedEncodingException;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ApiPaymentController {

    @Autowired
    private PaymentService paymentService;


    private final VNPayConfig vnpConfig;

    public ApiPaymentController(VNPayConfig vnpConfig) {
        this.vnpConfig = vnpConfig;
    }

    @GetMapping("/payment/create")
    public ResponseEntity<?> createPayment(@RequestParam("amount") long amount,
                                           @RequestParam("type") String type) throws UnsupportedEncodingException {

        if (amount <= 0) {
            return ResponseEntity.badRequest().body("Số tiền phải lớn hơn 0");
        }

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_TxnRef = String.valueOf(System.currentTimeMillis());
        String vnp_IpAddr = "127.0.0.1";
        String orderType = "170000"; // Thương mại điện tử

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnpConfig.getVnp_TmnCode());
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + vnp_TxnRef);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        Calendar cal = Calendar.getInstance();
        cal.add(Calendar.MINUTE, 15);
        vnp_Params.put("vnp_ExpireDate", new SimpleDateFormat("yyyyMMddHHmmss").format(cal.getTime()));

        String returnUrl = vnpConfig.getVnp_ReturnUrl() + "?type=" + type;
        vnp_Params.put("vnp_ReturnUrl", returnUrl);

        // Sort params
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString())).append('&');
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString())).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString())).append('&');
            }
        }
        hashData.deleteCharAt(hashData.length() - 1);
        query.deleteCharAt(query.length() - 1);

        String vnp_SecureHash = hmacSHA512(vnpConfig.getVnp_HashSecret(), hashData.toString());
        query.append("&vnp_SecureHash=").append(vnp_SecureHash);
        String paymentUrl = vnpConfig.getVnp_Url() + "?" + query.toString();

        Map<String, String> result = new HashMap<>();
        result.put("paymentUrl", paymentUrl);

        return ResponseEntity.ok(result);
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] result = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : result) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    @GetMapping("/payment/return")
    public void handleReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws Exception {
        String vnp_SecureHash = params.get("vnp_SecureHash");
        String type = params.get("type");

        Map<String, String> sortedParams = new TreeMap<>(params);
        sortedParams.remove("vnp_SecureHash");

        StringBuilder signData = new StringBuilder();
        for (Map.Entry<String, String> entry : sortedParams.entrySet()) {
            if (entry.getKey().startsWith("vnp_")) {
                signData.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8.toString())).append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString())).append("&");
            }
        }
        signData.deleteCharAt(signData.length() - 1);

        String calculatedHash = hmacSHA512(vnpConfig.getVnp_HashSecret(), signData.toString());

        String frontendUrl = "http://localhost:3000/payment/result"; // ví dụ frontend React

        if (calculatedHash.equals(vnp_SecureHash)) {
            String status = "failure";
            if ("00".equals(params.get("vnp_ResponseCode"))) {
                status = "success";
            }
            response.sendRedirect(frontendUrl + "?status=" + status + "&amount=" + params.get("vnp_Amount") + "&type=" + type);
        } else {
            response.sendRedirect(frontendUrl + "?status=invalid-signature");
        }
    }

    @GetMapping("/payment/revenue")
    public ResponseEntity<Map<String, Map<String, BigDecimal>>> getRevenue(
            @RequestParam int year,
            @RequestParam(required = false) Integer month) {

        Map<String, Map<String, BigDecimal>> revenueMap = paymentService.getRevenueByType(year, month);

        // Xóa key null nếu có
        Map<String, Map<String, BigDecimal>> cleanMap = revenueMap.entrySet().stream()
                .filter(e -> e.getKey() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                        (a, b) -> a, LinkedHashMap::new));

        return ResponseEntity.ok(cleanMap);
    }




    @GetMapping("/payments")
    public Page<Map<String, Object>> getPayments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "id") String sortBy
    ) {
        return this.paymentService.getPayments(page, size, sortBy)
                .map(p -> {
                    Map<String, Object> paymentMap = new HashMap<>();
                    paymentMap.put("id", p.getId());
                    paymentMap.put("user", p.getReader().getFullName());
                    paymentMap.put("paymentDate", p.getPaymentDate());
                    if (p.getFine() != null) {
                        paymentMap.put("type", "fine");
                    } else {
                        paymentMap.put("type", "Membership");
                    }
                    paymentMap.put("description", p.getTitle());
                    paymentMap.put("amount", p.getAmount());
                    return paymentMap;
                });
    }
}