package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.request.AuthRegisterRequest;
import ar.edu.uade.desa1.domain.response.AuthRegisterResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    public static final String USER_REGISTERED_SUCCESSFULLY = "User registered successfully.";

    public AuthRegisterResponse register(AuthRegisterRequest request) {
        return AuthRegisterResponse.builder().message(USER_REGISTERED_SUCCESSFULLY).createdUserId("123").build();
    }

}
