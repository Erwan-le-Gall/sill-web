import type { OidcClient } from "../ports/OidcClient";
import keycloak_js from "keycloak-js";
import { id } from "tsafe/id";
import { createKeycloakAdapter } from "keycloakify";
import type { NonPostableEvt } from "evt";
import * as jwtSimple from "jwt-simple";
import type { KcLanguageTag } from "keycloakify";

export async function createKeycloakOidcClient(params: {
    url: string;
    realm: string;
    clientId: string;
    termsOfServices?: string | Partial<Record<KcLanguageTag, string>>;
    transformUrlBeforeRedirectToLogin: (params: {
        url: string;
        termsOfServices: string | Partial<Record<KcLanguageTag, string>> | undefined;
    }) => string;
    evtUserActivity: NonPostableEvt<void>;
    log?: typeof console.log;
}): Promise<OidcClient> {
    const {
        url,
        realm,
        clientId,
        termsOfServices,
        transformUrlBeforeRedirectToLogin,
        evtUserActivity,
        log,
    } = params;

    const keycloakInstance = keycloak_js({ url, realm, clientId });

    const isAuthenticated = await keycloakInstance
        .init({
            "onLoad": "check-sso",
            "silentCheckSsoRedirectUri": `${window.location.origin}/silent-sso.html`,
            "responseMode": "query",
            "checkLoginIframe": false,
            "adapter": createKeycloakAdapter({
                "transformUrlBeforeRedirect": url =>
                    transformUrlBeforeRedirectToLogin({ url, termsOfServices }),
                keycloakInstance,
            }),
        })
        .catch((error: Error) => error);

    //TODO: Make sure that result is always an object.
    if (isAuthenticated instanceof Error) {
        throw isAuthenticated;
    }

    const login: OidcClient.NotLoggedIn["login"] = async () => {
        await keycloakInstance.login({ "redirectUri": window.location.href });

        return new Promise<never>(() => {});
    };

    if (!isAuthenticated) {
        return id<OidcClient.NotLoggedIn>({
            "isUserLoggedIn": false,
            login,
        });
    }

    const oidcClient = id<OidcClient.LoggedIn>({
        "isUserLoggedIn": true,
        "accessToken": keycloakInstance.token!,
        "logout": async ({ redirectTo }) => {
            await keycloakInstance.logout({
                "redirectUri": (() => {
                    switch (redirectTo) {
                        case "current page":
                            return window.location.href;
                        case "home":
                            return window.location.origin;
                    }
                })(),
            });

            return new Promise<never>(() => {});
        },
        "updateTokenInfo": async () => {
            await keycloakInstance.updateToken(-1);

            oidcClient.accessToken = keycloakInstance.token!;
        },
    });

    (function callee() {
        const msBeforeExpiration =
            jwtSimple.decode(oidcClient.accessToken, "", true)["exp"] * 1000 - Date.now();

        setTimeout(async () => {
            log?.(
                `OIDC access token will expire in ${minValiditySecond} seconds, waiting for user activity before renewing`,
            );

            await evtUserActivity.waitFor();

            log?.("User activity detected. Refreshing access token now");

            const error = await keycloakInstance.updateToken(-1).then(
                () => undefined,
                (error: Error) => error,
            );

            if (error) {
                log?.("Can't refresh OIDC access token, getting a new one");
                //NOTE: Never resolves
                await login();
            }

            oidcClient.accessToken = keycloakInstance.token!;

            callee();
        }, msBeforeExpiration - minValiditySecond * 1000);
    })();

    return oidcClient;
}

const minValiditySecond = 25;
