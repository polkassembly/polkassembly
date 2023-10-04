// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

<<<<<<< HEAD
import { Col,Row,Tabs as AntdTabs } from 'antd';
=======
import { Col, Row, Tabs } from 'antd';
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
import { GetServerSideProps } from 'next';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTheme } from 'next-themes';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import ParachainInfoCard from '~src/components/Parachains/ParachainInfoCard';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import CountBadgePill from '~src/ui-components/CountBadgePill';

<<<<<<< HEAD
import ChainData from '../../src/components/Parachains/ChainDataTable';
=======
import ChainDataTable from '../../src/components/Parachains/ChainDataTable';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29

interface Props {
	className?: string;
	network: string;
}

const Tabs = styled(AntdTabs)`
	.ant-tabs-tab-active > .ant-tabs-tab-btn{
 	color: ${props => props.theme === 'dark' ? '#FF60B5' : ''} !important;
	}
	.ant-tabs-tab{
	border: ${props => props.theme=='dark' ? 'none' : ''} !important;
	font-weight: ${props => props.theme=='dark' ? '400' : '500'} !important;
	color: ${props => props.theme=='dark' ? '#FFFFFF' : ''} !important;
	}
	.ant-tabs-nav::before{
	border-bottom: ${props => props.theme=='dark' ? '1px #4B4B4B solid' : ''} !important;
	}
	.ant-tabs-tab-active{
		background-color: ${props => props.theme=='dark' ? '#0D0D0D' : 'white'} !important;
		border: ${props => props.theme=='dark' ? '1px solid #4B4B4B' : ''} !important;
		border-bottom: ${props => props.theme=='dark' ? 'none' : ''} !important;
	}
`;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const ChainDataTable = styled(ChainData)`
	.ant-table-thead > tr > th, .ant-table-tbody > tr {
		background-color: ${props => props.theme === 'dark' ? 'blue' : 'white'} !important;
	}
	td{
		color: ${props => props.theme === 'dark' ? 'white' : '#243A57'} !important;
		font-weight: 500;
		background-color: ${props => props.theme === 'dark' ? 'blue' : 'white'} !important;
	}
`;

const Parachains = ({ className, network }: Props) => {
	const { setNetwork } = useNetworkContext();
	const { resolvedTheme:theme } = useTheme();
	useEffect(() => {
		setNetwork(network);
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
<<<<<<< HEAD
		{ label: <CountBadgePill label='Polkadot' count={polkadotProjects} />, key: 'polkadot', children: <ChainDataTable theme={theme} data={parachainsData} chain='polkadot' /> },
		// eslint-disable-next-line sort-keys
		{ label: <CountBadgePill label='Kusama' count={kusamaProjects} />, key: 'kusama', children: <ChainDataTable theme={theme} data={parachainsData} chain='kusama' /> }
=======
		{
			children: (
				<ChainDataTable
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
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	];

	return (
		<>
			<SEOHead
				title='Parachains'
				network={network}
			/>
			<div className={className}>
<<<<<<< HEAD
				<h1 className='text-blue-light-high dark:text-blue-dark-high font-semibold text-2xl leading-9 mx-2'>Polkadot and Kusama ecosystem and directory</h1>

				<Row gutter={[{ lg:16 }, 16]} className='mb-4 md:mb-6'>
					<Col span={24} lg={{ span:12 }}>
						<ParachainInfoCard projects={polkadotProjects} theme={theme} network='polkadot' />
					</Col>
					<Col span={24} lg={{ span:12 }}>
						<ParachainInfoCard projects={kusamaProjects} theme={theme} network='kusama' />
					</Col>
				</Row>

				<div className={`${className} bg-white dark:bg-section-dark-overlay drop-shadow-md p-2 lg:p-6 rounded-xxl h-[650px]`}>
					<h2 className='text-blue-light-high dark:text-blue-dark-high text-xl font-medium leading-8 mb-6 mt-6 sm:mt-0'>Projects</h2>
					<Tabs
						theme={theme}
						type="card"
						className='ant-tabs-tab-bg-white dark:bg-section-dark-overlay text-blue-light-high dark:text-blue-dark-high font-medium dark:font-normal'
=======
				<h1 className='mx-2 text-2xl font-semibold leading-9 text-bodyBlue'>Polkadot and Kusama ecosystem and directory</h1>

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
							network='polkadot'
						/>
					</Col>
					<Col
						span={24}
						lg={{ span: 12 }}
					>
						<ParachainInfoCard
							projects={kusamaProjects}
							network='kusama'
						/>
					</Col>
				</Row>

				<div className={`${className} h-[650px] rounded-xxl bg-white p-2 drop-shadow-md lg:p-6`}>
					<h2 className='mb-6 mt-6 text-xl font-medium leading-8 text-bodyBlue sm:mt-0'>Projects</h2>
					<Tabs
						type='card'
						className='ant-tabs-tab-bg-white font-medium text-bodyBlue'
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
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

<<<<<<< HEAD
	.ant-table-thead{
		color: ${props => props.theme === 'dark' ? 'white' : '#243A57'} !important;
=======
	.ant-table-thead {
		color: var(--bodyBlue) !important;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
		font-weight: 500;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: white;
		border-top-color: white;
		border-left-color: white;
		border-right-color: white;
		border-bottom-color: #e1e6eb;
	}

<<<<<<< HEAD
	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-tab-active{
		border-top-color: #E1E6EB;
		border-left-color: #E1E6EB;
		border-right-color: #E1E6EB;
		border-radius: 6px 6px 0 0 !important;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-nav:before{
		border-bottom: 1px solid #E1E6EB;
=======
	.ant-tabs-tab-bg-white .ant-tabs-tab-active {
		border-top-color: #e1e6eb;
		border-left-color: #e1e6eb;
		border-right-color: #e1e6eb;
		border-radius: 6px 6px 0 0 !important;
	}

	.ant-tabs-tab-bg-white .ant-tabs-nav:before {
		border-bottom: 1px solid #e1e6eb;
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
	}
`;
