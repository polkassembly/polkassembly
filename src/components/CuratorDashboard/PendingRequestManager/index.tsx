// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React from 'react';

function CuratorPendingRequestManager() {
	return (
		<div
			className={`${spaceGrotesk.className} ${spaceGrotesk.variable} rounded-lg border-[1px] border-solid border-[#D2D8E0] bg-white p-5 dark:border-[#494b4d] dark:bg-[#0d0d0d]`}
		>
			<p className='text-[24px] font-bold text-blue-light-high dark:text-lightWhite'>Pending Requests (Coming Soon)</p>
		</div>
	);
}

export default CuratorPendingRequestManager;
