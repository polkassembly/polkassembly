// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider } from 'antd';
import BN from 'bn.js';
import { network as AllNetworks } from '~src/global/networkConstants';
import React, { FC, useEffect, useState } from 'react';
import formatBnBalance from 'src/util/formatBnBalance';
import { chainProperties } from '~src/global/networkConstants';
import { networkTrackInfo } from '~src/global/post_trackInfo';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import DelegateModal from './DelegateModal';
import { useApiContext } from '~src/context';
import { ETrackDelegationStatus, TrackProps } from '~src/types';
import { ChartData, Point } from 'chart.js';
import { getTrackFunctions } from '../../Post/GovernanceSideBar/Referenda/util';
import blockToTime from '~src/util/blockToTime';
import dynamic from 'next/dynamic';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import DiscussionIconGrey from '~assets/icons/Discussion-Unselected.svg';
import DiscussionIconWhite from '~assets/icons/Discussion-Unselected-white.svg';
import { useTheme } from 'next-themes';
import styled from 'styled-components';
import OpenGovTreasuryProposal from '~src/components/OpenGovTreasuryProposal';
import HelperTooltip from '~src/ui-components/HelperTooltip';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import Tooltip from '~src/basic-components/Tooltip';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ITrackDelegation } from 'pages/api/v1/delegations';
import Address from '~src/ui-components/Address';
import Link from 'next/link';
import Alert from '~src/basic-components/Alert';
import ProposalActionButtons from '~src/ui-components/ProposalActionButtons';
import Skeleton from '~src/basic-components/Skeleton';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { delegationSupportedNetworks } from '~src/components/Post/Tabs/PostStats/util/constants';
import AmbassadorActionButtons from '~src/components/AmbassadorSeeding/AmbassadorActionButtons';

const Curves = dynamic(() => import('./Curves'), {
	loading: () => <Skeleton active />,
	ssr: false
});
// import DelegateModalEthV2 from './DelegateModalEthV2';

interface IAboutTrackCardProps {
	className?: string;
	trackName: string;
}

export const treasuryProposalCreationAllowedNetwork = [AllNetworks.KUSAMA, AllNetworks.POLKADOT, AllNetworks.ROCOCO];

export const getDefaultTrackMetaData = () => {
	return {
		confirmPeriod: '',
		decisionDeposit: '',
		decisionPeriod: '',
		description: '',
		group: '',
		maxDeciding: '',
		minEnactmentPeriod: '',
		preparePeriod: '',
		trackGroup: [],
		trackId: 0
	};
};
const groups: any = {
	Admin: ['staking_admin', 'lease_admin', 'fellowship_admin', 'general_admin', 'auction_admin'],
	Governance: ['referendum_killer', 'referendum_canceller', 'fast_general_admin'],
	Root: ['whitelisted_caller', 'root', 'wish_for_change'],
	Treasury: ['small_spender', 'medium_spender', 'big_spender', 'small_tipper', 'big_tipper', 'treasurer']
};

function addTrackGroup(arr: any) {
	for (let i = 0; i < arr.length; i++) {
		const currentTrackId = arr[i][0];
		const currentTrackName = arr[i][1].name;

		let groupName: any;
		for (const group in groups) {
			if (groups[group].includes(currentTrackName)) {
				groupName = group;
				break;
			}
		}

		if (groupName) {
			const trackGroup = arr.filter((track: any[]) => groups[groupName].includes(track[1].name) && track[0] !== currentTrackId).map((track: any[]) => track[0]);

			arr[i][1].trackGroup = trackGroup;
		}
	}

	return arr;
}

export const getTrackData = (network: string, trackName?: string, trackNumber?: number) => {
	const defaultTrackMetaData = getDefaultTrackMetaData();

	if (!network) return defaultTrackMetaData;
	let trackMetaData: TrackProps | undefined = undefined;
	if (trackName) {
		trackMetaData = networkTrackInfo[network][trackName];
	} else if (trackNumber || trackNumber === 0) {
		trackMetaData = Object.values(networkTrackInfo[network]).find((v) => v && v.trackId === trackNumber);
	}
	if (trackMetaData) {
		Object.keys(defaultTrackMetaData).forEach((key) => {
			(defaultTrackMetaData as any)[key] = trackMetaData?.[key];
		});
	}
	//33: [32, 34, 36]
	const tracks = localStorage.getItem('tracks');
	if (tracks) {
		const tracksArr = JSON.parse(tracks) as any[];
		if (tracksArr && Array.isArray(tracksArr) && tracksArr.length > 0) {
			addTrackGroup(tracksArr);
			const currTrackMetaDataArr = tracksArr.find((v) => v && Array.isArray(v) && v.length > 1 && v[0] === trackMetaData?.trackId);
			if (currTrackMetaDataArr && Array.isArray(currTrackMetaDataArr) && currTrackMetaDataArr.length >= 2) {
				const currTrackMetaData = currTrackMetaDataArr[1];
				const keys = ['confirmPeriod', 'decisionDeposit', 'decisionPeriod', 'maxDeciding', 'minEnactmentPeriod', 'preparePeriod', 'trackGroup'];
				keys.forEach((key) => {
					if (currTrackMetaData[key]) {
						(defaultTrackMetaData as any)[key] = currTrackMetaData[key];
					}
				});
			}
		}
	}
	return defaultTrackMetaData;
};

export const blocksToRelevantTime = (network: string, blocks: number): string => {
	const blockTimeSeconds: number = chainProperties?.[network]?.blockTime / 1000;
	let divisor: number = 1;
	let text: string = 'sec';

	const blockSeconds = blocks * blockTimeSeconds;

	if (blockSeconds > 60 && blockSeconds <= 3600) {
		divisor = 60;
		text = 'min';
	} else if (blockSeconds > 3600 && blockSeconds < 86400) {
		divisor = 3600;
		text = 'hr';
	} else if (blockSeconds >= 86400) {
		divisor = 86400;
		text = 'day';
	}

	const roundedValue = Math.round(blockSeconds / divisor);
	return `${roundedValue} ${text}${roundedValue !== 1 ? 's' : ''}`;
};

const AboutTrackCard: FC<IAboutTrackCardProps> = (props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const { loginAddress } = useUserDetailsSelector();
	const { resolvedTheme: theme } = useTheme();
	const { className, trackName } = props;
	const [delegatedTo, setDelegatedTo] = useState<string | null>(null);
	const [trackMetaData, setTrackMetaData] = useState(getDefaultTrackMetaData());
	const [curvesLoading, setCurvesLoading] = useState(true);
	const [showDetails, setShowDetails] = useState(false);
	const [trackNum, setTrackNum] = useState<number | null>(null);

	const [data, setData] = useState<any>({
		datasets: [],
		labels: []
	});

	const getData = async (trackNum: number) => {
		const { data, error } = await nextApiClientFetch<ITrackDelegation[]>('api/v1/delegations', {
			address: loginAddress,
			track: trackNum
		});

		if (data && data?.filter((item) => item?.status.includes(ETrackDelegationStatus.DELEGATED))?.length) {
			const delegated = data?.filter((item) => item?.status.includes(ETrackDelegationStatus.DELEGATED))[0];
			delegated?.delegations.map((item) => {
				if (getEncodedAddress(item.from, network) === getEncodedAddress(loginAddress, network)) {
					setDelegatedTo(item?.to);
				} else {
					setDelegatedTo(null);
				}
			});
		} else if (error) {
			console.log(error);
			setDelegatedTo(null);
		}
	};

	useEffect(() => {
		const data = getTrackData(network, trackName);
		setTrackMetaData(data);
		setTrackNum(data.trackId);

		if (typeof data?.trackId !== 'number') return;
		getData(data?.trackId);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, trackName]);

	useEffect(() => {
		if (!api || !apiReady) {
			return;
		}
		setCurvesLoading(true);

		const getData = async () => {
			const tracks = network != 'collectives' ? api?.consts?.referenda?.tracks.toJSON() : api?.consts?.fellowshipReferenda?.tracks?.toJSON();
			if (tracks && Array.isArray(tracks)) {
				const track = tracks?.find((track) => track && Array.isArray(track) && track?.length >= 2 && track[0] === trackNum);
				if (track && Array.isArray(track) && track?.length > 1) {
					const trackInfo = track[1] as any;
					const { decisionPeriod } = trackInfo;
					const strArr = blockToTime(decisionPeriod, network)['time'].split(' ');
					let decisionPeriodHrs = 0;
					if (strArr && Array.isArray(strArr)) {
						strArr?.forEach((str) => {
							if (str.includes('h')) {
								decisionPeriodHrs += parseInt(str.replace('h', ''));
							} else if (str.includes('d')) {
								decisionPeriodHrs += parseInt(str.replace('d', '')) * 24;
							}
						});
					}
					const labels: number[] = [];
					const supportData: { x: number; y: number }[] = [];
					const approvalData: { x: number; y: number }[] = [];
					const { approvalCalc, supportCalc } = getTrackFunctions(trackInfo);
					for (let i = 0; i < decisionPeriodHrs * 60; i++) {
						labels.push(i);
						if (supportCalc) {
							supportData.push({
								x: i,
								y: supportCalc(i / (decisionPeriodHrs * 60)) * 100
							});
						}
						if (approvalCalc) {
							approvalData.push({
								x: i,
								y: approvalCalc(i / (decisionPeriodHrs * 60)) * 100
							});
						}
					}
					const newData: ChartData<'line', (number | Point | null)[]> = {
						datasets: [
							{
								backgroundColor: 'transparent',
								borderColor: '#5BC044',
								borderWidth: 1,
								data: approvalData,
								label: 'Approval',
								pointHitRadius: 10,
								pointHoverRadius: 5,
								pointRadius: 0,
								tension: 0.1
							},
							{
								backgroundColor: 'transparent',
								borderColor: '#E5007A',
								borderWidth: 1,
								data: supportData,
								label: 'Support',
								pointHitRadius: 10,
								pointHoverRadius: 5,
								pointRadius: 0,
								tension: 0.1
							}
						],
						labels
					};
					setData(JSON.parse(JSON.stringify(newData)));
				}
			}
			setCurvesLoading(false);
		};
		getData();
	}, [api, apiReady, network, trackNum]);

	const path = window.location.pathname;

	return (
		<div className={`${className}`}>
			<article className='flex justify-between xs:py-2 md:py-0'>
				<div className='flex items-center gap-2 xs:mt-2 xs:flex-wrap md:mt-0'>
					{theme === 'dark' ? <DiscussionIconWhite /> : <DiscussionIconGrey />}
					<h2 className='mb-0 text-xl font-semibold leading-8 text-bodyBlue dark:text-blue-dark-high'>About {trackName.split(/(?=[A-Z])/).join(' ')}</h2>
					<Tooltip
						color='#E5007A'
						title='Track Number'
						className='cursor-pointer text-bodyBlue'
					>
						<h4 className=' mb-0 text-xl font-semibold leading-8 tracking-[0.01em] dark:text-blue-dark-high'>(#{trackMetaData.trackId})</h4>
					</Tooltip>
				</div>
				<div className='flex justify-end xs:hidden md:flex md:p-1'>
					<div className='flex gap-4'>
						{delegationSupportedNetworks.includes(network) && !delegatedTo && <DelegateModal trackNum={trackMetaData?.trackId} />}
						{network === 'polkadot' && trackName == 'FellowshipAdmin' && (
							<div className=''>
								<AmbassadorActionButtons />
							</div>
						)}
						{['root', 'ReferendumCanceller', 'ReferendumKiller', 'StakingAdmin', 'AuctionAdmin', 'WishForChange', 'FastGeneralAdmin'].includes(trackName) && (
							<ProposalActionButtons
								isCreateProposal={
									trackName === 'root' || trackName === 'StakingAdmin' || trackName === 'AuctionAdmin' || trackName === 'WishForChange' || trackName === 'FastGeneralAdmin'
								}
								isCancelProposal={trackName === 'ReferendumCanceller'}
								isKillProposal={trackName === 'ReferendumKiller'}
							/>
						)}
						{trackMetaData?.group === 'Treasury' && treasuryProposalCreationAllowedNetwork.includes(network) && (
							<CustomButton
								className='delegation-buttons'
								variant='solid'
								width={175}
								height={40}
							>
								<OpenGovTreasuryProposal
									theme={theme}
									isUsedInTreasuryTrack={true}
								/>
							</CustomButton>
						)}
					</div>
				</div>
			</article>
			{delegatedTo && (
				<Alert
					message={
						<span className='flex items-center text-[13px]'>
							You have delegated vote to
							<Address
								address={delegatedTo}
								className='ml-2 text-xs'
								iconSize={20}
								displayInline
								isTruncateUsername={false}
								isUsedIndelegationNudge={true}
							/>
							<Link
								href={`https://${network}.polkassembly.io/delegation${path}`}
								target='_blank'
								className='ml-2 mt-1 text-xs text-pink_primary'
							>
								View Details
							</Link>
						</span>
					}
					className={'mt-4 rounded-[10px] text-sm text-bodyBlue dark:border-[#026630] dark:bg-[#063E20] dark:text-blue-dark-high'}
					type='success'
					showIcon
				/>
			)}
			<section className={`${className} mt-2 rounded-xxl bg-white drop-shadow-md dark:bg-section-dark-overlay md:p-4`}>
				<div className='text-container flex gap-x-2 px-4 font-normal leading-6 text-bodyBlue dark:text-blue-dark-high xs:mt-2 md:mt-0'>
					<p className='m-0 p-0 text-sm'>
						{trackMetaData?.description}
						{showDetails && (
							<span
								className={`m-0 ml-2 ${theme === 'dark' ? 'mt-1' : 'mt-[2px]'} cursor-pointer p-0 text-xs font-medium text-pink_primary`}
								onClick={() => setShowDetails(false)}
							>
								Hide Track details
							</span>
						)}
						{!showDetails && (
							<span
								className={`m-0 ml-2 ${theme === 'dark' ? 'mt-1' : 'mt-[2px]'} cursor-pointer p-0 text-xs font-medium text-pink_primary`}
								onClick={() => setShowDetails(true)}
							>
								Show Track details
							</span>
						)}
					</p>
				</div>

				{showDetails && (
					<article className='md:flex md:justify-between'>
						<section className='mt-6 flex w-full flex-wrap text-xs md:grid md:w-[70%] md:grid-cols-3'>
							<article className='px-4 xs:w-1/2 sm:w-1/2 lg:w-auto'>
								<div className='flex flex-col'>
									<div className='flex gap-1'>
										<span className='whitespace-pre text-sm font-medium text-lightBlue dark:text-blue-dark-medium'>Max Deciding</span>
										<HelperTooltip
											text='Maximum number of referenda that can be in the decision period of a track all at once'
											className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
										/>
									</div>
									<span className='my-1.5 whitespace-pre text-lg font-medium leading-7 text-bodyBlue dark:text-blue-dark-high'>{trackMetaData.maxDeciding}</span>
								</div>
							</article>

							<article className='px-4 xs:w-1/2 sm:w-1/2 lg:w-auto'>
								<div className='flex flex-col'>
									<div className='flex gap-1'>
										<span className='whitespace-pre text-sm font-medium text-lightBlue dark:text-blue-dark-medium'>Confirm Period</span>
										<HelperTooltip
											text='Total time the referenda must meet both the min approval and support criteria during the decision period in order to pass'
											className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
										/>
									</div>

									<span className='my-1.5 whitespace-pre text-lg font-medium leading-7 text-bodyBlue dark:text-blue-dark-high'>
										{blocksToRelevantTime(network, Number(trackMetaData.confirmPeriod))}
									</span>
								</div>
							</article>

							<article className='px-4 xs:w-1/2 sm:w-1/2 lg:w-auto'>
								<div className='flex flex-col'>
									<div className='flex gap-1'>
										<span className='whitespace-pre text-sm font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'>Min. Enactment Period</span>
										<HelperTooltip
											text='Minimum time that an approved proposal must be in dispatch queue after approval. Proposer can set enactment period at any value greater than this.'
											className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
										/>
									</div>

									<span className='my-1.5 whitespace-pre text-lg font-medium leading-7 text-bodyBlue dark:text-blue-dark-high'>
										{blocksToRelevantTime(network, Number(trackMetaData.minEnactmentPeriod))}
									</span>
								</div>
							</article>

							<article className='px-4 xs:w-1/2 sm:w-1/2 lg:w-auto'>
								<div className='flex flex-col'>
									<div className='flex gap-1'>
										<span className='whitespace-pre text-sm font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'>Decision Period</span>
										<HelperTooltip
											text='Amount of time a proposal may take to be approved. If the proposal is not approved by the end of the decision period, it gets rejected.'
											className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
										/>
									</div>

									<span className='my-1.5 whitespace-pre text-lg font-medium leading-7 text-bodyBlue dark:text-blue-dark-high'>
										{blocksToRelevantTime(network, Number(trackMetaData.decisionPeriod))}
									</span>
								</div>
							</article>

							<article className='px-4 xs:w-1/2 sm:w-1/2 lg:w-auto'>
								<div className='flex flex-col'>
									<div className='flex gap-1'>
										<span className='whitespace-pre text-sm font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'>Decision Deposit</span>
										<HelperTooltip
											text='Amount to be deposited for a referendum to progress from prepare to decision period.'
											className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
										/>
									</div>

									<span className='my-1.5 whitespace-pre text-lg font-medium leading-7 text-bodyBlue dark:text-blue-dark-high'>
										{trackMetaData.decisionDeposit &&
											formatUSDWithUnits(
												formatBnBalance(
													`${trackMetaData.decisionDeposit}`.startsWith('0x') ? new BN(`${trackMetaData.decisionDeposit}`.slice(2), 'hex') : trackMetaData.decisionDeposit,
													{ numberAfterComma: 2, withThousandDelimitor: false, withUnit: true },
													network
												),
												1
											)}
									</span>
								</div>
							</article>

							<article className='px-4 xs:w-1/2 sm:w-1/2 lg:w-auto'>
								<div className='flex flex-col'>
									<div className='flex gap-1'>
										<span className='whitespace-pre text-sm font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'>Prepare Period</span>
										<HelperTooltip
											text='Minimum waiting time for a referendum to proceed from submission into decision period.'
											className='text-xs font-medium leading-5 text-lightBlue dark:text-blue-dark-medium'
										/>
									</div>

									<span className='my-1.5 whitespace-pre text-lg font-medium leading-7 text-bodyBlue dark:text-blue-dark-high'>
										{blocksToRelevantTime(network, Number(trackMetaData.preparePeriod))}
									</span>
								</div>
							</article>
						</section>
						<section className='mb-5 mr-5 flex justify-center xs:mt-6 sm:mt-0 md:w-[30%]'>
							<Curves
								curvesLoading={curvesLoading}
								data={data}
							/>
						</section>
					</article>
				)}

				<Divider className='xs:block sm:hidden' />

				<article className='justify-end px-4 pb-4 pt-0 xs:flex md:hidden md:p-4'>
					<div className='flex flex-wrap gap-2'>
						{delegationSupportedNetworks.includes(network) && <DelegateModal trackNum={trackMetaData?.trackId} />}
						{network === 'polkadot' && trackName == 'FellowshipAdmin' && (
							<div>
								<AmbassadorActionButtons />
							</div>
						)}
						{trackMetaData?.group === 'Treasury' && treasuryProposalCreationAllowedNetwork?.includes(network) && (
							<CustomButton
								className='delegation-buttons'
								variant='solid'
								width={175}
								height={40}
							>
								<OpenGovTreasuryProposal
									theme={theme}
									isUsedInTreasuryTrack={true}
								/>
							</CustomButton>
						)}
					</div>
				</article>
			</section>
		</div>
	);
};

export default styled(AboutTrackCard)`
	@media (max-width: 766px) and (min-width: 319px) {
		.text-container {
			padding-top: 16px !important;
			margin-bottom: 8px !important;
		}
	}
	@media (max-width: 374px) and (min-width: 319px) {
		.text-container {
			display: block !important;
		}
	}
`;
