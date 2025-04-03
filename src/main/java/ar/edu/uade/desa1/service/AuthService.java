package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.domain.request.AuthRegisterRequest;
import ar.edu.uade.desa1.domain.response.AuthRegisterResponse;

import javax.management.relation.RoleNotFoundException;

public interface AuthService {

    AuthRegisterResponse register(AuthRegisterRequest request) throws RoleNotFoundException;
}
