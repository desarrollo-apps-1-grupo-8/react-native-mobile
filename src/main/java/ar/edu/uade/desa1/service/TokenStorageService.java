package ar.edu.uade.desa1.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class TokenStorageService {

    private final Map<String, String> tokensByUser = new HashMap<>();

    public void saveToken(String userId, String token) {
        tokensByUser.put(userId, token);
    }

    public String getToken(String userId) {
        return tokensByUser.get(userId);
    }
}
