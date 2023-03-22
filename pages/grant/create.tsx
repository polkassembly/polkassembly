// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Skeleton } from 'antd';
import dynamic from 'next/dynamic';
import React from 'react';

import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';

const CreatePost = dynamic(() => import('~src/components/Post/CreatePost'), {
	loading: () => <div className="flex flex-col mt-6 bg-white p-4 md:p-8 rounded-md w-full shadow-md mb-4">
		<Skeleton.Input active />
		<Skeleton.Input className='mt-8' active />
		<Skeleton className='mt-8' active />
		<Skeleton.Input className='mt-8' active />
		<Skeleton.Button className='mt-8' active />
	</div> ,
	ssr: false
});

const Create = () => {
	return <>
		<SEOHead title={'Create Post'} />
		<CreatePost proposalType={ProposalType.GRANTS} />
	</>;
};

export default Create;