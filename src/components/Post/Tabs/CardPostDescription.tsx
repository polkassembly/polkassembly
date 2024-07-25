// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useRouter } from 'next/router';
import React, { FC } from 'react';

interface ICardPostDescription {
	postContent: any;
	postId: any;
}
const CardPostDescription: FC<ICardPostDescription> = (props) => {
	const { postContent, postId } = props;
	const router = useRouter();

	return (
		<section>
			<p>{postContent}</p>
			<p
				className='m-0 my-4 flex cursor-pointer justify-start p-0 text-xs text-pink_primary'
				onClick={() => {
					router.push(`/referenda/${postId}`);
				}}
			>
				Read Full Proposal
			</p>
		</section>
	);
};

export default CardPostDescription;
