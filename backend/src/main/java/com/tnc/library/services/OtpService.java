package com.tnc.library.services;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class OtpService {
    private final StringRedisTemplate redisTemplate;

    public OtpService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    // Lưu OTP vào Redis với TTL 5 phút
    public void saveOtp(String key, String otp) {
        redisTemplate.opsForValue().set(key, otp, 5, TimeUnit.MINUTES);
    }

    public void saveResetToken(String email, String token) {
        redisTemplate.opsForValue().set("reset:" + token, email, 10, TimeUnit.MINUTES);
    }

    public String getEmailByResetToken(String token) {
        return redisTemplate.opsForValue().get("reset:" + token);
    }

    // Lấy OTP ra từ Redis
    public String getOtp(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    // Xóa OTP sau khi dùng
    public void deleteOtp(String key) {
        redisTemplate.delete(key);
    }
}
