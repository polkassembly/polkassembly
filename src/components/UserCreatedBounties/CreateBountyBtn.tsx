// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import { spaceGrotesk } from 'pages/_app';
import CreateBountyModal from './CreateBountyModal';

interface ICreateBountyBtnProps {
	className?: string;
}

const CreateBountyBtn = ({ className }: ICreateBountyBtnProps) => {
	const [openCreateBountyModal, setOpenCreateBountyModal] = useState<boolean>(false);

	return (
		<div className={className}>
			<button
				onClick={() => setOpenCreateBountyModal(true)}
				className='bounty-button flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[14px] border-none px-[22px] py-[11px] md:w-auto md:justify-normal '
			>
				<ImageIcon
					src='/assets/bounty-icons/proposal-icon.svg'
					alt='bounty icon'
					imgClassName=''
				/>
				<span className={`${spaceGrotesk.className} ${spaceGrotesk.variable} font-bold text-white`}>Create Bounty</span>
			</button>
			<CreateBountyModal
				openCreateBountyModal={openCreateBountyModal}
				setOpenCreateBountyModal={setOpenCreateBountyModal}
			/>
		</div>
	);
};

export default CreateBountyBtn;
