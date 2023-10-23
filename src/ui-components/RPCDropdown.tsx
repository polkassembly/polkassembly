// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable no-tabs */
import { MenuProps } from 'antd';
import { Dropdown } from '~src/ui-components/Dropdown';
import React, { FC, useEffect, useState } from 'react';
import { useApiContext } from '~src/context';
import { chainProperties } from '~src/global/networkConstants';
import { TRPCEndpoint } from '~src/types';
import { ArrowDownIcon, SignalTowerIcon } from './CustomIcons';
import Loader from './Loader';
import styled from 'styled-components';
import { useNetworkSelector } from '~src/redux/selectors';
import { useTheme } from 'next-themes';
interface IRPCDropdownProps {
	className?: string;
	setSidebarHiddenFunc?: () => void;
	isSmallScreen?: boolean;
}

export const dropdownLabel = (wsProvider: string, network: string) => {
	let label = '';

	chainProperties?.[network]?.rpcEndpoints?.some((endpointData) => {
		if (endpointData && endpointData.key == wsProvider) {
			label = `${endpointData.label?.substring(4, endpointData.label.length)}`;
			return true;
		}
	});

	return label;
};

const RPCDropdown: FC<IRPCDropdownProps> = (props) => {
	const { className, isSmallScreen } = props;
	const { isApiLoading, setWsProvider, wsProvider } = useApiContext();
	const { network } = useNetworkSelector();
	const [rpcEndpoints, setRPCEndpoints] = useState<TRPCEndpoint[]>([]);
	const { resolvedTheme: theme } = useTheme();
	useEffect(() => {
		setRPCEndpoints(chainProperties[network].rpcEndpoints);
	}, [network]);

	const handleEndpointChange: MenuProps['onClick'] = ({ key }) => {
		if (wsProvider === `${key}`) return;
		setWsProvider(`${key}`);
	};

	return !isApiLoading ? (
		<Dropdown
			theme={theme}
			trigger={['click']}
			menu={{
				defaultSelectedKeys: [wsProvider ? wsProvider : network ? chainProperties?.[network]?.rpcEndpoint : ''],
				items: rpcEndpoints,
				onClick: handleEndpointChange,
				selectable: true
			}}
			className={`${className}`}
			overlayClassName={`${className} navbar-dropdowns text-sm font-medium text-bodyBlue dark:text-blue-dark-high hover:text-pink_primary z-[1056]`}
		>
			{isSmallScreen ? (
				<span className='flex h-10 items-center justify-between gap-x-2 rounded-[4px] border border-solid border-[#D2D8E0] bg-[rgba(210,216,224,0.2)] px-[18px] dark:bg-[#29323C33]'>
					<div className='flex items-center gap-x-[6px]'>
						<SignalTowerIcon className='m-0 h-[20px] w-[20px] p-0' />
						<span className='text-xs font-semibold leading-[18px] tracking-[0.02em]'>{dropdownLabel(wsProvider || chainProperties?.[network!]?.rpcEndpoint, network)}</span>
					</div>
					<span className='text-[#485F7D]'>
						<ArrowDownIcon />
					</span>
				</span>
			) : (
				<span className='flex cursor-pointer items-center justify-center rounded-[2px] border border-solid border-[#D2D8E0] bg-[rgba(210,216,224,0.2)] p-1 dark:border-separatorDark dark:bg-[#29323C33] md:rounded-[4px] md:p-[8.5px]'>
					<SignalTowerIcon className='m-0 p-0 text-xs md:text-sm' />
				</span>
			)}
		</Dropdown>
	) : (
		<Loader />
	);
};

export default styled(RPCDropdown)`
	.ant-dropdown-menu-item {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '#243a57')} !important;
		font-weight: 500 !important;
	}
`;
