package br.cefet.acolhimed.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Collections;
import java.util.List;

import org.springframework.stereotype.Service;

import com.google.api.client.extensions.jetty.auth.oauth2.LocalServerReceiver;
import com.google.api.gax.core.FixedCredentialsProvider;

import com.google.apps.meet.v2.CreateSpaceRequest;
import com.google.apps.meet.v2.Space;
import com.google.apps.meet.v2.SpacesServiceClient;
import com.google.apps.meet.v2.SpacesServiceSettings;

import com.google.auth.Credentials;
import com.google.auth.oauth2.ClientId;
import com.google.auth.oauth2.DefaultPKCEProvider;
import com.google.auth.oauth2.TokenStore;
import com.google.auth.oauth2.UserAuthorizer;
import com.google.auth.oauth2.UserCredentials;

@Service
public class GoogleMeetService {

    private static final String TOKENS_DIRECTORY_PATH = "tokens";

    private static final List<String> SCOPES = Collections.singletonList(
            "https://www.googleapis.com/auth/meetings.space.created");

    private static final String CREDENTIALS_FILE_PATH = "/credentials.json";

    private static final String USER = "default";

    private String getEnv(String name) {
        String value = System.getenv(name);
        return value == null || value.isBlank() ? null : value;
    }

    private static final TokenStore TOKEN_STORE = new TokenStore() {

        private Path pathFor(String id) {
            return Paths.get(
                    ".",
                    TOKENS_DIRECTORY_PATH,
                    id + ".json");
        }

        @Override
        public String load(String id) throws IOException {

            if (!Files.exists(pathFor(id))) {
                return null;
            }

            return Files.readString(pathFor(id));
        }

        @Override
        public void store(String id, String token) throws IOException {

            Files.createDirectories(
                    Paths.get(".", TOKENS_DIRECTORY_PATH));

            Files.writeString(
                    pathFor(id),
                    token);
        }

        @Override
        public void delete(String id) throws IOException {

            if (Files.exists(pathFor(id))) {
                Files.delete(pathFor(id));
            }
        }
    };

    private ClientId getClientId() throws IOException {
        String clientId = System.getenv("GOOGLE_CLIENT_ID");
        String clientSecret = System.getenv("GOOGLE_CLIENT_SECRET");

        if (clientId != null && !clientId.isBlank() && clientSecret != null && !clientSecret.isBlank()) {
            String credentialsJson = """
                    {
                      "installed": {
                        "client_id": "%s",
                        "client_secret": "%s",
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token",
                        "redirect_uris": ["http://localhost"]
                      }
                    }
                    """.formatted(clientId, clientSecret);

            return ClientId.fromStream(
                    new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8)));
        }

        try (InputStream in = GoogleMeetService.class
                .getResourceAsStream(CREDENTIALS_FILE_PATH)) {

            if (in == null) {
                throw new FileNotFoundException(
                        "credentials.json não encontrado.");
            }

            return ClientId.fromStream(in);
        }
    }

    private UserAuthorizer getAuthorizer(URI callbackUri)
            throws IOException {

        ClientId clientId = getClientId();

        return UserAuthorizer.newBuilder()
                .setClientId(clientId)
                .setCallbackUri(callbackUri)
                .setScopes(SCOPES)
                .setPKCEProvider(new DefaultPKCEProvider() {

                    @Override
                    public String getCodeChallenge() {
                        return super.getCodeChallenge()
                                .split("=")[0];
                    }
                })
                .setTokenStore(TOKEN_STORE)
                .build();
    }

    private Credentials getCredentials() throws Exception {
        String clientId = getEnv("GOOGLE_CLIENT_ID");
        String clientSecret = getEnv("GOOGLE_CLIENT_SECRET");
        String refreshToken = getEnv("GOOGLE_REFRESH_TOKEN");

        if (clientId != null && clientSecret != null && refreshToken != null) {
            return UserCredentials.newBuilder()
                    .setClientId(clientId)
                    .setClientSecret(clientSecret)
                    .setRefreshToken(refreshToken)
                    .build();
        }

        if (!"true".equalsIgnoreCase(getEnv("GOOGLE_ALLOW_LOCAL_OAUTH"))) {
            throw new IllegalStateException(
                    "Configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET e GOOGLE_REFRESH_TOKEN para criar reuniões do Google Meet.");
        }

        LocalServerReceiver receiver = new LocalServerReceiver.Builder().build();

        try {

            URI callbackUri = URI.create(receiver.getRedirectUri());

            UserAuthorizer authorizer = getAuthorizer(callbackUri);

            // Tenta recuperar um token que já foi salvo
            Credentials credentials = authorizer.getCredentials(USER);

            if (credentials != null) {
                return credentials;
            }

            // Ainda não existe autorização
            URL authorizationUrl = authorizer.getAuthorizationUrl(
                    USER,
                    "",
                    null);

            System.out.println(
                    "Abra esta URL para autorizar o Google:");

            System.out.println(
                    authorizationUrl);

            if (java.awt.Desktop.isDesktopSupported()
                    && java.awt.Desktop
                            .getDesktop()
                            .isSupported(java.awt.Desktop.Action.BROWSE)) {

                java.awt.Desktop
                        .getDesktop()
                        .browse(authorizationUrl.toURI());
            }

            String code = receiver.waitForCode();

            credentials = authorizer.getAndStoreCredentialsFromCode(
                    USER,
                    code,
                    callbackUri);

            return credentials;

        } finally {
            receiver.stop();
        }
    }

    public String criarReuniao() throws Exception {

        Credentials credentials = getCredentials();

        SpacesServiceSettings settings = SpacesServiceSettings.newBuilder()
                .setCredentialsProvider(
                        FixedCredentialsProvider
                                .create(credentials))
                .build();

        try (
                SpacesServiceClient spacesServiceClient = SpacesServiceClient.create(settings)) {

            CreateSpaceRequest request = CreateSpaceRequest.newBuilder()
                    .setSpace(
                            Space.newBuilder().build())
                    .build();

            Space response = spacesServiceClient.createSpace(request);

            return response.getMeetingUri();
        }
    }
}
