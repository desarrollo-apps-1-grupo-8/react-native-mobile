package ar.edu.uade.desa1.controller;

import ar.edu.uade.desa1.domain.request.AuthLoginRequest;
import ar.edu.uade.desa1.domain.request.AuthRegisterRequest;
import ar.edu.uade.desa1.domain.request.PasswordRecoveryRequest;
import ar.edu.uade.desa1.domain.request.PasswordResetRequest;
import ar.edu.uade.desa1.domain.response.AuthLoginResponse;
import ar.edu.uade.desa1.domain.response.AuthRegisterResponse;
import ar.edu.uade.desa1.service.AuthServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class AuthController {

    private final AuthServiceImpl authService;

    @PostMapping("/register")
    public ResponseEntity<AuthRegisterResponse> register(@RequestBody AuthRegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthLoginResponse> login(@RequestBody AuthLoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }   

    /*
     *  @PostMapping("/recover")
    public ResponseEntity<String> recoverPassword(@RequestBody PasswordRecoveryRequest request) {
        authService.recoverPassword(request.getEmail());
        return ResponseEntity.ok("Se ha enviado un token de recuperación.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody PasswordResetRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Contraseña actualizada correctamente.");
    }
     */
   


}
