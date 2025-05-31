package com.phishing.antiphishing.repository;

import com.phishing.antiphishing.model.EmailAnalysis;
import com.phishing.antiphishing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailAnalysisRepository extends JpaRepository<EmailAnalysis, Long> {
    List<EmailAnalysis> findByUserOrderByCreatedAtDesc(User user);
    List<EmailAnalysis> findByIsPhishingTrueOrderByCreatedAtDesc();
} 