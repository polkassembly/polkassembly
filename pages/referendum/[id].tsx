// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { getOnChainPost, IPostResponse } from 'pages/api/v1/posts/on-chain-post';
import React, { FC, useEffect, useState } from 'react';
import Post from 'src/components/Post/Post';
import { PostCategory } from 'src/global/post_categories';
import BackToListingView from 'src/ui-components/BackToListingView';
import { PostEmptyState } from 'src/ui-components/UIStates';
// import EmptyIcon from '~assets/icons/empty-state-image.svg';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useApiContext } from '~src/context';
import { noTitle } from '~src/global/noTitle';
import { ProposalType } from '~src/global/proposalType';
import SEOHead from '~src/global/SEOHead';
import { useRouter } from 'next/router';
import { checkIsOnChain } from '~src/util/checkIsOnChain';
import checkRouteNetworkWithRedirect from '~src/util/checkRouteNetworkWithRedirect';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import { FrownOutlined } from '@ant-design/icons';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

const proposalType = ProposalType.REFERENDUMS;
export const getServerSideProps: GetServerSideProps = async ({ req, query, locale }) => {
	const { id } = query;
	const network = getNetworkFromReqHeaders(req.headers);

	const networkRedirect = checkRouteNetworkWithRedirect(network);
	if (networkRedirect) return networkRedirect;
	const translations = await serverSideTranslations(locale || '', ['common']);

	const { data, error, status } = await getOnChainPost({
		network,
		postId: id,
		proposalType
	});
	return { props: { error, network, post: data, status, ...translations } };
};

interface IReferendumPostProps {
	post: IPostResponse;
	error?: string;
	network: string;
	status?: number;
}

const ReferendumPost: FC<IReferendumPostProps> = (props) => {
	const { post, error, status, network } = props;
	const dispatch = useDispatch();
	const { api, apiReady } = useApiContext();
	const router = useRouter();
	const { id } = router.query;
	const { t } = useTranslation('common');
	const [isUnfinalized, setIsUnFinalized] = useState(false);

	useEffect(() => {
		if (!api || !apiReady || !error || !status || !id || status !== 404) {
			return;
		}
		(async () => {
			setIsUnFinalized(Boolean(await checkIsOnChain(String(id), proposalType, api)));
		})();
	}, [api, apiReady, error, status, id]);

	useEffect(() => {
		dispatch(setNetwork(props.network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (isUnfinalized) {
		return (
			<PostEmptyState
				description={
					<div className='p-5'>
						<b className='my-4 text-xl'>{t('waiting_for_block_confirmation')}</b>
						<p>{t('usually_its_done_within_a_few_seconds')}</p>
					</div>
				}
			/>
		);
	}

	if (post) {
		return (
			<>
				<SEOHead
					title={post.title || `${noTitle} - Referendum`}
					desc={post.content}
					network={network}
				/>

				<BackToListingView postCategory={PostCategory.REFERENDA} />

				<div className='mt-6'>
					<Post
						post={post}
						proposalType={proposalType}
					/>
				</div>
			</>
		);
	} else if (error) {
		return (
			<div className='mt-20 flex flex-col items-center justify-center'>
				<div className='flex items-center gap-5'>
					<FrownOutlined className=' -mt-5 text-4xl text-pink_primary dark:text-blue-dark-high' /> <h1 className='text-6xl font-bold'>{t('404')}</h1>
				</div>
				<p className='mt-2 text-lg text-gray-500'>{t('post_not_found')}</p>
				<div className='mt-5'>
					<BackToListingView postCategory={PostCategory.REFERENDA} />
				</div>
			</div>
		);
	}

	return (
		<div className='mt-16'>
			<LoadingState />
		</div>
	);
};

export default ReferendumPost;
