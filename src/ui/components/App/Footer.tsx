import { memo } from "react";
import { makeStyles, Text, LanguageSelect } from "ui/theme";
import { useTranslation } from "ui/i18n/useTranslations";
import { ReactComponent as GitHubSvg } from "ui/assets/svg/GitHub.svg";
import { useLng } from "ui/i18n/useLng";
import { DarkModeSwitch } from "onyxia-ui/DarkModeSwitch";

export type Props = {
    className?: string;
    packageJsonVersion: string;
    contributeUrl: string;
    tosUrl: string | undefined;
};

export const Footer = memo((props: Props) => {
    const { contributeUrl, tosUrl, packageJsonVersion, className } = props;

    const { classes, cx } = useStyles(props);

    const { t } = useTranslation({ Footer });

    const { lng, setLng } = useLng();

    const spacing = <div className={classes.spacing} />;

    return (
        <footer className={cx(classes.root, className)}>
            <Text typo="body 2">2017 - 2022 Onyxia, InseefrLab</Text>
            {spacing}
            <a
                href={contributeUrl}
                className={classes.contribute}
                target="_blank"
                rel="noreferrer"
            >
                <GitHubSvg className={classes.icon} />
                &nbsp;
                <Text typo="body 2">{t("contribute")}</Text>
            </a>
            <div className={classes.sep} />
            <LanguageSelect
                language={lng}
                onLanguageChange={setLng}
                variant="small"
                changeLanguageText={t("change language")}
            />
            {spacing}
            {tosUrl !== undefined && (
                <>
                    <a href={tosUrl} target="_blank" rel="noreferrer">
                        {" "}
                        <Text typo="body 2">{t("terms of service")}</Text>{" "}
                    </a>
                    {spacing}
                </>
            )}
            <a
                href={`https://github.com/InseeFrLab/onyxia-web/tree/v${packageJsonVersion}`}
                target="_blank"
                rel="noreferrer"
            >
                <Text typo="body 2">v{packageJsonVersion} </Text>
            </a>
            {spacing}
            <DarkModeSwitch size="extra small" className={classes.darkModeSwitch} />
        </footer>
    );
});

export declare namespace Footer {
    export type I18nScheme = {
        "contribute": undefined;
        "terms of service": undefined;
        "change language": undefined;
    };
}

const useStyles = makeStyles<Props>({ "name": { Footer } })(theme => ({
    "root": {
        "backgroundColor": theme.colors.useCases.surfaces.background,
        "display": "flex",
        "alignItems": "center",
        "& a:hover": {
            "textDecoration": "underline",
            "textDecorationColor": theme.colors.useCases.typography.textPrimary,
        },
    },
    "icon": {
        "fill": theme.colors.useCases.typography.textPrimary,
    },
    "contribute": {
        "display": "flex",
        "alignItems": "center",
    },
    "sep": {
        "flex": 1,
    },
    "spacing": {
        "width": theme.spacing(4),
    },
    "darkModeSwitch": {
        "padding": 0,
    },
}));
