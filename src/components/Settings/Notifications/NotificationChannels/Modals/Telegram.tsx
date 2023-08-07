// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal, message } from "antd";
import React, { useState } from "react";
import CopyIcon from "~assets/icons/content-copy.svg";
import { CHANNEL } from "..";
import { useUserDetailsContext } from "~src/context";

type Props = {
    icon: any;
    title: string;
    open: boolean;
    getVerifyToken: (channel: CHANNEL) => Promise<any>;
    generatedToken?: string;
    onClose: () => void;
};

const TelegramInfoModal = ({
    icon,
    title,
    open,
    getVerifyToken,
    generatedToken = "",
    onClose
}: Props) => {
    const [loading, setLoading] = useState(false);
    const [token, setToken] = useState(generatedToken);
    const { username } = useUserDetailsContext();
    const handleGenerateToken = async () => {
        setLoading(true);
        const data = await getVerifyToken(CHANNEL.TELEGRAM);
        setToken(data);
        setLoading(false);
    };

    const handleCopyClicked = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success("Copied");
    };

    return (
        <Modal
            title={
                <h3 className="flex items-center gap-3 mb-5">
                    {icon} {title}
                </h3>
            }
            open={open}
            closable
            onCancel={onClose}
            footer={null}
        >
            <div className="">
                <ol>
                    <li className="list-inside leading-[40px]">
                        Click this invite link
                        <span className="p-1 mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary">
                            <a
                                href="https://t.me/PolkassemblyBot"
                                target="_blank"
                                rel="noreferrer"
                            >
                                t.me/PolkassemblyBot
                            </a>
                        </span>
                        <br />
                        or Add
                        <span
                            onClick={() =>
                                handleCopyClicked("@PolkassemblyBot")
                            }
                            className="p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary"
                        >
                            <CopyIcon className="relative top-[6px] color-pink_primary" />{" "}
                            @PolkassemblyBot
                        </span>
                        to your Telegram Chat as a member
                    </li>
                    <li className="list-inside leading-[40px]">
                        Send this command to the chat with the bot:
                        <br />
                        <span
                            onClick={() =>
                                handleCopyClicked(
                                    "/add <username> <verificationToken>"
                                )
                            }
                            className="p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary"
                        >
                            <CopyIcon className="relative top-[6px]" />{" "}
                            {"<username>"} {"<verificationToken>"}
                        </span>
                        <Button
                            loading={loading}
                            onClick={handleGenerateToken}
                            className="bg-pink_primary text-white font-normal"
                        >
                            Generate Token
                        </Button>
                        <br />
                        {token && (
                            <div className="flex items-center">
                                <span>Username & Verification Token: </span>
                                <div
                                    onClick={() =>
                                        handleCopyClicked(
                                            `/add ${username} ${token}`
                                        )
                                    }
                                    className="flex items-center max-w-[230px] p-0 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary h-[30px]"
                                >
                                    <CopyIcon className="relative" />{" "}
                                    <span className="max-w-[100px] text-ellipsis overflow-hidden whitespace-nowrap inline-block mr-2">
                                        {username}
                                    </span>
                                    <span className="max-w-[100px] text-ellipsis overflow-hidden whitespace-nowrap inline-block">
                                        {token}
                                    </span>
                                </div>
                            </div>
                        )}
                    </li>
                    <li className="list-inside">
                        (Optional) Send this command to get help:
                        <span
                            onClick={() => handleCopyClicked("/start")}
                            className="p-1 cursor-pointer mx-2 rounded-md bg-bg-secondary text-pink_primary border border-solid border-text_secondary"
                        >
                            <CopyIcon className="relative top-[6px]" /> /start
                        </span>
                    </li>
                </ol>
            </div>
        </Modal>
    );
};

export default TelegramInfoModal;
