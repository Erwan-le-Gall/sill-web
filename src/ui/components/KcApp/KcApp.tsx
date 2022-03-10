import { useEffect, memo } from "react";
import { useSplashScreen } from "onyxia-ui";
import { defaultKcProps } from "keycloakify";
import { makeStyles } from "ui/theme";
import { Login } from "./Login";
import { Terms } from "./Terms";
import { LoginUpdateProfile } from "./LoginUpdateProfile";
import { RegisterUserProfile } from "./RegisterUserProfile";
import { getBrowser } from "ui/tools/getBrowser";
import type { KcContext } from "./kcContext";
import { KcApp as KcAppBase } from "keycloakify/lib/components/KcApp";

export type Props = {
    kcContext: KcContext;
};

export const KcApp = memo((props: Props) => {
    const { kcContext } = props;

    const { hideRootSplashScreen } = useSplashScreen({
        "fadeOutDuration": getBrowser() === "firefox" ? 0 : undefined,
    });

    useEffect(() => {
        hideRootSplashScreen();
    }, []);

    const { classes } = useStyles();

    const kcProps = {
        ...defaultKcProps,
        "kcHtmlClass": [...defaultKcProps.kcHtmlClass, classes.kcHtmlClass],
        "kcLoginClass": [...defaultKcProps.kcLoginClass, classes.kcLoginClass],
        "kcFormCardClass": [...defaultKcProps.kcFormCardClass, classes.kcFormCardClass],
        "kcButtonPrimaryClass": [
            ...defaultKcProps.kcButtonPrimaryClass,
            classes.kcButtonPrimaryClass,
        ],
        "kcInputClass": [...defaultKcProps.kcInputClass, classes.kcInputClass],
    };

    switch (kcContext.pageId) {
        case "login.ftl":
            return <Login {...{ kcContext, ...kcProps }} />;
        case "terms.ftl":
            return <Terms {...{ kcContext, ...kcProps }} />;
        case "login-update-profile.ftl":
            return <LoginUpdateProfile {...{ kcContext, ...kcProps }} />;
        case "register-user-profile.ftl":
            return <RegisterUserProfile {...{ kcContext, ...kcProps }} />;
        default:
            return <KcAppBase {...{ kcContext, ...kcProps }} />;
    }
});

const useStyles = makeStyles({ "name": { KcApp } })(theme => ({
    "kcLoginClass": {
        "& #kc-locale": {
            "zIndex": 5,
        },
    },
    "kcHtmlClass": {
        "& body": {
            "fontFamily": theme.typography.fontFamily,
        },
        "background": `${theme.colors.useCases.surfaces.background}`,
        "& a": {
            "color": `${theme.colors.useCases.typography.textFocus}`,
        },
        "& #kc-current-locale-link": {
            "color": `${theme.colors.palette.light.greyVariant3}`,
        },
        "& label": {
            "fontSize": 14,
            "color": theme.colors.palette.light.greyVariant3,
            "fontWeight": "normal",
        },
        "& #kc-page-title": {
            ...theme.typography.variants["page heading"].style,
            "color": theme.colors.palette.dark.main,
        },
        "& #kc-header-wrapper": {
            "visibility": "hidden",
        },
    },
    "kcFormCardClass": {
        "borderRadius": 10,
    },
    "kcButtonPrimaryClass": {
        "backgroundColor": "unset",
        "backgroundImage": "unset",
        "borderColor": `${theme.colors.useCases.typography.textFocus}`,
        "borderWidth": "2px",
        "borderRadius": `20px`,
        "color": `${theme.colors.useCases.typography.textFocus}`,
        "textTransform": "uppercase",
    },
    "kcInputClass": {
        "borderRadius": "unset",
        "border": "unset",
        "boxShadow": "unset",
        "borderBottom": `1px solid ${theme.colors.useCases.typography.textTertiary}`,
        "&:focus": {
            "borderColor": "unset",
            "borderBottom": `1px solid ${theme.colors.useCases.typography.textFocus}`,
        },
    },
}));
