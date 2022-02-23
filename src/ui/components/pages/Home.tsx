import { useEffect, useRef, useMemo, memo } from "react";
import { Button } from "ui/theme";
import { createGroup } from "type-route";
import { routes } from "ui/routes";
import { makeStyles, Text, useStyles as useClasslessStyles } from "ui/theme";
import { ReactComponent as OnyxiaLogoSvg } from "ui/assets/svg/OnyxiaLogo.svg";
import { useThunks } from "ui/coreApi";
import { useTranslation } from "ui/i18n/useTranslations";
import { ReactComponent as IconCommunitySvg } from "ui/assets/svg/IconCommunity.svg";
import { ReactComponent as IconServiceSvg } from "ui/assets/svg/IconService.svg";
import { Card as OnyxiaUiCard } from "onyxia-ui/Card";
import type { Link } from "type-route";
import onyxiaNeumorphismDarkModeUrl from "ui/assets/svg/OnyxiaNeumorphismDarkMode.svg";
import onyxiaNeumorphismLightModeUrl from "ui/assets/svg/OnyxiaNeumorphismLightMode.svg";
import homeIllustrationImgUrl from "ui/assets/img/homeIllustration.png";

Home.routeGroup = createGroup([routes.home]);

Home.getDoRequireUserLoggedIn = () => false;

type Props = {
    className?: string;
};

export function Home(props: Props) {
    const { className } = props;

    const { classes, cx } = useStyles();

    const { userAuthenticationThunks } = useThunks();

    const isUserLoggedIn = userAuthenticationThunks.getIsUserLoggedIn();

    const { t } = useTranslation({ Home });

    const catalogExplorerLink = useMemo(() => routes.catalogExplorer().link, []);

    return (
        <div className={cx(classes.root, className)}>
            <div className={classes.hero}>
                <div className={classes.heroTextWrapper}>
                    <OnyxiaLogoSvg className={classes.svg} />
                    <Text typo="display heading">
                        {isUserLoggedIn
                            ? t("welcome", {
                                  "who": userAuthenticationThunks.getUser().firstName,
                              })
                            : t("title")}
                    </Text>
                    <Text typo="subtitle" className={classes.heroSubtitle}>
                        {t("subtitle")}
                    </Text>
                    {!isUserLoggedIn ? (
                        <Button onClick={userAuthenticationThunks.login}>
                            {t("login")}
                        </Button>
                    ) : (
                        <Button href="https://docs.sspcloud.fr/">{t("new user")}</Button>
                    )}
                </div>
            </div>
            <div className={classes.cardsWrapper}>
                <Card
                    Icon={IconServiceSvg}
                    title={t("cardTitle1")}
                    text={t("cardText1")}
                    buttonText={t("cardButton1")}
                    link={catalogExplorerLink}
                />
                <Card
                    className={classes.middleCard}
                    Icon={IconCommunitySvg}
                    title={t("cardTitle2")}
                    text={t("cardText2")}
                    buttonText={t("cardButton2")}
                    link={
                        "https://tchap.gouv.fr/#/room/#SSPCloudXDpAw6v:agent.finances.tchap.gouv.fr"
                    }
                />
            </div>
        </div>
    );
}

export declare namespace Home {
    export type I18nScheme = {
        welcome: { who: string };
        login: undefined;
        "new user": undefined;
        title: undefined;
        subtitle: undefined;
        cardTitle1: undefined;
        cardTitle2: undefined;
        cardTitle3: undefined;
        cardText1: undefined;
        cardText2: undefined;
        cardText3: undefined;
        cardButton1: undefined;
        cardButton2: undefined;
        cardButton3: undefined;
    };
}

const useStyles = makeStyles({ "name": { Home } })(theme => ({
    "root": {
        "height": "100%",
        "overflow": "auto",
        "backgroundColor": "transparent",
        "display": "flex",
        "flexDirection": "column",
    },
    "hero": {
        "flex": 1,
        "backgroundImage": `url(${homeIllustrationImgUrl}), url(${
            theme.isDarkModeEnabled
                ? onyxiaNeumorphismDarkModeUrl
                : onyxiaNeumorphismLightModeUrl
        })`,
        "backgroundPosition": "171% 38%, 100% 0%",
        "backgroundRepeat": "no-repeat, no-repeat",
        "backgroundSize": "76%, 80%",
    },
    "heroTextWrapper": {
        "paddingLeft": theme.spacing(3),
        "maxWidth": "42%",
        "& > *": {
            "marginBottom": theme.spacing(4),
        },
    },
    "heroSubtitle": {
        "marginBottom": theme.spacing(5),
    },
    "cardsWrapper": {
        "borderTop": `1px solid ${theme.colors.useCases.typography.textPrimary}`,
        "display": "flex",
        ...theme.spacing.topBottom("padding", 4),
        "& > *": {
            "flex": 1,
        },
    },
    "middleCard": {
        ...theme.spacing.rightLeft("margin", 3),
    },
    "svg": {
        "fill": theme.colors.useCases.typography.textFocus,
        "width": 122,
    },
}));

const { Card } = (() => {
    type Props = {
        className?: string;
        title: string;
        text: string;
        buttonText: string;
        Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
        link: Link | string;
    };

    const Card = memo((props: Props) => {
        const { title, text, buttonText, Icon, className, link } = props;

        const { css, cx, theme } = useClasslessStyles();

        const iconRef = useRef<SVGSVGElement>(null);

        useEffect(() => {
            iconRef
                .current!.querySelectorAll("g")
                .forEach(g =>
                    g.setAttribute(
                        "fill",
                        g.classList.contains("colorPrimary")
                            ? theme.colors.useCases.typography.textFocus
                            : theme.colors.useCases.typography.textPrimary,
                    ),
                );
        }, [theme]);

        return (
            <OnyxiaUiCard
                className={cx(
                    css({
                        "display": "flex",
                        "flexDirection": "column",
                        "padding": theme.spacing(4),
                        "backgroundColor": theme.isDarkModeEnabled
                            ? "#383E50"
                            : undefined,
                    }),
                    className,
                )}
            >
                <div className={css({ "display": "flex" })}>
                    <Icon ref={iconRef} width={120} height={120} />
                    <div
                        className={css({
                            "flex": 1,
                            "display": "flex",
                            "alignItems": "center",
                            ...theme.spacing.rightLeft("padding", 4),
                        })}
                    >
                        <Text typo="section heading">{title}</Text>
                    </div>
                </div>
                <div
                    className={css({
                        "flex": 1,
                        "display": "flex",
                        "flexDirection": "column",
                        "paddingTop": theme.spacing(3),
                    })}
                >
                    <div className={css({ "flex": 1 })}>
                        <Text typo="body 1">{text}</Text>
                    </div>
                    <div
                        className={css({
                            "marginTop": theme.spacing(5),
                            "display": "flex",
                        })}
                    >
                        <div style={{ "flex": 1 }} />
                        <Button
                            variant="secondary"
                            {...(typeof link === "string" ? { "href": link } : link)}
                        >
                            {buttonText}
                        </Button>
                    </div>
                </div>
            </OnyxiaUiCard>
        );
    });

    return { Card };
})();
