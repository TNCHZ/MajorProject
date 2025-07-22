package com.tnc.library.configs;

import com.cloudinary.Cloudinary;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary(){
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "dqlk15sot");
        config.put("api_key", "277286143587839");
        config.put("api_secret", "qDbT7U85sEMNEKvcVHARyWdbB54");
        return new Cloudinary(config);
    }
}