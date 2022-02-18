import { useState, memo } from "react";
import type { RefObject } from "react";
import { makeStyles } from "ui/theme";
import { useCallbackFactory } from "powerhooks/useCallbackFactory";
import { CatalogExplorerCard } from "./CatalogExplorerCard";
import { useTranslation } from "ui/i18n/useTranslations";
import { Button, Text } from "ui/theme";
import { useConstCallback } from "powerhooks/useConstCallback";
import Link from "@mui/material/Link";
import { ReactComponent as ServiceNotFoundSvg } from "ui/assets/svg/ServiceNotFound.svg";
import { SearchBar } from "onyxia-ui/SearchBar";
import type { SearchBarProps } from "onyxia-ui/SearchBar";
import type { UnpackEvt } from "evt";
import { breakpointsValues } from "onyxia-ui";
import { Evt } from "evt";

export type Props<PackageName extends string = string> = {
    className?: string;
    packages: {
        packageName: PackageName;
        packageIconUrl?: string;
        packageDescription: string;
        packageHomeUrl?: string;
    }[];
    search: string;
    onSearchChange: (search: string) => void;
    onRequestLaunch: (packageName: PackageName) => void;
    onRequestRevealPackagesNotShown: () => void;
    scrollableDivRef: RefObject<HTMLDivElement>;
    notShownPackageCount: number;
};

export const CatalogExplorerCards = memo(
    <PackageName extends string = string>(props: Props<PackageName>) => {
        const {
            className,
            packages,
            search,
            onSearchChange,
            onRequestLaunch,
            onRequestRevealPackagesNotShown,
            scrollableDivRef,
            notShownPackageCount,
        } = props;

        const onRequestLaunchFactory = useCallbackFactory(
            ([packageName]: [PackageName]) => onRequestLaunch(packageName),
        );

        const onShowMoreClick = useConstCallback(() => onRequestRevealPackagesNotShown());

        const { t } = useTranslation({ CatalogExplorerCards });

        const { classes, cx } = useStyles({
            "filteredCardCount": packages.length,
        });

        const [evtSearchBarAction] = useState(() =>
            Evt.create<UnpackEvt<SearchBarProps["evtAction"]>>(),
        );

        const onGoBackClick = useConstCallback(() =>
            evtSearchBarAction.post("CLEAR SEARCH"),
        );

        return (
            <div className={cx(classes.root, className, "foo-bar")}>
                <SearchBar
                    className={classes.searchBar}
                    search={search}
                    evtAction={evtSearchBarAction}
                    onSearchChange={onSearchChange}
                    placeholder={t("search")}
                />
                <div ref={scrollableDivRef} className={classes.cardsWrapper}>
                    {packages.length === 0 ? undefined : (
                        <Text typo="section heading" className={classes.contextTypo}>
                            {t(
                                search !== ""
                                    ? "search results"
                                    : notShownPackageCount === 0
                                    ? "all services"
                                    : "main services",
                            )}
                        </Text>
                    )}
                    <div className={classes.cards}>
                        {packages.length === 0 ? (
                            <NoMatches search={search} onGoBackClick={onGoBackClick} />
                        ) : (
                            packages.map(
                                ({
                                    packageName,
                                    packageIconUrl,
                                    packageDescription,
                                    packageHomeUrl,
                                }) => (
                                    <CatalogExplorerCard
                                        key={packageName}
                                        packageIconUrl={packageIconUrl}
                                        packageName={packageName}
                                        packageDescription={packageDescription}
                                        onRequestLaunch={onRequestLaunchFactory(
                                            packageName,
                                        )}
                                        packageHomeUrl={packageHomeUrl}
                                    />
                                ),
                            )
                        )}
                        {notShownPackageCount !== 0 && (
                            <CardShowMore
                                leftToShowCount={notShownPackageCount}
                                onClick={onShowMoreClick}
                            />
                        )}
                    </div>
                    <div className={classes.bottomScrollSpace} />
                </div>
            </div>
        );
    },
);

export declare namespace CatalogExplorerCards {
    export type I18nScheme = {
        "main services": undefined;
        "all services": undefined;
        "search results": undefined;
        "show more": undefined;
        "no service found": undefined;
        "no result found": { forWhat: string };
        "check spelling": undefined;
        "go back": undefined;
        "search": undefined;
    };
}

const { CardShowMore } = (() => {
    type Props = {
        onClick(): void;
        leftToShowCount: number;
    };

    const useStyles = makeStyles()(() => ({
        "root": {
            "display": "flex",
            "justifyContent": "center",
            "alignItems": "center",
        },
    }));

    const CardShowMore = memo((props: Props) => {
        const { leftToShowCount, onClick } = props;

        const { t } = useTranslation({ CatalogExplorerCards });

        const { classes } = useStyles();

        return (
            <div className={classes.root}>
                <Button onClick={onClick}>
                    {t("show more")}&nbsp;({leftToShowCount})
                </Button>
            </div>
        );
    });

    return { CardShowMore };
})();

const { NoMatches } = (() => {
    type Props = {
        search: string;
        onGoBackClick(): void;
    };

    const useStyles = makeStyles()(theme => ({
        "root": {
            "display": "flex",
            "justifyContent": "center",
        },
        "innerDiv": {
            "textAlign": "center",
            "maxWidth": 500,
        },
        "svg": {
            "fill": theme.colors.palette.dark.greyVariant2,
            "width": 100,
            "margin": 0,
        },
        "h2": {
            ...theme.spacing.topBottom("margin", 4),
        },
        "typo": {
            "marginBottom": theme.spacing(1),
            "color": theme.colors.palette.light.greyVariant3,
        },
        "link": {
            "cursor": "pointer",
        },
    }));

    const NoMatches = memo((props: Props) => {
        const { search, onGoBackClick } = props;

        const { classes } = useStyles();

        const { t } = useTranslation({ CatalogExplorerCards });

        return (
            <div className={classes.root}>
                <div className={classes.innerDiv}>
                    <ServiceNotFoundSvg className={classes.svg} />
                    <Text typo="page heading" className={classes.h2}>
                        {t("no service found")}
                    </Text>
                    <Text className={classes.typo} typo="body 1">
                        {t("no result found", { "forWhat": search })}
                    </Text>
                    <Text className={classes.typo} typo="body 1">
                        {t("check spelling")}
                    </Text>
                    <Link className={classes.link} onClick={onGoBackClick}>
                        {t("go back")}
                    </Link>
                </div>
            </div>
        );
    });

    return { NoMatches };
})();

const useStyles = makeStyles<{
    filteredCardCount: number;
}>({ "name": { CatalogExplorerCards } })((theme, { filteredCardCount }) => ({
    "root": {
        "height": "100%",
        "display": "flex",
        "flexDirection": "column",
    },
    "searchBar": {
        "marginBottom": theme.spacing(4),
    },
    "contextTypo": {
        "marginBottom": theme.spacing(4),
    },
    "cardsWrapper": {
        "flex": 1,
        "overflow": "auto",
    },
    "cards": {
        ...(filteredCardCount === 0
            ? {}
            : {
                  "display": "grid",
                  "gridTemplateColumns": `repeat(${(() => {
                      if (theme.windowInnerWidth >= breakpointsValues.xl) {
                          return 4;
                      }
                      if (theme.windowInnerWidth >= breakpointsValues.lg) {
                          return 3;
                      }

                      return 2;
                  })()},1fr)`,
                  "gap": theme.spacing(4),
              }),
    },
    "bottomScrollSpace": {
        "height": theme.spacing(3),
    },
}));
