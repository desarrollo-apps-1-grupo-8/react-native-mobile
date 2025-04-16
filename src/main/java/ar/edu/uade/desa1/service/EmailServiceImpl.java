package ar.edu.uade.desa1.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    @Autowired
    private JavaMailSender javaMailSender;
    @Autowired
    private Environment environment;

    @Override
    public void sendVerificationEmail(String to, String firstName, String verificationCode) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
                    message.setFrom(environment.getProperty("spring.mail.username"));
                    message.setTo(to);
                    message.setSubject("Verificación de cuenta");
                    message.setText("Hola " + firstName + ", tu código de verificación es: " + verificationCode);

            javaMailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email", e);
        }
    }
} 