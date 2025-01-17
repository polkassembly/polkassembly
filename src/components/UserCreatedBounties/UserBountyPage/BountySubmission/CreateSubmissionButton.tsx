// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';
import { Tooltip } from 'antd';

const CreateSubmissionButton = ({ setOpenModal, disabled }: { setOpenModal: (pre: boolean) => void; disabled?: boolean }) => {
	const button = (
		<div
			className={`flex items-center gap-[6px] rounded-md ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} bg-[#E5007A] px-3 py-[5px]`}
			onClick={() => !disabled && setOpenModal(true)}
		>
			<ImageIcon
				alt='icon'
				src='/assets/icons/user-bounties/submission-white-icon.svg'
			/>
			<span className='text-sm font-semibold text-white'>Make Submission</span>
		</div>
	);

	return disabled ? <Tooltip title="Deadline is passed, can't make a submission now">{button}</Tooltip> : button;
};

export default CreateSubmissionButton;
