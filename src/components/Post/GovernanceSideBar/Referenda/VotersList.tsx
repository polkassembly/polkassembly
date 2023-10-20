// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LeftOutlined, LikeFilled, MinusCircleFilled, RightOutlined, SwapOutlined } from '@ant-design/icons';
import { LoadingOutlined } from '@ant-design/icons';
import { Dropdown, Pagination, PaginationProps, Segmented, Spin } from 'antd';
import { IVotesResponse } from 'pages/api/v1/votes';
import React, { FC, useEffect, useRef, useState } from 'react';
import { LoadingStatusType } from 'src/types';
import Address from 'src/ui-components/Address';
// import formatBnBalance from 'src/util/formatBnBalance';

import { useApiContext } from '~src/context';
import { LISTING_LIMIT, VOTES_LISTING_LIMIT } from '~src/global/listingLimit';
import { ProposalType, VoteType } from '~src/global/proposalType';
import { votesSortOptions, votesSortValues } from '~src/global/sortOptions';
import { PostEmptyState } from '~src/ui-components/UIStates';
// import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { network as AllNetworks } from '~src/global/networkConstants';
import classNames from 'classnames';
import { IPIPsVoting } from 'pages/api/v1/posts/on-chain-post';
import { parseBalance } from '../Modal/VoteData/utils/parseBalaceToReadable';
import { useNetworkSelector } from '~src/redux/selectors';

interface IVotersListProps {
	className?: string;
	referendumId: number;
	voteType: VoteType;
	pipsVoters?: IPIPsVoting[];
	proposalType?: ProposalType;
}

type DecisionType = 'yes' | 'no' | 'abstain';

const VotersList: FC<IVotersListProps> = (props) => {
	const { network } = useNetworkSelector();
	const firstRef = useRef(true);
	const { api, apiReady } = useApiContext();

	const { className, referendumId, voteType, pipsVoters, proposalType } = props;

	const [loadingStatus, setLoadingStatus] = useState<LoadingStatusType>({ isLoading: true, message: 'Loading votes' });
	const [currentPage, setCurrentPage] = useState<number>(1);
	const [decision, setDecision] = useState<DecisionType>('yes');
	const [votesRes, setVotesRes] = useState<IVotesResponse>();
	const [sortBy, setSortBy] = useState<string>(votesSortValues.TIME_DESC);
	const [polymeshVotesData, setPolymeshVotesData] = useState<{ ayeVotes: any[]; nayVotes: any[] }>({ ayeVotes: [], nayVotes: [] });

	const getVoterFromPolkadot = async (identityId: string) => {
		if (!api || !apiReady) return;

		const didKeys = await api.query.identity.didKeys.keys(identityId);
		if (didKeys.length > 0) {
			const didKey = didKeys[0];
			const key = didKey.args[1].toJSON();
			return key;
		}
	};

	const fetchVotersListForPolymesh = async () => {
		if (!api || !apiReady || !pipsVoters) return;

		const votesWithoutVoter = pipsVoters.filter((vote) => !vote.voter);
		const votesWithVoter = pipsVoters.filter((vote) => vote.voter);

		const voterAddedArr = [];
		for (const vote in votesWithoutVoter) {
			const voter = await getVoterFromPolkadot(votesWithoutVoter?.[vote]?.identityId);
			voterAddedArr?.push({
				...votesWithoutVoter?.[vote],
				voter
			});
		}

		const votes = [...voterAddedArr, ...votesWithVoter];

		const ayeVotes = votes.filter((vote) => vote.decision === 'yes');
		const nayVotes = votes.filter((vote) => vote.decision === 'no');
		setPolymeshVotesData({ ayeVotes, nayVotes });
		setVotesRes({
			abstain: {
				count: 0,
				votes: []
			},
			no: {
				count: nayVotes.length,
				votes: nayVotes?.slice(0, 10)
			},
			yes: {
				count: ayeVotes.length,
				votes: ayeVotes?.slice(0, 10)
			}
		});
		setLoadingStatus({
			isLoading: false,
			message: ''
		});
	};

	useEffect(() => {
		if (network === 'polymesh') {
			fetchVotersListForPolymesh();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady]);

	useEffect(() => {
		if (network === 'polymesh') {
			setLoadingStatus({
				isLoading: true,
				message: ''
			});
			if (sortBy === votesSortValues.BALANCE_DESC) {
				const sortedAyeVotes = polymeshVotesData.ayeVotes.sort((a, b) => Number(b?.balance?.value || 0) - Number(a?.balance?.value || 0));
				const sortedNayVotes = polymeshVotesData.nayVotes.sort((a, b) => Number(b?.balance?.value || 0) - Number(a?.balance?.value || 0));

				setVotesRes({
					abstain: {
						count: 0,
						votes: []
					},
					no: {
						count: polymeshVotesData?.nayVotes.length,
						votes: sortedNayVotes?.slice((currentPage - 1) * LISTING_LIMIT, (currentPage - 1) * LISTING_LIMIT + LISTING_LIMIT)
					},
					yes: {
						count: polymeshVotesData?.ayeVotes.length,
						votes: sortedAyeVotes?.slice((currentPage - 1) * LISTING_LIMIT, (currentPage - 1) * LISTING_LIMIT + LISTING_LIMIT)
					}
				});
			}
			setLoadingStatus({
				isLoading: false,
				message: ''
			});
		} else {
			setLoadingStatus({
				isLoading: true,
				message: 'Loading votes'
			});
			nextApiClientFetch<IVotesResponse>(`api/v1/votes?listingLimit=${VOTES_LISTING_LIMIT}&postId=${referendumId}&voteType=${voteType}&page=${currentPage}&sortBy=${sortBy}`)
				.then((res) => {
					if (res.error) {
						console.log(res.error);
					} else {
						const votesRes = res.data;
						setVotesRes(votesRes);
						if (votesRes && firstRef.current) {
							firstRef.current = false;
							let decision: DecisionType = 'yes';
							if (votesRes.yes.count > 0) {
								decision = 'yes';
							} else if (votesRes.no.count > 0) {
								decision = 'no';
							} else if (votesRes.abstain.count > 0) {
								decision = 'abstain';
							}
							setDecision(decision);
						}
					}
				})
				.catch((err) => {
					console.log(err);
				})
				.finally(() => {
					setLoadingStatus({
						isLoading: false,
						message: ''
					});
				});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [referendumId, currentPage, voteType, sortBy]);

	const decisionOptions = [
		{
			label: (
				<div className='flex items-center justify-center'>
					<LikeFilled className='mr-1.5' /> <span>Ayes</span>
				</div>
			),
			value: 'yes'
		},
		{
			label: (
				<div className='flex items-center justify-center'>
					<DislikeFilled className='mr-1.5' /> <span>Nays</span>
				</div>
			),
			value: 'no'
		}
	];

	if (voteType === VoteType.REFERENDUM_V2) {
		decisionOptions.push({
			label: (
				<div className='flex items-center justify-center'>
					<MinusCircleFilled className='mr-1.5' /> <span>Abstain</span>
				</div>
			),
			value: 'abstain'
		});
	}

	const onChange: PaginationProps['onChange'] = (page) => {
		setCurrentPage(page);
		if (network === 'polymesh') {
			setVotesRes({
				abstain: {
					count: 0,
					votes: []
				},
				no: {
					count: polymeshVotesData?.nayVotes.length,
					votes: polymeshVotesData?.nayVotes?.slice((page - 1) * LISTING_LIMIT, (page - 1) * LISTING_LIMIT + LISTING_LIMIT)
				},
				yes: {
					count: polymeshVotesData?.ayeVotes.length,
					votes: polymeshVotesData?.ayeVotes?.slice((page - 1) * LISTING_LIMIT, (page - 1) * LISTING_LIMIT + LISTING_LIMIT)
				}
			});
		}
	};
	const handleSortByClick = ({ key }: { key: string }) => {
		setSortBy(key);
	};
	const sortByDropdown = (
		<Dropdown
			overlayClassName='z-[1056]'
			menu={{
				defaultSelectedKeys: [votesSortValues.TIME_DESC],
				items: [
					...(network === AllNetworks.POLYMESH
						? votesSortOptions.slice(2, 5)
						: proposalType === ProposalType.REFERENDUM_V2
						? votesSortOptions.slice(2, votesSortOptions.length - 2)
						: votesSortOptions.slice(0, votesSortOptions.length - 2))
				],
				onClick: handleSortByClick,
				selectable: true
			}}
			trigger={['click']}
		>
			<div className='dropdown-div flex cursor-pointer items-center rounded px-2 py-1 hover:text-pink_primary'>
				<span className='mr-2'>Sort By</span>
				<SwapOutlined
					rotate={90}
					style={{ fontSize: '14px' }}
				/>
			</div>
		</Dropdown>
	);
	return (
		<>
			<Spin
				className={className}
				spinning={loadingStatus.isLoading}
				indicator={<LoadingOutlined />}
			>
				<div className='z-10 mb-6 flex justify-between bg-white dark:bg-section-dark-overlay'>
					<h6 className='dashboard-heading'>Votes</h6>
					{![ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType as ProposalType) && <div>{sortByDropdown}</div>}
				</div>

				<div className='mb-8 flex w-full items-center justify-center'>
					<Segmented
						block
						className='w-full rounded-md px-3 py-2'
						size='large'
						value={decision}
						onChange={(value) => {
							setDecision(String(value) as DecisionType);
							onChange(1, 10);
						}}
						options={decisionOptions}
					/>
				</div>

				<div className='flex flex-col gap-y-1 overflow-y-auto px-0 text-xs text-sidebarBlue xl:max-h-screen xl:text-sm'>
					<div className='mb-9 flex items-center justify-between text-xs font-semibold'>
						<div className='w-[110px]'>Voter</div>
						<div
							className={classNames('', {
								'w-[100px]': network === AllNetworks.COLLECTIVES,
								'w-[60px]': network !== AllNetworks.COLLECTIVES
							})}
						>
							{![ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType as ProposalType) && (
								<>
									<span className='hidden md:inline-block'>Amount</span>
									<span className='inline-block md:hidden'>Amt.</span>
								</>
							)}
						</div>
						{![AllNetworks.COLLECTIVES, AllNetworks.POLYMESH].includes(network) ? <div className='w-[70px]'>Conviction</div> : null}
						<div className='w-[30px]'>Vote</div>
					</div>

					{votesRes && decision && !!votesRes[decision]?.votes?.length ? (
						votesRes[decision]?.votes.map((voteData: any, index: number) => (
							<div
								className='mb-9 flex items-center justify-between'
								key={index}
							>
								{voteType === VoteType.REFERENDUM_V2 && voteData?.txnHash ? (
									<a
										href={`https://${network}.moonscan.io/tx/${voteData.txnHash}`}
										className='w-[110px] max-w-[110px] overflow-ellipsis'
									>
										<Address
											isVoterAddress
											isSubVisible={false}
											displayInline
											showFullAddress
											address={voteData?.voter}
										/>
									</a>
								) : (
									<div className='w-[110px] max-w-[110px] overflow-ellipsis'>
										<Address
											isVoterAddress
											isSubVisible={false}
											displayInline
											showFullAddress
											address={voteData?.voter}
										/>
									</div>
								)}
								{![ProposalType.TECHNICAL_PIPS, ProposalType.UPGRADE_PIPS].includes(proposalType as ProposalType) ? (
									network !== AllNetworks.COLLECTIVES ? (
										<>
											<div className='w-[80px] max-w-[80px] overflow-ellipsis whitespace-nowrap'>
												{parseBalance((voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0).toString(), 2, true, network)}
												{/* {formatUSDWithUnits(
													formatBnBalance(
														voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || voteData?.balance?.replaceAll(',', '') || 0,
														{ numberAfterComma: 1, withThousandDelimitor: false, withUnit: true },
														network
													),
													1
												)} */}
											</div>
											{network !== AllNetworks.POLYMESH && (
												<div className='w-[50px] max-w-[50px] overflow-ellipsis'>
													{voteData.lockPeriod ? `${voteData.lockPeriod}x${voteData?.isDelegated ? '/d' : ''}` : '0.1x'}
												</div>
											)}
										</>
									) : (
										<>
											<div className='w-[80px] max-w-[80px] overflow-ellipsis'>
												{voteData?.decision === 'abstain' ? voteData?.balance?.abstain || 0 : voteData?.balance?.value || 0}
											</div>
										</>
									)
								) : null}

								{voteData.decision === 'yes' || voteData.passed ? (
									<div className='text-md flex w-[20px] max-w-[20px] items-center text-aye_green'>
										<LikeFilled className='mr-2' />
									</div>
								) : voteData.decision === 'no' || !voteData.passed ? (
									<div className='text-md flex w-[20px] max-w-[20px] items-center text-nay_red'>
										<DislikeFilled className='mr-2' />
									</div>
								) : (
									<div className='flex h-[20px] w-[20px] items-center justify-center'>
										<span className='mr-2 h-[8px] w-[8px] rounded-full bg-grey_primary'></span>
									</div>
								)}
							</div>
						))
					) : (
						<PostEmptyState />
					)}
				</div>

				<div className='z-10 flex justify-center bg-white pt-6 dark:bg-section-dark-overlay'>
					<Pagination
						size='small'
						defaultCurrent={1}
						current={currentPage}
						onChange={onChange}
						total={votesRes && decision ? votesRes[decision]?.count || 0 : 0}
						showSizeChanger={false}
						pageSize={VOTES_LISTING_LIMIT}
						responsive={true}
						hideOnSinglePage={true}
						nextIcon={
							<div className={`ml-1 ${currentPage > Math.floor((votesRes && decision ? votesRes[decision]?.count || 0 : 0) / VOTES_LISTING_LIMIT) ? 'text-grey_secondary' : ''}`}>
								<RightOutlined />
							</div>
						}
						prevIcon={
							<div className={`mr-1 ${currentPage <= 1 ? 'text-grey_secondary' : ''}`}>
								<LeftOutlined />
							</div>
						}
					/>
				</div>
			</Spin>
		</>
	);
};

export default React.memo(VotersList);
