package ar.edu.uade.desa1.domain.request;

import lombok.Data;

//mapea la info de un JSON cuando alguien hace un Post a ese objeto.
//Es una clase que representa los datos que recibe el backend cuando un usuario intenta iniciar sesión.
@Data
public class AuthLoginRequest {
    private String email;
    private String password;
}

