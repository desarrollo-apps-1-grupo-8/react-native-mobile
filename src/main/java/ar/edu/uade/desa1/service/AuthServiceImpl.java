package ar.edu.uade.desa1.service;

import ar.edu.uade.desa1.config.JwtUtil;
import ar.edu.uade.desa1.domain.entity.Role;
import ar.edu.uade.desa1.domain.entity.User;
import ar.edu.uade.desa1.domain.request.AuthLoginRequest;
import ar.edu.uade.desa1.domain.request.AuthRegisterRequest;
import ar.edu.uade.desa1.domain.response.AuthLoginResponse;
import ar.edu.uade.desa1.domain.response.AuthRegisterResponse;
import ar.edu.uade.desa1.exception.NotFoundException;
import ar.edu.uade.desa1.exception.UserAlreadyExistsException;
import ar.edu.uade.desa1.repository.RoleRepository;
import ar.edu.uade.desa1.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    public static final String USER_REGISTERED_SUCCESSFULLY = "User registered successfully.";
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;


    @Transactional
    public AuthRegisterResponse register(AuthRegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException(request.getEmail());
        }

        Role role = roleRepository.findById((request.getRoleId()))
                .orElseThrow(() -> new NotFoundException("Role id " + request.getRoleId() + " does not exists."));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .dni(request.getDni())
                .phone(request.getPhone())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .active("true")
                .build();

        User savedUser = userRepository.save(user);

        return AuthRegisterResponse.builder()
                .message(USER_REGISTERED_SUCCESSFULLY)
                .createdUserId(savedUser.getId().toString())
                .build();
    }

    @Override
    public AuthLoginResponse login(AuthLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));
    
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Contraseña incorrecta");
        }
    
        String token = jwtUtil.generateToken(user.getEmail());
    
        return new AuthLoginResponse(token);
    }

    

}
