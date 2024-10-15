// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

interface Bounty {
	id: number;
	title: string;
	reward: number;
	childBountyCount: number;
	childBounties: ChildBounty[];
	totalReward: number;
	claimedReward: number;
}

interface ChildBounty {
	id: number;
	title: string;
	reward: number;
	payee: string;
}

function BountiesCuratorInfo() {
	const currentUser = useUserDetailsSelector();
	const { network } = useNetworkSelector();
	const [expandedBountyId, setExpandedBountyId] = useState<number | null>(null);

	const [curatedBounties, setCuratedBounties] = useState<Bounty[]>([
		{
			childBounties: [
				{
					id: 1,
					payee: 'John Doe',
					reward: 250,
					title: 'Child Bounty 1 - Complete frontend design'
				},
				{
					id: 2,
					payee: 'Jane Smith',
					reward: 500,
					title: 'Child Bounty 2 - Implement backend logic'
				}
			],
			childBountyCount: 2,
			claimedReward: 750,
			id: 123,
			reward: 1260,
			title: 'Ut vestibulum efficitur mois maena eget li vitae enim posuere',
			totalReward: 1800
		},
		{
			childBounties: [
				{
					id: 3,
					payee: 'Emily Johnson',
					reward: 300,
					title: 'Child Bounty 3 - Write test cases'
				}
			],
			childBountyCount: 1,
			claimedReward: 500,
			id: 124,
			reward: 1000,
			title: 'Curabitur non nulla sit amet nisl tempus convallis quis ac lectus',
			totalReward: 1300
		},
		{
			childBounties: [],
			childBountyCount: 0,
			claimedReward: 1200,
			id: 125,
			reward: 1500,
			title: 'Praesent sapien massa, convallis a pellentesque nec, egestas non nisi',
			totalReward: 1500
		}
	]);
	const toggleChildBounties = (bountyId: number) => {
		setExpandedBountyId(expandedBountyId === bountyId ? null : bountyId);
	};
	const fetchCuratorBounties = async () => {
		if (currentUser?.id !== undefined && currentUser?.id !== null) {
			const { data } = await nextApiClientFetch<any>('/api/v1/bounty/curator/getAllCuratedBountiesAndChildBounties', {
				network,
				page: 1,
				userAddress: currentUser?.addresses ? currentUser?.addresses[0] : ''
			});
			if (data) setCuratedBounties(data);
		}
	};

	const calculateClaimedPercentage = (claimed: number, total: number) => {
		return total ? ((claimed / total) * 100).toFixed(2) : 0;
	};

	useEffect(() => {
		fetchCuratorBounties();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg border-[0.7px] border-solid bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]`}>
			<p className='text-[24px] font-bold text-blue-light-high dark:text-lightWhite'>Bounties Curated ({curatedBounties.length})</p>

			{curatedBounties.map((bounty) => (
				<div
					key={bounty.id}
					className='mb-4'
				>
					<div className=' flex justify-end text-[12px] font-semibold text-gray-500'>
						<span className='rounded-t-lg border-t-[1px] border-solid border-t-[#DF1380] bg-[#FFF0FF] p-2'>
							{calculateClaimedPercentage(bounty.claimedReward, bounty.totalReward)}% Claimed
						</span>
					</div>

					<div className={`rounded-lg  border-solid ${expandedBountyId === bounty.id ? 'border-[1px] border-[#E5007A]' : 'border-[0.7px] border-[#D2D8E0]'} bg-white p-3`}>
						<div className='flex items-center justify-between'>
							<div className='flex items-center gap-3'>
								<span className='text-[17px] font-medium text-blue-light-medium'>#{bounty.id} </span>
								<span className='w-96 text-[17px] font-medium text-blue-light-high'>{bounty.title} </span>
							</div>
							<div className='flex items-center gap-3'>
								<span className='text-[20px] font-bold text-pink_primary'>${bounty.reward}</span>
								{bounty.childBountyCount > 0 && (
									<div
										onClick={() => toggleChildBounties(bounty.id)}
										className='cursor-pointer'
									>
										{expandedBountyId === bounty.id ? (
											<UpOutlined
												style={{
													background: 'linear-gradient(264.95deg, #333333 19.45%, #0A0A0A 101.3%)'
												}}
												className='rounded-full p-2 text-white'
											/>
										) : (
											<DownOutlined
												style={{
													background: 'linear-gradient(264.95deg, #333333 19.45%, #0A0A0A 101.3%)'
												}}
												className='rounded-full p-2 text-white'
											/>
										)}
									</div>
								)}
							</div>
						</div>

						{expandedBountyId === bounty.id && bounty.childBountyCount > 0 && (
							<div className='ml-4 mt-2 '>
								{bounty.childBounties.map((childBounty) => (
									<div
										key={childBounty.id}
										className='mt-3 flex flex-col  justify-between rounded-lg border-[0.7px] border-solid border-[#D2D8E0] bg-[#F7F8FA] p-3'
									>
										<div className='flex items-center gap-3'>
											<span className='text-[18px] text-blue-light-medium'>#{childBounty.id} </span>
											<span className='text-[18px] font-medium text-blue-light-high'>{childBounty.title}</span>
										</div>
										<div className='mt-2 flex items-center justify-center gap-3 rounded-lg border-[1px] border-solid border-[#129F5D] bg-[#E7F6EC] p-1'>
											<span className='text-[18px] font-bold text-[#129F5D]'>${childBounty.reward}</span>
											<span>
												<span className='text-[#485F7D]'>Claimed By</span> {childBounty.payee}
											</span>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	);
}

export default BountiesCuratorInfo;
