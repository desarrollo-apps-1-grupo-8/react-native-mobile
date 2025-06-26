package ar.edu.uade.desa1.service;

import com.google.firebase.messaging.*;
import org.springframework.stereotype.Service;

import java.util.concurrent.ExecutionException;

@Service
public class FirebaseMessagingService {

    public String sendNotification(String title, String body, String token) throws InterruptedException, ExecutionException {
        Notification notification = Notification.builder()
            .setTitle(title)
            .setBody(body)
            .build();

        Message message = Message.builder()
            .setToken(token)
            .setNotification(notification)
            .build();

        return FirebaseMessaging.getInstance().sendAsync(message).get();
    }
}
