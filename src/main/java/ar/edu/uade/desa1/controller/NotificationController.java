package ar.edu.uade.desa1.controller;

import ar.edu.uade.desa1.domain.request.SaveTokenRequest;
import ar.edu.uade.desa1.service.FirebaseMessagingService;
import ar.edu.uade.desa1.service.TokenStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private TokenStorageService tokenStorageService;
    @Autowired
    private FirebaseMessagingService firebaseMessagingService;

    @PostMapping("/token")
    public void saveToken(@RequestBody SaveTokenRequest request) {
        tokenStorageService.saveToken(request.getUserId(), request.getToken());
    }
@PostMapping("/send-test")
public ResponseEntity<String> sendTest(@RequestBody Map<String, String> body) {
    String userId = body.get("userId");
    String token = tokenStorageService.getToken(userId);

    if (token == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Token no registrado para userId=" + userId);
    }

    try {
        firebaseMessagingService.sendNotification(
            "¡Nueva ruta de prueba!",
            "Este es un mensaje de prueba para el usuario " + userId,
            token
        );
        return ResponseEntity.ok("Notificación enviada");
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Error al enviar notificación: " + e.getMessage());
    }
}


    
}
