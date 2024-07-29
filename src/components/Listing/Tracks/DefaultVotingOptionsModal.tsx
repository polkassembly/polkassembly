// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Alert } from 'antd';
import React, { FC, useState } from 'react';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { ProposalType } from '~src/global/proposalType';
import { ILastVote } from '~src/types';
import VoteReferendumCard from '~src/components/Post/GovernanceSideBar/Referenda/VoteReferendumCard';
interface IDefaultVotingOptionsModal {
	theme?: string;
	forSpecificPost?: boolean;
	postEdit?: any;
}

const DefaultVotingOptionsModal: FC<IDefaultVotingOptionsModal> = (props) => {
	const { forSpecificPost, postEdit } = props;
	const { loginAddress } = useUserDetailsSelector();
	const [lastVote, setLastVote] = useState<ILastVote | null>(null);
	const [address, setAddress] = useState<string>(loginAddress);
	const onAccountChange = (address: string) => {
		setAddress(address);
	};

	return (
		<section className='mt-4'>
			{!forSpecificPost && (
				<Alert
					type='info'
					showIcon
					message={<span className='text-[13px] dark:text-black'>Select default values for votes. These can be edited before making a final transaction</span>}
				/>
			)}
			<VoteReferendumCard
				address={String(address)}
				onAccountChange={onAccountChange}
				proposalType={ProposalType.TREASURY_PROPOSALS}
				lastVote={lastVote as any}
				setLastVote={setLastVote}
				forSpecificPost={forSpecificPost}
				postEdit={postEdit}
			/>
		</section>
	);
};

export default DefaultVotingOptionsModal;
