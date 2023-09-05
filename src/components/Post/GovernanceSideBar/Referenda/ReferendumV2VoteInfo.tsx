// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, Modal, Spin } from 'antd';
import { LoadingOutlined, InfoCircleOutlined, DislikeFilled } from '@ant-design/icons';
import BN from 'bn.js';
import React, { FC, useEffect, useState } from 'react';
import GovSidebarCard from 'src/ui-components/GovSidebarCard';
import VoteProgress from 'src/ui-components/VoteProgress';
import formatBnBalance from 'src/util/formatBnBalance';

import { useApiContext, useNetworkContext } from '~src/context';
import { usePostDataContext } from '~src/context';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { CastVoteIcon, ConvictionPeriodIcon, LikeDislikeIcon, RightArrowIcon, ThresholdGraphIcon, VoteAmountIcon, VotingHistoryIcon } from '~src/ui-components/CustomIcons';
import PassingInfoTag from '~src/ui-components/PassingInfoTag';
import CloseIcon from 'public/assets/icons/close.svg';
import DefaultProfile from '~assets/icons/dashboard-profile.svg';
import { poppins } from 'pages/_app';

interface IReferendumV2VoteInfoProps {
	className?: string;
	referendumId: number;
	tally?: any;
	setOpen: (value: React.SetStateAction<boolean>) => void;
	setThresholdOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const ZERO = new BN(0);

const ReferendumV2VoteInfo: FC<IReferendumV2VoteInfoProps> = ({ className, tally, setOpen, setThresholdOpen }) => {
	const { network } = useNetworkContext();
	const { postData: { status, postIndex } } = usePostDataContext();
	const [voteCalculationModalOpen, setVoteCalculationModalOpen] = useState(false);

	const { api, apiReady } = useApiContext();
	const [activeIssuance, setActiveIssuance] = useState<BN | null>(null);
	const[isLoading,setIsLoading] = useState(true);

	const [tallyData, setTallyData] = useState({
		ayes: ZERO || 0,
		nays: ZERO || 0,
		support: ZERO || 0
	});

	useEffect(() => {
		if( !api || !apiReady) return;

		(async () => {
			const totalIssuance = await api.query.balances.totalIssuance();
			const inactiveIssuance = await api.query.balances.inactiveIssuance();
			setActiveIssuance(totalIssuance.sub(inactiveIssuance));
		})();

		if(['confirmed', 'executed', 'timedout', 'cancelled', 'rejected', 'executionfailed'].includes(status.toLowerCase())){
			setTallyData({
				ayes: String(tally?.ayes).startsWith('0x') ? new BN(tally?.ayes || 0, 'hex') : new BN(tally?.ayes || 0),
				nays: String(tally?.nays).startsWith('0x') ? new BN(tally?.nays || 0, 'hex') : new BN(tally?.nays || 0),
				support: String(tally?.support).startsWith('0x') ? new BN(tally?.support || 0, 'hex') : new BN(tally?.support || 0)
			});
			setIsLoading(false);
			return;
		}

		(async () => {
			const referendumInfoOf = await api.query.referenda.referendumInfoFor(postIndex);
			const parsedReferendumInfo: any = referendumInfoOf.toJSON();
			if (parsedReferendumInfo?.ongoing?.tally) {
				setTallyData({
					ayes: typeof parsedReferendumInfo.ongoing.tally.ayes === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.ayes.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.ayes),
					nays: typeof parsedReferendumInfo.ongoing.tally.nays === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.nays.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.nays),
					support: typeof parsedReferendumInfo.ongoing.tally.support === 'string' ? new BN(parsedReferendumInfo.ongoing.tally.support.slice(2), 'hex') : new BN(parsedReferendumInfo.ongoing.tally.support)
				});
			} else {
				setTallyData({
					ayes: new BN(tally?.ayes || 0, 'hex'),
					nays: new BN(tally?.nays || 0, 'hex'),
					support: new BN(tally?.support || 0, 'hex')
				});
			}
		})();
		setIsLoading(false);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [status, api, apiReady]);

	return (
		<GovSidebarCard className={className}>
			<div className='flex items-center justify-between relative z-50'>
				<h6 className='text-bodyBlue font-medium text-xl leading-6 m-0 p-0'>Voting</h6>
				<div className='flex items-center gap-x-2'>
					{['Executed', 'Confirmed', 'Approved', 'TimedOut', 'Cancelled', 'Rejected'].includes(status) && <PassingInfoTag status={status} isPassing={['Executed', 'Confirmed', 'Approved'].includes(status)}/>}
					<button onClick={() => setVoteCalculationModalOpen(true)} className='border-none outline-none bg-transparent flex items-center cursor-pointer justify-center text-lg text-navBlue hover:text-pink_primary'>
						<InfoCircleOutlined style={{ color: '#90A0B7' }} />
					</button>
				</div>
			</div>
			<Spin spinning={ isLoading } indicator={<LoadingOutlined />}>
				<div>
					<VoteProgress
						ayeVotes={tallyData.ayes}
						className='vote-progress'
						nayVotes={tallyData.nays}
					/>
				</div>
				<section className='grid grid-cols-2 gap-x-7 gap-y-3 text-lightBlue -mt-4'>
					<article className='flex items-center justify-between gap-x-2'>
						<div className='flex items-center gap-x-1'>
							<span className='font-medium text-xs leading-[18px] tracking-[0.01em]'>
							Ayes
							</span>
						</div>
						<div
							className='text-navBlue text-xs font-medium leading-[22px]'
						>
							{formatUSDWithUnits(formatBnBalance(tallyData.ayes, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
						</div>
					</article>
					<article className='flex items-center justify-between gap-x-2'>
						<div className='flex items-center gap-x-1'>
							<span className='font-medium text-xs leading-[18px] tracking-[0.01em]'>
							Nays
							</span>
						</div>
						<div
							className='text-navBlue text-xs font-medium leading-[22px]'
						>
							{formatUSDWithUnits(formatBnBalance(tallyData.nays, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
						</div>
					</article>
					<article className='flex items-center justify-between gap-x-2'>
						<div className='flex items-center gap-x-1'>
							<span className='font-medium text-xs leading-[18px] tracking-[0.01em]'>
							Support
							</span>
						</div>
						<div
							className='text-navBlue text-xs font-medium leading-[22px]'
						>
							{formatUSDWithUnits(formatBnBalance(tallyData.support, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
						</div>
					</article>
					{
						activeIssuance?
							<article className='flex items-center justify-between gap-x-2'>
								<div className='flex items-center gap-x-1'>
									<span className='font-medium text-xs leading-[18px] tracking-[0.01em]'>
									Issuance
									</span>
								</div>
								<div
									className='text-navBlue text-xs font-medium leading-[22px]'
								>
									{formatUSDWithUnits(formatBnBalance(activeIssuance, { numberAfterComma: 2, withThousandDelimitor: false, withUnit: true }, network), 1)}
								</div>
							</article>
							: null
					}
				</section>
				<section className='flex items-center gap-x-4 border-0 border-t-[0.75px] border-solid border-[#D2D8E0] mt-[18px] pt-[18px] pb-[14px]'>
					<button
						className='bg-transparent p-0 m-0 border-none outline-none cursor-pointer flex items-center gap-x-1 text-pink_primary font-medium text-xs leading-[22px]'
						onClick={() => {
							setOpen(true);
						}}
					>
						<VotingHistoryIcon />
						<span>Voting History</span>
					</button>
					<button
						className='bg-transparent p-0 m-0 border-none outline-none cursor-pointer flex items-center gap-x-1 text-pink_primary font-medium text-xs leading-[22px]'
						onClick={() => {
							setThresholdOpen(true);
						}}
					>
						<ThresholdGraphIcon />
						<span>Threshold Data</span>
					</button>
					<Modal
						onCancel={() => {
							setVoteCalculationModalOpen(false);
						}}
						open={voteCalculationModalOpen}
						footer={[
							<div key='ok' className='mt-4 -mx-6' style={{ borderTop: '1.5px solid #E1E6EB' }}>
								<div className='flex items-center justify-end mt-5 px-6'>
									<Button
										className='border-none rounded-[4px] bg-pink_primary text-white font-medium text-sm flex w-[134px] h-[40px] py-1 px-4 flex-col justify-center items-center gap-10 flex-shrink-0'
										onClick={() => setVoteCalculationModalOpen(false)}
									>
										Got It
									</Button>
								</div>
							</div>
						]}
						className={`${poppins.variable} ${poppins.className} w-[584px] max-sm:w-full`}
						closeIcon={<CloseIcon className="mt-2"/>}
						title={
							<label className={`${poppins.variable} ${poppins.className} text-bodyBlue tracking-[0.01em] text-xl leading-[30px] font-semibold`}><InfoCircleOutlined className="w-6 h-6 mr-2"/><span className='font-semibold'>How are votes calculated</span></label>
						}
					>
						<section className='flex flex-col gap-y-6'>
							<div className='mt-3 -mx-6' style={{ borderTop: '1px solid #E1E6EB' }}>
								<p className='text-bodyBlue font-normal text-sm leading-[18px] m-0 p-0 mt-5 px-6'>
									Votes are calculated by multiplying the votes casted by a user with the conviction period.
								</p>
							</div>

							<article className='flex items-center justify-between md:gap-x-2 my-2'>
								<div className='flex flex-col items-center justify-center gap-y-3'>
									<CastVoteIcon className='text-4xl' />
									<p className='m-0 p-0 text-xs font-normal text-bodyBlue leading-4 flex flex-col items-center'>
										<span className='whitespace-nowrap flex items-center gap-x-1 flex-col md:flex-row'>
											<span>User wants to</span>
										</span>
										<span>cast a vote</span>
									</p>
								</div>
								<div className='flex items-center justify-center'>
									<RightArrowIcon className='text-sm md:text-xl' />
								</div>
								<div className='flex flex-col items-center justify-center gap-y-3'>
									<VoteAmountIcon className='text-4xl' />
									<p className='m-0 p-0 text-xs font-normal text-bodyBlue leading-4 hidden md:flex flex-col items-center'>
										<span className='whitespace-nowrap'>Chooses vote amount</span>
										<span>and type (Aye/Nay)</span>
									</p>
									<p className='m-0 p-0 text-xs font-normal text-bodyBlue leading-4 flex md:hidden flex-col items-center'>
										<span className='whitespace-nowrap'>
										Chooses vote
										</span>
										<span>
										amount and
										</span>
										<span className='whitespace-nowrap'>type (Aye/Nay)</span>
									</p>
								</div>
								<div className='flex items-center justify-center'>
									<RightArrowIcon className='text-sm md:text-xl' />
								</div>
								<div className='flex flex-col items-center justify-center gap-y-3'>
									<ConvictionPeriodIcon className='text-4xl' />
									<p className='m-0 p-0 text-xs font-normal text-bodyBlue leading-4 flex flex-col items-center'>
										<span className='whitespace-nowrap flex items-center gap-x-1 flex-col md:flex-row'>
											<span>Sets a</span>
											<a className='text-pink_primary underline' href="https://wiki.polkadot.network/docs/learn-opengov#voluntary-locking" target='_blank' rel="noreferrer">conviction</a>
										</span>
										<span>period</span>
									</p>
								</div>
								<div className='flex items-center justify-center'>
									<RightArrowIcon className='text-sm md:text-xl' />
								</div>
								<div className='flex flex-col items-center justify-center gap-y-3'>
									<LikeDislikeIcon className='text-4xl' />
									<p className='m-0 p-0 text-xs font-normal text-bodyBlue leading-4 hidden md:flex flex-col items-center'>
										<span className='whitespace-nowrap'>User casts their</span>
										<span>vote</span>
									</p>
									<p className='m-0 p-0 text-xs font-normal text-sidebarBlue leading-4 flex md:hidden flex-col items-center'>
										<span className='whitespace-nowrap'>
										User
										</span>
										<span>casts</span>
										<span className='whitespace-nowrap'>their vote</span>
									</p>
								</div>
							</article>
							<div className='flex flex-col'>
								<div style={{ borderTop: '1.5px dashed #D2D8E0' }}>
									<p className='font-medium text-sm leading-[18px] text-bodyBlue m-0 p-0 mt-5'>Here,</p>
								</div>
								<article className='flex justify-between items-start rounded-lg max-w-[400px] mt-[12px] p-3' style={{ backgroundColor: 'rgba(216, 185, 202, 0.19);', boxShadow: '0px 4px 19px 0px rgba(216, 185, 202, 0.19)' }}>
									<div className='flex flex-col items-center justify-center'>
										<p className='mt-[2px] m-0 p-0 text-sm text-bodyBlue font-normal flex flex-col'>
											<p className="leading-3 font-semibold">Voter</p>
											<div className="leading-6 flex items-center justify-start">
												<DefaultProfile style={{ height: '20px', width: '20px' }} />
												<p className="mt-2 text-xs ml-2 text-navBlue">DDUX..c..</p>
											</div>
										</p>
									</div>
									<div className='flex flex-col items-center justify-center '>
										<p className='m-0 p-0 text-sm text-bodyBlue font-normal flex flex-col'>
											<p className="leading-5 font-semibold">Amount</p>
											<span className="leading-6 text-xs item-start text-navBlue">11.27 KSM</span>
										</p>
									</div>
									<div className='flex flex-col items-center justify-center '>
										<p className='m-0 p-0 text-sm text-bodyBlue font-normal flex flex-col'>
											<p className="leading-5 font-semibold">Conviction</p>
											<span className="leading-6 text-xs text-navBlue">4x</span>
										</p>
									</div>
									<div className='flex flex-col items-center justify-center '>
										<p className='m-0 p-0 text-sm text-bodyBlue font-normal flex flex-col'>
											<p className="leading-5 font-semibold">Vote</p>
											<DislikeFilled className="leading-6 text-xl" style={{ color: '#F53C3C' }}/>
										</p>
									</div>
								</article>
							</div>
							<p className='p-0 m-0 text-sidebarBlue font-normal text-sm leading-[18px]'>The vote will be calculated by multiplying <span className='text-pink_primary'>11.27 KSM (amount)*4 (conviction)</span> to get the final vote.</p>
						</section>
					</Modal>
				</section>
			</Spin>
		</GovSidebarCard>
	);
};

export default React.memo(ReferendumV2VoteInfo);