// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

// import { DownOutlined } from '@ant-design/icons';
import { Card, Col, Dropdown, Row } from 'antd';
import Image from 'next/image';
import React, { FC, useContext } from 'react';
import { chainProperties, network } from 'src/global/networkConstants';

import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import { NetworkContext } from '~src/context/NetworkContext';
import { ArrowDownIcon } from './CustomIcons';

type DropdownMenuItemType = {
	key: any,
	label: any
}

const polkadotChains: DropdownMenuItemType[] = [];
const kusamaChains: DropdownMenuItemType[] = [];
const soloChains: DropdownMenuItemType[] = [];
const testChains: DropdownMenuItemType[] = [];

for (const key of Object.keys(network)) {
	const keyVal = network[key as keyof typeof network];
	const link = ['MOONBASE', 'MOONRIVER', 'MOONBEAM', 'KILT'].includes(key) ? `https://${key}.polkassembly.network` : `https://${key === 'POLYMESHTEST'? 'polymesh-test': key}.polkassembly.io`;
	const optionObj: DropdownMenuItemType = {
		key,
		label: <a href={link} className='flex items-center my-2'>
			<Image
				className='w-5 h-5 mr-3 object-contain rounded-full'
				src={chainProperties[keyVal]?.logo ? chainProperties[keyVal].logo : chainLogo}
				alt='Logo'
			/>
			<span className='capitalize'> {keyVal == 'hydradx' ? 'HydraDX' : keyVal} </span>
		</a>
	};

	switch(chainProperties[keyVal]?.category) {
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

const NetworkDropdown: FC<{setSidedrawer: React.Dispatch<React.SetStateAction<boolean>>}> = ({ setSidedrawer }) => {
	const { network } = useContext(NetworkContext);

	return (
		<Dropdown
			trigger={['click']}
			dropdownRender={() => {
				return (
					<Card className='max-w-[356px] max-h-[52vh] overflow-y-auto'>
						<>
							<div className='text-navBlue font-medium'>Polkadot &amp; Parachains</div>
							<Row className="mt-2">
								{
									polkadotChains.map(optionObj => (
										<Col span={12} key={optionObj.key} className="flex">{optionObj.label}</Col>
									))
								}
							</Row>

							<div className='text-navBlue font-medium mt-4'>Kusama &amp; Parachains</div>
							<Row className="mt-2">
								{
									kusamaChains.map(optionObj => (
										<Col span={12} key={optionObj.key} className="flex">{optionObj.label}</Col>
									))
								}
							</Row>

							<div className='text-navBlue font-medium mt-4'>Solo Chains</div>
							<Row className="mt-2">
								{
									soloChains.map(optionObj => (
										<Col span={12} key={optionObj.key} className="flex">{optionObj.label}</Col>
									))
								}
							</Row>

							<div className='text-navBlue font-medium mt-4'>Test Chains</div>
							<Row className="mt-2">
								{
									testChains.map(optionObj => (
										<Col span={12} key={optionObj.key} className="flex">{optionObj.label}</Col>
									))
								}
							</Row>
						</>
					</Card>
				);}
			}
		>
			<a className='flex items-center justify-between text-navBlue hover:text-pink_primary lg:min-w-[133px] lg:h-8 lg:border-solid lg:border lg:border-[#D2D8E0] lg:rounded-[26px] lg:bg-[rgba(210,216,224,0.2)] lg:px-[12px] lg:py-[6px]' onClick={e => {
				e.preventDefault();
				setSidedrawer(false);
			}}
			>
				<Image
					className='w-[20px] h-[20px] rounded-full'
					src={chainProperties[network]?.logo ? chainProperties[network]?.logo : chainLogo}
					alt='Logo'
				/>
				<span className='hidden lg:flex lg:items-center lg:justify-center lg:ml-[9.25px] lg:mr-[13.35px] font-semibold text-[#243A57] text-xs leading-[18px] tracking-[0.02em] capitalize'>
					{
						network
					}
				</span>
				<span className='hidden lg:flex lg:items-center lg:justify-center text-[#485F7D]'>
					<ArrowDownIcon />
				</span>
			</a>
		</Dropdown>
	);
};

export default NetworkDropdown;