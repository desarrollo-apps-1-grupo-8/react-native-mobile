package ar.edu.uade.desa1.domain.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ValidateResetTokenResponse {
    private boolean valid;
}



