package com.phishing.antiphishing.service;

import com.phishing.antiphishing.model.EmailAnalysis;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportGenerationService {
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public byte[] generatePdfReport(EmailAnalysis analysis) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 20);
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("Email Analysis Report");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.newLineAtOffset(50, 700);
                contentStream.showText("Analysis Date: " + analysis.getCreatedAt().format(DATE_FORMATTER));
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Subject: " + analysis.getSubject());
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Risk Score: " + String.format("%.2f", analysis.getRiskScore()));
                contentStream.newLineAtOffset(0, -20);
                contentStream.showText("Phishing Detection: " + (analysis.getIsPhishing() ? "Yes" : "No"));
                contentStream.endText();

                if (!analysis.getLinks().isEmpty()) {
                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                    contentStream.newLineAtOffset(50, 600);
                    contentStream.showText("Links Analysis");
                    contentStream.endText();

                    contentStream.beginText();
                    contentStream.setFont(PDType1Font.HELVETICA, 12);
                    contentStream.newLineAtOffset(50, 580);
                    for (String link : analysis.getLinks()) {
                        contentStream.showText("- " + link);
                        contentStream.newLineAtOffset(0, -20);
                    }
                    contentStream.endText();
                }

                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 14);
                contentStream.newLineAtOffset(50, 400);
                contentStream.showText("Detailed Analysis");
                contentStream.endText();

                contentStream.beginText();
                contentStream.setFont(PDType1Font.HELVETICA, 12);
                contentStream.newLineAtOffset(50, 380);
                String[] details = analysis.getAnalysisDetails().split("\n");
                for (String detail : details) {
                    contentStream.showText(detail);
                    contentStream.newLineAtOffset(0, -20);
                }
                contentStream.endText();
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    public String generateCsvReport(List<EmailAnalysis> analyses) {
        StringBuilder csv = new StringBuilder();

        // Add header
        csv.append("Date,Subject,Risk Score,Is Phishing,Number of Links,Analysis Details\n");

        // Add data rows
        for (EmailAnalysis analysis : analyses) {
            csv.append(analysis.getCreatedAt().format(DATE_FORMATTER)).append(",");
            csv.append(escapeCsv(analysis.getSubject())).append(",");
            csv.append(String.format("%.2f", analysis.getRiskScore())).append(",");
            csv.append(analysis.getIsPhishing()).append(",");
            csv.append(analysis.getLinks().size()).append(",");
            csv.append(escapeCsv(analysis.getAnalysisDetails())).append("\n");
        }

        return csv.toString();
    }

    private String escapeCsv(String value) {
        if (value == null)
            return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}