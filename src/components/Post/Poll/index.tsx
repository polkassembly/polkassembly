// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { IPollsResponse } from 'pages/api/v1/polls';
import React, { useCallback, useEffect, useState } from 'react';

import { usePostDataContext } from '~src/context';
import POLL_TYPE from '~src/global/pollTypes';
import { ProposalType } from '~src/global/proposalType';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

import Poll from './Poll';
interface Props {
	className?: string;
	postId: number;
	canEdit: boolean;
	proposalType: ProposalType;
}

const PollComponent = ({ postId, canEdit, proposalType }: Props) => {
	const [error, setError] = useState('');
	const {
		postData: { polls },
		setPostData
	} = usePostDataContext();

	const getPolls = useCallback(async () => {
		const { data: fetchData, error: fetchError } =
			await nextApiClientFetch<IPollsResponse>(
				`api/v1/polls?postId=${postId}&pollType=${POLL_TYPE.NORMAL}&proposalType=${proposalType}`
			);

		if (fetchError) {
			setError(fetchError);
			return;
		}

		if (fetchData && fetchData.polls) {
			setError('');
			setPostData((prev) => {
				return {
					...prev,
					polls: fetchData.polls
				};
			});
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [postId, proposalType]);

	useEffect(() => {
		getPolls();
	}, [getPolls]);

	if (error) return null;

	if (!polls || polls.length == 0) return null;

	return (
		<>
			{polls.map((poll) => (
				<Poll
					proposalType={proposalType}
					key={poll.id}
					pollId={String(poll.id)}
					endBlock={poll.block_end}
					votes={poll.poll_votes}
					canEdit={canEdit}
				/>
			))}
		</>
	);
};

export default PollComponent;
