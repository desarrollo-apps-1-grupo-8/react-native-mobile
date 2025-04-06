package ar.edu.uade.desa1.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String to, String firstName, String verificationCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setTo(to);
            helper.setSubject("Email Verification");
            
            String content = "<p>Hello " + firstName + ",</p>"
                    + "<p>Please use the following verification code to verify your email address:</p>"
                    + "<h2 style='background-color: #f8f9fa; padding: 10px; text-align: center;'>" + verificationCode + "</h2>"
                    + "<p>This code will expire in 15 minutes.</p>"
                    + "<p>Thank you,<br>UADE Backend Team</p>";
            
            helper.setText(content, true);
            
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }
} 