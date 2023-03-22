// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Tooltip } from 'antd';
import Table, { ColumnsType } from 'antd/lib/table';
import Image from 'next/image';
import React, { Key, useEffect,useState } from 'react';
import { LoadingLatestActivity } from 'src/ui-components/LatestActivityStates';

import announcedIcon from '~assets/parachains/announced.png';
import auctionIcon from '~assets/parachains/auction.png';
import liveIcon from '~assets/parachains/chain-link.png';
import githubLogo from '~assets/parachains/github.png';
import testingIcon from '~assets/parachains/testing.png';
import w3fBlackLogo from '~assets/parachains/w3f-black.png';
import w3fGreenLogo from '~assets/parachains/w3f-green.png';
import w3fRedLogo from '~assets/parachains/w3f-red.png';

import Cards from './Cards';

interface Props{
    chain: string
    data?: any
}

interface ParachainRowData{
    index: number | string
    project: string
    badgeArray: string[]
    status: string
    token: string
    investors: number
    githubLink: string
    logoURL: string
	chain: string
    w3fGrant: { [key: string]: any; } | null
	key: Key | null | undefined
}

const columns: ColumnsType<ParachainRowData> = [
	{
		dataIndex: 'index',
		fixed: 'left',
		key: 'index',
		render: (index) => <div className='text-sidebarBlue'>#{index}</div>,
		title: 'Index',
		width: 75
	},
	{
		dataIndex: 'project',
		fixed: 'left',
		key: 'project',
		render:(name, { badgeArray, logoURL }) => (
			<div style={{ alignItems:'center', display:'flex' }}>
				<Image style={{ marginRight:'16px' }} src={logoURL} height={34} width={34} alt={`${name} logo`} />
				<div className='text-sidebarBlue' style={{ marginRight:'16px' }}>{name}</div>
				{badgeArray.map((item : any) => (
					<div key={item} className='bg-pink_light text-white text-[12px]' style={{  borderRadius:'48px', marginRight:'10px', padding:'4px 10px' }}>{item}</div>
				))}
			</div>
		),
		title: 'Project',
		width: 420
	},
	{
		dataIndex: 'status',
		key: 'status',
		render:(status) => (
			<>
				{
					status.search('auction') !== -1 ? <span className='flex items-center gap-4 text-sidebarBlue'><Image src={auctionIcon} height={16} width={16} alt='Auction Icon' /> In Auction</span>:
						status.search('Testing') !== -1 ? <span className='flex items-center gap-4 text-sidebarBlue'><Image src={testingIcon} height={16} width={16} alt='Testing Icon' /> Testing</span> :
							status.search('announced') !== -1 ? <span className='flex items-center gap-4 text-sidebarBlue'><Image src={announcedIcon} height={16} width={16} alt='Announced Icon' /> Announced</span>:
								status.search('live') !== -1 ? <span className='flex items-center gap-4 text-sidebarBlue'><Image src={liveIcon} height={16} width={16} alt='Live Icon' /> Live</span> : null
				}
			</>
		),
		title: 'Status'
	},
	{
		dataIndex: 'token',
		key: 'token',
		render:(token) => <div className='text-sidebarBlue'>{token}</div>,
		title: 'Token'
	},
	{
		dataIndex: 'w3fGrant',
		key: 'w3fGrant',
		render:(w3fGrant) => {
			function toTitleCase(str: string): string {
				return str.replace(
					/\w\S*/g,
					function(txt) {
						return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
					}
				);
			}

			const grantTooltip = () => {
				let content = '';
				if(w3fGrant){
					if(w3fGrant.terminated){
						content = toTitleCase(`W3F grant TERMINATED: "${w3fGrant.terminationReason}"`);
					}else if(w3fGrant.milestoneText){
						content = toTitleCase(`${w3fGrant.received} W3F grant(s) received, ${w3fGrant.milestoneText}`);
					}else{
						content = toTitleCase(`${w3fGrant.received} received, ${w3fGrant.completed} completed`);
					}
				}else {
					content = '';
				}
				return content;
			};

			const title = grantTooltip();

			return (
				<>
					{title ? <Tooltip title={title}>
						<Image src={w3fGrant?.terminated ? w3fRedLogo : w3fGrant?.milestoneText? w3fBlackLogo : w3fGreenLogo} height={34} width={34} alt='W3F Logo' />
					</Tooltip> : <Image src={w3fGrant?.terminated ? w3fRedLogo : w3fGrant?.milestoneText? w3fBlackLogo : w3fGreenLogo} height={34} width={34} alt='W3F Logo' />}
				</>
			);},
		title: 'W3F'
	},
	{
		dataIndex: 'investors',
		key: 'investors',
		render: (investors) => <div className='text-sidebarBlue'>{!!investors && investors}</div>,
		title: 'Investors',
		width: 'auto'
	},
	{
		dataIndex: 'githubLink',
		key: 'githubLink',
		render:( githubLink ) => (
			<a href={githubLink} target='_blank' rel='noreferrer'>
				<Image src={githubLogo} height={34} width={34} alt='github logo' />
			</a>
		),
		title: 'Github'
	}
];

const ChainDataTable = ({ chain, data }:Props) => {

	const [chainData, setChainData] = useState<any>(null);

	useEffect(() => {
		const filteredData: any = data.filter((project: any) => {
			return project.chain == chain;
		});
		setChainData(filteredData);
	}, [chain, data]);

	if(chainData){

		const tableData: ParachainRowData[] = [];
		chainData.forEach((item : any, id : any) => {
			if(item?.name && item?.id) {
				// truncate title
				let title = item?.name || 'Untitled';
				title = title.length > 80 ? `${title.substring(0, Math.min(80, title.length))}...`  : title.substring(0, Math.min(80, title.length));

				const tableDataObj:ParachainRowData = {
					badgeArray: [...item.badges],
					chain: item?.chain,
					githubLink: item?.githubURL,
					index: id + 1,
					investors: item.investorsCount,
					key: id + 1,
					logoURL: item?.logoURL,
					project: title,
					status: item?.status,
					token: item?.token,
					w3fGrant: item?.w3fGrant
				};

				tableData.push(tableDataObj);
			}
		});
		return(<>
			<div className='hidden lg:block'>
				<Table
					columns={columns}
					dataSource={tableData}
					pagination={false}
					scroll={{ x: 1000, y: 400 }}
				/>
			</div>

			<div className="block lg:hidden h-[520px] overflow-y-auto">
				{tableData.map((data) => (
					// eslint-disable-next-line react/jsx-key
					<Cards {...data} />
				))}
			</div>
		</>);
	}
	//Loading
	return (
		<LoadingLatestActivity/>
	);
};

export default ChainDataTable;