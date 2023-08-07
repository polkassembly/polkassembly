// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from "react";
import { ESocialType, ISocial } from "~src/auth/types";
import {
    DiscordIcon,
    EmailIcon,
    RiotIcon,
    TelegramIcon,
    TwitterIcon
} from "~src/ui-components/CustomIcons";

interface ISocialIconProps {
    type: ESocialType;
    className?: string;
}

export const SocialIcon: FC<ISocialIconProps> = (props) => {
    switch (props.type) {
        case ESocialType.EMAIL:
            return <EmailIcon className={props.className} />;
        case ESocialType.RIOT:
            return <RiotIcon className={props.className} />;
        case ESocialType.TWITTER:
            return <TwitterIcon className={props.className} />;
        case ESocialType.TELEGRAM:
            return <TelegramIcon className={props.className} />;
        case ESocialType.DISCORD:
            return <DiscordIcon className={props.className} />;
        default:
            return <></>;
    }
};

interface ISocialLink extends ISocial {
    className?: string;
    disable?: boolean;
    iconClassName?: string;
}

const SocialLink: FC<ISocialLink> = (props) => {
    const { link: handle, className, type, disable, iconClassName } = props;

    function getSocialLink(handle: any) {
        let username = "";
        if (handle.startsWith("https://")) {
            const url = new URL(handle);
            username = url.pathname.split("/")[1];
        } else {
            username = handle;
        }
        return username;
    }
    const userName = getSocialLink(handle);
    let link = "";
    switch (type) {
        case ESocialType.TWITTER:
            link = `https://twitter.com/${userName}`;
            break;
        case ESocialType.TELEGRAM:
            link = `https:/t.me/${userName}`;
            break;
        case ESocialType.EMAIL:
            link = `mailto:${handle}`;
            break;
        case ESocialType.RIOT:
            link = `https://riot.im/app/#/user/${userName}`;
            break;
        case ESocialType.DISCORD:
            link = `https://discordapp.com/users/${userName}`;
            break;
    }

    return (
        <>
            {disable ? (
                <span className={`${className} cursor-not-allowed opacity-60`}>
                    <SocialIcon type={type} className={iconClassName} />
                </span>
            ) : (
                <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className={className}
                >
                    <SocialIcon type={type} className={iconClassName} />
                </a>
            )}
        </>
    );
};
export default SocialLink;
