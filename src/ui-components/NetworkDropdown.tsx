// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Card, Col, Dropdown, Row } from 'antd';
import Image from 'next/image';
import React, { FC, useState } from 'react';
import { chainProperties, network } from 'src/global/networkConstants';
import { useNetworkContext } from '~src/context';
import { ArrowDownIcon } from './CustomIcons';
import { isOpenGovSupported } from '~src/global/openGovNetworks';
import { useRouter } from 'next/router';
import DownOutlined from '~assets/search/dropdown-down.svg';
import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import HightlightDownOutlined from '~assets/search/pink-dropdown-down.svg';

type DropdownMenuItemType = {
	key: any;
	label: any;
	link: string;
};

const polkadotChains: DropdownMenuItemType[] = [];
const kusamaChains: DropdownMenuItemType[] = [];
const soloChains: DropdownMenuItemType[] = [];
const testChains: DropdownMenuItemType[] = [];

let link = '';

for (const key of Object.keys(network)) {
	const keyVal = network[key as keyof typeof network];
	if (key === 'TANGANIKA') continue;

	link = ['MOONBASE', 'MOONRIVER', 'MOONBEAM', 'KILT'].includes(key)
		? `https://${key}.polkassembly.network`
		: `https://${key === 'POLYMESHTEST' ? 'polymesh-test' : keyVal}.polkassembly.io`;

	if (isOpenGovSupported(keyVal)) {
		link = `${link}`;
	}
	const optionObj: DropdownMenuItemType = {
		key,
		label: (
			<div className='my-2 flex items-center'>
				<Image
					className='mr-3 h-5 w-5 rounded-full object-contain'
					src={chainProperties[keyVal]?.logo ? chainProperties[keyVal].logo : chainLogo}
					alt='Logo'
				/>
				<span className='text-sm font-medium capitalize text-bodyBlue hover:text-pink_primary'> {keyVal == 'hydradx' ? 'HydraDX' : keyVal} </span>
			</div>
		),
		link
	};

	switch (chainProperties[keyVal]?.category) {
		case 'polkadot':
			polkadotChains.push(optionObj);
			break;
		case 'kusama':
			kusamaChains.push(optionObj);
			break;
		case 'test':
			testChains.push(optionObj);
			break;
		default:
			soloChains.push(optionObj);
	}
}

interface INetworkDropdown {
	setSidedrawer: React.Dispatch<React.SetStateAction<boolean>>;
	isSmallScreen?: boolean;
	isSearch?: boolean;
	setSelectedNetworks?: (pre: string[]) => void;
	selectedNetworks?: string[];
	allowedNetwork?: string[];
}

const NetworkDropdown: FC<INetworkDropdown> = (props) => {
	const { isSmallScreen, setSidedrawer, isSearch, setSelectedNetworks, selectedNetworks = [], allowedNetwork } = props;
	const { network } = useNetworkContext();
	const [openFilter, setOpenFilter] = useState<boolean>(false);
	const router = useRouter();

	const handleLink = (option: DropdownMenuItemType) => {
		setOpenFilter(false);
		if (isSearch && setSelectedNetworks && selectedNetworks) {
			if (!allowedNetwork?.includes(option.key)) return;
			const filterArr = selectedNetworks.filter((network) => network !== option?.key);
			if (filterArr?.length < selectedNetworks.length) {
				setSelectedNetworks([...filterArr]);
			} else {
				setSelectedNetworks([...selectedNetworks, option.key]);
			}
		} else {
			router.push(option.link);
		}
	};

	return (
		<Dropdown
			open={openFilter}
			onOpenChange={() => setOpenFilter(!openFilter)}
			placement={'bottomLeft'}
			trigger={[isSearch ? 'hover' : 'click']}
			dropdownRender={() => {
				return (
					<Card className='mt-3 max-h-[52vh] max-w-[356px] overflow-y-auto'>
						<>
							<div className='font-medium text-bodyBlue'>Polkadot &amp; Parachains</div>
							<Row className='mt-2'>
								{polkadotChains.map((optionObj) => (
									<Col
										span={12}
										key={optionObj.key}
										className={`flex ${!isSearch && 'cursor-pointer'} ${isSearch && selectedNetworks?.includes(optionObj.key) && 'cursor-pointer font-medium text-pink_primary'} ${
											isSearch && !allowedNetwork?.includes(optionObj?.key) && 'cursor-not-allowed text-[#B5BFCC]'
										}`}
										onClick={() => handleLink(optionObj)}
									>
										{optionObj.label}
									</Col>
								))}
							</Row>

							<div className='mt-4 font-medium text-bodyBlue'>Kusama &amp; Parachains</div>
							<Row className='mt-2'>
								{kusamaChains.map((optionObj) => (
									<Col
										span={12}
										key={optionObj.key}
										className={`flex ${!isSearch && 'cursor-pointer'} ${isSearch && selectedNetworks?.includes(optionObj.key) && 'cursor-pointer font-medium text-pink_primary'} ${
											isSearch && !allowedNetwork?.includes(optionObj?.key) && 'cursor-not-allowed text-[#B5BFCC]'
										}`}
										onClick={() => handleLink(optionObj)}
									>
										{optionObj.label}
									</Col>
								))}
							</Row>

							<div className='mt-4 font-medium text-bodyBlue'>Solo Chains</div>
							<Row className='mt-2'>
								{soloChains.map((optionObj) => (
									<Col
										span={12}
										key={optionObj.key}
										className={`flex ${!isSearch && 'cursor-pointer'} ${isSearch && selectedNetworks?.includes(optionObj.key) && 'cursor-pointer font-medium text-pink_primary'} ${
											isSearch && !allowedNetwork?.includes(optionObj?.key) && 'cursor-not-allowed text-[#B5BFCC]'
										}`}
										onClick={() => handleLink(optionObj)}
									>
										{optionObj.label}
									</Col>
								))}
							</Row>

							<div className='mt-4 font-medium text-bodyBlue'>Test Chains</div>
							<Row className='mt-2'>
								{testChains.map((optionObj) => (
									<Col
										span={12}
										key={optionObj.key}
										className={`flex ${!isSearch && 'cursor-pointer'} ${isSearch && selectedNetworks?.includes(optionObj.key) && 'cursor-pointer font-medium text-pink_primary'} ${
											isSearch && !allowedNetwork?.includes(optionObj?.key) && 'cursor-not-allowed text-[#B5BFCC]'
										}`}
										onClick={() => handleLink(optionObj)}
									>
										{optionObj.label}
									</Col>
								))}
							</Row>
						</>
					</Card>
				);
			}}
		>
			{isSearch ? (
				<div className={`flex cursor-pointer items-center justify-center text-xs ${(openFilter || selectedNetworks.length > 0) && 'text-pink_primary'} max-sm:text-[10px]`}>
					Network
					<span className='text-[#96A4B6]'>
						{openFilter ? <HightlightDownOutlined className='ml-2.5 mt-1 max-md:ml-1' /> : <DownOutlined className='ml-2.5 mt-1 max-md:ml-1' />}
					</span>
				</div>
			) : isSmallScreen ? (
				<a
					className='flex h-10 items-center justify-between gap-x-2 rounded-[4px] border border-solid border-[#D2D8E0] bg-[rgba(210,216,224,0.2)] px-[18px]'
					onClick={(e) => {
						e.preventDefault();
						setSidedrawer(false);
					}}
				>
					<div className='flex items-center gap-x-[6px] border-solid'>
						<Image
							className='h-[20px] w-[20px] rounded-full'
							src={chainProperties[network]?.logo ? chainProperties[network]?.logo : chainLogo}
							alt='Logo'
						/>
						<span className='text-xs font-semibold capitalize leading-[18px] tracking-[0.02em] text-[#243A57]'>{network}</span>
					</div>
					<span className='text-[#485F7D]'>
						<ArrowDownIcon />
					</span>
				</a>
			) : (
				<a
					className='flex items-center justify-between text-bodyBlue hover:text-pink_primary lg:h-8 lg:min-w-[133px] lg:rounded-[26px] lg:border lg:border-solid lg:border-[#D2D8E0] lg:bg-[rgba(210,216,224,0.2)] lg:px-[12px] lg:py-[6px]'
					onClick={(e) => {
						e.preventDefault();
						setSidedrawer(false);
					}}
				>
					<Image
						className='h-[20px] w-[20px] rounded-full'
						src={chainProperties[network]?.logo ? chainProperties[network]?.logo : chainLogo}
						alt='Logo'
					/>
					<span className='hidden text-xs font-semibold capitalize leading-[18px] tracking-[0.02em] text-[#243A57] lg:ml-[9.25px] lg:mr-[13.35px] lg:flex lg:items-center lg:justify-center'>
						{network}
					</span>
					<span className='hidden text-[#485F7D] lg:flex lg:items-center lg:justify-center'>
						<ArrowDownIcon />
					</span>
				</a>
			)}
		</Dropdown>
	);
};

export default NetworkDropdown;
