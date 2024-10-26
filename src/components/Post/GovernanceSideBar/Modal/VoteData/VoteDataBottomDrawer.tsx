// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState, useRef, useEffect } from 'react';
import VoteDataExpand from './VoteDataExpand';
import { useVoteDataSelector } from '~src/redux/selectors';

const VoteDataBottomDrawer = () => {
	const [height, setHeight] = useState('390px');
	const prevClientYRef = useRef<number | null>(null);
	const { isVoteDataModalOpen, voteData } = useVoteDataSelector();

	useEffect(() => {
		if (voteData?.delegatedVotes?.length > 0) {
			setHeight('390px');
		} else {
			setHeight('330px');
		}
	}, [voteData]);

	const handleMouseUp = (e: any) => {
		const { clientY } = e.changedTouches[0];

		if (prevClientYRef.current !== null) {
			const deltaY = prevClientYRef.current - clientY;

			if (voteData?.delegatedVotes?.length > 0) {
				if (deltaY > 0) {
					setHeight('100%');
				} else {
					setHeight('390px');
				}
			} else {
				if (deltaY > 0) {
					setHeight('100%');
				} else {
					setHeight('330px');
				}
			}
		}

		prevClientYRef.current = clientY;
	};
	if (!isVoteDataModalOpen) return null;
	return (
		<div className='fixed inset-0 z-[99998] h-screen w-full bg-gray-700 bg-opacity-60'>
			<div
				id='voteDataDrawer'
				className={'delay-800 fixed bottom-0 left-0 z-[99999] w-full rounded-t-2xl bg-white transition-all ease-in-out dark:bg-section-dark-overlay'}
				style={{ height }}
				onTouchMove={handleMouseUp}
			>
				<VoteDataExpand />
			</div>
		</div>
	);
};

export default VoteDataBottomDrawer;
