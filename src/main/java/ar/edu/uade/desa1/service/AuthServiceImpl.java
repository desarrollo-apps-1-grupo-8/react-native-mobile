package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.entity.Role;
import ar.edu.uade.desa1.domain.entity.User;
import ar.edu.uade.desa1.domain.request.AuthRegisterRequest;
import ar.edu.uade.desa1.domain.request.VerifyEmailRequest;
import ar.edu.uade.desa1.domain.response.AuthRegisterResponse;
import ar.edu.uade.desa1.domain.response.VerifyEmailResponse;
import ar.edu.uade.desa1.exception.NotFoundException;
import ar.edu.uade.desa1.exception.UserAlreadyExistsException;
import ar.edu.uade.desa1.repository.RoleRepository;
import ar.edu.uade.desa1.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    public static final String USER_REGISTERED_SUCCESSFULLY = "User registered successfully. Please check your email for verification instructions.";
    public static final String EMAIL_VERIFIED_SUCCESSFULLY = "Email verified successfully.";
    public static final String INVALID_VERIFICATION_CODE = "Invalid or expired verification code.";
    public static final String VERIFICATION_EMAIL_RESENT = "Verification email has been resent. Please check your inbox.";
    public static final String EMAIL_ALREADY_VERIFIED = "Email already verified.";
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    @Value("${app.email.verification.expiration-minutes:15}")
    private int expirationMinutes;

    @Transactional
    public AuthRegisterResponse register(AuthRegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException(request.getEmail());
        }

        Role role = roleRepository.findById((request.getRoleId()))
                .orElseThrow(() -> new NotFoundException("Role id " + request.getRoleId() + " does not exists."));

        // Generate verification code
        String verificationCode = generateVerificationCode();
        LocalDateTime verificationCodeExpiry = LocalDateTime.now().plusMinutes(expirationMinutes);
        
        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dni(request.getDni())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active("false") // Set to inactive until email is verified
                .verificationCode(verificationCode)
                .verificationCodeExpiry(verificationCodeExpiry)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);
        
        // Send verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationCode);

        return AuthRegisterResponse.builder()
                .message(USER_REGISTERED_SUCCESSFULLY)
                .createdUserId(savedUser.getId().toString())
                .build();
    }
    
    @Override
    public VerifyEmailResponse verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("User with email " + request.getEmail() + " not found"));
        
        if (user.getEmailVerified() != null && user.getEmailVerified()) {
            return VerifyEmailResponse.builder()
                    .success(true)
                    .message(EMAIL_ALREADY_VERIFIED)
                    .build();
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        if (user.getVerificationCode() != null && 
            user.getVerificationCode().equals(request.getVerificationCode()) && 
            user.getVerificationCodeExpiry() != null && 
            now.isBefore(user.getVerificationCodeExpiry())) {
            
            user.setEmailVerified(true);
            user.setActive("true");
            user.setVerificationCode(null);
            user.setVerificationCodeExpiry(null);
            
            userRepository.save(user);
            
            return VerifyEmailResponse.builder()
                    .success(true)
                    .message(EMAIL_VERIFIED_SUCCESSFULLY)
                    .build();
        }
        
        return VerifyEmailResponse.builder()
                .success(false)
                .message(INVALID_VERIFICATION_CODE)
                .build();
    }
    
    @Override
    public VerifyEmailResponse resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User with email " + email + " not found"));
        
        if (user.getEmailVerified() != null && user.getEmailVerified()) {
            return VerifyEmailResponse.builder()
                    .success(false)
                    .message(EMAIL_ALREADY_VERIFIED)
                    .build();
        }
        
        // Generate new verification code
        String verificationCode = generateVerificationCode();
        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiry(LocalDateTime.now().plusMinutes(expirationMinutes));
        userRepository.save(user);
        
        // Resend verification email
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(), verificationCode);
        
        return VerifyEmailResponse.builder()
                .success(true)
                .message(VERIFICATION_EMAIL_RESENT)
                .build();
    }
    
    private String generateVerificationCode() {
        // Generate a 6-digit verification code
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
