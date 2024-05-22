// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { GetServerSideProps } from 'next';
import { useTheme } from 'next-themes';
import { fetchForumSubcategory } from 'pages/api/v1/discourse/getDataBySubcategory';
import ForumLayout from 'pages/forum/ForumLayout';
import React, { useEffect } from 'react';
import ForumPostsContainer from '~src/components/ForumDiscussions';
import { IForumData } from '~src/components/ForumDiscussions/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import { getNetworkFromReqHeaders } from '~src/api-utils';
import { useDispatch } from 'react-redux';
import { setNetwork } from '~src/redux/network';
import { isForumSupportedNetwork } from '~src/global/ForumNetworks';
import { isOpenGovSupported } from '~src/global/openGovNetworks';

export const getServerSideProps: GetServerSideProps = async (context) => {
	const page = context.query.page ? parseInt(context.query.page as string, 10) : 0;
	const { category, subcategory } = context.query;

	if (typeof category !== 'string' || typeof subcategory !== 'string') {
		return { props: { data: null } };
	}

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
		const { data, error } = await fetchForumSubcategory(category, subcategory, page);
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

interface ForumSubCategoryProps {
	data: IForumData | null;
	network: string;
}

const SubCategory: React.FC<ForumSubCategoryProps> = ({ data, network }) => {
	const dispatch = useDispatch();
	const { resolvedTheme: theme } = useTheme();

	useEffect(() => {
		dispatch(setNetwork(network));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network]);
	return (
		<ForumLayout>
			{data ? (
				<ForumPostsContainer topics={data?.topic_list} />
			) : (
				<div className='my-[60px] flex flex-col items-center gap-6'>
					<ImageIcon
						src={theme == 'light' ? '/assets/EmptyStateLight.svg' : '/assets/EmptyStateDark.svg '}
						alt='Empty Icon'
						imgClassName='w-[225px] h-[225px]'
					/>
					<h3 className='text-blue-light-high dark:text-blue-dark-high'>Something went wrong , Please try again later</h3>
				</div>
			)}
		</ForumLayout>
	);
};

export default SubCategory;
