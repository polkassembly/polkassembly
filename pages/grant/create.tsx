// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Skeleton } from 'antd';
import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import React from 'react';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import SkeletonInput from '~src/basic-components/Skeleton/SkeletonInput';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;

	return { props: { network } };
};

const CreatePost = dynamic(() => import('~src/components/Post/CreatePost'), {
	loading: () => (
		<div className='mb-4 mt-6 flex w-full flex-col rounded-md bg-white p-4 shadow-md dark:bg-section-dark-overlay md:p-8'>
			<SkeletonInput active />
			<SkeletonInput
				className='mt-8'
				active
			/>
			<Skeleton
				className='mt-8'
				active
			/>
			<SkeletonInput
				className='mt-8'
				active
			/>
			<SkeletonButton
				className='mt-8'
				active
			/>
		</div>
	),
	ssr: false
});

const Create = ({ network }: { network: string }) => {
	return (
		<>
			<SEOHead
				title={'Create Post'}
				network={network}
			/>
			<CreatePost proposalType={ProposalType.GRANTS} />
		</>
	);
};

export default Create;
