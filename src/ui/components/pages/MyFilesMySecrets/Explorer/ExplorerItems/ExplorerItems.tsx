import { useMemo, useState, useRef, memo } from "react";
import type { ExplorerItemProps } from "./ExplorerItem";
import { ExplorerItem } from "./ExplorerItem";
import { getKeyPropFactory } from "ui/tools/getKeyProp";
import type { NonPostableEvt } from "evt";
import { useEvt } from "evt/hooks";
import { Evt } from "evt";
import type { UnpackEvt } from "evt";
import { assert } from "tsafe/assert";
import { useEffectOnValueChange } from "powerhooks/useEffectOnValueChange";
import { useArrayDiff } from "powerhooks/useArrayDiff";
import { useTranslation } from "ui/i18n/useTranslations";
import { useCallbackFactory } from "powerhooks/useCallbackFactory";
import { useConstCallback } from "powerhooks/useConstCallback";
import memoize from "memoizee";
import { Text, makeStyles } from "ui/theme";
import { useConst } from "powerhooks/useConst";
import type { Param0 } from "tsafe";

export type ExplorerItemsProps = {
    className?: string;
    explorerType: "s3" | "secrets";

    isNavigating: boolean;

    /** Assert all uniq */
    files: string[];
    /** Assert all uniq */
    directories: string[];

    directoriesBeingCreated: string[];
    directoriesBeingRenamed: string[];
    filesBeingCreated: string[];
    filesBeingRenamed: string[];

    onNavigate: (params: { basename: string }) => void;
    onOpenFile: (params: { basename: string }) => void;
    onEditBasename: (params: {
        kind: "file" | "directory";
        basename: string;
        newBasename: string;
    }) => void;
    onDeleteItem: (params: { kind: "file" | "directory"; basename: string }) => void;
    onCopyPath: (params: { basename: string }) => void;

    /** Assert initial value is none */
    onSelectedItemKindValueChange: (params: {
        selectedItemKind: "file" | "directory" | "none";
    }) => void;

    onIsSelectedItemInEditingStateValueChange: (params: {
        isSelectedItemInEditingState: boolean;
    }) => void;

    evtAction: NonPostableEvt<
        | "START EDITING SELECTED ITEM BASENAME"
        | "DELETE SELECTED ITEM"
        | "COPY SELECTED ITEM PATH"
    >;
};

export const ExplorerItems = memo((props: ExplorerItemsProps) => {
    const {
        className,
        explorerType,
        isNavigating,
        files,
        directories,
        onNavigate,
        onOpenFile,
        onEditBasename,
        onDeleteItem,
        onCopyPath,
        directoriesBeingCreated,
        directoriesBeingRenamed,
        filesBeingCreated,
        filesBeingRenamed,
        evtAction,
        onSelectedItemKindValueChange,
        onIsSelectedItemInEditingStateValueChange,
    } = props;

    const { classes, cx } = useStyles({
        "isEmpty": files.length === 0 && directories.length === 0,
    });

    const { getKeyProp, transfersKeyProp, getValuesCurrentlyMappedToKeyProp } = useConst(
        () =>
            getKeyPropFactory<{
                kind: "directory" | "file";
                basename: string;
            }>(),
    );

    const [selectedItemKeyProp, setSelectedItemKeyProp] = useState<string | undefined>(
        undefined,
    );

    useEffectOnValueChange(
        selectedItemKind => onSelectedItemKindValueChange({ selectedItemKind }),
        [
            useMemo(
                () =>
                    selectedItemKeyProp === undefined
                        ? ("none" as const)
                        : getValuesCurrentlyMappedToKeyProp(selectedItemKeyProp).kind,
                [selectedItemKeyProp, getValuesCurrentlyMappedToKeyProp],
            ),
        ],
    );

    const getEvtItemAction = useConst(() =>
        memoize((_keyProp: string) =>
            Evt.create<UnpackEvt<ExplorerItemProps["evtAction"]>>(),
        ),
    );

    useEvt(
        ctx =>
            evtAction.attach(ctx, action => {
                switch (action) {
                    case "DELETE SELECTED ITEM":
                        assert(selectedItemKeyProp !== undefined);
                        onDeleteItem(
                            getValuesCurrentlyMappedToKeyProp(selectedItemKeyProp),
                        );
                        break;
                    case "START EDITING SELECTED ITEM BASENAME":
                        assert(selectedItemKeyProp !== undefined);
                        getEvtItemAction(selectedItemKeyProp).post("ENTER EDITING STATE");
                        break;
                    case "COPY SELECTED ITEM PATH":
                        assert(selectedItemKeyProp !== undefined);
                        onCopyPath({
                            "basename":
                                getValuesCurrentlyMappedToKeyProp(selectedItemKeyProp)
                                    .basename,
                        });
                        break;
                }
            }),
        [
            evtAction,
            onDeleteItem,
            onCopyPath,
            getEvtItemAction,
            selectedItemKeyProp,
            getValuesCurrentlyMappedToKeyProp,
        ],
    );

    useEffectOnValueChange(() => {
        setIsSelectedItemInEditingState(false);
        setSelectedItemKeyProp(undefined);
    }, [isNavigating]);

    // If selected item is removed, unselect it.
    {
        const callbackFactory = useCallbackFactory(
            ([kind]: ["file" | "directory"], [params]: [{ removed: string[] }]) => {
                const { removed } = params;

                if (selectedItemKeyProp === undefined) {
                    return;
                }

                const selectedItem =
                    getValuesCurrentlyMappedToKeyProp(selectedItemKeyProp);

                if (
                    selectedItem.kind === kind &&
                    removed.includes(selectedItem.basename)
                ) {
                    setIsSelectedItemInEditingState(false);
                    setSelectedItemKeyProp(undefined);
                }
            },
        );

        useArrayDiff({
            "watchFor": "deletion",
            "array": files,
            "callback": callbackFactory("file"),
        });

        useArrayDiff({
            "watchFor": "deletion",
            "array": directories,
            "callback": callbackFactory("directory"),
        });
    }

    // secrets only: When an item is created automatically enter editing mode.
    {
        const callbackFactory = useCallbackFactory(
            ([kind]: ["file" | "directory"], [params]: [{ added: string[] }]) => {
                if (explorerType !== "secrets") {
                    return;
                }

                const { added } = params;

                if (added.length > 1) {
                    return;
                }

                const [basename] = added;

                if (
                    !(() => {
                        switch (kind) {
                            case "directory":
                                return directoriesBeingCreated;
                            case "file":
                                return filesBeingCreated;
                        }
                    })().includes(basename)
                ) {
                    return;
                }

                const evtItemAction = getEvtItemAction(getKeyProp({ kind, basename }));

                evtItemAction.post("ENTER EDITING STATE");
            },
        );

        useArrayDiff({
            "watchFor": "addition",
            "array": files,
            "callback": callbackFactory("file"),
        });

        useArrayDiff({
            "watchFor": "addition",
            "array": directories,
            "callback": callbackFactory("directory"),
        });
    }

    const onMouseEventFactory = useCallbackFactory(
        async (
            [kind, basename]: ["file" | "directory", string],
            [{ type, target }]: [Param0<ExplorerItemProps["onMouseEvent"]>],
        ) => {
            if (isNavigating) {
                return;
            }

            switch (type) {
                case "down":
                    const keyProp = getKeyProp({ kind, basename });

                    if (target === "text" && selectedItemKeyProp === keyProp) {
                        await Evt.from(window, "mouseup").waitFor();

                        getEvtItemAction(keyProp).post("ENTER EDITING STATE");

                        break;
                    }

                    setSelectedItemKeyProp(keyProp);

                    break;

                case "double":
                    switch (kind) {
                        case "directory":
                            onNavigate({ basename });
                            break;
                        case "file":
                            onOpenFile({ basename });
                            break;
                    }
                    break;
            }
        },
    );

    const [isSelectedItemInEditingState, setIsSelectedItemInEditingState] =
        useState(false);

    useEffectOnValueChange(
        () =>
            onIsSelectedItemInEditingStateValueChange({
                isSelectedItemInEditingState,
            }),
        [isSelectedItemInEditingState],
    );

    const onEditBasenameFactory = useCallbackFactory(
        (
            [kind, basename]: ["file" | "directory", string],
            [{ editedBasename }]: [Parameters<ExplorerItemProps["onEditBasename"]>[0]],
        ) => {
            transfersKeyProp({
                "toValues": { kind, "basename": editedBasename },
                "fromValues": { kind, basename },
            });

            onEditBasename({ kind, basename, "newBasename": editedBasename });
        },
    );

    const getIsValidBasenameFactory = useCallbackFactory(
        (
            [kind, basename]: ["file" | "directory", string],

            [{ basename: candidateBasename }]: [
                Parameters<ExplorerItemProps["getIsValidBasename"]>[0],
            ],
        ) => {
            if (basename === candidateBasename) {
                return true;
            }

            if (
                (() => {
                    switch (kind) {
                        case "directory":
                            return directories;
                        case "file":
                            return files;
                    }
                })().includes(candidateBasename)
            ) {
                return false;
            }

            return !candidateBasename.includes(" ") && !candidateBasename.includes("/");
        },
    );

    const onIsInEditingStateValueChange = useConstCallback(
        ({
            isInEditingState,
        }: Parameters<ExplorerItemProps["onIsInEditingStateValueChange"]>[0]) =>
            setIsSelectedItemInEditingState(isInEditingState),
    );

    const containerRef = useRef<HTMLDivElement>(null);

    const onGridMouseDown = useConstCallback(
        ({ target }: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            if (
                containerRef.current !== target &&
                !Array.from(containerRef.current!.children).includes(target as any)
            ) {
                return;
            }

            setIsSelectedItemInEditingState(false);
            setSelectedItemKeyProp(undefined);
        },
    );

    const { t } = useTranslation({ ExplorerItems });

    return (
        <div
            className={cx(classes.root, className)}
            ref={containerRef}
            onMouseDown={onGridMouseDown}
        >
            {files.length === 0 && directories.length === 0 ? (
                <Text typo="body 1">{t("empty directory")}</Text>
            ) : (
                <>
                    {(["directory", "file"] as const).map(kind =>
                        (() => {
                            switch (kind) {
                                case "directory":
                                    return directories;
                                case "file":
                                    return files;
                            }
                        })().map(basename => {
                            const keyProp = getKeyProp({ kind, basename });
                            const isSelected = selectedItemKeyProp === keyProp;

                            return (
                                <ExplorerItem
                                    className={classes.item}
                                    explorerType={explorerType}
                                    key={keyProp}
                                    kind={kind}
                                    basename={basename}
                                    isSelected={isSelected}
                                    evtAction={getEvtItemAction(keyProp)}
                                    isCircularProgressShown={(() => {
                                        switch (kind) {
                                            case "directory":
                                                return [
                                                    ...directoriesBeingCreated,
                                                    ...directoriesBeingRenamed,
                                                ];
                                            case "file":
                                                return [
                                                    ...filesBeingCreated,
                                                    ...filesBeingRenamed,
                                                ];
                                        }
                                    })().includes(basename)}
                                    standardizedWidth="big"
                                    onMouseEvent={onMouseEventFactory(kind, basename)}
                                    onEditBasename={onEditBasenameFactory(kind, basename)}
                                    getIsValidBasename={getIsValidBasenameFactory(
                                        kind,
                                        basename,
                                    )}
                                    onIsInEditingStateValueChange={
                                        onIsInEditingStateValueChange
                                    }
                                />
                            );
                        }),
                    )}
                </>
            )}
        </div>
    );
});

export declare namespace ExplorerItems {
    export type I18nScheme = {
        "empty directory": undefined;
    };
}

const useStyles = makeStyles<{ isEmpty: boolean }>({ "name": { ExplorerItems } })(
    (theme, { isEmpty }) => ({
        "root": {
            ...(isEmpty
                ? {}
                : {
                      "display": "flex",
                      "flexWrap": "wrap",
                      "justifyContent": "flex-start",
                  }),
        },
        "item": {
            "margin": theme.spacing(2),
        },
    }),
);
