import "minimal-polyfills/Object.fromEntries";
import type { SupportedLanguage } from "ui/i18n/translations";
//TODO: Move in a slice, we shouldn't access env directly here.
import { getEnv } from "env";
import { symToStr } from "tsafe/symToStr";
import memoize from "memoizee";
import { assert } from "tsafe/assert";

export type AdminProvidedLink = {
    iconId: string;
    label: string | Partial<Record<SupportedLanguage, string>>;
    url: string;
};

const getAdminProvidedLinksFromEnv = memoize(
    (
        envName: "EXTRA_LEFTBAR_ITEMS" | "HEADER_LINKS",
    ): AdminProvidedLink[] | undefined => {
        const envValue = getEnv()[envName];

        if (envValue === "") {
            return undefined;
        }

        const errorMessage = `${envName} is malformed`;

        let extraLeftBarItems: AdminProvidedLink[];

        try {
            extraLeftBarItems = JSON.parse(envValue);
        } catch {
            throw new Error(errorMessage);
        }

        assert(
            extraLeftBarItems instanceof Array &&
                extraLeftBarItems.find(
                    extraLeftBarItem =>
                        !(
                            extraLeftBarItem instanceof Object &&
                            typeof extraLeftBarItem.url === "string" &&
                            (typeof extraLeftBarItem.label === "string" ||
                                extraLeftBarItem.label instanceof Object)
                        ),
                ) === undefined,
            errorMessage,
        );

        return extraLeftBarItems;
    },
);

export const getExtraLeftBarItemsFromEnv = () =>
    getAdminProvidedLinksFromEnv("EXTRA_LEFTBAR_ITEMS");
export const getHeaderLinksFromEnv = () => getAdminProvidedLinksFromEnv("HEADER_LINKS");

export const getDoHideOnyxia = memoize((): boolean => {
    const { HEADER_HIDE_ONYXIA } = getEnv();

    const possibleValues = ["true", "false"];

    assert(
        possibleValues.indexOf(HEADER_HIDE_ONYXIA) >= 0,
        `${symToStr({ HEADER_HIDE_ONYXIA })} should either be ${possibleValues.join(
            " or ",
        )}`,
    );

    return HEADER_HIDE_ONYXIA === "true";
});
