package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.repository.UserRepository;
import ar.edu.uade.desa1.domain.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TokenStorageService {

    private final UserRepository userRepository;

    @Transactional
    public void saveToken(String userId, String token) {
        Long id = Long.parseLong(userId);
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            user.setPushToken(token);
            userRepository.save(user);
        }
    }

    public String getToken(String userId) {
        Long id = Long.parseLong(userId);
        return userRepository.findById(id)
            .map(User::getPushToken)
            .orElse(null);
    }
}


