package ar.edu.uade.desa1.domain.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//representa la respuesta que el back le va a devolver al front luego de procesar el login.
//Sirve para que si el login es exitoso vamos a devolver algun mensaje o token, que se encapsula en esta clase.
@Data
@NoArgsConstructor
public class AuthLoginResponse {

    private boolean success;
    private String token;
    private Boolean active; 
    private String status;

    public AuthLoginResponse(boolean success, String token, Boolean active, String status) {
        this.success = success;
        this.token = token;
        this.active = active;
        this.status = status;
    }
}

