package com.phishing.antiphishing.service;

import org.springframework.stereotype.Service;
import java.util.Arrays;
import java.util.List;

@Service
public class ExternalSecurityService {

    private static final List<String> SUSPICIOUS_PATTERNS = Arrays.asList(
            "suspicious", "malware", "virus", "malicious", "hack", "steal",
            "password", "login", "account", "verify", "confirm", "bank",
            "paypal", "amazon", "ebay", "microsoft", "apple", "google",
            "security", "update", "suspended", "blocked");

    public boolean checkGoogleSafeBrowsing(String url) {
        String lowerUrl = url.toLowerCase();
        return !SUSPICIOUS_PATTERNS.stream().anyMatch(lowerUrl::contains);
    }

    public boolean checkVirusTotal(String url) {
        String lowerUrl = url.toLowerCase();
        // Vérification plus stricte pour VirusTotal
        return !lowerUrl.contains("virus") &&
                !lowerUrl.contains("malicious") &&
                !lowerUrl.contains("hack") &&
                !lowerUrl.contains("steal");
    }
}