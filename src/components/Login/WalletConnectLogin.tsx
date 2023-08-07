// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { InjectedAccountWithMeta } from "@polkadot/extension-inject/types";
import { stringToHex } from "@polkadot/util";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { Button, Divider } from "antd";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import { UserDetailsContext } from "src/context/UserDetailsContext";
import { chainProperties } from "src/global/networkConstants";
import { handleTokenChange } from "src/services/auth.service";
import AccountSelectionForm from "src/ui-components/AccountSelectionForm";
import FilteredError from "src/ui-components/FilteredError";
import Loader from "src/ui-components/Loader";
import getNetwork from "src/util/getNetwork";
import styled from "styled-components";

import { ChallengeMessage, IAuthResponse, TokenType } from "~src/auth/types";
import { Wallet } from "~src/types";
import nextApiClientFetch from "~src/util/nextApiClientFetch";
import TFALoginForm from "./TFALoginForm";

interface Props {
    className?: string;
    setDisplayWeb2: () => void;
    setPolkadotWallet: () => void;
    isModal?: boolean;
    setLoginOpen?: (pre: boolean) => void;
}

const initAuthResponse: IAuthResponse = {
    isTFAEnabled: false,
    tfa_token: "",
    token: "",
    user_id: 0
};

const NETWORK = getNetwork();

const WalletConnectLogin = ({
    className,
    setDisplayWeb2,
    setPolkadotWallet,
    isModal,
    setLoginOpen
}: Props): JSX.Element => {
    const currentUser = useContext(UserDetailsContext);
    const { setWalletConnectProvider } = currentUser;

    const [error, setError] = useState("");
    const [address, setAddress] = useState<string>("");
    const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
    const [isAccountLoading, setIsAccountLoading] = useState(true);
    const [accountsNotFound, setAccountsNotFound] = useState(false);

    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [provider, setProvider] = useState<WalletConnectProvider | null>(
        null
    );
    const [authResponse, setAuthResponse] =
        useState<IAuthResponse>(initAuthResponse);

    const connect = async () => {
        setIsAccountLoading(true);

        if (provider && provider.wc.connected) {
            provider.wc.killSession();
        }

        //  Create new WalletConnect Provider
        window.localStorage.removeItem("walletconnect");
        const wcPprovider = new WalletConnectProvider({
            rpc: {
                1284: "https://rpc.api.moonbeam.network",
                1285: "https://rpc.api.moonriver.moonbeam.network",
                1287: "https://rpc.api.moonbase.moonbeam.network"
            }
        });
        setProvider(wcPprovider);
    };

    const getAccounts = async () => {
        if (!provider) return;

        if (!provider.wc.connected) {
            await provider.wc.createSession();
        }

        // Subscribe to events
        provider.wc.on("modal_closed", () => {
            setProvider(null);
            setDisplayWeb2();
        });

        provider.wc.on("connect", (error, payload) => {
            if (error) {
                setError(error?.message);
                return;
            }

            const { accounts: addresses, chainId } = payload.params[0];

            getAccountsHandler(addresses, Number(chainId));
        });

        provider.wc.on("session_update", (error, payload) => {
            if (error) {
                setError(error?.message);
                return;
            }

            // updated accounts and chainId
            const { accounts: addresses, chainId } = payload.params[0];
            getAccountsHandler(addresses, Number(chainId));
        });

        provider.wc.on("disconnect", async (error) => {
            if (error) {
                setError(error?.message);
                return;
            }

            // Delete connector
            window.localStorage.removeItem("walletconnect");
            setProvider(null);
            setDisplayWeb2();
        });
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const getAccountsHandler = async (addresses: string[], chainId: number) => {
        if (chainId !== chainProperties[NETWORK].chainId) {
            setError(
                `Please login using the ${NETWORK} network on WalletConnect`
            );
            setAccountsNotFound(true);
            setIsAccountLoading(false);
            return;
        }

        const checksumAddresses = addresses.map((address: string) => address);

        if (checksumAddresses.length === 0) {
            setAccountsNotFound(true);
            setIsAccountLoading(false);
            return;
        }

        setAccounts(
            checksumAddresses.map(
                (address: string): InjectedAccountWithMeta => {
                    const account = {
                        address: address.toLowerCase(),
                        meta: {
                            genesisHash: null,
                            name: "walletConnect",
                            source: "walletConnect"
                        }
                    };

                    return account;
                }
            )
        );

        if (checksumAddresses.length > 0) {
            setAddress(checksumAddresses[0]);
        }

        setIsAccountLoading(false);
    };

    useEffect(() => {
        connect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        getAccounts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [provider]);

    const onAccountChange = (address: string) => {
        setAddress(address);
    };

    const handleLogin = async () => {
        if (!provider) return;

        if (!accounts.length) {
            return getAccounts();
        }

        try {
            setLoading(true);

            const { data: loginStartData, error: loginStartError } =
                await nextApiClientFetch<ChallengeMessage>(
                    "api/v1/auth/actions/addressLoginStart",
                    { address }
                );
            if (loginStartError) {
                console.log("Error in address login start", loginStartError);
                setError(loginStartError);
                setLoading(false);
                return;
            }

            const signMessage = loginStartData?.signMessage;

            if (!signMessage) {
                setLoading(false);
                throw new Error("Challenge message not found");
            }

            const msg = stringToHex(signMessage);
            const from = address;

            const params = [msg, from];
            const method = "personal_sign";

            const tx = {
                method,
                params
            };

            provider.wc
                .sendCustomRequest(tx)
                .then(async (result: any) => {
                    try {
                        const {
                            data: addressLoginData,
                            error: addressLoginError
                        } = await nextApiClientFetch<IAuthResponse>(
                            "api/v1/auth/actions/addressLogin",
                            {
                                address,
                                signature: result,
                                wallet: Wallet.WALLETCONNECT
                            }
                        );

                        if (addressLoginError) {
                            console.log(
                                "Error in address login",
                                addressLoginError
                            );
                            setError(addressLoginError);

                            // TODO: change method of checking if user/address needs signup
                            if (
                                addressLoginError ===
                                "Login with web3 account failed. Address not linked to any account."
                            ) {
                                try {
                                    setLoading(true);
                                    const { data, error } =
                                        await nextApiClientFetch<ChallengeMessage>(
                                            "api/v1/auth/actions/addressSignupStart",
                                            { address }
                                        );
                                    if (error || !data) {
                                        setError(
                                            error || "Something went wrong"
                                        );
                                        setLoading(false);
                                        return;
                                    }

                                    const signMessage = data?.signMessage;
                                    if (!signMessage) {
                                        setError("Challenge message not found");
                                        setLoading(false);
                                        return;
                                    }

                                    const msg = stringToHex(signMessage);
                                    const from = address;

                                    const params = [msg, from];
                                    const method = "personal_sign";

                                    if (
                                        (window as any)?.web3?.currentProvider
                                    ) {
                                        (
                                            window as any
                                        ).web3.currentProvider.sendAsync(
                                            {
                                                from,
                                                method,
                                                params
                                            },
                                            async (err: any, result: any) => {
                                                if (err) {
                                                    setError(err.message);
                                                    setLoading(false);
                                                    return;
                                                }

                                                const {
                                                    data: confirmData,
                                                    error: confirmError
                                                } =
                                                    await nextApiClientFetch<TokenType>(
                                                        "api/v1/auth/actions/addressSignupConfirm",
                                                        {
                                                            address,
                                                            signature:
                                                                result.result,
                                                            wallet: Wallet.WALLETCONNECT
                                                        }
                                                    );

                                                if (
                                                    confirmError ||
                                                    !confirmData
                                                ) {
                                                    setError(
                                                        confirmError ||
                                                            "Something went wrong"
                                                    );
                                                    setLoading(false);
                                                    return;
                                                }

                                                if (confirmData.token) {
                                                    currentUser.loginWallet =
                                                        Wallet.WALLETCONNECT;
                                                    currentUser.loginAddress =
                                                        address;
                                                    currentUser.delegationDashboardAddress =
                                                        address;
                                                    localStorage.setItem(
                                                        "delegationWallet",
                                                        Wallet.WALLETCONNECT
                                                    );
                                                    localStorage.setItem(
                                                        "delegationDashboardAddress",
                                                        address
                                                    );
                                                    localStorage.setItem(
                                                        "loginWallet",
                                                        Wallet.WALLETCONNECT
                                                    );

                                                    handleTokenChange(
                                                        confirmData.token,
                                                        currentUser
                                                    );
                                                    if (isModal) {
                                                        setLoginOpen &&
                                                            setLoginOpen(false);
                                                        setLoading(false);
                                                        return;
                                                    }
                                                    router.back();
                                                } else {
                                                    throw new Error(
                                                        "Web3 Login failed"
                                                    );
                                                }
                                            }
                                        );
                                    }
                                } catch (error) {
                                    console.log(error);
                                    setError(error.message);
                                    setLoading(false);
                                }
                            }
                        }

                        if (addressLoginData?.token) {
                            setWalletConnectProvider(provider);
                            currentUser.loginWallet = Wallet.WALLETCONNECT;
                            currentUser.loginAddress = address;
                            currentUser.delegationDashboardAddress = address;
                            localStorage.setItem(
                                "delegationWallet",
                                Wallet.WALLETCONNECT
                            );
                            localStorage.setItem(
                                "delegationDashboardAddress",
                                address
                            );
                            localStorage.setItem(
                                "loginWallet",
                                Wallet.WALLETCONNECT
                            );

                            handleTokenChange(
                                addressLoginData.token,
                                currentUser
                            );
                            if (isModal) {
                                setLoginOpen?.(false);
                                setLoading(false);
                                return;
                            }
                            router.back();
                        } else if (addressLoginData?.isTFAEnabled) {
                            if (!addressLoginData?.tfa_token) {
                                setError(
                                    error ||
                                        "TFA token missing. Please try again."
                                );
                                setLoading(false);
                                return;
                            }

                            setAuthResponse(addressLoginData);
                            setLoading(false);
                        } else {
                            throw new Error("WalletConnect Login failed");
                        }
                    } catch (error) {
                        setError(error?.message || error);
                    }
                    setLoading(false);
                })
                .catch((error) => {
                    // Error returned when rejected
                    setLoading(false);
                    setError(error?.message || error);
                    return;
                });
        } catch (error) {
            setLoading(false);
            setError(error?.message || error);
        }
    };

    const handleSubmitAuthCode = async (formData: any) => {
        const { authCode } = formData;
        if (isNaN(authCode)) return;
        setLoading(true);

        const { data, error } = await nextApiClientFetch<IAuthResponse>(
            "api/v1/auth/actions/2fa/validate",
            {
                auth_code: String(authCode), //use string for if it starts with 0
                login_address: address,
                login_wallet: Wallet.WALLETCONNECT,
                tfa_token: authResponse.tfa_token,
                user_id: Number(authResponse.user_id)
            }
        );

        if (error || !data) {
            setError(error || "Login failed. Please try again later.");
            setLoading(false);
            return;
        }

        if (data?.token) {
            setError("");

            setWalletConnectProvider(provider);
            currentUser.loginWallet = Wallet.WALLETCONNECT;
            currentUser.loginAddress = address;
            currentUser.delegationDashboardAddress = address;
            localStorage.setItem("delegationWallet", Wallet.WALLETCONNECT);
            localStorage.setItem("delegationDashboardAddress", address);
            localStorage.setItem("loginWallet", Wallet.WALLETCONNECT);

            handleTokenChange(data.token, currentUser);
            if (isModal) {
                setLoginOpen?.(false);
                setLoading(false);
                return;
            }
            router.back();
        }
    };

    return (
        <div className={className}>
            <h3>WalletConnect Login</h3>
            {accountsNotFound ? (
                <div className="card">
                    <div className="text-muted">
                        You need at least one account via WalletConnect to
                        login.
                    </div>
                    <div className="text-muted">
                        Please reload this page after adding accounts.
                    </div>
                </div>
            ) : null}
            {isAccountLoading ? (
                <div className="loader-cont">
                    <Loader text={"Requesting accounts"} />
                </div>
            ) : (
                accounts.length > 0 && (
                    <>
                        {authResponse.isTFAEnabled ? (
                            <TFALoginForm
                                onBack={() => {
                                    setAuthResponse(initAuthResponse);
                                    setError("");
                                }}
                                onSubmit={handleSubmitAuthCode}
                                error={error || ""}
                                loading={loading}
                            />
                        ) : (
                            <>
                                <div>
                                    <AccountSelectionForm
                                        title="Choose linked account"
                                        accounts={accounts}
                                        address={address}
                                        onAccountChange={onAccountChange}
                                    />
                                </div>
                                <div className={"mainButtonContainer"}>
                                    <Button
                                        disabled={loading}
                                        onClick={handleLogin}
                                    >
                                        Login
                                    </Button>
                                </div>
                            </>
                        )}
                    </>
                )
            )}
            <div className="mt-4">
                {error && <FilteredError text={error} />}
            </div>
            <Divider plain>Or</Divider>
            <div className={"mainButtonContainer"}>
                <Button disabled={loading} onClick={() => setDisplayWeb2()}>
                    Login with username
                </Button>
            </div>
            <Divider plain>Or</Divider>
            <div className={"mainButtonContainer"}>
                <Button disabled={loading} onClick={() => setPolkadotWallet()}>
                    Login with polkadot.js
                </Button>
            </div>
        </div>
    );
};

export default styled(WalletConnectLogin)`
    .loader-cont {
        margin-top: 150px;
        .ui.dimmer {
            height: 100%;
        }
    }

    .mainButtonContainer {
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: center;
    }
    input.error {
        border-style: solid;
        border-width: 1px;
        border-color: red_secondary;
    }
    .info {
        margin: 10px 0;
    }
    .errorText {
        color: red_secondary;
    }
    .ui.dimmer {
        height: calc(100% - 6.5rem);
    }
`;
