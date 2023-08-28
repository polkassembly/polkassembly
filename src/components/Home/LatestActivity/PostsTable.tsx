// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ColumnsType } from 'antd/lib/table';
import { useRouter } from 'next/router';
import React, { FC } from 'react';
import { noTitle } from 'src/global/noTitle';
import { EmptyLatestActivity, ErrorLatestActivity, PopulatedLatestActivity, PopulatedLatestActivityCard } from 'src/ui-components/LatestActivityStates';

import { getFirestoreProposalType, getSinglePostLinkFromProposalType, ProposalType } from '~src/global/proposalType';

export interface IPostsRowData {
	key: string | number;
	title: string;
	proposer?: string;
	username: string;
	status?: string;
	created_at: string | null;
	post_id?: string | number | null | undefined;
	type: string;
	hash?: string;
	origin?: string;
	track?: number;
	sub_title?: string;
	topic?: {
		id?: number;
		name?: string;
	}
	tip_id?: number;
	spam_users_count?: number;
  description?: string;
}

interface IPostsTableProps {
	posts: any[];
	error?: string;
    columns: ColumnsType<IPostsRowData>;
    type: 'all' | ProposalType;
	count: number;
}

const PostsTable: FC<IPostsTableProps> = ({ posts, error, columns, type, count }) => {
	const router = useRouter();

	// if(network === 'collectives') return <EmptyLatestActivity />;

	//error state
	if (error) return <ErrorLatestActivity errorMessage={error} />;

	//empty state
	if(!posts || !posts.length) return <EmptyLatestActivity />;

	const tableData: IPostsRowData[] = [];

	posts.forEach((post: any, index) => {
		// TODO: enable this check once we have a way to fetch the author of a post
		const { hash, post_id, method, created_at, proposer, status, description, spam_users_count } = post;
		// if(post?.author?.username) {
		// truncate title
		let title = post.title || description || method || post?.preimage?.method || post?.description || noTitle;
		title = title.length > 80 ? `${title.substring(0, Math.min(80, title.length))}...`  : title.substring(0, Math.min(80, title.length));

		const isTip = type === ProposalType.TIPS;
		const id = isTip? hash: post_id;
		const tableDataObj: IPostsRowData = {
			created_at: created_at,
			description: post?.description || '',
			hash: isTip? hash?.substring(0,4): hash,
			key: id,
			post_id: id,
			proposer: proposer,
			spam_users_count: spam_users_count,
			status: status||'-',
			tip_id: count - index - 1,
			title,
			topic: post?.topic?.name,
			type: post.type,
			username: post?.username
		};

		tableData.push(tableDataObj);
	});

	return(<>
		<div className='hidden md:block'>
			<PopulatedLatestActivity
				columns={columns}
				tableData={tableData}
				onClick={(rowData) => {
					const firestoreProposalType = getFirestoreProposalType(['discussions', 'grants'].includes(rowData.type) ? `${rowData.type.charAt(0).toUpperCase()}${rowData.type.slice(1)}` :  rowData.type);
					const link = getSinglePostLinkFromProposalType(firestoreProposalType as ProposalType);
					if ((event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey) {
						window?.open(`/${link}/${rowData.post_id}`, '_blank');
					} else {
						router.push(`/${link}/${rowData.post_id}`);
					}
				}}
			/>
		</div>

		<div className="block md:hidden h-[520px] overflow-y-auto px-0">
			<PopulatedLatestActivityCard
				tableData={tableData}
				onClick={(rowData) => {
					const firestoreProposalType = getFirestoreProposalType(['discussions', 'grants'].includes(rowData.type) ? `${rowData.type.charAt(0).toUpperCase()}${rowData.type.slice(1)}` :  rowData.type);
					const link = getSinglePostLinkFromProposalType(firestoreProposalType as ProposalType);
					if ((event as KeyboardEvent).ctrlKey || (event as KeyboardEvent).metaKey) {
						window?.open(`/${link}/${rowData.post_id}`, '_blank');
					} else {
						router.push(`/${link}/${rowData.post_id}`);
					}
				}}
			/>
		</div>
	</>);
};

export default PostsTable;