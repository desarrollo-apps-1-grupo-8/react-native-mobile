package ar.edu.uade.desa1.exception;

public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException(String message) {
        super(message);
    }

    public UserAlreadyExistsException(Long email) {
        super("User with email " + email + " already exists.");
    }

}
