// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { spaceGrotesk } from 'pages/_app';
import React, { useCallback, useEffect, useState } from 'react';
import ReceivedSubmissions from './ReceivedRequestsSubmission';
import SentSubmissions from './SentRequestsSubmission';
import MakeChildBountySubmisionModal from '~src/components/Post/GovernanceSideBar/Bounty/Curator/MakeChildBountySubmision';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { IChildBountySubmission } from '~src/types';
import { useUserDetailsSelector } from '~src/redux/selectors';

function CuratorSubmission({
	sentSubmissions,
	receivedSubmissions,
	setReceivedSubmissions,
	setSentSubmissions
}: {
	receivedSubmissions: any;
	sentSubmissions: any;
	setReceivedSubmissions: (submissions: any) => void;
	setSentSubmissions: (submissions: any) => void;
}) {
	const [activeTab, setActiveTab] = useState('received');
	const currentUser = useUserDetailsSelector();
	const [isloadingSubmissions, setLoadingSubmission] = useState<boolean>(false);
	const [isloading, setLoading] = useState<boolean>(false);

	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editSubmission, setEditSubmission] = useState<any>();
	const [bountyId, setBountyId] = useState('');

	const handleNewSubmission = useCallback(async () => {
		await fetchSubmissions('/api/v1/bounty/curator/submissions/getReceivedSubmissions', { curatorAddress: currentUser?.loginAddress }, setReceivedSubmissions, setLoading);
		setIsModalVisible(false);
		setEditSubmission(undefined);
		setIsEditing(false);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchSubmissions = async (url: string, params: Record<string, any>, setData: React.Dispatch<any>, setLoading: React.Dispatch<boolean>) => {
		try {
			setLoading(true);
			const { data, error } = await nextApiClientFetch<IChildBountySubmission>(url, params);
			if (error) {
				console.error('Error fetching submissions:', error);
				setLoading(false);
				return;
			}
			setData(data);
		} catch (e) {
			console.error('API call failed:', e);
		} finally {
			setLoading(false);
		}
	};

	const handleTabClick = (tab: string) => {
		setActiveTab(tab);
	};
	const getReceivedRequests = () => {
		fetchSubmissions('/api/v1/bounty/curator/submissions/getReceivedSubmissions', { curatorAddress: currentUser?.loginAddress }, setReceivedSubmissions, setLoading);
	};

	const getSentRequests = () => {
		fetchSubmissions('/api/v1/bounty/curator/submissions/getSentSubmissions', { userAddress: currentUser?.loginAddress }, setSentSubmissions, setLoadingSubmission);
	};

	useEffect(() => {
		getReceivedRequests();
		getSentRequests();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUser]);

	return (
		<div className='curator-request-container'>
			<div className='flex justify-between rounded-full border-[1px] border-solid border-[#D2D8E0]'>
				<div
					className={`w-1/2 ${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer py-2 text-center text-[14px] ${
						activeTab === 'received'
							? 'rounded-l-full bg-[#F6F8FA] font-bold text-blue-light-high dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick('received')}
				>
					Received Requests <span className={'text-[12px] font-medium text-[#475569] dark:text-icon-dark-inactive'}>({receivedSubmissions.length})</span>
				</div>
				<div
					className={`w-1/2 ${spaceGrotesk.className} ${spaceGrotesk.variable} cursor-pointer py-2 text-center text-[14px] ${
						activeTab === 'sent'
							? 'rounded-r-full bg-[#F6F8FA] font-bold text-blue-light-high dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick('sent')}
				>
					Sent Requests <span className={'text-[12px] font-medium text-[#475569] dark:text-icon-dark-inactive'}>({sentSubmissions.length})</span>
				</div>
			</div>
			<div className='pt-5'>
				{activeTab === 'received' && (
					<ReceivedSubmissions
						isloading={isloading}
						receivedSubmissions={receivedSubmissions}
						setReceivedSubmissions={setReceivedSubmissions}
					/>
				)}
				{activeTab === 'sent' && (
					<SentSubmissions
						isloading={isloadingSubmissions}
						sentSubmissions={sentSubmissions}
						setSentSubmissions={setSentSubmissions}
						setIsModalVisible={setIsModalVisible}
						setIsEditing={setIsEditing}
						setEditSubmission={setEditSubmission}
						setBountyId={setBountyId}
					/>
				)}
			</div>
			<MakeChildBountySubmisionModal
				bountyId={bountyId}
				open={isModalVisible}
				setOpen={setIsModalVisible}
				editing={isEditing}
				submission={isEditing ? editSubmission : undefined}
				ModalTitle={isEditing ? 'Edit Submission' : undefined}
				onSubmissionCreated={handleNewSubmission}
			/>
		</div>
	);
}

export default CuratorSubmission;
