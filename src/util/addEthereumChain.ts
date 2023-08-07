// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { chainProperties } from "~src/global/networkConstants";

interface IAddEthereumChainParams {
    network: string;
    ethereum: any;
}

type TAddEthereumChainFn = (params: IAddEthereumChainParams) => Promise<void>;

const addEthereumChain: TAddEthereumChainFn = async (params) => {
    const { network, ethereum } = params;
    const { chainId, rpcEndpoint, tokenSymbol, tokenDecimals } =
        chainProperties[network];
    const metaMaskChainId = await ethereum.request({ method: "eth_chainId" });
    if (parseInt(metaMaskChainId, 16) !== chainId) {
        const rpcUrls = [
            rpcEndpoint.replace("wss", "https").replace("wss", "rpc"),
            rpcEndpoint
        ];
        const newChainId = `0x${chainId.toString(16)}`;
        try {
            await ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: newChainId }]
            });
        } catch (error) {
            if (
                typeof error?.message === "string" &&
                error?.message.includes("wallet_addEthereumChain")
            ) {
                await ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [
                        {
                            chainId: newChainId,
                            chainName: network,
                            nativeCurrency: {
                                decimals: tokenDecimals,
                                name: network,
                                symbol: tokenSymbol
                            },
                            rpcUrls: rpcUrls
                        }
                    ]
                });
                await ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: newChainId }]
                });
            }
        }
    }
};

export default addEthereumChain;
