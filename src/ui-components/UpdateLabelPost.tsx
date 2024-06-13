// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { dayjs } from 'dayjs-init';
import React, { useState } from 'react';
import styled from 'styled-components';
import Tooltip from '~src/basic-components/Tooltip';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IPostHistory } from '~src/types';
import PostHistoryModal from './PostHistoryModal';

interface Props {
	className?: string;
	created_at: Date | string;
	updated_at: Date | string;
	content: string;
	username: string;
	onchainId: number | string;
	proposalType: string;
	proposer: string;
}
const UpdateLabelPost = ({ className, created_at, updated_at, content, username, onchainId, proposalType, proposer }: Props) => {
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [history, setHistory] = useState<IPostHistory[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [hasFetched, setHasFetched] = useState<boolean>(false);
	const defaultTime = 'a few minutes ago';
	const title = dayjs.utc(updated_at, 'YYYY-MM-DDTHH:mm:ss.SSS').fromNow() !== 'NaN years ago' ? dayjs.utc(updated_at, 'YYYY-MM-DDTHH:mm:ss.SSS').fromNow() : defaultTime;

	const getHistoryData = async () => {
		if (hasFetched) return;
		setIsLoading(true);
		try {
			const { data } = await nextApiClientFetch<IPostHistory[]>(`/api/v1/posts/editHistory?postId=${String(onchainId)}&proposalType=${proposalType}`);
			if (data) {
				setHistory(data);
				setHasFetched(true);
			}
		} catch (error) {
			console.error('Error fetching history data:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleOpenModal = async () => {
		await getHistoryData();
		setOpenModal(true);
	};

	if (!updated_at && !created_at) return null;

	return updated_at.toString() === created_at.toString() ? null : (
		<div>
			<span className={className}>
				<Tooltip
					color='#E5007A'
					title={title}
				>
					<span
						onClick={handleOpenModal}
						className={`text-xs leading-4 text-navBlue ${'text-pink_primary'}`}
					>
						(Edit History)
					</span>
				</Tooltip>
			</span>
			<PostHistoryModal
				open={openModal}
				setOpen={setOpenModal}
				history={[{ content: content, created_at: updated_at || '', title: title }, ...history]}
				username={username}
				defaultAddress={proposer}
				isLoading={isLoading}
			/>
		</div>
	);
};

export default styled(UpdateLabelPost)`
	margin-left: 0.5rem;
	font-size: sm;
	color: grey_secondary;
`;
