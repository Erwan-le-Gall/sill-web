import { memo } from "react";
import type { KcProps } from "keycloakify/lib/components/KcProps";
import type { KcContext } from "./kcContext";
import { useKcMessage } from "keycloakify/lib/i18n/useKcMessage";
import { Template } from "./Template";
import { useStyles } from "ui/theme";

type KcContext_LoginUpdateProfile = Extract<
    KcContext,
    { pageId: "login-update-profile.ftl" }
>;

export const LoginUpdateProfile = memo(
    ({ kcContext, ...props }: { kcContext: KcContext_LoginUpdateProfile } & KcProps) => {
        const { url, user, messagesPerField, isAppInitiatedAction } = kcContext;

        const { msg, msgStr } = useKcMessage();

        const { cx } = useStyles();

        return (
            <Template
                {...{ kcContext, ...props }}
                doFetchDefaultThemeResources={true}
                headerNode={msg("loginProfileTitle")}
                formNode={
                    <form
                        id="kc-update-profile-form"
                        className={cx(props.kcFormClass)}
                        action={url.loginAction}
                        method="post"
                    >
                        {user.editUsernameAllowed && (
                            <div
                                className={cx(
                                    props.kcFormGroupClass,
                                    messagesPerField.printIfExists(
                                        "username",
                                        props.kcFormGroupErrorClass,
                                    ),
                                )}
                            >
                                <div className={cx(props.kcLabelWrapperClass)}>
                                    <label
                                        htmlFor="username"
                                        className={cx(props.kcLabelClass)}
                                    >
                                        {msg("username")}
                                    </label>
                                </div>
                                <div className={cx(props.kcInputWrapperClass)}>
                                    <input
                                        spellCheck={false}
                                        type="text"
                                        id="username"
                                        name="username"
                                        className={cx(props.kcInputClass)}
                                    />
                                </div>
                            </div>
                        )}

                        <div
                            className={cx(
                                props.kcFormGroupClass,
                                messagesPerField.printIfExists(
                                    "email",
                                    props.kcFormGroupErrorClass,
                                ),
                            )}
                        >
                            <div className={cx(props.kcLabelWrapperClass)}>
                                <label htmlFor="email" className={cx(props.kcLabelClass)}>
                                    {msg("email")}
                                </label>
                            </div>
                            <div className={cx(props.kcInputWrapperClass)}>
                                <input
                                    readOnly
                                    type="text"
                                    id="email"
                                    name="email"
                                    defaultValue={user.email ?? ""}
                                    className={cx(props.kcInputClass)}
                                />
                            </div>
                        </div>

                        <div
                            className={cx(
                                props.kcFormGroupClass,
                                messagesPerField.printIfExists(
                                    "firstName",
                                    props.kcFormGroupErrorClass,
                                ),
                            )}
                        >
                            <div className={cx(props.kcLabelWrapperClass)}>
                                <label
                                    htmlFor="firstName"
                                    className={cx(props.kcLabelClass)}
                                >
                                    {msg("firstName")}
                                </label>
                            </div>
                            <div className={cx(props.kcInputWrapperClass)}>
                                <input
                                    readOnly
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    defaultValue={user.firstName ?? ""}
                                    className={cx(props.kcInputClass)}
                                />
                            </div>
                        </div>

                        <div
                            className={cx(
                                props.kcFormGroupClass,
                                messagesPerField.printIfExists(
                                    "lastName",
                                    props.kcFormGroupErrorClass,
                                ),
                            )}
                        >
                            <div className={cx(props.kcLabelWrapperClass)}>
                                <label
                                    htmlFor="lastName"
                                    className={cx(props.kcLabelClass)}
                                >
                                    {msg("lastName")}
                                </label>
                            </div>
                            <div className={cx(props.kcInputWrapperClass)}>
                                <input
                                    readOnly
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    defaultValue={user.lastName ?? ""}
                                    className={cx(props.kcInputClass)}
                                />
                            </div>
                        </div>

                        <div className={cx(props.kcFormGroupClass)}>
                            <div
                                id="kc-form-options"
                                className={cx(props.kcFormOptionsClass)}
                            >
                                <div className={cx(props.kcFormOptionsWrapperClass)} />
                            </div>

                            <div
                                id="kc-form-buttons"
                                className={cx(props.kcFormButtonsClass)}
                            >
                                {isAppInitiatedAction ? (
                                    <>
                                        <input
                                            className={cx(
                                                props.kcButtonClass,
                                                props.kcButtonPrimaryClass,
                                                props.kcButtonLargeClass,
                                            )}
                                            type="submit"
                                            defaultValue={msgStr("doSubmit")}
                                        />
                                        <button
                                            className={cx(
                                                props.kcButtonClass,
                                                props.kcButtonDefaultClass,
                                                props.kcButtonLargeClass,
                                            )}
                                            type="submit"
                                            name="cancel-aia"
                                            value="true"
                                        >
                                            {msg("doCancel")}
                                        </button>
                                    </>
                                ) : (
                                    <input
                                        className={cx(
                                            props.kcButtonClass,
                                            props.kcButtonPrimaryClass,
                                            props.kcButtonBlockClass,
                                            props.kcButtonLargeClass,
                                        )}
                                        type="submit"
                                        defaultValue={msgStr("doSubmit")}
                                    />
                                )}
                            </div>
                        </div>
                    </form>
                }
            />
        );
    },
);
