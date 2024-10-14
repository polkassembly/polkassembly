// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect, useState } from 'react';
import { ESocialType, ISocial } from '~src/auth/types';
import { useNetworkSelector } from '~src/redux/selectors';
import { useApiContext } from '~src/context';
import { getKiltDidName, getKiltDidSocialEndpoints } from '~src/util/kiltDid';
import Link from 'next/link';
import SocialLink from './SocialLinks';
import { UserOutlined } from '@ant-design/icons';
import { PolkaverseIcon, WebIcon } from './CustomIcons';
import classNames from 'classnames';
import Image from 'next/image';
import { isSubscanSupport } from '~src/util/subscanCheck';
import { socialLinks } from '~src/components/UserProfile/Socials';

interface ISocialsType {
	isVerified: boolean;
	key: ESocialType;
	value: string;
}
interface Props {
	className?: string;
	onchainIdentity: any | null;
	socials: ISocial[];
	address: string;
	boxSize?: number;
	iconSize?: number;
}
const SocialsHandle = ({ className, onchainIdentity, socials, address, boxSize = 24, iconSize = 14 }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const isGood = onchainIdentity?.isGood;
	const [isKiltNameExists, setIsKiltNameExists] = useState<boolean>(false);
	// const isBad = judgements?.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);
	const [identityArr, setIdentityArr] = useState<ISocialsType[]>([
		{
			isVerified: (!!onchainIdentity?.twitter && isGood) || false,
			key: ESocialType.TWITTER,
			value: onchainIdentity?.twitter || socials?.find((social) => social.type === 'Twitter')?.link || ''
		},
		{
			isVerified: (!!onchainIdentity?.email && isGood) || false,
			key: ESocialType.EMAIL,
			value: onchainIdentity?.email || socials?.find((social) => social.type === ESocialType.EMAIL)?.link || ''
		},
		{
			isVerified: ((!!onchainIdentity?.riot || !!onchainIdentity?.matrix) && isGood) || false,
			key: ESocialType.RIOT,
			value: onchainIdentity?.riot || onchainIdentity?.matrix || socials?.find((social) => social.type === ESocialType.RIOT)?.link || ''
		},
		{ isVerified: false, key: ESocialType.TELEGRAM, value: socials?.find((social) => social.type === ESocialType.TELEGRAM)?.link || '' }
	]);

	const handleSocials = () => {
		setIdentityArr([
			{
				isVerified: (!!onchainIdentity?.twitter && isGood) || false,
				key: ESocialType.TWITTER,
				value: onchainIdentity?.twitter || socials?.find((social) => social.type === 'Twitter')?.link || ''
			},
			{
				isVerified: (!!onchainIdentity?.email && isGood) || false,
				key: ESocialType.EMAIL,
				value: onchainIdentity?.email || socials?.find((social) => social.type === ESocialType.EMAIL)?.link || ''
			},
			{
				isVerified: ((!!onchainIdentity?.riot || !!onchainIdentity?.matrix) && isGood) || false,
				key: ESocialType.RIOT,
				value: onchainIdentity?.riot || onchainIdentity?.matrix || socials?.find((social) => social.type === ESocialType.RIOT)?.link || ''
			},
			{ isVerified: false, key: ESocialType.TELEGRAM, value: socials?.find((social) => social.type === ESocialType.TELEGRAM)?.link || '' }
		]);
	};
	const handleKiltSocialFields = (verified: boolean, key: ESocialType, value: string) => {
		switch (key) {
			case ESocialType.EMAIL:
				return { isVerified: verified, key: ESocialType.EMAIL, value: value as string };
			case ESocialType.TWITTER:
				return { isVerified: verified, key: ESocialType.TWITTER, value: value as string };
			case ESocialType.RIOT:
				return { isVerified: verified, key: ESocialType.RIOT, value: value as string };
			default:
				return {};
		}
	};
	const handleKiltSocials = async () => {
		if (!api || !apiReady || network !== 'kilt') return;
		const data = await getKiltDidSocialEndpoints(api, address);
		if (data) {
			const socialsArr: ISocialsType[] = [];
			for (const service of data) {
				if (['KiltPublishedCredentialCollectionV1'].includes(service?.serviceTypes?.[0])) {
					try {
						const res = await fetch(service?.urls?.[0]).then((e) => e.json());

						for (const social of res) {
							if (social?.credential?.claim?.contents) {
								Object.entries(social?.credential?.claim?.contents).map(([key, value]) => {
									socialsArr.push(handleKiltSocialFields(true, key as ESocialType, value as string) as ISocialsType);
									if (key === 'Username' && social?.metadata?.label === 'KILT Discord Credential') {
										socialsArr.push({ isVerified: true, key: ESocialType.DISCORD, value: value as string });
									} else if (key === 'Username' && social?.metadata?.label === 'Personal Telegram Credential') {
										socialsArr.push({ isVerified: true, key: ESocialType.TELEGRAM, value: value as string });
									}
								});
							}
						}
					} catch (err) {
						console.log(err, 'error');
					}
				} else if (['Twitter', 'Email', 'Telegram', 'Discord', 'Riot'].includes(service?.serviceTypes?.[0])) {
					try {
						const res = await fetch(service?.urls?.[0]).then((e) => e.json());
						if (res.request?.claim?.contents) {
							Object.entries(res?.request?.claim?.contents).map(([key, value]) => {
								socialsArr.push(handleKiltSocialFields(false, key as ESocialType, value as string) as ISocialsType);
								if (key === 'Username' && res.cTypeTitle === ESocialType.DISCORD) {
									socialsArr.push({ isVerified: false, key: ESocialType.DISCORD, value: value as string });
								}
								if (key === 'Username' && res.cTypeTitle === ESocialType.TELEGRAM) {
									socialsArr.push({ isVerified: false, key: ESocialType.TELEGRAM, value: value as string });
								}
							});
						}
					} catch (err) {
						console.log(err, 'error');
					}
				}
			}
			setIdentityArr(socialsArr);
		}
	};
	const getKiltName = async () => {
		if (!api || !apiReady) return;

		const web3Name = await getKiltDidName(api, address);
		setIsKiltNameExists(!!web3Name);
	};

	useEffect(() => {
		if (!isKiltNameExists || !api || !apiReady || network !== 'kilt') return;
		getKiltName();
		handleKiltSocials();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isKiltNameExists, api, apiReady, network]);

	useEffect(() => {
		if (isKiltNameExists || !api || !apiReady || network === 'kilt') return;

		handleSocials();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [onchainIdentity]);

	return (
		<div className={classNames(className, 'flex items-center gap-1.5')}>
			{!!onchainIdentity?.web && (
				<Link
					target='_blank'
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						window.open(onchainIdentity?.web, '_blank');
					}}
					href={onchainIdentity?.web}
					title={onchainIdentity?.web}
					className={`flex h-[${boxSize}px] w-[${boxSize}px] cursor-pointer items-center justify-center rounded-full text-xl ${
						isGood ? 'bg-[#51D36E] text-white hover:text-white' : 'bg-[#edeff3] text-[#96A4B6] hover:text-[#96A4B6]'
					}`}
					style={{ height: `${boxSize}px`, width: `${boxSize}px` }}
				>
					<WebIcon
						style={{ height: `${iconSize}px`, width: `${iconSize}px` }}
						className='flex items-center justify-center'
					/>
				</Link>
			)}
			{socialLinks?.map((social: any, index: number) => {
				const link = identityArr?.find((s) => s.key === social)?.value || '';
				const isVerified = identityArr.find((s) => s.key === social)?.isVerified || false;
				return (
					link && (
						<div
							title={link ? String(link) : ''}
							key={index}
						>
							<SocialLink
								className={`flex h-[${boxSize}px] w-[${boxSize}px] ${boxSize === 24 && 'h-6 w-6'} items-center justify-center rounded-full hover:text-[#576D8B] ${
									isVerified ? 'bg-[#51D36E]' : 'bg-[#edeff3]'
								}`}
								link={link as string}
								type={social}
								iconClassName={`text-[${iconSize}px] ${isVerified ? 'text-white bg-[#51D36E]' : 'text-[#96A4B6] bg-[#edeff3]'}`}
							/>
						</div>
					)
				);
			})}
			{address && (
				<Link
					target='_blank'
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						window.open(`https://polkaverse.com/accounts/${address}`, '_blank');
					}}
					title={`https://polkaverse.com/accounts/${address}`}
					href={`https://polkaverse.com/accounts/${address}`}
					className={`flex h-[${boxSize}px] w-[${boxSize}px] cursor-pointer items-center justify-center rounded-full bg-[#edeff3] text-xl`}
					style={{ height: `${boxSize}px`, width: `${boxSize}px` }}
				>
					<PolkaverseIcon />
				</Link>
			)}
			{network?.includes('kilt') && (
				<Link
					target='_blank'
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						window.open(`https://w3n.id/${address}`, '_blank');
					}}
					title={`https://w3n.id/${address}`}
					href={`https://w3n.id/${address}`}
					className={`flex  h-[${boxSize}px] w-[${boxSize}px] cursor-pointer items-center justify-center rounded-full bg-[#edeff3] text-[13px] text-[#96A4B6] hover:text-[#96A4B6]`}
					style={{ height: `${boxSize}px`, width: `${boxSize}px` }}
				>
					<UserOutlined />
				</Link>
			)}
			{isSubscanSupport(network) && (
				<Link
					target='_blank'
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						window.open(`https://www.subscan.io/account/${address}`, '_blank');
					}}
					title={`https://www.subscan.io/account/${address}`}
					href={`https://www.subscan.io/account/${address}`}
					className='flex cursor-pointer items-center justify-center rounded-full bg-[#edeff3] text-[13px] text-[#96A4B6] hover:text-[#96A4B6]'
				>
					<Image
						src='/assets/icons/subscan.svg'
						width={boxSize}
						height={boxSize}
						alt=''
					/>
				</Link>
			)}
		</div>
	);
};

export default SocialsHandle;
