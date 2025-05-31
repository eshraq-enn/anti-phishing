package com.phishing.antiphishing.service;

import com.phishing.antiphishing.model.EmailAnalysis;
import com.phishing.antiphishing.model.User;
import com.phishing.antiphishing.repository.EmailAnalysisRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.ArrayList; // Add this line

@Service
@RequiredArgsConstructor
public class EmailAnalysisService {
    private final EmailAnalysisRepository emailAnalysisRepository;
    private static final Pattern URL_PATTERN = Pattern.compile(
            "http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+");

    @Transactional
    public EmailAnalysis analyzeEmail(String content, String subject, User user) {
        EmailAnalysis analysis = new EmailAnalysis();
        analysis.setUser(user);
        analysis.setContent(content);
        analysis.setSubject(subject);

        // Extract and analyze links
        List<String> links = extractLinks(content);
        analysis.setLinks(links);

        // Calculate risk score (règles)
        double riskScore = calculateRiskScore(content, subject, links);
        analysis.setRiskScore(riskScore);
        analysis.setIsPhishing(riskScore > 0.7);

        // Appel IA
        try {
            RestTemplate restTemplate = new RestTemplate();
            String aiApiUrl = "http://127.0.0.1:5005/predict";
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            ObjectMapper mapper = new ObjectMapper();
            ObjectNode json = mapper.createObjectNode();
            json.put("subject", subject);
            json.put("content", content);
            HttpEntity<String> request = new HttpEntity<>(mapper.writeValueAsString(json), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(aiApiUrl, request, String.class);
            JsonNode node = mapper.readTree(response.getBody());
            if (node.has("error")) {
                String errorMsg = node.get("error").asText();
                String details = generateAnalysisDetails(content, subject, links, analysis.getRiskScore());
                details += "\n[IA] Erreur lors de la prédiction IA : " + errorMsg;
                analysis.setAnalysisDetails(details);
            } else {
                boolean aiPhishing = node.get("isPhishing").asBoolean();
                double aiConfidence = node.get("confidence").asDouble();
                // Combiner IA et règles
                if (aiPhishing && aiConfidence > 0.7) {
                    analysis.setIsPhishing(true);
                    analysis.setRiskScore(Math.max(analysis.getRiskScore(), aiConfidence));
                }
                String details = generateAnalysisDetails(content, subject, links, analysis.getRiskScore());
                details += String.format("\n[IA] Prédiction IA : %s (confiance : %.2f)",
                        aiPhishing ? "Phishing" : "Sûr", aiConfidence);
                analysis.setAnalysisDetails(details);
            }
        } catch (Exception e) {
            String details = generateAnalysisDetails(content, subject, links, analysis.getRiskScore());
            details += "\n[IA] Erreur lors de la prédiction IA : " + e.getMessage();
            analysis.setAnalysisDetails(details);
        }

        return emailAnalysisRepository.save(analysis);
    }

    private List<String> extractLinks(String content) {
        List<String> links = new ArrayList<>();
        Matcher matcher = URL_PATTERN.matcher(content);
        while (matcher.find()) {
            links.add(matcher.group());
        }
        return links;
    }

    private double calculateRiskScore(String content, String subject, List<String> links) {
        double score = 0.0;

        // Check for urgency in subject
        if (subject.toLowerCase().contains("urgent") ||
                subject.toLowerCase().contains("immediate") ||
                subject.toLowerCase().contains("action required")) {
            score += 0.2;
        }

        // Check for suspicious links
        for (String link : links) {
            if (isSuspiciousLink(link)) {
                score += 0.3;
            }
        }

        // Check for suspicious content patterns
        if (content.toLowerCase().contains("password") ||
                content.toLowerCase().contains("account") ||
                content.toLowerCase().contains("verify") ||
                content.toLowerCase().contains("confirm")) {
            score += 0.2;
        }

        // Ajout de points si le contenu contient des phrases typiques de phishing
        if (hasSuspiciousKeywords(content)) {
            score += 0.3;
        }

        // Check for poor grammar
        if (hasPoorGrammar(content)) {
            score += 0.1;
        }

        return Math.min(score, 1.0);
    }

    private boolean isSuspiciousLink(String link) {
        // Add more sophisticated link checking logic here
        return link.contains("login") ||
                link.contains("account") ||
                link.contains("verify") ||
                link.contains("confirm");
    }

    private boolean hasPoorGrammar(String content) {
        // Add more sophisticated grammar checking logic here
        return content.contains("Dear Sir/Madam") ||
                content.contains("Kindly") ||
                content.contains("Please be informed");
    }

    private String generateAnalysisDetails(String content, String subject, List<String> links, double riskScore) {
        StringBuilder details = new StringBuilder();
        details.append("Email Analysis Report\n");
        details.append("====================\n\n");

        details.append("Risk Score: ").append(String.format("%.2f", riskScore)).append("\n");
        details.append("Classification: ").append(riskScore > 0.7 ? "Likely Phishing" : "Likely Safe").append("\n\n");

        details.append("Subject Analysis:\n");
        details.append("- Contains urgency indicators: ").append(subject.toLowerCase().contains("urgent")).append("\n");

        details.append("\nContent Analysis:\n");
        details.append("- Contains suspicious keywords: ").append(hasSuspiciousKeywords(content)).append("\n");
        details.append("- Grammar quality: ").append(hasPoorGrammar(content) ? "Poor" : "Good").append("\n");

        details.append("\nLink Analysis:\n");
        for (String link : links) {
            details.append("- ").append(link).append(": ").append(isSuspiciousLink(link) ? "Suspicious" : "Safe")
                    .append("\n");
        }

        return details.toString();
    }

    private boolean hasSuspiciousKeywords(String content) {
        String[] suspiciousKeywords = {
                "password", "account", "verify", "confirm", "login",
                "security", "update", "suspended", "blocked", "verify",
                "limité", "restreint", "temporairement limité", "votre compte a été limité",
                "certaines options de votre compte ne seront pas disponibles",
                "veuillez vérifier", "veuillez confirmer", "votre compte est suspendu"
        };

        String lowerContent = content.toLowerCase();
        for (String keyword : suspiciousKeywords) {
            if (lowerContent.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    public List<EmailAnalysis> getUserAnalyses(User user) {
        return emailAnalysisRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public EmailAnalysis getAnalysisById(Long id) {
        return emailAnalysisRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Analysis not found with id: " + id));
    }
}