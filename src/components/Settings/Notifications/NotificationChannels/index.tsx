// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from "react";
import { Divider } from "antd";
import ExpandIcon from "~assets/icons/expand.svg";
import CollapseIcon from "~assets/icons/collapse.svg";
import NotificationChannelsIcon from "~assets/icons/notification-channel-svg.svg";
import SlackIcon from "~assets/icons/slack.svg";
import ElementIcon from "~assets/icons/element.svg";
import EmailNotificationCard from "./EmailNotificationCard";
import BotSetupCard from "./BotSetupCard";
import TelegramInfoModal from "./Modals/Telegram";
import queueNotification from "~src/ui-components/QueueNotification";
import { NotificationStatus } from "~src/types";
import { FIREBASE_FUNCTIONS_URL, firebaseFunctionsHeader } from "../utils";
import { useNetworkContext, useUserDetailsContext } from "~src/context";
import DiscordInfoModal from "./Modals/Discord";
import SlackInfoModal from "./Modals/Slack";
import { Collapse } from "../common-ui/Collapse";
import MailFilled from "~assets/icons/email-notification.svg";
import TelegramIcon from "~assets/icons/telegram-notification.svg";
import DiscordIcon from "~assets/icons/discord-notification.svg";

const { Panel } = Collapse;
type Props = { handleEnableDisabled: any; handleReset: any };

export enum CHANNEL {
    TELEGRAM = "telegram",
    DISCORD = "discord",
    EMAIL = "email",
    SLACK = "slack",
    ELEMENT = "element"
}

// eslint-disable-next-line no-empty-pattern
export default function NotificationChannels({
    handleEnableDisabled,
    handleReset
}: Props) {
    const [showModal, setShowModal] = useState<CHANNEL | null>(null);
    const { network } = useNetworkContext();
    const { id, networkPreferences, email, email_verified } =
        useUserDetailsContext();
    const [active, setActive] = useState<boolean | undefined>(false);
    const handleClick = (channelName: CHANNEL) => {
        setShowModal(channelName);
    };

    const getVerifyToken = async (channel: CHANNEL) => {
        try {
            const verifyTokenRes = await fetch(
                `${FIREBASE_FUNCTIONS_URL}/getChannelVerifyToken`,
                {
                    body: JSON.stringify({
                        channel,
                        userId: id
                    }),
                    headers: firebaseFunctionsHeader(network),
                    method: "POST"
                }
            );

            const { data: verifyToken, error: verifyTokenError } =
                (await verifyTokenRes.json()) as {
                    data: string;
                    error: string;
                };

            if (verifyTokenError) {
                queueNotification({
                    header: "Failed!",
                    message: verifyTokenError,
                    status: NotificationStatus.ERROR
                });
                return;
            }

            if (verifyToken) {
                return verifyToken;
            }
        } catch (error) {
            queueNotification({
                header: "Failed!",
                message: "Error in generating token.",
                status: NotificationStatus.ERROR
            });
        }
    };

    return (
        <Collapse
            size="large"
            className="bg-white"
            expandIconPosition="end"
            expandIcon={({ isActive }) => {
                setActive(isActive);
                return isActive ? <CollapseIcon /> : <ExpandIcon />;
            }}
        >
            <Panel
                header={
                    <div className="flex justify-between gap-[8px] items-center">
                        <div className="flex items-center gap-[6px] channel-header">
                            <NotificationChannelsIcon />
                            <h3 className="font-semibold text-[16px] text-[#243A57] md:text-[18px] tracking-wide leading-[21px] mb-0 pt-1">
                                Notification Channels
                            </h3>
                        </div>
                        {!!active && (
                            <div className="gap-4 hidden items-center md:flex">
                                <div
                                    className={`${
                                        !networkPreferences
                                            ?.channelPreferences?.[
                                            CHANNEL.EMAIL
                                        ]?.enabled
                                            ? "[&>svg]:opacity-50"
                                            : ""
                                    }`}
                                >
                                    <MailFilled />
                                </div>
                                {Bots.map((bot, i) => (
                                    <div
                                        className={`${
                                            !networkPreferences
                                                ?.channelPreferences?.[
                                                bot.channel
                                            ]?.enabled
                                                ? "[&>svg]:opacity-50"
                                                : ""
                                        }`}
                                        key={i}
                                    >
                                        {bot.Icon}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                }
                key="1"
            >
                <div className="flex flex-col">
                    <p className="font-medium text-[16px] leading-[21px] mb-[22px] text-[#243A57]">
                        Please select the socials where you would like to
                        receive notifications:
                    </p>
                    <EmailNotificationCard
                        verifiedEmail={
                            networkPreferences?.channelPreferences?.[
                                CHANNEL.EMAIL
                            ]?.handle ||
                            email ||
                            ""
                        }
                        verified={email_verified || false}
                        notificationEnabled={
                            networkPreferences?.channelPreferences?.[
                                CHANNEL.EMAIL
                            ]?.enabled || false
                        }
                        handleEnableDisabled={handleEnableDisabled}
                    />
                    <Divider
                        className="border-[#D2D8E0] border-2 my-[30px]"
                        dashed
                    />
                    {Bots.map((bot, i) => (
                        <div key={bot.title}>
                            <BotSetupCard
                                {...bot}
                                onClick={handleClick}
                                enabled={
                                    networkPreferences?.channelPreferences?.[
                                        bot.channel
                                    ]?.enabled || false
                                }
                                isBotSetup={
                                    networkPreferences?.channelPreferences?.[
                                        bot.channel
                                    ]?.enabled === undefined
                                        ? false
                                        : true
                                }
                                handleEnableDisabled={handleEnableDisabled}
                                handleReset={handleReset}
                            />
                            {Bots.length - 1 > i && (
                                <Divider
                                    className="border-[#D2D8E0] border-[2px] my-[30px]"
                                    dashed
                                />
                            )}
                        </div>
                    ))}
                </div>
                <TelegramInfoModal
                    icon={<TelegramIcon />}
                    title="How to add Bot to Telegram"
                    open={showModal === CHANNEL.TELEGRAM}
                    getVerifyToken={getVerifyToken}
                    onClose={() => setShowModal(null)}
                    generatedToken={
                        networkPreferences?.channelPreferences?.[
                            CHANNEL.TELEGRAM
                        ]?.verification_token || ""
                    }
                />
                <DiscordInfoModal
                    icon={<DiscordIcon />}
                    title="How to add Bot to Discord"
                    open={showModal === CHANNEL.DISCORD}
                    getVerifyToken={getVerifyToken}
                    onClose={() => setShowModal(null)}
                    generatedToken={
                        networkPreferences?.channelPreferences?.[
                            CHANNEL.DISCORD
                        ]?.verification_token || ""
                    }
                />
                <SlackInfoModal
                    icon={<SlackIcon />}
                    title="How to add Bot to Slack"
                    open={showModal === CHANNEL.SLACK}
                    getVerifyToken={getVerifyToken}
                    onClose={() => setShowModal(null)}
                    generatedToken={
                        networkPreferences?.channelPreferences?.[
                            CHANNEL.DISCORD
                        ]?.verification_token || ""
                    }
                />
            </Panel>
        </Collapse>
    );
}

const Bots = [
    {
        Icon: <TelegramIcon />,
        channel: CHANNEL.TELEGRAM,
        description: "a Telegram chat to get Telegram notifications",
        title: "Telegram"
    },
    {
        Icon: <DiscordIcon />,
        channel: CHANNEL.DISCORD,
        description: "a Discord Channel chat to get Discord notifications",
        title: "Discord"
    },
    {
        Icon: <SlackIcon style={{ marginTop: 4, transform: "scale(0.9)" }} />,
        channel: CHANNEL.SLACK,
        description: "",
        title: "Slack"
    },
    {
        Icon: <ElementIcon style={{ marginTop: 4, transform: "scale(0.9)" }} />,
        channel: CHANNEL.ELEMENT,
        description: "",
        title: "Element"
    }
];
