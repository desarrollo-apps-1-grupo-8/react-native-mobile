package ar.edu.uade.desa1.controller;

import ar.edu.uade.desa1.domain.request.SaveTokenRequest;
import ar.edu.uade.desa1.service.TokenStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private TokenStorageService tokenStorageService;

    @PostMapping("/token")
    public void saveToken(@RequestBody SaveTokenRequest request) {
        tokenStorageService.saveToken(request.getUserId(), request.getToken());
    }
}
