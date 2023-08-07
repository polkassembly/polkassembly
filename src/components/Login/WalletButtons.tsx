// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from "antd";
import React from "react";
import { Wallet } from "src/types";

import WalletButton from "../WalletButton";
import { useNetworkContext } from "~src/context";
import { WalletIcon } from "./MetamaskLogin";

interface Props {
    disabled: boolean;
    onWalletSelect: (wallet: Wallet) => void;
}

const WalletButtons = ({ onWalletSelect, disabled }: Props) => {
    const { network } = useNetworkContext();
    function handleWalletClick(
        event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        wallet: Wallet
    ) {
        event.preventDefault();
        onWalletSelect(wallet);
    }

    return (
        <div className="w-full">
            <div className="flex items-center gap-x-2">
                <Divider className="text-grey_primary">Or Login with</Divider>
            </div>
            <div className="flex mt-3 max-w-xs gap-4 flex-col m-auto justify-center sm:flex-row sm:mx-2 sm:max-w-none">
                <WalletButton
                    disabled={disabled}
                    onClick={(event) =>
                        handleWalletClick(event as any, Wallet.POLKADOT)
                    }
                    name="Polkadot.js"
                    icon={
                        <WalletIcon
                            which={Wallet.POLKADOT}
                            className="h-6 w-6"
                        />
                    }
                />
                <WalletButton
                    disabled={disabled}
                    onClick={(event) =>
                        handleWalletClick(event as any, Wallet.TALISMAN)
                    }
                    name="Talisman"
                    icon={
                        <WalletIcon
                            which={Wallet.TALISMAN}
                            className="h-6 w-6"
                        />
                    }
                />
                <WalletButton
                    disabled={disabled}
                    onClick={(event) =>
                        handleWalletClick(event as any, Wallet.SUBWALLET)
                    }
                    name="SubWallet"
                    icon={
                        <WalletIcon
                            which={Wallet.SUBWALLET}
                            className="h-6 w-6"
                        />
                    }
                />
                {["polymesh"].includes(network) ? (
                    <WalletButton
                        disabled={disabled}
                        onClick={(event) =>
                            handleWalletClick(event as any, Wallet.POLYWALLET)
                        }
                        name="PolyWallet"
                        icon={
                            <WalletIcon
                                which={Wallet.POLYWALLET}
                                className="h-6 w-6"
                            />
                        }
                    />
                ) : null}
                {["moonbase", "moonbeam", "moonriver"].includes(network) ? (
                    <WalletButton
                        disabled={disabled}
                        onClick={(event) =>
                            handleWalletClick(event as any, Wallet.METAMASK)
                        }
                        name="MetaMask"
                        icon={
                            <WalletIcon
                                which={Wallet.METAMASK}
                                className="h-6 w-6"
                            />
                        }
                    />
                ) : null}
                {(window as any).walletExtension?.isNovaWallet && (
                    <WalletButton
                        disabled={disabled}
                        onClick={(event) =>
                            handleWalletClick(event as any, Wallet.NOVAWALLET)
                        }
                        name="Nova Wallet"
                        icon={
                            <WalletIcon
                                which={Wallet.NOVAWALLET}
                                className="h-6 w-6"
                            />
                        }
                    />
                )}
            </div>
        </div>
    );
};

export default WalletButtons;
