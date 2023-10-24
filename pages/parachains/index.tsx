// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col, Row } from 'antd';
import { GetServerSideProps } from 'next';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from 'next-themes';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import ParachainInfoCard from '~src/components/Parachains/ParachainInfoCard';
import SEOHead from '~src/global/SEOHead';
import CountBadgePill from '~src/ui-components/CountBadgePill';

import ChainData from '../../src/components/Parachains/ChainDataTable';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { Tabs } from '~src/ui-components/Tabs';

interface Props {
	className?: string;
	network: string;
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const ChainDataTable = styled(ChainData)`
	.ant-table-thead > tr > th,
	.ant-table-tbody > tr {
		background-color: ${(props) => (props.theme === 'dark' ? 'blue' : 'white')} !important;
	}
	td {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '#243A57')} !important;
		font-weight: 500;
		background-color: ${(props) => (props.theme === 'dark' ? 'blue' : 'white')} !important;
	}
`;

const Parachains = ({ className, network }: Props) => {
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const [parachainsData, setParachainsData] = useState([]);

	useEffect(() => {
		fetch('/parachains.json')
			.then((r) => r.json())
			.then((data) => {
				setParachainsData(data);
			});
	}, []);

	const polkadotProjects = parachainsData?.filter((item: any) => item?.chain === 'polkadot').length;
	const kusamaProjects = parachainsData?.filter((item: any) => item?.chain === 'kusama').length;

	const tabItems = [
		// eslint-disable-next-line sort-keys
		{
			children: (
				<ChainDataTable
					theme={theme}
					data={parachainsData}
					chain='polkadot'
				/>
			),
			key: 'polkadot',
			label: (
				<CountBadgePill
					label='Polkadot'
					count={polkadotProjects}
				/>
			)
		},
		// eslint-disable-next-line sort-keys
		{
			children: (
				<ChainDataTable
					theme={theme}
					data={parachainsData}
					chain='kusama'
				/>
			),
			key: 'kusama',
			label: (
				<CountBadgePill
					label='Kusama'
					count={kusamaProjects}
				/>
			)
		}
	];

	return (
		<>
			<SEOHead
				title='Parachains'
				network={network}
			/>
			<div className={className}>
				<h1 className='mx-2 text-2xl font-semibold leading-9 text-blue-light-high dark:text-blue-dark-high'>Polkadot and Kusama ecosystem and directory</h1>

				<Row
					gutter={[{ lg: 16 }, 16]}
					className='mb-4 md:mb-6'
				>
					<Col
						span={24}
						lg={{ span: 12 }}
					>
						<ParachainInfoCard
							projects={polkadotProjects}
							theme={theme}
							network='polkadot'
						/>
					</Col>
					<Col
						span={24}
						lg={{ span: 12 }}
					>
						<ParachainInfoCard
							projects={kusamaProjects}
							theme={theme}
							network='kusama'
						/>
					</Col>
				</Row>

				<div className={`${className} h-[650px] rounded-xxl bg-white p-2 drop-shadow-md dark:bg-section-dark-overlay lg:p-6`}>
					<h2 className='mb-6 mt-6 text-xl font-medium leading-8 text-blue-light-high dark:text-blue-dark-high sm:mt-0'>Projects</h2>
					<Tabs
						theme={theme}
						type='card'
						className='ant-tabs-tab-bg-white font-medium text-blue-light-high dark:bg-section-dark-overlay dark:font-normal dark:text-blue-dark-high'
						items={tabItems}
					/>
				</div>
			</div>
		</>
	);
};

export default styled(Parachains)`
	.loader-cont {
		display: flex;
		justify-content: center;
		margin-top: 30%;
	}

	.ma-sm-1 {
		@media only screen and (max-width: 768px) {
			margin: 1rem;
		}
	}

	.card-group {
		margin-top: 32px;
		flex-wrap: nowrap;
		max-width: 99.9%;
		overflow-x: hidden !important;

		&:hover {
			overflow-x: auto !important;
		}

		@media only screen and (max-width: 768px) {
			overflow-x: hidden !important;
			padding-left: 1em;
			flex-direction: column;
			align-items: center;
			max-width: 100%;
			margin-left: 4px;
			margin-top: 22px;

			&:hover {
				overflow-x: hidden !important;
			}
		}
	}

	.ant-table-thead {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '#243A57')} !important;
		font-weight: 500;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: white;
		border-top-color: white;
		border-left-color: white;
		border-right-color: white;
		border-bottom-color: #e1e6eb;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-tab-active {
		border-top-color: #e1e6eb;
		border-left-color: #e1e6eb;
		border-right-color: #e1e6eb;
		border-radius: 6px 6px 0 0 !important;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-nav:before {
		border-bottom: 1px solid #e1e6eb;
	}
`;
