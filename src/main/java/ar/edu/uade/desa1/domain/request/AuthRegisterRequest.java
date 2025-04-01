package ar.edu.uade.desa1.domain.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthRegisterRequest {
    private String email;
    private String password;
    private String roleId;
    private String firstName;
    private String lastName;
    private String dni;
    private String phone;
}
