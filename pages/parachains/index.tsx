// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Col,Row,Tabs } from 'antd';
import { GetServerSideProps } from 'next';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import { getNetworkFromReqHeaders } from '~src/api-utils';
import ParachainInfoCard from '~src/components/Parachains/ParachainInfoCard';
import { useNetworkContext } from '~src/context';
import SEOHead from '~src/global/SEOHead';
import CountBadgePill from '~src/ui-components/CountBadgePill';

import ChainDataTable from '../../src/components/Parachains/ChainDataTable';

interface Props {
  className?: string
	network: string
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);
	return { props: { network } };
};

const Parachains = ({ className, network }: Props) => {
	const { setNetwork } = useNetworkContext();

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
	},[]);

	const polkadotProjects = parachainsData?.filter((item : any) => item?.chain === 'polkadot').length;
	const kusamaProjects = parachainsData?.filter((item : any) => item?.chain === 'kusama').length;

	const tabItems = [
		// eslint-disable-next-line sort-keys
		{ label: <CountBadgePill label='Polkadot' count={polkadotProjects} />, key: 'polkadot', children: <ChainDataTable data={parachainsData} chain='polkadot' /> },
		// eslint-disable-next-line sort-keys
		{ label: <CountBadgePill label='Kusama' count={kusamaProjects} />, key: 'kusama', children: <ChainDataTable data={parachainsData} chain='kusama' /> }
	];

	return (
		<>
			<SEOHead title='Parachains' network={network}/>
			<div className={className}>
				<h1 className='text-blue-light-high dark:text-blue-dark-high font-semibold text-2xl leading-9 mx-2'>Polkadot and Kusama ecosystem and directory</h1>

				<Row gutter={[{ lg:16 }, 16]} className='mb-4 md:mb-6'>
					<Col span={24} lg={{ span:12 }}>
						<ParachainInfoCard projects={polkadotProjects} network='polkadot' />
					</Col>
					<Col span={24} lg={{ span:12 }}>
						<ParachainInfoCard projects={kusamaProjects} network='kusama' />
					</Col>
				</Row>

				<div className={`${className} bg-white dark:bg-section-dark-overlay drop-shadow-md p-2 lg:p-6 rounded-xxl h-[650px]`}>
					<h2 className='text-blue-light-high dark:text-blue-dark-high text-xl font-medium leading-8 mb-6 mt-6 sm:mt-0'>Projects</h2>
					<Tabs
						type="card"
						className='ant-tabs-tab-bg-white dark:bg-section-dark-overlay text-blue-light-high dark:text-blue-dark-high font-medium'
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

		@media only screen and (max-width: 768px){
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

	.ant-table-thead{
		color: var(--bodyBlue) !important;
		font-weight: 500;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: white;
		border-top-color: white;
		border-left-color: white;
		border-right-color: white;
		border-bottom-color: #E1E6EB;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-tab-active{
		border-top-color: #E1E6EB;
		border-left-color: #E1E6EB;
		border-right-color: #E1E6EB;
		border-radius: 6px 6px 0 0 !important;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-nav:before{
		border-bottom: 1px solid #E1E6EB;
	}
`;