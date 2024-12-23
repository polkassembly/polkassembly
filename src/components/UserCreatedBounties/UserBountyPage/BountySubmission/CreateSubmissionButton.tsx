// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import ImageIcon from '~src/ui-components/ImageIcon';

const CreateSubmissionButton = () => {
	return (
		<div className='flex cursor-pointer items-center gap-[6px] rounded-md bg-[#E5007A] px-3 py-[5px]'>
			<ImageIcon
				alt='icon'
				src='/assets/icons/user-bounties/submission-white-icon.svg'
			/>
			<span className='text-sm font-semibold text-white'>Make Submission</span>
		</div>
	);
};

export default CreateSubmissionButton;
