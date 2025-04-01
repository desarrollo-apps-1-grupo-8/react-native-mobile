package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.request.AuthRegisterRequest;
import ar.edu.uade.desa1.domain.response.AuthRegisterResponse;

public interface AuthService {

    AuthRegisterResponse register(AuthRegisterRequest request);
}
