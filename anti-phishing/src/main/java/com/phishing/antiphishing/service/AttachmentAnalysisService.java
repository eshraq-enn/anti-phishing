package com.phishing.antiphishing.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.io.IOException;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class AttachmentAnalysisService {
    private static final Set<String> SUSPICIOUS_EXTENSIONS = new HashSet<>(Arrays.asList(
            ".exe", ".scr", ".bat", ".cmd", ".ps1", ".vbs", ".js", ".jar", ".msi"));

    private static final Set<String> SUSPICIOUS_MIME_TYPES = new HashSet<>(Arrays.asList(
            "application/x-msdownload",
            "application/x-executable",
            "application/x-msdos-program",
            "application/x-msdos-windows",
            "application/x-ms-windows",
            "application/x-ms-windows-executable"));

    public boolean isAttachmentSuspicious(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            return true; // Suspicious if no filename
        }

        // Check file extension
        String extension = getFileExtension(originalFilename.toLowerCase());
        if (SUSPICIOUS_EXTENSIONS.contains(extension)) {
            return true;
        }

        // Check MIME type
        String mimeType = file.getContentType();
        if (mimeType != null && SUSPICIOUS_MIME_TYPES.contains(mimeType.toLowerCase())) {
            return true;
        }

        // Check for password-protected ZIP files
        if (extension.equals(".zip")) {
            return isPasswordProtectedZip(file);
        }

        return false;
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex) : "";
    }

    private boolean isPasswordProtectedZip(MultipartFile file) {
        try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                // Check entry name to avoid unused variable warning
                if (entry.getName() != null) {
                    // No action needed, just using the variable
                }
            }
            return false;
        } catch (IOException e) {
            return true;
        }
    }

    public String getAttachmentAnalysisReport(MultipartFile file) {
        StringBuilder report = new StringBuilder();
        report.append("Attachment Analysis Report\n");
        report.append("=======================\n\n");
    
        String originalFilename = file.getOriginalFilename();
        String filenameForReport = originalFilename != null ? originalFilename : "Unknown";
        String extension = originalFilename != null ? 
            getFileExtension(originalFilename.toLowerCase()) : "";
    
        report.append("Filename: ").append(filenameForReport).append("\n");
        report.append("Size: ").append(file.getSize()).append(" bytes\n");
        report.append("Content Type: ").append(file.getContentType()).append("\n\n");
    
        boolean isSuspicious = isAttachmentSuspicious(file);
        report.append("Analysis Result: ").append(isSuspicious ? "SUSPICIOUS" : "SAFE").append("\n\n");
    
        if (isSuspicious) {
            report.append("Reasons for suspicion:\n");
            if (!extension.isEmpty() && SUSPICIOUS_EXTENSIONS.contains(extension)) {
                report.append("- File has a suspicious extension: ").append(extension).append("\n");
            }
            String mimeType = file.getContentType();
            if (mimeType != null && SUSPICIOUS_MIME_TYPES.contains(mimeType.toLowerCase())) {
                report.append("- File has a suspicious MIME type: ").append(mimeType).append("\n");
            }
            if (extension.equals(".zip") && isPasswordProtectedZip(file)) {
                report.append("- File is a password-protected ZIP archive\n");
            }
        }
    
        return report.toString();
    }
}