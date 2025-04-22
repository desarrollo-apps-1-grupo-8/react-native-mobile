package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.request.AuthLoginRequest;
import ar.edu.uade.desa1.domain.request.AuthRegisterRequest;
import ar.edu.uade.desa1.domain.request.SendVerificationCodeRequest;
import ar.edu.uade.desa1.domain.response.AuthLoginResponse;
import ar.edu.uade.desa1.domain.request.VerifyCodeRequest;
import ar.edu.uade.desa1.domain.response.AuthRegisterResponse;
import ar.edu.uade.desa1.domain.response.SendVerificationCodeResponse;
import ar.edu.uade.desa1.domain.response.VerifyCodeResponse;

import javax.management.relation.RoleNotFoundException;

public interface AuthService {

    AuthRegisterResponse register(AuthRegisterRequest request) throws RoleNotFoundException;
    AuthLoginResponse login(AuthLoginRequest request);
    VerifyCodeResponse verifyCode(VerifyCodeRequest request);
    SendVerificationCodeResponse sendVerificationCode(SendVerificationCodeRequest request);

    void resetPassword(String token, String newPassword);

}
