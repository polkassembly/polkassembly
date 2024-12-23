// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'react-big-calendar/lib/css/react-big-calendar.css';

// import { DownOutlined } from '@ant-design/icons';
import { MenuProps, Space } from 'antd';
import { Dropdown } from '~src/ui-components/Dropdown';
import Image from 'next/image';
import React from 'react';
import { chainProperties, network } from 'src/global/networkConstants';
import styled from 'styled-components';

import chainLogo from '~assets/parachain-logos/chain-logo.jpg';
import { useTheme } from 'next-themes';

const StyledDiv = styled.div`
	display: flex;
	align-items: center;
	text-transform: capitalize;

	img {
		width: 22px;
		border-radius: 50%;
		margin-right: 0.5rem;
	}
`;

function NetworkSelect({ selectedNetwork, setSelectedNetwork }: { selectedNetwork: string; setSelectedNetwork: React.Dispatch<React.SetStateAction<string>> }) {
	const { resolvedTheme: theme } = useTheme();
	const StyledNetworkItem = ({ className, showNetwork }: { className?: string; showNetwork: string }) => {
		return (
			<StyledDiv className={className}>
				<Image
					src={chainProperties[showNetwork]?.logo ? chainProperties[showNetwork].logo : chainLogo}
					alt={showNetwork}
					height={24}
					width={24}
				/>
				{showNetwork}
			</StyledDiv>
		);
	};

	const networkOptions: MenuProps['items'] = [];
	for (const key of Object.keys(network)) {
		const optionObj = {
			key: network[key as keyof typeof network],
			label: <StyledNetworkItem showNetwork={network[key as keyof typeof network]} />
		};

		networkOptions.push(optionObj);
	}

	const handleSetSelectedNetwork: MenuProps['onClick'] = ({ key }) => {
		setSelectedNetwork(`${key}`);
	};

	return (
		<div className='select-div filter-by-chain-div pt-1'>
			{/* <label>Filter by</label> */}
			<label>Network</label>
			<Dropdown
				disabled
				trigger={['click']}
				overlayClassName='z-[1056]'
				dropdownRender={(menus: any) => <div className='max-h-[20rem] overflow-auto rounded-md drop-shadow-xl'>{menus}</div>}
				menu={{ items: networkOptions, onClick: handleSetSelectedNetwork }}
				theme={theme}
			>
				<Space className='cursor-pointer'>
					<StyledNetworkItem
						className='text-pink_primary'
						showNetwork={selectedNetwork}
					/>
					{/* <DownOutlined className='text-pink_primary align-middle' /> */}
				</Space>
			</Dropdown>
		</div>
	);
}

export default NetworkSelect;
