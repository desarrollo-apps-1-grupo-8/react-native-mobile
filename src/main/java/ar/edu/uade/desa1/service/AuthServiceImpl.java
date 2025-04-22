package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.config.JwtUtil;
import ar.edu.uade.desa1.domain.entity.PasswordResetToken;
import ar.edu.uade.desa1.domain.entity.Role;
import ar.edu.uade.desa1.domain.entity.User;
import ar.edu.uade.desa1.domain.request.AuthLoginRequest;
import ar.edu.uade.desa1.domain.request.AuthRegisterRequest;
import ar.edu.uade.desa1.domain.request.SendVerificationCodeRequest;
import ar.edu.uade.desa1.domain.request.VerifyCodeRequest;
import ar.edu.uade.desa1.domain.response.AuthLoginResponse;
import ar.edu.uade.desa1.domain.response.AuthRegisterResponse;
import ar.edu.uade.desa1.domain.response.SendVerificationCodeResponse;
import ar.edu.uade.desa1.domain.response.VerifyCodeResponse;
import ar.edu.uade.desa1.exception.NotFoundException;
import ar.edu.uade.desa1.exception.UserAlreadyExistsException;
import ar.edu.uade.desa1.repository.PasswordResetTokenRepository;
import ar.edu.uade.desa1.repository.RoleRepository;
import ar.edu.uade.desa1.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    public static final String USER_REGISTERED_SUCCESSFULLY = "Usuario registrado satisfactoriamente";
    public static final String EMAIL_VERIFIED_SUCCESSFULLY = "Email verificado satisfactoriamente.";
    public static final String OTP_VERIFIED_SUCCESSFULLY = "El OTP se ha verificado correctamente.";
    public static final String INVALID_VERIFICATION_CODE = "Código de verificación inválido o expirado.";
    public static final String EMAIL_ALREADY_VERIFIED = "Email ya verificado.";
    
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final PasswordResetTokenRepository tokenRepository;

    private final EmailService emailService;
    
    @Value("${email.verification.expiration-minutes:15}")
    private int expirationMinutes;

    @Transactional
    public AuthRegisterResponse register(AuthRegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException(request.getEmail());
        }

        Role role = roleRepository.findById((request.getRoleId()))
                .orElseThrow(() -> new NotFoundException("Role id " + request.getRoleId() + " does not exists."));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dni(request.getDni())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active(false)
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        return AuthRegisterResponse.builder()
                .message(USER_REGISTERED_SUCCESSFULLY)
                .createdUserId(savedUser.getId().toString())
                .build();
    }

    @Override
    public AuthLoginResponse login(AuthLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        if (!user.getEmailVerified()) {
            return new AuthLoginResponse(false, null, false, "NEEDS_VERIFICATION");
        }


        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Contraseña incorrecta");
        }
    
        String token = jwtUtil.generateToken(user);
        return new AuthLoginResponse(true, token, true, null);
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }


    @Override
    public VerifyCodeResponse verifyCode(VerifyCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("Usuario con email " + request.getEmail() + " no encontrado"));
        
        if (!request.getRecoverPassword() && user.getEmailVerified() != null && user.getEmailVerified()) {
            return VerifyCodeResponse.builder()
                    .success(true)
                    .message(EMAIL_ALREADY_VERIFIED)
                    .build();
        }
        
        LocalDateTime now = LocalDateTime.now();
        
        if (user.getVerificationCode() != null && 
            user.getVerificationCode().equals(request.getVerificationCode()) && 
            user.getVerificationCodeExpiry() != null && 
            now.isBefore(user.getVerificationCodeExpiry())) {

            if (!request.getRecoverPassword()) {
                user.setEmailVerified(true);
                user.setActive(true);
            }
            user.setVerificationCode(null);
            user.setVerificationCodeExpiry(null);
            
            userRepository.save(user);
            
            return VerifyCodeResponse.builder()
                    .success(true)
                    .message(OTP_VERIFIED_SUCCESSFULLY)
                    .build();
        }
        
        return VerifyCodeResponse.builder()
                .success(false)
                .message(INVALID_VERIFICATION_CODE)
                .build();
    }

    @Override
    public SendVerificationCodeResponse sendVerificationCode(SendVerificationCodeRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new NotFoundException("Usuario con email " + request.getEmail() + " no encontrado"));


        if (user.getEmailVerified() != null && user.getEmailVerified() && !request.getRecoverPassword()) {
            return SendVerificationCodeResponse.builder()
                    .success(false)
                    .message(EMAIL_ALREADY_VERIFIED)
                    .build();
        }

        String verificationCode = generateVerificationCode();
        LocalDateTime verificationCodeExpiry = LocalDateTime.now().plusMinutes(expirationMinutes);

        user.setVerificationCode(verificationCode);
        user.setVerificationCodeExpiry(verificationCodeExpiry);
        userRepository.save(user);
        emailService.sendVerificationEmail(user.getEmail(), user.getFirstName(),
                request.getRecoverPassword() ? "Password" : "Verifica tu Email", verificationCode);

        return SendVerificationCodeResponse.builder()
                .success(true)
                .message("Código de verificación enviado correctamente")
                .build();
    }

    private String generateVerificationCode() {
        Random random = new Random();
        int code = 100000 + random.nextInt(900000);
        return String.valueOf(code);
    }
}
