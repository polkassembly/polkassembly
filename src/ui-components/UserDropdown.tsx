// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { UserOutlined, CheckCircleFilled } from '@ant-design/icons';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import React, { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import styled from 'styled-components';
import { Avatar } from 'antd';

import { useNetworkContext, useUserDetailsContext } from '~src/context';
import getEncodedAddress from '~src/util/getEncodedAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import getSubstrateAddress from '~src/util/getSubstrateAddress';
import classNames from 'classnames';
import { ApiPromise } from '@polkadot/api';
import { network as AllNetworks } from '~src/global/networkConstants';
import MANUAL_USERNAME_25_CHAR from '~src/auth/utils/manualUsername25Char';
import { DeriveAccountInfo } from '@polkadot/api-derive/types';

export enum EAddressOtherTextType {
	CONNECTED = 'Connected',
	COUNCIL = 'Council',
	COUNCIL_CONNECTED = 'Council (Connected)',
	LINKED_ADDRESS = 'Linked',
	UNLINKED_ADDRESS = 'Address not linked'
}

interface Props {
	address: string;
	className?: string;
	displayInline?: boolean;
	disableIdenticon?: boolean;
	extensionName?: string;
	popupContent?: string;
	disableAddress?: boolean;
	shortenAddressLength?: number;
	isShortenAddressLength?: boolean;
	textClassName?: string;
	identiconSize?: number;
	ethIdenticonSize?: number;
	disableHeader?: boolean;
	disableAddressClick?: boolean;
	isSubVisible?: boolean;
	addressClassName?: string;
	clickable?: boolean;
	truncateUsername?: boolean;
	otherTextType?: EAddressOtherTextType;
	otherTextClassName?: string;
	passedUsername?: string;
	passedImageURL?: string;
	isVoterAddress?: boolean;
	isSimpleDropdown?: boolean;
}

const UserDropdown = ({
	address,
	className,
	displayInline,
	disableAddress,
	disableAddressClick,
	addressClassName,
	clickable = true,
	otherTextType,
	otherTextClassName,
	isVoterAddress
}: Props): JSX.Element => {
	const { network } = useNetworkContext();
	const apiContext = useContext(ApiContext);
	const [api, setApi] = useState<ApiPromise>();
	const [apiReady, setApiReady] = useState(false);
	const [img, setImg] = useState<string>('');
	const { username } = useUserDetailsContext();
	const [isIdentityUnverified, setIsIdentityUnverified] = useState<boolean>(false);
	const [isGood, setIsGood] = useState<boolean>(false);
	const [mainDisplay, setMainDisplay] = useState<string>('');
	const displayUsername = mainDisplay || username;
	useEffect(() => {
		if (network === AllNetworks.COLLECTIVES && apiContext.relayApi && apiContext.relayApiReady) {
			setApi(apiContext.relayApi);
			setApiReady(apiContext.relayApiReady);
		} else {
			if (!apiContext.api || !apiContext.apiReady) return;
			setApi(apiContext.api);
			setApiReady(apiContext.apiReady);
		}
	}, [network, apiContext.api, apiContext.apiReady, apiContext.relayApi, apiContext.relayApiReady]);

	const encoded_addr = address ? getEncodedAddress(address, network) || '' : '';
	const fetchUsername = async (isOnclick: boolean) => {
		if (isVoterAddress) {
			return;
		}
		const substrateAddress = getSubstrateAddress(address);

		if (substrateAddress) {
			try {
				const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`, undefined, 'GET');
				if (error || !data || !data.username) {
					return;
				}

				console.log(data);
				setImg(data?.profile?.image || '');
				if (isOnclick) {
					return;
				}

				if (MANUAL_USERNAME_25_CHAR.includes(data.username) || data.custom_username || data.username.length !== 25) {
					return;
				}
			} catch (error) {
				console.log(error);
			}
		}
	};

	const getKiltName = async () => {
		if (!api || !apiReady) return;
	};

	useEffect(() => {
		try {
			if (!username) fetchUsername(false);
		} catch (error) {
			// console.log(error);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;

		api.derive.accounts
			.info(encoded_addr, () => {
				// setIdentity(info.identity);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [encoded_addr, api, apiReady]);

	useEffect(() => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;

		api.derive.accounts
			.flags(encoded_addr, () => {})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();
	}, [encoded_addr, api, apiReady]);

	useEffect(() => {
		if (network === 'kilt') {
			getKiltName();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network]);

	useEffect(() => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;
		const address = localStorage.getItem('loginAddress');
		const encoded_addr = address ? getEncodedAddress(address, network) : '';

		if (!encoded_addr) return;

		api.derive.accounts
			.info(encoded_addr, (info: DeriveAccountInfo) => {
				if (info.identity.displayParent && info.identity.display) {
					// when an identity is a sub identity `displayParent` is set
					// and `display` get the sub identity
					setMainDisplay(info.identity.displayParent);
				} else {
					// There should not be a `displayParent` without a `display`
					// but we can't be too sure.
					setMainDisplay(info.identity.displayParent || info.identity.display || info.nickname || '');
				}
				const infoCall = info.identity?.judgements.filter(([, judgement]): boolean => judgement.isFeePaid);
				const judgementProvided = infoCall?.some(([, judgement]): boolean => judgement.isFeePaid);
				const isGood = info.identity?.judgements.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
				setIsGood(Boolean(isGood));
				setIsIdentityUnverified(judgementProvided || !info?.identity?.judgements?.length);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);
	return (
		<div
			className={`${displayInline ? className + ' display_inline' : className} user-container flex items-center justify-center rounded-3xl bg-[#f6f7f9] px-2 font-semibold`}
			style={{ border: '1px solid #d7dce3' }}
		>
			{img ? (
				<Avatar
					className='user-image -ml-1 mr-2'
					size={20}
					src={img}
				/>
			) : (
				<Avatar
					className='user-image -ml-1 mr-2'
					size={20}
					icon={<UserOutlined />}
				/>
			)}
			{!disableAddress && (
				<div
					className={`content -mr-[3px] ${clickable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
					onClick={async () => {
						if (!clickable) {
							return;
						}
						if (!disableAddressClick) {
							await fetchUsername(true);
						}
					}}
				>
					<div className={`description ${addressClassName} user-details-container flex overflow-hidden text-xs text-bodyBlue`}>
						<div className={`truncate text-ellipsis ${isGood ? '' : 'w-[66px]'}`}>
							{displayUsername && displayUsername?.length > 7 && isGood && !isIdentityUnverified ? `${displayUsername?.slice(0, 7)}...` : displayUsername || ''}
						</div>
						{isGood && !isIdentityUnverified && (
							<CheckCircleFilled
								style={{ color: 'green' }}
								className='relative top-[1px] ml-1 rounded-full border-none bg-transparent text-sm'
							/>
						)}
					</div>
				</div>
			)}
			{otherTextType ? (
				<p className={`m-0 flex items-center gap-x-1 text-[10px] leading-[15px] text-lightBlue ${otherTextClassName}`}>
					<span
						className={classNames('h-[6px] w-[6px] rounded-full', {
							'bg-aye_green ': [EAddressOtherTextType.CONNECTED, EAddressOtherTextType.COUNCIL_CONNECTED].includes(otherTextType),
							'bg-blue ': otherTextType === EAddressOtherTextType.COUNCIL,
							'bg-nay_red': [EAddressOtherTextType.LINKED_ADDRESS, EAddressOtherTextType.UNLINKED_ADDRESS].includes(otherTextType)
						})}
					></span>
					<span className='text-xs text-lightBlue'>{otherTextType}</span>
				</p>
			) : null}
			<div className='-ml-2 flex items-center justify-center'>
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='30'
					height='25'
					viewBox='0 0 20 21'
					fill='none'
				>
					<path
						d='M6.76693 8.2418L10.0003 11.4751L13.2336 8.2418C13.5586 7.9168 14.0836 7.9168 14.4086 8.2418C14.7336 8.5668 14.7336 9.0918 14.4086 9.4168L10.5836 13.2418C10.2586 13.5668 9.73359 13.5668 9.40859 13.2418L5.58359 9.4168C5.25859 9.0918 5.25859 8.5668 5.58359 8.2418C5.90859 7.92513 6.44193 7.9168 6.76693 8.2418Z'
						fill='#485F7D'
					/>
				</svg>
			</div>
		</div>
	);
};

export default styled(UserDropdown)`
	position: relative;
	display: flex;
	align-items: center;

	.content {
		display: inline-block;
		color: nav_blue !important;
	}

	.identicon {
		margin-right: 0.25rem;
	}
	.identicon svg {
		width: 20px;
		font-size: 15px;
	}

	.identityName {
		filter: grayscale(100%);
	}

	.header {
		color: black_text;
		font-weight: 500;
		margin-right: 0.4rem;
	}

	.description {
		color: nav_blue;
		margin-right: 0.4rem;
	}

	.display_inline {
		display: inline-flex !important;
	}

	.sub {
		color: nav_blue;
		line-height: inherit;
	}

	@media (max-width: 468px) and (min-width: 380px) {
		.user-details-container {
			width: 100px !important;
			font-size: 14px !important;
		}

		.user-image-container {
			transform: scale(2);
			margin-left: -32px !important;
		}

		.user-container {
			display: flex !important;
			margin-top: 30px !important;
		}
	}
`;
