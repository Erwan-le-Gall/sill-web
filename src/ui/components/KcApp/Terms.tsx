import { memo } from "react";
import { Template } from "./Template";
import type { KcProps } from "keycloakify";
import { useDownloadTerms, getMsg } from "keycloakify";
import { Button } from "ui/theme";
import { makeStyles } from "ui/theme";
import type { KcContext } from "./kcContext";
import { thermOfServicesPassedByClient } from "ui/termsOfServices";
import { createResolveLocalizedString } from "sill-api/tools/LocalizedString";
import type { KcLanguageTag } from "keycloakify";
import { id } from "tsafe/id";
import type { fallbackLanguage } from "ui/i18n/translations";

type KcContext_Terms = Extract<KcContext, { pageId: "terms.ftl" }>;

export const Terms = memo(
    ({ kcContext, ...props }: { kcContext: KcContext_Terms } & KcProps) => {
        const { msg, msgStr } = getMsg(kcContext);

        const { url } = kcContext;

        useDownloadTerms({
            kcContext,
            "downloadTermMarkdown": ({ currentKcLanguageTag }) => {
                const url = (() => {
                    const termsOfServices = thermOfServicesPassedByClient;

                    if (termsOfServices === undefined) {
                        return undefined;
                    }

                    const { resolveLocalizedString } =
                        createResolveLocalizedString<KcLanguageTag>({
                            "currentLanguage": currentKcLanguageTag,
                            "fallbackLanguage": id<typeof fallbackLanguage>("en"),
                        });

                    return resolveLocalizedString(termsOfServices);
                })();

                return url === undefined
                    ? Promise.resolve(
                          [
                              "There was no therms of service provided in the Onyxia-web configuration.",
                              "Provide it or disable therms as required action in Keycloak",
                          ].join(" "),
                      )
                    : fetch(url).then(response => response.text());
            },
        });

        const { classes } = useStyles();

        return (
            <Template
                {...{ kcContext, ...props }}
                doFetchDefaultThemeResources={false}
                displayMessage={false}
                headerNode={null}
                formNode={
                    <>
                        <div className={classes.markdownWrapper}>{msg("termsText")}</div>

                        <form
                            className="form-actions"
                            action={url.loginAction}
                            method="POST"
                        >
                            <div className={classes.buttonsWrapper}>
                                <Button variant="secondary" name="cancel" type="submit">
                                    {msgStr("doDecline")}
                                </Button>
                                <Button
                                    tabIndex={1}
                                    className={classes.buttonSubmit}
                                    name="accept"
                                    autoFocus={true}
                                    type="submit"
                                >
                                    {msgStr("doAccept")}
                                </Button>
                            </div>
                        </form>
                    </>
                }
            />
        );
    },
);

const useStyles = makeStyles({ "name": { Terms } })(theme => ({
    "buttonsWrapper": {
        "marginTop": theme.spacing(4),
        "display": "flex",
        "justifyContent": "flex-end",
    },
    "buttonSubmit": {
        "marginLeft": theme.spacing(2),
    },
    "markdownWrapper": {
        "& a": {
            "color": theme.colors.useCases.buttons.actionActive,
        },
        "& a:hover": {
            "textDecoration": "underline",
        },
    },
}));
