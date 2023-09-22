// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import '@polkadot/api-augment';

import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import { Divider, Progress } from 'antd';
import { IAddressesResponse } from 'pages/api/v1/getAddressesData';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { CouncilVote, IPollVote, Vote } from 'src/types';
import Address from 'src/ui-components/Address';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import HelperTooltip from 'src/ui-components/HelperTooltip';

import { ApiContext } from '~src/context/ApiContext';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useNetworkSelector } from '~src/redux/selectors';

interface Props {
	className?: string;
	votes: IPollVote[];
}

const CouncilSignals = ({ className, votes }: Props) => {
	const { api, apiReady } = useContext(ApiContext);
	const { network } = useNetworkSelector();

	const [ayes, setAyes] = useState(0);
	const [nays, setNays] = useState(0);
	const [memberSet, setMemberSet] = useState<Set<string>>(new Set<string>());
	const [councilVotes, setCouncilVotes] = useState<CouncilVote[]>([]);

	const getCurrentCouncilMembers = useCallback(() => {
		if (!api || !apiReady) return;

		api.query?.council?.members().then((councilMembers) => {
			const memberAddresses = councilMembers.map((member) => member.toString());
			setMemberSet(new Set(...memberSet, memberAddresses));
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady]);

	useEffect(() => {
		getCurrentCouncilMembers();
	}, [getCurrentCouncilMembers]);

	useEffect(() => {
		const addresses: string[] = [];
		Array.from(memberSet).forEach((member) => {
			const address = getSubstrateAddress(member);
			if (address) {
				addresses.push(address);
			}
		});

		nextApiClientFetch<IAddressesResponse>('api/v1/getAddressesData', {
			addresses
		})
			.then((res) => {
				if (res.error) {
					console.error(res.error);
				} else {
					const addressesData = res.data?.addressesData;
					if (addressesData && addressesData.length > 0) {
						let ayes = 0;
						let nays = 0;
						const councilVotes: CouncilVote[] = [];

						addressesData.forEach((addressData) => {
							if (addressData) {
								const userVote = votes.find((v) => v.user_id === addressData.user_id);
								if (userVote) {
									const { vote } = userVote;
									if (addressData.address) {
										councilVotes.push({
											address: addressData.address,
											vote: vote
										});
									}
									if (vote === Vote.AYE) {
										ayes++;
									}
									if (vote === Vote.NAY) {
										nays++;
									}
								}
							}
						});

						setAyes(ayes);
						setNays(nays);
						setCouncilVotes(councilVotes);
					}
				}
			})
			.catch((err) => {
				console.error(err);
			});
	}, [votes, memberSet, network]);

	return (
		<>
			{councilVotes.length > 0 ? (
				<GovSidebarCard className={className}>
					<h3 className='flex items-center'>
						<span className='dashboard-heading mr-2'>Council Signals</span> <HelperTooltip text='This represents the off-chain votes of council members' />
					</h3>

					<div className='mt-6 flex'>
						<div>
							<Progress
								percent={100}
								success={{ percent: (ayes / (ayes + nays)) * 100, strokeColor: '#2ED47A' }}
								type='circle'
								strokeWidth={12}
								strokeColor='#FF3C5F'
								format={() =>
									ayes && nays ? (
										<div className='text-sm'>
											<div className='mx-10 border-b border-b-gray-400 text-green-400'>{((ayes / (ayes + nays)) * 100).toFixed(1)}%</div>
											<div className='text-pink_primary'>{((nays / (ayes + nays)) * 100).toFixed(1)}%</div>
										</div>
									) : (
										<div className='text-sm'>No Votes</div>
									)
								}
							/>
						</div>

						<div className='ml-12 flex flex-1 flex-col justify-between py-5'>
							<div className='mb-auto flex items-center'>
								<div className='mr-auto font-medium text-sidebarBlue'>Aye</div>
								<div className='text-navBlue'>{ayes}</div>
							</div>

							<div className='flex items-center'>
								<div className='mr-auto font-medium text-sidebarBlue'>Nay</div>
								<div className='text-navBlue'>{nays}</div>
							</div>
						</div>
					</div>

					{councilVotes.length > 0 && (
						<div>
							<Divider />
							{councilVotes.map((councilVote) => (
								<div
									className='mt-3 flex items-center px-12'
									key={councilVote.address}
								>
									<div className='mr-auto'>
										<Address address={councilVote.address} />
									</div>
									<div>
										{councilVote.vote === Vote.AYE ? (
											<>
												<div className='flex items-center'>
													<LikeFilled className='mr-4 text-pink_primary' />
													Aye
												</div>
											</>
										) : (
											<>
												<div className='flex items-center'>
													<DislikeFilled className='mr-4 text-green-400' />
													Nay
												</div>
											</>
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</GovSidebarCard>
			) : (
				<></>
			)}
		</>
	);
};

export default CouncilSignals;
