// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import {
    DesktopOutlined,
    FileTextOutlined,
    HomeFilled,
    PlayCircleFilled,
    TwitterOutlined,
    YoutubeFilled
} from "@ant-design/icons";
import { Space } from "antd";
import React from "react";
import {
    CubeIcon,
    DiscordIcon,
    GithubIcon,
    RedditIcon,
    TelegramIcon
} from "src/ui-components/CustomIcons";
import styled from "styled-components";

import { NetworkSocials } from "~src/types";

export const socialLinks = (blockchain_socials: NetworkSocials) => {
    if (!blockchain_socials) {
        return null;
    }

    return (
        <Space size={19} className="items-center">
            {blockchain_socials.homepage ? (
                <a
                    href={blockchain_socials.homepage}
                    target="_blank"
                    rel="noreferrer"
                >
                    <HomeFilled className="text-sm md:text-lg md:mr-1 text-lightBlue" />
                </a>
            ) : null}
            {blockchain_socials.twitter ? (
                <a
                    href={blockchain_socials.twitter}
                    target="_blank"
                    rel="noreferrer"
                >
                    <TwitterOutlined className="text-sm md:text-lg md:mr-1 text-lightBlue" />
                </a>
            ) : null}
            {blockchain_socials.discord ? (
                <a
                    href={blockchain_socials.discord}
                    target="_blank"
                    rel="noreferrer"
                >
                    <DiscordIcon className="text-sm md:text-lg md:mr-1 text-lightBlue" />
                </a>
            ) : null}
            {blockchain_socials.github ? (
                <a
                    href={blockchain_socials.github}
                    target="_blank"
                    rel="noreferrer"
                >
                    <GithubIcon className="text-sm md:text-lg md:mr-1 text-lightBlue" />
                </a>
            ) : null}
            {blockchain_socials.youtube ? (
                <a
                    href={blockchain_socials.youtube}
                    target="_blank"
                    rel="noreferrer"
                >
                    <YoutubeFilled className="text-sm md:text-lg md:mr-1 text-lightBlue" />
                </a>
            ) : null}
            {blockchain_socials.reddit ? (
                <a
                    href={blockchain_socials.reddit}
                    target="_blank"
                    rel="noreferrer"
                >
                    <RedditIcon className="text-sm md:text-lg md:mr-1 text-lightBlue" />
                </a>
            ) : null}
            {blockchain_socials.telegram ? (
                <a
                    href={blockchain_socials.telegram}
                    target="_blank"
                    rel="noreferrer"
                >
                    <TelegramIcon className="text-sm md:text-lg md:mr-1 text-lightBlue" />
                </a>
            ) : null}
            {blockchain_socials.block_explorer ? (
                <a
                    href={blockchain_socials.block_explorer}
                    target="_blank"
                    rel="noreferrer"
                >
                    <CubeIcon className="text-sm md:text-lg md:mr-1 text-lightBlue" />
                </a>
            ) : null}
        </Space>
    );
};

const gov2Link = ({
    className,
    bgImage,
    icon,
    link,
    text,
    subText
}: {
    className?: string;
    bgImage: any;
    icon?: any;
    link: string;
    text: string;
    subText: string;
}) => (
    <a
        href={link}
        target="_blank"
        rel="noreferrer"
        className={`${className} group flex min-w-[260px] max-w-[260px]`}
    >
        <div
            style={{ backgroundImage: `url(${bgImage})` }}
            className="group-hover:text-pink_secondary mr-3 flex items-center justify-center min-w-[132px] h-[75px]"
        >
            {icon}
        </div>

        <div className="flex flex-col justify-between">
            <div className="text-bodyBlue font-semibold text-sm group-hover:text-pink_secondary leading-[150%]">
                {text}
            </div>
            <div className="text-lightBlue font-medium text-xs group-hover:text-pink_secondary">
                {subText}
            </div>
        </div>
    </a>
);

const AboutNetwork = ({
    className,
    networkSocialsData,
    showGov2Links
}: {
    className?: string;
    networkSocialsData: NetworkSocials | null;
    showGov2Links?: boolean;
}) => {
    return (
        <div
            className={`${className} bg-white drop-shadow-md p-5 md:p-6 rounded-xxl`}
        >
            <div className="flex items-center justify-between">
                <h2 className="text-bodyBlue text-xl font-medium leading-8">
                    About
                </h2>
                <div className="hidden lg:inline-block">
                    {networkSocialsData && socialLinks(networkSocialsData)}
                </div>
            </div>

            <p className="text-bodyBlue mt-1.5 medium text-sm">
                Join our Community to discuss, contribute and get regular
                updates from us!
            </p>

            <div className="mt-5 lg:hidden flex">
                {networkSocialsData && socialLinks(networkSocialsData)}
            </div>

            {showGov2Links && (
                <div className="mt-10 pb-2 flex justify-between xl:w-[90%] overflow-x-auto">
                    {gov2Link({
                        bgImage: "/assets/gov2-info-bg.png",
                        className: "mr-12 lg:mr-9",
                        icon: (
                            <PlayCircleFilled className="text-white text-xl" />
                        ),
                        link: "https://www.youtube.com/watch?v=EF93ZM_P_Oc",
                        subText: "45:33 mins",
                        text: "Gavin's view on Gov2"
                    })}

                    {gov2Link({
                        bgImage: "/assets/gov2-info-bg-2.png",
                        className: "mr-12 lg:mr-9",
                        icon: (
                            <DesktopOutlined className="text-white text-xl" />
                        ),
                        link: "https://medium.com/polkadot-network/gov2-polkadots-next-generation-of-decentralised-governance-4d9ef657d11b",
                        subText: "17 min read",
                        text: "Gavin's blog on Medium"
                    })}

                    {gov2Link({
                        bgImage: "/assets/gov2-info-bg-3.png",
                        className: "mr-12 lg:mr-0",
                        icon: (
                            <FileTextOutlined className="text-white text-xl" />
                        ),
                        link: "https://wiki.polkadot.network/docs/learn-governance",
                        subText: "Wiki",
                        text: "Governance V1 Basics"
                    })}
                </div>
            )}
        </div>
    );
};

export default styled(AboutNetwork)`
    .anticon:hover {
        path {
            fill: var(--pink_primary) !important;
        }
    }
`;
