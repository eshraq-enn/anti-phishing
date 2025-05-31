package com.phishing.antiphishing.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "email_analyses")
public class EmailAnalysis {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String subject;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "sender_email")
    private String senderEmail;

    @Column(name = "sender_name")
    private String senderName;

    @Column(name = "reply_to")
    private String replyTo;

    @Column(name = "return_path")
    private String returnPath;

    @ElementCollection
    @CollectionTable(name = "email_links", joinColumns = @JoinColumn(name = "email_id"))
    @Column(name = "link")
    private List<String> links = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "email_attachments", joinColumns = @JoinColumn(name = "email_id"))
    @Column(name = "attachment")
    private List<String> attachments = new ArrayList<>();

    @Column(name = "risk_score")
    private Double riskScore;

    @Column(name = "is_phishing")
    private Boolean isPhishing;

    @Column(name = "analysis_details", columnDefinition = "TEXT")
    private String analysisDetails;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}