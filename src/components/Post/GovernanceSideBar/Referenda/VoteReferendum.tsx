// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useState } from 'react';
import { ILastVote } from 'src/types';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import { ProposalType } from '~src/global/proposalType';
import LoginToVote from '../LoginToVoteOrEndorse';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import VoteReferendumModal from './VoteReferendumModal';

interface Props {
	className?: string;
	referendumId?: number | null | undefined;
	onAccountChange: (address: string) => void;
	lastVote: ILastVote | undefined;
	setLastVote: (pre: ILastVote) => void;
	proposalType: ProposalType;
	address: string;
	theme?: string;
	trackNumber?: number;
	setUpdateTally?: (pre: boolean) => void;
	updateTally?: boolean;
}

const VoteReferendum = ({ className, referendumId, onAccountChange, lastVote, setLastVote, proposalType, address, trackNumber, setUpdateTally, updateTally }: Props) => {
	const { network } = useNetworkSelector();
	const { api, apiReady } = useApiContext();
	const userDetails = useUserDetailsSelector();
	const { addresses, id } = userDetails;
	const [showModal, setShowModal] = useState<boolean>(false);
	const [isFellowshipMember, setIsFellowshipMember] = useState<boolean>(false);
	const [fetchingFellowship, setFetchingFellowship] = useState(true);

	const checkIfFellowshipMember = async () => {
		if (!api || !apiReady) {
			return;
		}

		if (!api?.query?.fellowshipCollective?.members?.entries) {
			return;
		}

		// using any because it returns some Codec types
		api.query.fellowshipCollective.members.entries().then((entries: any) => {
			const members: string[] = [];

			for (let i = 0; i < entries.length; i++) {
				// key split into args part to extract
				const [
					{
						args: [accountId]
					},
					optInfo
				] = entries[i];
				if (optInfo.isSome) {
					members.push(accountId.toString());
				}
			}

			addresses &&
				addresses.some((address) => {
					if (members.includes(address)) {
						setIsFellowshipMember(true);
						// this breaks the loop as soon as we find a matching address
						return true;
					}
					return false;
				});

			setFetchingFellowship(false);
		});
	};

	useEffect(() => {
		if (!api || !apiReady) return;
		checkIfFellowshipMember();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network, api, apiReady]);

	useEffect(() => {}, []);

	if (!id) {
		return <LoginToVote />;
	}

	const VoteUI = (
		<>
			<div className={className}>
				<CustomButton
					variant='solid'
					fontSize='lg'
					className='mx-auto mb-8 w-full rounded-xxl p-7 font-semibold lg:w-[480px] xl:w-full xl:shadow-md'
					onClick={() => setShowModal(true)}
				>
					{!lastVote ? 'Cast Your Vote' : 'Cast Vote Again'}
				</CustomButton>
				<VoteReferendumModal
					onAccountChange={onAccountChange}
					address={address}
					proposalType={proposalType}
					setLastVote={setLastVote}
					setShowModal={setShowModal}
					showModal={showModal}
					referendumId={referendumId}
					setUpdateTally={setUpdateTally}
					trackNumber={trackNumber}
					updateTally={updateTally}
				/>
			</div>
		</>
	);

	if (proposalType === ProposalType.FELLOWSHIP_REFERENDUMS) {
		if (!fetchingFellowship) {
			if (isFellowshipMember) return VoteUI;

			return <div className={className}>Only fellowship members may vote.</div>;
		} else {
			return <div className={className}>Fetching fellowship members...</div>;
		}
	}
	return VoteUI;
};

export default React.memo(styled(VoteReferendum)`
	.LoaderWrapper {
		height: 40rem;
		position: absolute;
		width: 100%;
	}
	.vote-form-cont {
		padding: 12px;
	}
	.vote-referendum .ant-modal-close {
		margin-top: 4px;
	}
	.vote-referendum .ant-modal-close:hover {
		margin-top: 4px;
	}
	.vote-referendum .ant-select-selector {
		border: 1px solid !important;
		border-color: #d2d8e0 !important;
		height: 40px;
		border-radius: 4px !important;
	}
	.vote-referendum .ant-select-selection-item {
		font-style: normal !important;
		font-weight: 400 !important;
		font-size: 14px !important;
		display: flex;
		align-items: center;
		line-height: 21px !important;
		letter-spacing: 0.0025em !important;
		color: #243a57;
	}

	.vote-referendum .ant-input-number-in-from-item {
		height: 39.85px !important;
	}
	.vote-referendum .ant-segmented-item-label {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 32px !important;
		border-radius: 4px !important;
		padding-right: 0px !important;
		padding-left: 0px !important;
	}
	.vote-referendum .ant-segmented {
		padding: 0px !important;
	}

	.vote-referendum .ant-select-selection-item {
		color: #243a57;
	}
	.vote-referendum .ant-select-focused {
		border: 1px solid #e5007a !important;
		border-radius: 4px !important;
	}
	.vote-referendum.ant-segmented-item-selected {
		box-shadow: none !important;
		padding-right: 0px !important;
	}
	.vote-referendum .ant-segmented-item {
		padding: 0px !important;
	}
	.dark .ant-segmented-group label {
		background-color: transparent !important;
	}
	.ant-checkbox .ant-checkbox-inner {
		background-color: transparent !important;
	}
	.ant-checkbox-checked .ant-checkbox-inner {
		background-color: #e5007a !important;
		border-color: #e5007a !important;
	}
`);
