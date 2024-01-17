// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useState, useRef } from 'react';
import VoteDataExpand from './VoteDataExpand';
import { useVoteDataSelector } from '~src/redux/selectors';

const VoteDataBottomDrawer = () => {
	const [height, setHeight] = useState('395px');
	const prevClientYRef = useRef<number | null>(null);
	const { isVoteDataModalOpen } = useVoteDataSelector();

	const handleMouseUp = (e: any) => {
		const { clientY } = e.changedTouches[0];

		if (prevClientYRef.current !== null) {
			const deltaY = prevClientYRef.current - clientY;

			if (deltaY > 0) {
				setHeight('100%');
			} else {
				setHeight('395px');
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
