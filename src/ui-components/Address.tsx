// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveAccountFlags, DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { Skeleton, Space, Tooltip } from 'antd';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import React, { useContext, useEffect, useState } from 'react';
import { ApiContext } from 'src/context/ApiContext';
import styled from 'styled-components';

import { useNetworkContext } from '~src/context';
import getEncodedAddress from '~src/util/getEncodedAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import shortenAddress from '../util/shortenAddress';
import EthIdenticon from './EthIdenticon';
import IdentityBadge from './IdentityBadge';
import getSubstrateAddress from '~src/util/getSubstrateAddress';

interface Props {
	address: string
	className?: string
	displayInline?: boolean
	disableIdenticon?: boolean
	extensionName?: string
	popupContent?: string
	disableAddress?:boolean
	shortenAddressLength?:number
	isShortenAddressLength?:boolean
	textClassName?:string
	identiconSize?: number;
	ethIdenticonSize?: number;
	disableHeader?: boolean;
	disableAddressClick?: boolean;
	isSubVisible?: boolean;
  addressClassName?: string;
  clickable?:boolean
}

const Identicon = dynamic(() => import('@polkadot/react-identicon'), {
	loading: () => <Skeleton.Avatar active size='large' shape='circle' /> ,
	ssr: false
});

const Address = ({ address, className, displayInline, disableIdenticon, extensionName, popupContent, disableAddress, textClassName, shortenAddressLength, isShortenAddressLength = true, identiconSize, ethIdenticonSize, disableHeader, disableAddressClick, isSubVisible = true, addressClassName, clickable=true }: Props): JSX.Element => {
	const { network } = useNetworkContext();
	const { api, apiReady } = useContext(ApiContext);
	const [mainDisplay, setMainDisplay] = useState<string>('');
	const [sub, setSub] = useState<string | null>(null);
	const [identity, setIdentity] = useState<DeriveAccountRegistration | null>(null);
	const [flags, setFlags] = useState<DeriveAccountFlags | undefined>(undefined);
	const router = useRouter();
	const [username, setUsername] = useState('');

	const encoded_addr = address ? getEncodedAddress(address, network) || '' : '';

	const fetchUsername = async () => {
		const substrateAddress = getSubstrateAddress(address);
		if (!username && substrateAddress) {
			const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`);
			if (error) {
				console.error(error);
				return;
			}
			if (data && data.username) {
				setUsername(data.username);
				router.push(`/user/${data.username}`);
			}
		}
	};

	useEffect(() => {
		if (!api){
			return;
		}

		if (!apiReady){
			return;
		}

		let unsubscribe: () => void;

		api.derive.accounts.info(encoded_addr, (info: DeriveAccountInfo) => {
			setIdentity(info.identity);

			if (info.identity.displayParent && info.identity.display){
				// when an identity is a sub identity `displayParent` is set
				// and `display` get the sub identity
				setMainDisplay(info.identity.displayParent);
				setSub(info.identity.display);
			} else {
				// There should not be a `displayParent` without a `display`
				// but we can't be too sure.
				setMainDisplay(info.identity.displayParent || info.identity.display || info.nickname || '');
			}
		})
			.then(unsub => { unsubscribe = unsub; })
			.catch(e => console.error(e));

		return () => unsubscribe && unsubscribe();
	}, [encoded_addr, api, apiReady]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		let unsubscribe: () => void;

		api.derive.accounts.flags(encoded_addr, (result: DeriveAccountFlags) => {
			setFlags(result);
		})
			.then(unsub => { unsubscribe = unsub; })
			.catch(e => console.error(e));

		return () => unsubscribe && unsubscribe();
	}, [encoded_addr, api, apiReady]);

	const t1 = mainDisplay || (isShortenAddressLength? shortenAddress(encoded_addr, shortenAddressLength): encoded_addr);
	const t2 = extensionName || mainDisplay;

	return (
		<div className={displayInline ? `${className} display_inline`: className}>
			{
				!disableIdenticon ?
					encoded_addr.startsWith('0x') ?
						<EthIdenticon className='image identicon flex items-center' size={ethIdenticonSize? ethIdenticonSize: 26} address={encoded_addr} />
						:
						<Identicon
							className='image identicon'
							value={encoded_addr}
							size={identiconSize? identiconSize:displayInline ? 20 : 32}
							theme={'polkadot'}
						/>
					:
					null
			}
			{!disableAddress && <div className={`content ${clickable ? 'cursor-pointer' : 'cursor-not-allowed' }`} onClick={async () => {
				if(!clickable){
					return;
				}
				if (!disableAddressClick) {
					await fetchUsername();
				}
			}}>
				{displayInline
					// When inline disregard the extension name.
					? popupContent
						? <Space>
							{identity && mainDisplay && <IdentityBadge address={address} identity={identity} flags={flags} />}
							<Tooltip color='#E5007A' title={popupContent}>
								<div className={'header display_inline identityName max-w-[30px] flex flex-col gap-y-1'}>
									{ t1 && <span className='truncate text-navBlue'>{t1}</span> }
									{sub && isSubVisible && <span className='sub truncate text-navBlue'>{sub}</span>}
								</div>
							</Tooltip>
						</Space>
						: <>
							<div className={'description display_inline flex items-center'}>
								{identity && mainDisplay && <IdentityBadge address={address} identity={identity} flags={flags} className='mr-2' />}
								<span title={mainDisplay || encoded_addr} className={` identityName max-w-[85px] flex gap-x-1 ${textClassName}`}>
									{ t1 && <span className={`truncate text-navBlue ${identity && mainDisplay && '-ml-1.5'}`}>{ t1 }</span> }
									{sub && isSubVisible && <span className={'sub truncate text-navBlue'}>{sub}</span>}
								</span>
							</div>
						</>
					: extensionName || mainDisplay
						? popupContent
							?
							<Tooltip color='#E5007A' title={popupContent}>
								<Space>
									<Space className={'header'}>
										{identity && mainDisplay && !extensionName && <IdentityBadge address={address} identity={identity} flags={flags} />}
										<span className='bg-red-500 identityName max-w-[85px] flex flex-col gap-y-1'>
											{ t2 && <span className={`${textClassName} truncate text-navBlue`}>{ t2 }</span> }
											{!extensionName && sub && isSubVisible && <span className={`${textClassName} sub truncate text-navBlue`}>{sub}</span>}
										</span>
									</Space>
									<div className={'description display_inline'}>{isShortenAddressLength? shortenAddress(encoded_addr, shortenAddressLength): encoded_addr}</div>
								</Space>
							</Tooltip>
							: <div>
								{
									!disableHeader ?
										<Space className={'header'}>
											{identity && mainDisplay && !extensionName && <IdentityBadge address={address} identity={identity} flags={flags} />}
											<span className='identityName max-w-[85px] flex flex-col gap-y-1'>
												{ t2 && <span className={`${textClassName} truncate text-navBlue`}>{ t2 }</span> }
												{!extensionName && sub && isSubVisible && <span className={`${textClassName} sub truncate text-navBlue`}>{sub}</span>}
											</span>
										</Space>
										: null
								}
								<div className={`description text-xs ml-0.5 ${addressClassName}`}>{isShortenAddressLength? shortenAddress(encoded_addr, shortenAddressLength): encoded_addr}</div>
							</div>
						: <div className={`description text-xs ${addressClassName}`}>{isShortenAddressLength? shortenAddress(encoded_addr, shortenAddressLength): encoded_addr}</div>
				}
			</div>}
		</div>
	);
};

export default styled(Address)`
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
`;
