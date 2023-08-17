// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DislikeFilled, LikeFilled } from '@ant-design/icons';
import React, { FC, useState } from 'react';
import Address from 'src/ui-components/Address';
import formatBnBalance from 'src/util/formatBnBalance';
import { VoteType } from '~src/global/proposalType';
import formatUSDWithUnits from '~src/util/formatUSDWithUnits';
import { network as AllNetworks } from '~src/global/networkConstants';
import { useNetworkContext } from '~src/context';
import { Collapse } from '~src/components/Settings/Notifications/common-ui/Collapse';
import CollapseDownIcon from '~assets/icons/keyboard_arrow_down.svg';
import CollapseUpIcon from '~assets/icons/keyboard_arrow_up.svg';
import CalenderIcon from '~assets/icons/calender-icon.svg';
import PowerIcon from '~assets/icons/body-part-muscle.svg';
import VoterIcon from '~assets/icons/vote-small-icon.svg';
import ConvictionIcon from '~assets/icons/conviction-small-icon.svg';
import CapitalIcon from '~assets/icons/capital-small-icom.svg';
import EmailIcon from '~assets/icons/email_icon.svg';
import styled from 'styled-components';
import { Divider } from 'antd';
import DelegationListRow from './DelegationListRow';

interface IVoterRow {
  index?: any;
  voteType: VoteType;
  voteData?: any;
}

const StyledCollapse = styled(Collapse)`
  .ant-collapse-item {
    border-bottom: none;
  }
  .ant-collapse-header {
    border: none !important;
    padding: 16px 8px !important;
  }
  .ant-collapse-content {
    border-top: none !important;
  }
  .ant-collapse-content-box {
    padding: 0px 8px !important;
    padding-bottom: 16px !important;
  }
`;

const VoterRow: FC<IVoterRow> = ({ voteType, voteData }) => {
	const [active, setActive] = useState<boolean | undefined>(false);
	const { network } = useNetworkContext();
	const Title = () => (
		<>
			<div className='flex items-center w-full gap-14'>
				{voteType === VoteType.REFERENDUM_V2 && voteData?.txnHash ? (
					<a
						href={`https://${network}.moonscan.io/tx/${voteData?.txnHash}`}
						className='overflow-ellipsis flex-[2]'
					>
						<Address
							isVoterAddress={true}
							textClassName='w-[75px]'
							isSubVisible={false}
							displayInline={true}
							isShortenAddressLength={false}
							address={voteData?.voter}
						/>
					</a>
				) : (
					<div className='overflow-ellipsis flex-[2]'>
						<Address
							isVoterAddress={true}
							textClassName='w-[75px]'
							isSubVisible={false}
							displayInline={true}
							isShortenAddressLength={false}
							address={voteData?.voter}
						/>
					</div>
				)}

				{network !== AllNetworks.COLLECTIVES ? (
					<>
						<div className='overflow-ellipsis flex-1'>
							{formatUSDWithUnits(
								formatBnBalance(
									voteData?.decision === 'abstain'
										? voteData?.balance?.abstain || 0
										: voteData?.balance?.value || 0,
									{
										numberAfterComma: 1,
										withThousandDelimitor: false,
										withUnit: true
									},
									network
								),
								1
							)}
						</div>
						<div className='overflow-ellipsis flex-1'>
							{voteData.lockPeriod
								? `${voteData.lockPeriod}x${voteData?.isDelegated ? '/d' : ''}`
								: '0.1x'}
						</div>
					</>
				) : (
					<div className='overflow-ellipsis flex-1'>
						{voteData?.decision === 'abstain'
							? voteData?.balance?.abstain || 0
							: voteData?.balance?.value || 0}
					</div>
				)}

				{voteData.decision === 'yes' ? (
					<div className='flex items-center text-aye_green text-md flex-1'>
						<LikeFilled className='mr-2' />
					</div>
				) : voteData.decision === 'no' ? (
					<div className='flex items-center text-nay_red text-md flex-1'>
						<DislikeFilled className='mr-2' />
					</div>
				) : (
					<div className='flex items-center justify-center flex-1'>
						<span className='rounded-full bg-grey_primary mr-2'></span>
					</div>
				)}
			</div>
		</>
	);
	return (
		<StyledCollapse
			className={`${
				active
					? 'border-pink_primary border-t-2'
					: 'border-[#D2D8E0] border-t-[1px]'
			} border-0 bg-white rounded-none`}
			size='large'
			expandIconPosition='end'
			expandIcon={({ isActive }) => {
				setActive(isActive);
				return isActive ? <CollapseUpIcon /> : <CollapseDownIcon />;
			}}
		>
			<StyledCollapse.Panel
				className={`rounded-none p-0 ${active ? 'border-b-[1px]' : ''}`}
				key={1}
				header={<Title />}
			>
				<div className='flex flex-col gap-4'>
					<div className='border-dashed border-[#D2D8E0] border-y-2 border-x-0 flex gap-4 p-2 py-4 items-center'>
						<span className='text-pink_primary underline flex gap-1 items-center'>
							<CalenderIcon /> 17/ 07/ 2023 16:32
						</span>
						<span className='flex gap-1 items-center text-lightBlue text-xs font-medium'>
							<PowerIcon />
              Voting Power <span className='text-[#96A4B6]'>5%</span>
						</span>
					</div>
					<div className='px-2'>
						<p className='text-sm text-bodyBlue font-medium mb-4'>
              Delegation Details
						</p>
						<div className='flex justify-between'>
							<div className='w-[200px] flex flex-col gap-1'>
								<div className='text-lightBlue text-xs font-medium'>
                  Self Votes
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<VoterIcon /> votes
									</span>
									<span className='text-xs text-bodyBlue'>150 DOT</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<ConvictionIcon /> Conviction
									</span>
									<span className='text-xs text-bodyBlue'>1x</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<CapitalIcon /> Capital
									</span>
									<span className='text-xs text-bodyBlue'>150 DOT</span>
								</div>
							</div>
							<div className='border-dashed border-[#D2D8E0] border-l-2 border-y-0 border-r-0'></div>
							<div className='w-[200px] flex flex-col gap-1'>
								<div className='text-lightBlue text-xs font-medium'>
                  Delegation Votes
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<VoterIcon /> votes
									</span>
									<span className='text-xs text-bodyBlue'>150 DOT</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<EmailIcon /> Delegators
									</span>
									<span className='text-xs text-bodyBlue'>1x</span>
								</div>
								<div className='flex justify-between'>
									<span className='text-[#576D8B] flex items-center gap-1 text-xs'>
										<CapitalIcon /> Capital
									</span>
									<span className='text-xs text-bodyBlue'>150 DOT</span>
								</div>
							</div>
						</div>
					</div>
					<Divider
						dashed
						className='m-0 mt-2 border-[#D2D8E0] border-[2px] border-x-0 border-b-0'
					/>
					<div className='px-2'>
						<p className='text-sm text-bodyBlue font-medium mb-4'>
              Delegation list
						</p>
						<div className='flex text-xs items-center gap-10 font-semibold mb-2'>
							<div className='basis-36 text-lightBlue text-sm font-medium'>
                Delegators
							</div>
							<div className='basis-28 ml-2 flex items-center gap-1 text-lightBlue'>
                Amount
							</div>
							{network !== AllNetworks.COLLECTIVES ? (
								<div className='basis-24 ml-1 flex items-center gap-1 text-lightBlue'>
                  Conviction{' '}
								</div>
							) : null}
							<div className='basis-10 flex items-center gap-1 text-lightBlue'>
                Votes
							</div>
						</div>
						<div className='pr-2 max-h-20 overflow-y-auto flex flex-col gap-1'>
							<DelegationListRow voteType={voteType} voteData={voteData} />
							<DelegationListRow voteType={voteType} voteData={voteData} />
							<DelegationListRow voteType={voteType} voteData={voteData} />
							<DelegationListRow voteType={voteType} voteData={voteData} />
						</div>
					</div>
				</div>
			</StyledCollapse.Panel>
		</StyledCollapse>
	);
};

export default VoterRow;
