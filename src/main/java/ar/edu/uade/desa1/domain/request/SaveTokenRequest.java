package ar.edu.uade.desa1.domain.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SaveTokenRequest {
    private String userId;
    private String token;
}
