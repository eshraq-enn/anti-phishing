package com.phishing.antiphishing.controller;

import com.phishing.antiphishing.model.EmailAnalysis;
import com.phishing.antiphishing.model.User;
import com.phishing.antiphishing.service.EmailAnalysisService;
import com.phishing.antiphishing.service.ReportGenerationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;

@RestController
@RequestMapping("/api/email-analysis")
@RequiredArgsConstructor
@Tag(name = "Email Analysis", description = "API d'analyse d'emails")
@SecurityRequirement(name = "bearerAuth")
public class EmailAnalysisController {
    private final EmailAnalysisService emailAnalysisService;
    private final ReportGenerationService reportGenerationService;

    @Operation(summary = "Analyser le contenu d'un email", description = "Analyse le contenu d'un email pour détecter les tentatives de phishing")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Analyse réussie", content = @Content(schema = @Schema(implementation = EmailAnalysis.class))),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    @PostMapping("/analyze")
    public ResponseEntity<EmailAnalysis> analyzeEmail(
            @RequestBody EmailAnalysisRequest request,
            @AuthenticationPrincipal User user) {
        EmailAnalysis analysis = emailAnalysisService.analyzeEmail(request.getContent(), request.getSubject(), user);
        return ResponseEntity.ok(analysis);
    }

    @Operation(summary = "Analyser un fichier email", description = "Analyse un fichier email pour détecter les tentatives de phishing")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Analyse réussie", content = @Content(schema = @Schema(implementation = EmailAnalysis.class))),
            @ApiResponse(responseCode = "400", description = "Fichier invalide"),
            @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    @PostMapping(value = "/analyze-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<EmailAnalysis> analyzeEmailFile(
            @Parameter(description = "Fichier email à analyser", required = true) @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) throws IOException {
        String content = new String(file.getBytes());
        String subject = file.getOriginalFilename();
        EmailAnalysis analysis = emailAnalysisService.analyzeEmail(content, subject, user);
        return ResponseEntity.ok(analysis);
    }

    @Operation(summary = "Obtenir l'historique des analyses", description = "Récupère l'historique des analyses d'emails de l'utilisateur")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Historique récupéré avec succès", content = @Content(schema = @Schema(implementation = EmailAnalysis.class))),
            @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    @GetMapping("/history")
    public ResponseEntity<List<EmailAnalysis>> getUserAnalysisHistory(
            @AuthenticationPrincipal User user) {
        List<EmailAnalysis> analyses = emailAnalysisService.getUserAnalyses(user);
        return ResponseEntity.ok(analyses);
    }

    @Operation(summary = "Obtenir une analyse spécifique", description = "Récupère les détails d'une analyse d'email spécifique")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Analyse récupérée avec succès", content = @Content(schema = @Schema(implementation = EmailAnalysis.class))),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès non autorisé"),
            @ApiResponse(responseCode = "404", description = "Analyse non trouvée")
    })
    @GetMapping("/{id}")
    public ResponseEntity<EmailAnalysis> getAnalysisById(
            @Parameter(description = "ID de l'analyse", required = true) @PathVariable Long id,
            @AuthenticationPrincipal User user) {

        EmailAnalysis analysis = emailAnalysisService.getAnalysisById(id);

        if (!analysis.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to access this analysis");
        }

        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/export/pdf")
    public ResponseEntity<byte[]> exportPdf(@RequestBody EmailAnalysis analysis) throws IOException {
        byte[] pdf = reportGenerationService.generatePdfReport(analysis);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport-analyse.pdf");
        headers.setContentType(MediaType.APPLICATION_PDF);
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @PostMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv(@RequestBody EmailAnalysis analysis) {
        List<EmailAnalysis> analyses = List.of(analysis);
        String csv = reportGenerationService.generateCsvReport(analyses);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport-analyse.csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        return ResponseEntity.ok().headers(headers).body(csv.getBytes());
    }

    @PostMapping("/export/pdf/{id}")
    public ResponseEntity<byte[]> exportPdfById(@PathVariable Long id, @AuthenticationPrincipal User user)
            throws IOException {
        EmailAnalysis analysis = emailAnalysisService.getAnalysisById(id);
        if (!analysis.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to access this analysis");
        }
        byte[] pdf = reportGenerationService.generatePdfReport(analysis);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport-analyse.pdf");
        headers.setContentType(MediaType.APPLICATION_PDF);
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @PostMapping("/export/csv/{id}")
    public ResponseEntity<byte[]> exportCsvById(@PathVariable Long id, @AuthenticationPrincipal User user) {
        EmailAnalysis analysis = emailAnalysisService.getAnalysisById(id);
        if (!analysis.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You are not authorized to access this analysis");
        }
        List<EmailAnalysis> analyses = List.of(analysis);
        String csv = reportGenerationService.generateCsvReport(analyses);
        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=rapport-analyse.csv");
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        return ResponseEntity.ok().headers(headers).body(csv.getBytes());
    }

    static class EmailAnalysisRequest {
        private String subject;
        private String content;

        public String getSubject() {
            return subject;
        }

        public void setSubject(String subject) {
            this.subject = subject;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}