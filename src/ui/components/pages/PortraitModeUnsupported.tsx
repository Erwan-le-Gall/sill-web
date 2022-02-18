import { memo } from "react";
import { useTranslation } from "ui/i18n/useTranslations";
import { makeStyles, Text } from "ui/theme";

export type Props = {
    className?: string;
};

export const PortraitModeUnsupported = memo((props: Props) => {
    const { className } = props;

    const { t } = useTranslation({ PortraitModeUnsupported });

    const { classes, cx } = useStyles();

    return (
        <div className={cx(classes.root, className)}>
            <div className={classes.wrapper}>
                <Text typo="section heading">{t("portrait mode not supported")} 🙇</Text>
                <Text typo="body 1" className={classes.instructions}>
                    {t("instructions")}
                </Text>
            </div>
        </div>
    );
});

const useStyles = makeStyles({ "name": { PortraitModeUnsupported } })(theme => ({
    "root": {
        "height": "100vh",
        "display": "flex",
        "alignItems": "center",
    },
    "wrapper": {
        "textAlign": "center",
    },
    "instructions": {
        "marginTop": theme.spacing(3),
    },
}));

export declare namespace PortraitModeUnsupported {
    export type I18nScheme = {
        "portrait mode not supported": undefined;
        "instructions": undefined;
    };
}
