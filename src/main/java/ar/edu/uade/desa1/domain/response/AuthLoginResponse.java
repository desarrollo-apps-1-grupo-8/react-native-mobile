package ar.edu.uade.desa1.domain.response;

import lombok.AllArgsConstructor;
import lombok.Data;


//representa la respuesta que el back le va a devolver al front luego de procesar el login.
//Sirve para que si el login es exitoso vamos a devolver algun mensaje o token, que se encapsula en esta clase.
@Data
@AllArgsConstructor
public class AuthLoginResponse {
    private String token;
}
