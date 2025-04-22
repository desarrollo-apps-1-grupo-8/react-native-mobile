package ar.edu.uade.desa1.service;

public interface EmailService {
    void sendVerificationEmail(String to, String firstName, String type, String verificationCode);
}