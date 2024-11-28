// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import Image from 'next/image';

interface Props {
	isRequestSent: boolean;
}

const RequestStatus = ({ isRequestSent }: Props) => (
	<div className={`mt-auto flex items-center gap-4 shadow-lg ${isRequestSent ? 'bg-[#31C4400F]' : 'bg-[#FFDF1A]'} px-5 py-2`}>
		<Image
			src={`/assets/icons/delegation-chat/${isRequestSent ? 'request-sent' : 'request-info'}.svg`}
			height={20}
			width={20}
			alt='chat icon'
		/>
		<span className={`font-medium text-blue-light-high ${isRequestSent ? 'dark:text-white' : ''}`}>
			{isRequestSent ? 'Message Request Sent!' : 'This message will be sent as a request.'}
		</span>
	</div>
);

export default RequestStatus;
