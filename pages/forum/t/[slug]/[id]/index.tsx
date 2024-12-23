// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useEffect } from 'react';
import { GetServerSideProps } from 'next/types';
import { IForumTopic } from '~src/components/ForumDiscussions/types';
import ForumTopicContainer from '~src/components/ForumDiscussions/ForumTopic';
import { fetchTopicData } from 'pages/api/v1/discourse/getTopicData';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { isForumSupportedNetwork } from '~src/global/ForumNetworks';
import { isOpenGovSupported } from '~src/global/openGovNetworks';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { slug, id } = context.query;
	if (!slug || !id || typeof slug !== 'string' || typeof id !== 'string') {
		return { props: { data: null } };
	}

	const safeSlug = encodeURIComponent(slug);
	const safeId = encodeURIComponent(id);

	const network = getNetworkFromReqHeaders(context.req.headers);
	if (!isForumSupportedNetwork(network)) {
		return {
			props: {},
			redirect: {
				destination: isOpenGovSupported(network) ? '/opengov' : '/'
			}
		};
	}

	try {
		const { data, error } = await fetchTopicData(safeSlug, safeId);
		if (data) {
			return {
				props: {
					data: data || null,
					error: null,
					network: network
				}
			};
		} else {
			return {
				props: {
					data: null,
					error: error,
					network: network
				}
			};
		}
	} catch (error: any) {
		console.error('Failed to execute fetchForumTopics:', error.message);
		return {
			props: {
				data: null,
				error: error.message || 'Failed to load data',
				network: network
			}
		};
	}
};

interface TopicIdProps {
	data: IForumTopic | null;
	network: string;
}
const TopicId: FC<TopicIdProps> = ({ data, network }) => {
	const dispatch = useDispatch();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);
	return <div>{data && <ForumTopicContainer data={data} />}</div>;
};

export default TopicId;
