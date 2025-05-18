package ar.edu.uade.desa1.domain.request;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class ValidateResetTokenRequest {
    private String email;
    private String reset_token;
}
