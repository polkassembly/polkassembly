// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC } from 'react';
import { ESocialType, ISocial } from '~src/auth/types';
import { DiscordIcon, EmailIcon, RiotIcon, TelegramIcon, TwitterIcon } from '~src/ui-components/CustomIcons';

interface ISocialIconProps {
	type: ESocialType;
}

export const SocialIcon: FC<ISocialIconProps> = (props) => {
	switch(props.type) {
	case ESocialType.EMAIL:
		return <EmailIcon />;
	case ESocialType.RIOT:
		return <RiotIcon />;
	case ESocialType.TWITTER:
		return <TwitterIcon />;
	case ESocialType.TELEGRAM:
		return <TelegramIcon />;
	case ESocialType.DISCORD:
		return <DiscordIcon />;
	default:
		return <></>;
	}
};

interface ISocialLink extends ISocial{
	className?: string;
	disable?: boolean;
}

const SocialLink: FC<ISocialLink> = (props) => {
	const { link, className, type, disable } = props;
	return (
		<>
			{
				disable?
					<span className={`${className} cursor-not-allowed opacity-60`}>
						<SocialIcon type={type} />
					</span>
					: <a
						href={type === ESocialType.EMAIL? `mailto:${link}`: link} target='_blank'
						rel='noreferrer'
						className={className}
					>
						<SocialIcon type={type} />
					</a>
			}
		</>
	);
};
export default SocialLink;