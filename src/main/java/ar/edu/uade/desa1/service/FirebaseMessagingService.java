package ar.edu.uade.desa1.service;

import okhttp3.*;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class FirebaseMessagingService {

    private final OkHttpClient client = new OkHttpClient();

        public void sendNotification(String title, String message, String expoPushToken, String target) throws IOException {
        if (!expoPushToken.startsWith("ExponentPushToken")) {
            throw new IllegalArgumentException(" Token inválido: no es un ExpoPushToken");
        }

        MediaType JSON = MediaType.get("application/json; charset=utf-8");

        JSONObject json = new JSONObject();
        json.put("to", expoPushToken);
        json.put("title", title);
        json.put("body", message);

        //Se envia un json llamado data para que el front sepa a donde redireccionar, el parametro target va a cambiar depende a donde se quiera redireccionar.
        JSONObject data = new JSONObject();
        data.put("target", target);
        json.put("data", data);


        RequestBody body = RequestBody.create(json.toString(), JSON);
        Request request = new Request.Builder()
                .url("https://exp.host/--/api/v2/push/send")
                .post(body)
                .addHeader("Accept", "application/json")
                .addHeader("Accept-Encoding", "gzip, deflate")
                .addHeader("Content-Type", "application/json")
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                System.err.println(" Error al enviar push a Expo: " + response.code() + " - " + response.message());
            } else {
                System.out.println(" Push enviada con éxito. Respuesta de Expo: " + response.body().string());
            }
        }
    }
}
