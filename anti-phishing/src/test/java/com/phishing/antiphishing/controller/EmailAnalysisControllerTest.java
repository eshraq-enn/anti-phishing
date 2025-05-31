package com.phishing.antiphishing.controller;

import com.phishing.antiphishing.config.RateLimitConfig;
import com.phishing.antiphishing.config.WebConfig;
import com.phishing.antiphishing.config.SecurityConfig;
import com.phishing.antiphishing.model.EmailAnalysis;
import com.phishing.antiphishing.model.User;
import com.phishing.antiphishing.service.EmailAnalysisService;
import io.github.bucket4j.Bucket;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;

import java.util.Arrays;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.junit.jupiter.api.Assertions.assertTrue;

@WebMvcTest(EmailAnalysisController.class)
@Import({ SecurityConfig.class, WebConfig.class })
public class EmailAnalysisControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockBean
    private EmailAnalysisService emailAnalysisService;

    @MockBean
    private RateLimitConfig rateLimitConfig;

    @MockBean
    private WebConfig webConfig;

    @MockBean
    private UserDetailsService userDetailsService;

    private MockMvc mockMvc;
    private User testUser;
    private EmailAnalysis testAnalysis;
    private UserDetails testUserDetails;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        // Setup test user
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setPassword("password");
        testUser.setFirstName("Test");
        testUser.setLastName("User");

        // Create UserDetails for authentication
        testUserDetails = new org.springframework.security.core.userdetails.User(
                testUser.getEmail(),
                testUser.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));

        // Setup test analysis
        testAnalysis = new EmailAnalysis();
        testAnalysis.setId(1L);
        testAnalysis.setUser(testUser);
        testAnalysis.setSubject("Test Subject");
        testAnalysis.setContent("Test Content");
        testAnalysis.setRiskScore(0.5);
        testAnalysis.setIsPhishing(false);

        // Mock rate limit behavior
        @SuppressWarnings("deprecation")
        Bucket mockBucket = Bucket.builder()
                .addLimit(io.github.bucket4j.Bandwidth.simple(100, java.time.Duration.ofHours(1)))
                .build();
        when(rateLimitConfig.resolveBucket(any())).thenReturn(mockBucket);

        // Mock user details service
        when(userDetailsService.loadUserByUsername(anyString())).thenReturn(testUserDetails);

        // Mock service behavior with proper user setup
        when(emailAnalysisService.analyzeEmail(any(), any(), any())).then(invocation -> {
            EmailAnalysis analysis = new EmailAnalysis();
            analysis.setId(1L);
            analysis.setUser(testUser);
            analysis.setSubject("Test Subject");
            analysis.setContent("Test Content");
            analysis.setRiskScore(0.5);
            analysis.setIsPhishing(false);
            return analysis;
        });

        when(emailAnalysisService.getAnalysisById(1L)).then(invocation -> {
            EmailAnalysis analysis = new EmailAnalysis();
            analysis.setId(1L);
            analysis.setUser(testUser);
            analysis.setSubject("Test Subject");
            analysis.setContent("Test Content");
            analysis.setRiskScore(0.5);
            analysis.setIsPhishing(false);
            return analysis;
        });

        when(emailAnalysisService.getUserAnalyses(any())).thenReturn(Arrays.asList(testAnalysis));
    }

    private void setupSecurityContext(User user) {
        SecurityContext securityContext = new SecurityContextImpl();
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                user, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
        securityContext.setAuthentication(auth);
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testAnalyzeEmail() throws Exception {
        setupSecurityContext(testUser);

        mockMvc.perform(post("/api/email-analysis/analyze")
                .param("content", "Test Content")
                .param("subject", "Test Subject")
                .contentType(MediaType.APPLICATION_FORM_URLENCODED))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.subject").value("Test Subject"))
                .andExpect(jsonPath("$.content").value("Test Content"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testAnalyzeEmailFile() throws Exception {
        setupSecurityContext(testUser);

        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.eml",
                MediaType.TEXT_PLAIN_VALUE,
                "Test Content".getBytes());

        mockMvc.perform(multipart("/api/email-analysis/analyze-file")
                .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.subject").value("Test Subject"))
                .andExpect(jsonPath("$.content").value("Test Content"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testGetUserAnalysisHistory() throws Exception {
        setupSecurityContext(testUser);

        mockMvc.perform(get("/api/email-analysis/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].subject").value("Test Subject"))
                .andExpect(jsonPath("$[0].content").value("Test Content"));
    }

    @Test
    @WithMockUser(username = "test@example.com")
    void testGetAnalysisById() throws Exception {
        setupSecurityContext(testUser);

        mockMvc.perform(get("/api/email-analysis/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.subject").value("Test Subject"))
                .andExpect(jsonPath("$.content").value("Test Content"));
    }

    @Test
    @WithMockUser(username = "other@example.com")
    void testGetAnalysisByIdUnauthorized() throws Exception {
        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@example.com");
        otherUser.setPassword("password");
        otherUser.setFirstName("Other");
        otherUser.setLastName("User");

        setupSecurityContext(otherUser);

        mockMvc.perform(get("/api/email-analysis/1"))
                .andExpect(status().isForbidden())
                .andExpect(result -> {
                    Throwable resolved = result.getResolvedException();
                    assertTrue(
                            resolved instanceof org.springframework.security.access.AccessDeniedException ||
                                    (resolved != null && resolved
                                            .getCause() instanceof org.springframework.security.access.AccessDeniedException));
                });
    }
}