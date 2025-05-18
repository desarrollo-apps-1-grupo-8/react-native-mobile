package ar.edu.uade.desa1.controller;

import ar.edu.uade.desa1.domain.request.*;
import ar.edu.uade.desa1.domain.response.AuthLoginResponse;
import ar.edu.uade.desa1.domain.response.AuthRegisterResponse;
import ar.edu.uade.desa1.domain.response.SendVerificationCodeResponse;
import ar.edu.uade.desa1.domain.response.ValidateResetTokenResponse;
import ar.edu.uade.desa1.domain.response.VerifyCodeResponse;
import ar.edu.uade.desa1.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.management.relation.RoleNotFoundException;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthRegisterResponse> register(@RequestBody AuthRegisterRequest request) throws RoleNotFoundException {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthLoginResponse> login(@RequestBody AuthLoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }


    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Contraseña actualizada correctamente.");
    }

    @PostMapping("/verify-code")
    public ResponseEntity<VerifyCodeResponse> verifyCode(@RequestBody VerifyCodeRequest request) {
        return ResponseEntity.ok(authService.verifyCode(request));
    }

    @PostMapping("/send-verification-code")
    public ResponseEntity<SendVerificationCodeResponse> sendVerificationCode(@RequestBody SendVerificationCodeRequest request) {
        return ResponseEntity.ok(authService.sendVerificationCode(request));
    }

    @PostMapping("/validate-reset-token")
    public ResponseEntity<ValidateResetTokenResponse> validateResetToken(@RequestBody ValidateResetTokenRequest request) {
        return ResponseEntity.ok(authService.validateResetToken(request));
    }
}
