import { memo } from "react";
import { makeStyles, Icon, Text } from "ui/theme";

import { useFromNow } from "ui/i18n/useMoment";
import { useTranslation } from "ui/i18n/useTranslations";

export type Props = {
    className?: string;
} & (
    | {
          isRunning: true;
          startTime: number;
          doesHaveBeenRunningForTooLong: boolean;
      }
    | {
          isRunning: false;
      }
);

export const MyServicesRunningTime = memo((props: Props) => {
    const { className } = props;

    const { classes, cx } = useStyles({
        "isOvertime": !props.isRunning ? false : props.doesHaveBeenRunningForTooLong,
    });

    const { fromNowText } = useFromNow({
        "dateTime": props.isRunning ? props.startTime : 0,
    });

    const { t } = useTranslation({ MyServicesRunningTime });

    return (
        <Text typo="label 1" className={cx(classes.root, className)}>
            <Icon iconId="accessTime" className={classes.icon} /> &nbsp;
            {props.isRunning ? fromNowText : t("launching")}
        </Text>
    );
});

export declare namespace MyServicesRunningTime {
    export type I18nScheme = {
        "launching": undefined;
    };
}

const useStyles = makeStyles<{ isOvertime: boolean }>({
    "name": { MyServicesRunningTime },
})((theme, { isOvertime }) => {
    const color = isOvertime
        ? theme.colors.useCases.alertSeverity.warning.main
        : undefined;

    return {
        "root": {
            color,
            "display": "flex",
            "alignItems": "center",
        },
        "icon": {
            color,
        },
    };
});
