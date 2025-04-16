package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.request.AuthLoginRequest;
import ar.edu.uade.desa1.domain.request.AuthRegisterRequest;
import ar.edu.uade.desa1.domain.response.AuthLoginResponse;
import ar.edu.uade.desa1.domain.request.VerifyEmailRequest;
import ar.edu.uade.desa1.domain.response.AuthRegisterResponse;
import ar.edu.uade.desa1.domain.response.VerifyEmailResponse;

import javax.management.relation.RoleNotFoundException;

public interface AuthService {

    AuthRegisterResponse register(AuthRegisterRequest request) throws RoleNotFoundException;
    AuthLoginResponse login(AuthLoginRequest request);
    VerifyEmailResponse verifyEmail(VerifyEmailRequest request);
}
