// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import BountyPost from './BountyPost';
import BountyDetails from './BountyDetails';
import BountySubmission from './BountySubmission';
import { IUserCreatedBounty } from '~src/types';

const UserBountyPage = ({ post }: { post: IUserCreatedBounty }) => {
	return (
		<section>
			<div className='flex items-start justify-between'>
				<BountyPost post={post} />
				<BountyDetails post={post} />
			</div>
			<BountySubmission />
		</section>
	);
};

export default UserBountyPage;
