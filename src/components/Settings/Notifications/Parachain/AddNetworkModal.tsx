// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from "react";
import { Button, Divider, Image, Switch, Tag } from "antd";
import SmallParachainIcon from "~assets/icons/parachain-small.svg";
import { chainProperties } from "~src/global/networkConstants";
import { useNetworkContext } from "~src/context";
import { PlusCircleOutlined } from "@ant-design/icons";
import { networkLabel } from "./utils";
import { ISelectedNetwork } from "../types";
import Modal from "~src/ui-components/Modal";

const AddNetworkModal = ({
    open,
    onConfirm,
    onCancel,
    selectedNetwork
}: {
    selectedNetwork: ISelectedNetwork;
    open: boolean;
    onConfirm: (networks: any) => void;
    onCancel: () => void;
}) => {
    const [allNetworks, setAllNetworks] = useState(selectedNetwork);
    const { network } = useNetworkContext();
    const [showSureModal, setShowSureModal] = useState(false);

    useEffect(() => {
        setAllNetworks(selectedNetwork);
    }, [selectedNetwork]);

    const handleClick = (name: string, category: string) => {
        if (name === network) {
            return;
        }
        const payload = allNetworks[category].map((net: any) =>
            net.name === name ? { ...net, selected: !net.selected } : net
        );
        setAllNetworks({ ...allNetworks, [category]: payload });
    };

    const handleSure = () => {
        setShowSureModal(true);
    };

    const handleConfirm = () => {
        if (!showSureModal) {
            handleSure();
            return;
        }
        onConfirm(allNetworks);
        setShowSureModal(false);
    };

    const handleAllClick = (checked: boolean, chain: string) => {
        const payload = allNetworks[chain].map((net: any) =>
            net.name === network
                ? net
                : {
                      ...net,
                      selected: checked
                  }
        );
        setAllNetworks({ ...allNetworks, [chain]: payload });
    };

    return (
        <>
            <Modal
                title="Add Networks"
                titleIcon={<PlusCircleOutlined />}
                open={open}
                onCancel={() => {
                    if (showSureModal) {
                        setShowSureModal(false);
                        return;
                    }
                    onCancel();
                }}
                onConfirm={handleConfirm}
                footer={[
                    <Button
                        key="1"
                        onClick={() => {
                            if (showSureModal) {
                                setShowSureModal(false);
                                return;
                            }
                            onCancel();
                        }}
                        className="h-10 rounded-[6px] bg-[#FFFFFF] border border-solid border-pink_primary px-[36px] py-[4px] text-pink_primary font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize"
                    >
                        Cancel
                    </Button>,
                    <Button
                        onClick={handleConfirm}
                        key="2"
                        className="h-10 rounded-[6px] bg-[#E5007A] border border-solid border-pink_primary px-[36px] py-[4px] text-white font-medium text-sm leading-[21px] tracking-[0.0125em] capitalize"
                    >
                        Confirm
                    </Button>
                ]}
            >
                <p className="font-medium text-[#243A57] text-[16px]">
                    {showSureModal
                        ? "Pre-existing settings will be changed for the following networks:"
                        : "Please select network(s) for which you want to replicate settings:"}
                </p>
                {showSureModal ? (
                    <div className="flex gap-[10px] flex-wrap">
                        {Object.keys(allNetworks).map((chain) => {
                            return allNetworks[chain]
                                .filter((net) => net.selected)
                                .map(({ name }: { name: string }) => {
                                    return (
                                        <Tag
                                            key={name}
                                            className={
                                                "items-center text-navBlue rounded-[34px] px-[12px] py-[8px] border-solid border bg-[#FEF2F8] border-[#E5007A] cursor-pointer hover:bg-[#FEF2F8] max-w-[200px] pb-[5px]"
                                            }
                                        >
                                            <Image
                                                className="w-[20px] h-[20px] rounded-full -mt-[10px]"
                                                src={
                                                    chainProperties[name].logo
                                                        .src
                                                }
                                                alt="Logo"
                                            />
                                            <span
                                                className={
                                                    "items-center justify-center ml-[10px] mr-[12px] font-semibold text-[#243A57] text-sm leading-[18px] tracking-[0.02em] "
                                                }
                                            >
                                                <span className="inline-block capitalize max-w-[100px] overflow-hidden text-ellipsis m-0">
                                                    {name === "xx"
                                                        ? "XX"
                                                        : name}
                                                </span>
                                            </span>
                                        </Tag>
                                    );
                                });
                        })}
                    </div>
                ) : (
                    Object.keys(allNetworks).map((chain, i) => {
                        return (
                            <div key={chain}>
                                <div className="flex items-center gap-[8px] mb-2">
                                    <SmallParachainIcon />
                                    <h3 className="font-semibold text-sm tracking-wide leading-[21px] text-sidebarBlue mb-0">
                                        {networkLabel[chain] === "Kusama" ||
                                        networkLabel[chain] === "Polkadot"
                                            ? `${networkLabel[chain]} and Parachains`
                                            : networkLabel[chain]}
                                    </h3>
                                    <span className="flex gap-[8px] items-center">
                                        <Switch
                                            size="small"
                                            id="postParticipated"
                                            onChange={(checked) =>
                                                handleAllClick(checked, chain)
                                            }
                                            checked={allNetworks[chain].every(
                                                (network: any) =>
                                                    network.selected
                                            )}
                                        />
                                        <p className="m-0 text-[#485F7D]">
                                            All
                                        </p>
                                    </span>
                                </div>
                                <div className="flex gap-[10px] flex-wrap">
                                    {allNetworks[chain].map(
                                        ({
                                            name,
                                            selected
                                        }: {
                                            name: string;
                                            selected: boolean;
                                        }) => {
                                            selected =
                                                selected || name === network;
                                            return (
                                                <div
                                                    className="flex-[170px] w-auto max-w-[175px]"
                                                    key={name}
                                                >
                                                    <Tag
                                                        onClick={() =>
                                                            handleClick(
                                                                name,
                                                                chain
                                                            )
                                                        }
                                                        className={`items-center text-navBlue rounded-[34px] px-[12px] py-[8px] ${
                                                            selected
                                                                ? "border-solid border bg-[#FEF2F8] border-[#E5007A]"
                                                                : "bg-white border-[#fff]"
                                                        } cursor-pointer hover:bg-[#FEF2F8] max-w-[200px] pb-[5px]`}
                                                    >
                                                        <Image
                                                            className="w-[20px] h-[20px] rounded-full -mt-[12px]"
                                                            src={
                                                                chainProperties[
                                                                    name
                                                                ].logo.src
                                                            }
                                                            alt="Logo"
                                                        />
                                                        <span
                                                            className={
                                                                "items-center justify-center ml-[10px] mr-[12px] font-normal text-[#243A57] text-sm leading-[21px] tracking-[0.02em]"
                                                            }
                                                        >
                                                            <span className="inline-block capitalize max-w-[100px] overflow-hidden text-ellipsis m-0">
                                                                {name === "xx"
                                                                    ? "XX"
                                                                    : name}
                                                            </span>
                                                        </span>
                                                    </Tag>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                                {i < Object.keys(allNetworks).length - 1 && (
                                    <Divider
                                        className="border-[#D2D8E0] border-2"
                                        dashed
                                    />
                                )}
                            </div>
                        );
                    })
                )}
                <div className="mr-[-24px] ml-[-24px]">
                    <Divider className="my-4" />
                </div>
            </Modal>
        </>
    );
};

export default AddNetworkModal;
