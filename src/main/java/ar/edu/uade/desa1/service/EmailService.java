package ar.edu.uade.desa1.service;

public interface EmailService {
    void sendVerificationEmail(String to, String firstName, String verificationCode);
    void sendRecoverEmail(String to, String firstName, String Token);
} 