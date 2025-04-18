// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useContext, useEffect, useState } from 'react';
import { DeriveAccountFlags } from '@polkadot/api-derive/types';
import { ApiPromise } from '@polkadot/api';
import { ApiContext } from '~src/context/ApiContext';
import { network as AllNetworks } from '~src/global/networkConstants';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import { IGetProfileWithAddressResponse } from 'pages/api/v1/auth/data/profileWithAddress';
import MANUAL_USERNAME_25_CHAR from '~src/auth/utils/manualUsername25Char';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getKiltDidName } from '~src/util/kiltDid';
import shortenAddress from '~src/util/shortenAddress';
import EthIdenticon from './EthIdenticon';
import { EAddressOtherTextType, IIdentityInfo } from '~src/types';
import classNames from 'classnames';
import styled from 'styled-components';
import IdentityBadge from './IdentityBadge';
import { Divider, message, Space } from 'antd';
import dynamic from 'next/dynamic';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
import { ISocial } from '~src/auth/types';
import QuickView, { TippingUnavailableNetworks } from './QuickView';
import { CopyIcon, VerifiedIcon } from './CustomIcons';
import Tooltip from '~src/basic-components/Tooltip';
import Image from 'next/image';
import { isAddress } from 'ethers';
import { dmSans } from 'pages/_app';
import getIdentityInformation from '~src/auth/utils/getIdentityInformation';
import { usePeopleChainApiContext } from '~src/context';
import isPeopleChainSupportedNetwork from '~src/components/OnchainIdentity/utils/getPeopleChainSupportedNetwork';
import copyToClipboard from '~src/util/copyToClipboard';
import IdenticonAndProfileImage from './IdenticonAndProfileImage';

const Tipping = dynamic(() => import('~src/components/Tipping'), {
	ssr: false
});

interface Props {
	address: string;
	className?: string;
	iconSize?: number;
	isSubVisible?: boolean;
	disableHeader?: boolean;
	displayInline?: boolean;
	addressClassName?: string;
	usernameMaxLength?: number;
	addressMaxLength?: number;
	isTruncateUsername?: boolean;
	usernameClassName?: string;
	disableIdenticon?: boolean;
	disableAddressClick?: boolean;
	showFullAddress?: boolean;
	extensionName?: string;
	addressOtherTextType?: EAddressOtherTextType;
	passedUsername?: string;
	ethIdenticonSize?: number;
	isVoterAddress?: boolean;
	disableTooltip?: boolean;
	showKiltAddress?: boolean;
	destroyTooltipOnHide?: boolean;
	inPostHeading?: boolean;
	isProfileView?: boolean;
	addressWithVerifiedTick?: boolean;
	isUsedIndelegationNudge?: boolean;
	isUsedInDelegationProfile?: boolean;
	isUsedInProfileBalances?: boolean;
	isUsedInAccountsPage?: boolean;
	disableParentProxyAddressTitle?: boolean;
	showCopyIcon?: boolean;
	showProxyTitle?: boolean;
	withUserProfileImage?: boolean;
}

const shortenUsername = (username: string, usernameMaxLength?: number) => {
	if (username.length > 19) {
		return shortenAddress(username, usernameMaxLength || 8);
	}
	return username;
};

const ParentProxyTitle = ({
	className,
	title,
	truncate,
	parentProxyAddress,
	disableParentProxyAddressTitle = false
}: {
	className?: string;
	title: string | null;
	truncate?: boolean;
	parentProxyAddress: string | null;
	disableParentProxyAddressTitle?: boolean;
}) => {
	if (!title?.length || disableParentProxyAddressTitle) return null;
	return (
		<Tooltip
			className={className}
			title={
				<div className='flex flex-col items-start justify-start gap-1 text-xs'>
					<span>Sub-account: On-chain Identity derived</span>
					<div className='flex flex-shrink-0 items-center justify-start gap-1'>
						from the parent-{' '}
						<Address
							address={parentProxyAddress || ''}
							displayInline
							disableTooltip
							usernameClassName='text-blue-dark-high text-xs'
							className='flex items-center text-xs'
							disableParentProxyAddressTitle
							iconSize={14}
							isTruncateUsername
							usernameMaxLength={10}
						/>
					</div>
				</div>
			}
		>
			<div className={classNames(className, 'flex items-center gap-0.5')}>
				<Divider
					type='vertical'
					className='border-[1px] bg-lightBlue dark:bg-separatorDark'
				/>
				<span
					className='hidden font-medium text-[#407BFF] sm:block'
					title={title}
				>
					{title?.length > 10 || truncate ? `${title?.slice(0, 10)}...` : title}
				</span>
				<span className='rounded-xl bg-[#f3f7ff] px-1 py-0.5 dark:bg-alertColorDark sm:ml-0.5'>
					<Image
						src={'/assets/icons/proxy-icon.svg'}
						height={14}
						width={14}
						alt=''
					/>
				</span>
			</div>
		</Tooltip>
	);
};

const Address = (props: Props) => {
	const {
		className,
		address,
		disableIdenticon = false,
		displayInline,
		iconSize,
		isSubVisible = true,
		showFullAddress,
		addressClassName,
		disableAddressClick = false,
		disableHeader,
		showProxyTitle = true,
		isTruncateUsername = true,
		usernameClassName,
		extensionName,
		usernameMaxLength,
		addressMaxLength,
		addressOtherTextType,
		withUserProfileImage = false,
		passedUsername,
		ethIdenticonSize,
		isVoterAddress,
		disableTooltip = false,
		showKiltAddress = false,
		destroyTooltipOnHide = false,
		inPostHeading,
		isProfileView = false,
		addressWithVerifiedTick = false,
		isUsedIndelegationNudge = false,
		isUsedInDelegationProfile = false,
		isUsedInAccountsPage = false,
		disableParentProxyAddressTitle = false,
		isUsedInProfileBalances = false,
		showCopyIcon = false
	} = props;
	const { network } = useNetworkSelector();
	const apiContext = useContext(ApiContext);
	const [api, setApi] = useState<ApiPromise | null>(null);
	const { peopleChainApi, peopleChainApiReady } = usePeopleChainApiContext();
	const router = useRouter();
	const isDelegation = router.asPath.includes('delegation');
	const [apiReady, setApiReady] = useState(false);
	const [mainDisplay, setMainDisplay] = useState<string>('');
	const [sub, setSub] = useState<string>('');
	const [identity, setIdentity] = useState<IIdentityInfo | null>(null);
	const [flags, setFlags] = useState<DeriveAccountFlags>();
	const [username, setUsername] = useState<string>(passedUsername || '');
	const [kiltName, setKiltName] = useState<string>('');
	const { resolvedTheme: theme } = useTheme();
	const [imgUrl, setImgUrl] = useState<string>('');
	const [profileCreatedAt, setProfileCreatedAt] = useState<Date | null>(null);
	const [userIdForThisAddress, setUserIdForThisAddress] = useState<number | null>(null);
	const encodedAddr = address ? getEncodedAddress(address, network) || '' : '';
	const [isAutoGeneratedUsername, setIsAutoGeneratedUsername] = useState(true);
	const [open, setOpen] = useState<boolean>(false);
	const [openTipping, setOpenTipping] = useState<boolean>(false);
	const [socials, setSocials] = useState<ISocial[]>([]);
	const [openAddressChangeModal, setOpenAddressChangeModal] = useState<boolean>(false);
	const [isW3FDelegate, setIsW3FDelegate] = useState<boolean>(false);
	const [isGood, setIsGood] = useState(false);
	const [messageApi, contextHolder] = message.useMessage();

	const getData = async () => {
		if (!api || !apiReady) return;

		if (!((getEncodedAddress(address, network) || isAddress(address)) && address.length > 0)) return;

		const { data, error } = await nextApiClientFetch<{ isW3fDelegate: boolean }>('api/v1/delegations/getW3fDelegateCheck', {
			addresses: [address]
		});
		if (data) {
			setIsW3FDelegate(data?.isW3fDelegate || false);
		} else {
			console.log(error);
			setIsW3FDelegate(false);
		}
	};

	useEffect(() => {
		if (!api || !apiReady || !address) return;
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady, address]);

	useEffect(() => {
		if (network === AllNetworks.COLLECTIVES && apiContext.relayApi && apiContext.relayApiReady) {
			setApi(apiContext.relayApi);
			setApiReady(apiContext.relayApiReady);
		} else if (isPeopleChainSupportedNetwork(network)) {
			setApi(peopleChainApi || null);
			setApiReady(peopleChainApiReady);
		} else {
			if (!apiContext.api || !apiContext.apiReady) return;
			setApi(apiContext.api);
			setApiReady(apiContext.apiReady);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, apiContext.api, apiContext.apiReady, apiContext.relayApi, apiContext.relayApiReady, address, peopleChainApi, peopleChainApiReady]);

	const FEATURE_RELEASE_DATE = dayjs('2023-06-12').toDate(); // Date from which we are sending custom username flag on web3 sign up.

	const fetchUsername = async (address: string) => {
		if (isVoterAddress) {
			return;
		}
		const substrateAddress = getSubstrateAddress(address);

		if (substrateAddress) {
			try {
				const { data, error } = await nextApiClientFetch<IGetProfileWithAddressResponse>(`api/v1/auth/data/profileWithAddress?address=${substrateAddress}`, undefined, 'GET');
				if (error || !data || !data.username) {
					setUsername('');
					setUserIdForThisAddress(null);
					setSocials([]);
					setImgUrl('');
					setIsAutoGeneratedUsername(false);
					return;
				}
				data.created_at && setProfileCreatedAt(new Date(data.created_at));
				setUsername(data.username || '');
				setImgUrl(data.profile?.image || '');
				setSocials(data?.profile.social_links || []);
				setUserIdForThisAddress(data?.user_id || null);
				if (MANUAL_USERNAME_25_CHAR.includes(data.username) || data.custom_username || data.username.length !== 25) {
					setIsAutoGeneratedUsername(false);
					return;
				} else if (
					(data.web3Signup && !data.created_at && data.username.length === 25) ||
					(data.web3Signup && data.username.length === 25 && dayjs(data.created_at).isBefore(dayjs(FEATURE_RELEASE_DATE)))
				) {
					setIsAutoGeneratedUsername(true);
				}
			} catch (error) {
				console.log(error);
				setUserIdForThisAddress(null);
				setUsername('');
				setSocials([]);
			}
		}
	};
	const handleRedirectLink = () => {
		const substrateAddress = getSubstrateAddress(address);
		if (!username) {
			return `https://${network}.polkassembly.io/address/${substrateAddress}`;
		}
		return `https://${network}.polkassembly.io/user/${username}`;
	};

	const handleIdentityInfo = () => {
		if (!api && !peopleChainApi) {
			setMainDisplay('');
			setSub('');
			setIdentity(null);
			return;
		}

		(async () => {
			const info = await getIdentityInformation({
				address: address,
				api: peopleChainApi ?? (api || undefined),
				network: network
			});
			setIdentity(info);
			if (info.display) {
				if (info.displayParent) {
					setMainDisplay(info?.displayParent);
					setSub(info?.display);
				} else {
					setMainDisplay(info?.displayParent || info?.display || (!isAutoGeneratedUsername ? shortenUsername(username, usernameMaxLength) : null) || info.nickname || '');
				}
			} else {
				setMainDisplay('');
				setSub('');
			}
			setIsGood(info?.isGood);
		})();
	};

	const getKiltName = async () => {
		if (!api || !apiReady) return;

		const web3Name = await getKiltDidName(api, address);
		setKiltName(web3Name ? `w3n:${web3Name}` : '');
	};

	const handleFlags = () => {
		if (!api || !apiReady) return;

		let unsubscribe: () => void;

		api.derive.accounts
			.flags(encodedAddr, (result: DeriveAccountFlags) => {
				setFlags(result);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();
	};

	useEffect(() => {
		if (!api || !apiReady) return;
		if (!address) return;

		try {
			fetchUsername(address);
		} catch (error) {
			console.log(error);
		}
		handleIdentityInfo();
		handleFlags();
		if (network === AllNetworks.KILT) {
			setKiltName('');
			getKiltName();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, peopleChainApi, peopleChainApiReady, address, encodedAddr, network]);

	useEffect(() => {
		setUsername(passedUsername || username);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [passedUsername]);

	const handleClick = (event: any) => {
		if (disableAddressClick) return;
		event.stopPropagation();
		event.preventDefault();
		window.open(handleRedirectLink(), '_blank');
	};

	const addressPrefix =
		kiltName ||
		mainDisplay ||
		(!isAutoGeneratedUsername ? username : null) ||
		(!showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr) ||
		shortenUsername(username, usernameMaxLength);
	const addressSuffix = extensionName || mainDisplay;

	const success = () => {
		messageApi.open({
			content: 'Address copied to clipboard',
			duration: 10,
			type: 'success'
		});
	};

	return (
		<div className={classNames(addressOtherTextType ? 'w-full' : ' myAddress', identity?.parentProxyTitle?.length ? 'flex items-center' : 'items-start')}>
			<Tooltip
				arrow
				color='#fff'
				overlayClassName={className}
				destroyTooltipOnHide={destroyTooltipOnHide}
				title={
					<QuickView
						socials={socials}
						setOpen={setOpen}
						setOpenTipping={setOpenTipping}
						profileCreatedAt={profileCreatedAt}
						userId={userIdForThisAddress}
						address={address}
						identity={identity}
						username={addressPrefix}
						polkassemblyUsername={username}
						imgUrl={imgUrl}
						setOpenAddressChangeModal={setOpenAddressChangeModal}
						isKiltNameExists={!!kiltName}
						isW3FDelegate={isW3FDelegate}
					/>
				}
				open={!disableTooltip ? open : false}
				onOpenChange={(e) => {
					setOpen(e);
				}}
			>
				<div className={`${className} flex ${isUsedInAccountsPage ? 'items-center md:items-start' : 'items-end '} gap-1`}>
					{!disableIdenticon &&
						(encodedAddr.startsWith('0x') ? (
							<EthIdenticon
								className='image identicon flex items-center'
								size={ethIdenticonSize || iconSize || 26}
								address={encodedAddr}
							/>
						) : (
							<IdenticonAndProfileImage
								address={encodedAddr}
								withUserProfileImage={withUserProfileImage}
								iconSize={iconSize ? iconSize : displayInline ? 20 : 32}
								displayInline={displayInline || false}
								imgUrl={imgUrl}
							/>
						))}
					{!isProfileView ? (
						<div className='flex items-center text-bodyBlue dark:text-blue-dark-high'>
							{displayInline ? (
								<div className='inline-address flex items-center'>
									{!!kiltName ||
										(!!identity && !!mainDisplay && (
											<IdentityBadge
												theme={theme}
												identity={identity}
												flags={flags}
												className='text-navBlue'
											/>
										))}

									<div
										className={`flex items-center font-semibold text-bodyBlue ${isUsedInAccountsPage && 'ml-1 text-xl md:ml-3 md:mt-1'} dark:text-blue-dark-high  ${
											!disableAddressClick && 'cursor-pointer hover:underline'
										}`}
									>
										<div
											onClick={(e) => handleClick(e)}
											title={mainDisplay || encodedAddr}
											className={`${isUsedIndelegationNudge ? 'text-xs' : ''} flex items-center gap-x-1 ${
												usernameClassName ? usernameClassName : 'font-semibold text-bodyBlue dark:text-blue-dark-high'
											} hover:text-bodyBlue dark:text-blue-dark-high ${inPostHeading ? 'text-xs' : 'text-sm'} ${isUsedInAccountsPage ? 'sm:text-xl' : ''}`}
										>
											{!!addressPrefix && (
												<span className={`${isTruncateUsername && !usernameMaxLength && 'max-w-[85px] truncate'}`}>
													{usernameMaxLength ? (addressPrefix.length > usernameMaxLength ? `${addressPrefix.slice(0, usernameMaxLength)}...` : addressPrefix) : addressPrefix}
												</span>
											)}
											{!!sub && !!isSubVisible && <span className={`${isTruncateUsername && !usernameMaxLength && 'max-w-[85px] truncate'}`}>{sub}</span>}
										</div>
									</div>
								</div>
							) : !!extensionName || !!mainDisplay ? (
								<div className='ml-0.5 font-semibold text-bodyBlue'>
									{!disableHeader && (
										<div>
											<div className='flex items-center'>
												{!!kiltName ||
													(!!identity && !!mainDisplay && (
														<IdentityBadge
															identity={identity}
															flags={flags}
														/>
													))}
												<Space className={'header'}>
													<div
														onClick={(e) => handleClick(e)}
														className={`flex flex-col items-center font-semibold text-bodyBlue ${
															!disableAddressClick && 'cursor-pointer hover:underline'
														} hover:text-bodyBlue dark:text-blue-dark-high`}
													>
														{!!addressSuffix && <span className={`${usernameClassName} ${isTruncateUsername && !usernameMaxLength && 'w-[85px] truncate'}`}>{addressSuffix}</span>}
														{!extensionName && !!sub && isSubVisible && (
															<span className={`${usernameClassName} ${isTruncateUsername && !usernameMaxLength && 'w-[85px] truncate'}`}>{sub}</span>
														)}
													</div>
												</Space>
											</div>
										</div>
									)}
									<div
										className={`${!addressClassName ? 'text-xs dark:text-blue-dark-medium' : addressClassName} ${
											!disableAddressClick && 'cursor-pointer hover:underline'
										} flex items-center font-normal ${isDelegation && isUsedInProfileBalances && 'dark:text-white'} `}
										onClick={(e) => handleClick(e)}
									>
										{kiltName ? addressPrefix : !showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr}
										{addressWithVerifiedTick && (!!kiltName || (!!identity && !!isGood)) && <div>{<VerifiedIcon className='ml-2 scale-125' />}</div>}
										{showKiltAddress && !!kiltName && <div className='font-normal text-lightBlue'>({shortenAddress(encodedAddr, addressMaxLength)})</div>}
										{addressWithVerifiedTick && (
											<div>
												{!kiltName && !isGood && (
													<Image
														src={'/assets/profile/identity-caution.svg'}
														height={20}
														width={20}
														alt=''
														className='-mt-1 ml-1'
													/>
												)}
											</div>
										)}
									</div>
								</div>
							) : (
								<div className={`${!addressClassName ? 'text-xs dark:text-blue-dark-medium' : addressClassName} flex items-center gap-0.5 font-semibold`}>
									{kiltName ? addressPrefix : !showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr}
									{showKiltAddress && !!kiltName && <div className='font-normal text-lightBlue'>({shortenAddress(encodedAddr, addressMaxLength)})</div>}
									{addressWithVerifiedTick && (!!kiltName || (!!identity && !!isGood)) && <div>{<VerifiedIcon className='ml-2 scale-125' />}</div>}
									{addressWithVerifiedTick && (
										<div>
											{!kiltName && !isGood && (
												<Image
													src={'/assets/profile/identity-caution.svg'}
													height={20}
													width={20}
													alt=''
													className='-mt-1 ml-1'
												/>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					) : (
						<div
							className={`${
								isUsedInDelegationProfile
									? `${dmSans.variable} ${dmSans.className} flex flex-col items-center text-[20px] text-blue-light-high dark:text-blue-dark-high`
									: 'flex items-center gap-x-2 font-semibold text-bodyBlue'
							} ${!addressSuffix && 'gap-0'}`}
						>
							{!disableHeader && (
								<div className='flex items-center'>
									<div className='flex items-center'>
										<Space className={'header'}>
											<div
												onClick={(e) => handleClick(e)}
												className={`flex items-center font-semibold text-bodyBlue ${!disableAddressClick && 'cursor-pointer hover:underline'} ${
													isUsedInDelegationProfile && 'gap-2'
												} text-base hover:text-bodyBlue dark:text-blue-dark-high`}
											>
												{!!addressPrefix && (
													<span
														className={`${usernameClassName} ${isTruncateUsername && !usernameMaxLength && 'w-[95px] truncate'} ${
															isUsedInAccountsPage ? 'ml-1 sm:ml-3 sm:text-xl' : ''
														}`}
													>
														{addressPrefix}
													</span>
												)}
												{isUsedInDelegationProfile && (!!kiltName || (!!identity && !!isGood)) && <VerifiedIcon className='scale-125' />}
											</div>
										</Space>
									</div>
								</div>
							)}
							{isUsedInAccountsPage && username && (
								<div className='flex items-center gap-[6px]'>
									<div
										className={` ${!disableAddressClick && 'cursor-pointer hover:underline'} font-medium dark:text-blue-dark-medium sm:text-xl ${
											isUsedInDelegationProfile && 'mt-[10px] flex gap-2 text-base font-normal sm:text-xl'
										}`}
										onClick={(e) => handleClick(e)}
									>
										({kiltName ? addressPrefix : !showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr})
									</div>
									{showCopyIcon && (
										<span
											className='flex cursor-pointer items-center text-base'
											onClick={(e) => {
												e.preventDefault();
												copyToClipboard(encodedAddr || '');
												success();
											}}
										>
											{contextHolder}
											<CopyIcon className='text-xl text-lightBlue dark:text-icon-dark-inactive' />
										</span>
									)}
								</div>
							)}
							{!isUsedInAccountsPage && (
								<div
									className={`${!addressClassName ? 'text-sm' : addressClassName} ${
										!disableAddressClick && 'cursor-pointer hover:underline'
									} font-normal dark:text-blue-dark-medium ${!addressSuffix && 'font-semibold'} ${isUsedInDelegationProfile && 'mt-[10px] flex gap-2 text-base font-normal'}`}
									onClick={(e) => handleClick(e)}
								>
									({kiltName ? addressPrefix : !showFullAddress ? shortenAddress(encodedAddr, addressMaxLength) : encodedAddr})
									{isUsedInDelegationProfile && (
										<span
											className='flex cursor-pointer items-center text-base'
											onClick={(e) => {
												e.preventDefault();
												copyToClipboard(encodedAddr || '');
												success();
											}}
										>
											{contextHolder}
											<CopyIcon className='text-xl text-lightBlue dark:text-icon-dark-inactive' />
										</span>
									)}
								</div>
							)}
							<div className='flex items-center gap-1 sm:gap-1.5'>
								{(!!kiltName || (!!identity && !!isGood)) && <VerifiedIcon className='scale-125' />}
								{isW3FDelegate && (
									<Tooltip
										title='Decentralized voices delegates'
										className={classNames(dmSans.className, dmSans.variable)}
									>
										<Image
											src={'/assets/profile/w3f.svg'}
											alt=''
											width={24}
											height={24}
											className='ml-[2px] sm:ml-2'
										/>
									</Tooltip>
								)}
							</div>
						</div>
					)}

					{addressOtherTextType ? (
						<p className={'m-0 ml-auto flex items-center gap-x-1 text-[10px] leading-[15px] text-lightBlue dark:text-blue-dark-medium'}>
							<span
								className={classNames('h-[6px] w-[6px] rounded-full', {
									'bg-aye_green ': [EAddressOtherTextType.LINKED_ADDRESS, EAddressOtherTextType.COUNCIL_CONNECTED].includes(addressOtherTextType),
									'bg-blue ': addressOtherTextType === EAddressOtherTextType.COUNCIL,
									'bg-nay_red': [EAddressOtherTextType.UNLINKED_ADDRESS].includes(addressOtherTextType)
								})}
							></span>
							<span className='text-xs text-lightBlue dark:text-blue-dark-medium'>{addressOtherTextType}</span>
						</p>
					) : null}
				</div>
			</Tooltip>
			{/* proxy parent title */}
			{!!identity?.parentProxyTitle && (displayInline || isProfileView || disableHeader) && showProxyTitle && (
				<ParentProxyTitle
					disableParentProxyAddressTitle={disableParentProxyAddressTitle}
					title={identity?.parentProxyTitle}
					truncate={isTruncateUsername}
					parentProxyAddress={identity?.parentProxyAddress}
					className={`${isProfileView ? 'text-sm' : 'text-xs'} font-normal ${className}`}
				/>
			)}
			{!TippingUnavailableNetworks.includes(network) && (
				<Tipping
					username={addressPrefix}
					open={openTipping}
					setOpen={setOpenTipping}
					paUsername={username}
					key={address}
					setOpenAddressChangeModal={setOpenAddressChangeModal}
					openAddressChangeModal={openAddressChangeModal}
				/>
			)}
		</div>
	);
};

export default styled(Address)`
	.ant-tooltip-content .ant-tooltip-inner {
		width: 400px !important;
	}
`;
