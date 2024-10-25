// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useCallback, useEffect, useState } from 'react';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { EPendingCuratorReqType, IChildBountySubmission, IPendingCuratorReq } from '~src/types';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { ProposalType } from '~src/global/proposalType';
import { BOUNTIES_LISTING_LIMIT } from '~src/global/listingLimit';
import { useRouter } from 'next/router';
import MakeChildBountySubmisionModal from '~src/components/Post/GovernanceSideBar/Bounty/Curator/MakeChildBountySubmision';
import CuratorRequest from './PendingRequestTabs/CuratorRequest/CuratorRequest';
import CuratorSubmission from './PendingRequestTabs/CuratorSubmission/CuratorSubmission';
import Alert from '~src/basic-components/Alert';

const RequestTabs = () => {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState(EPendingCuratorReqType.RECEIVED);
	const currentUser = useUserDetailsSelector();
	const userAddress = currentUser?.loginAddress;
	const [bountyRequests, setBountyRequests] = useState<IPendingCuratorReq[]>([]);
	const [childBountyRequests, setChildBountyRequests] = useState<IPendingCuratorReq[]>([]);
	const [isBountyExpanded, setBountyExpanded] = useState(false);
	const [isChildBountyExpanded, setChildBountyExpanded] = useState(false);
	const [isloadingSubmissions, setLoadingSubmission] = useState<boolean>(false);
	const [receivedSubmissions, setReceivedSubmissions] = useState<any>([]);
	const [sentSubmissions, setSentSubmissions] = useState<any>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editSubmission, setEditSubmission] = useState<any>();
	const [bountyId, setBountyId] = useState('');
	const activeSection = (router?.query?.section as string) || 'curatorRequests';
	const [isLoadingBounty, setLoadingBounty] = useState<boolean>(false);
	const [isLoadingChildBounty, setLoadingChildBounty] = useState<boolean>(false);

	const currentPage = parseInt(router?.query?.page as string) || 1;
	const requestType = (router?.query?.type as string) || ProposalType.BOUNTIES;

	const fetchCuratorRequest = async (proposalType: ProposalType, isBounty: boolean) => {
		const reqType = activeTab === EPendingCuratorReqType.RECEIVED ? EPendingCuratorReqType.RECEIVED : EPendingCuratorReqType.SENT;
		if (isBounty) {
			if (isLoadingBounty) return;
		} else {
			if (isLoadingChildBounty) return;
		}

		try {
			if (isBounty) setLoadingBounty(true);
			else setLoadingChildBounty(true);

			const { data, error } = await nextApiClientFetch<IPendingCuratorReq[]>('/api/v1/bounty/curator/requests/getAllSentOrReceivedCuratorReq', {
				page: currentPage,
				proposalType,
				reqType,
				userAddress
			});

			if (error) return;

			if (data) {
				isBounty ? setBountyRequests((prev) => [...prev, ...data]) : setChildBountyRequests((prev) => [...prev, ...data]);
				if (data?.length === BOUNTIES_LISTING_LIMIT) {
					router?.push({ query: { page: currentPage + 1, type: requestType } });
				}
			}
		} finally {
			if (isBounty) setLoadingBounty(false);
			else setLoadingChildBounty(false);
		}
	};
	const handleTabClick = (tab: EPendingCuratorReqType) => {
		setActiveTab(tab);

		if (activeSection === 'curatorRequests') {
			setBountyRequests([]);
			setChildBountyRequests([]);
			setBountyExpanded(false);
			setChildBountyExpanded(false);
			router?.push({ query: { page: 1, type: requestType } });
		}
	};

	const getReceivedRequests = () => {
		fetchSubmissions('/api/v1/bounty/curator/submissions/getReceivedSubmissions', { curatorAddress: currentUser?.loginAddress }, setReceivedSubmissions, setLoadingSubmission);
	};

	const getSentRequests = () => {
		fetchSubmissions('/api/v1/bounty/curator/submissions/getSentSubmissions', { userAddress: currentUser?.loginAddress }, setSentSubmissions, setLoadingSubmission);
	};
	const handleBountyClick = async () => {
		setChildBountyExpanded(false);
		setBountyExpanded(!isBountyExpanded);
		if (!isBountyExpanded && bountyRequests?.length === 0) {
			await fetchCuratorRequest(ProposalType.BOUNTIES, true);
		}
		!isBountyExpanded ? router.push({ query: { ...router.query, type: ProposalType.BOUNTIES } }) : router.push({ query: { ...router.query, type: undefined } });
	};

	const handleChildBountyClick = async () => {
		setBountyExpanded(false);
		setChildBountyExpanded(!isChildBountyExpanded);
		if (!isChildBountyExpanded && childBountyRequests?.length === 0) {
			await fetchCuratorRequest(ProposalType.CHILD_BOUNTIES, false);
		}
		!isChildBountyExpanded ? router.push({ query: { ...router.query, type: ProposalType.CHILD_BOUNTIES } }) : router.push({ query: { ...router.query, type: undefined } });
	};

	const handleNewSubmission = useCallback(async () => {
		setLoadingSubmission(true);
		await fetchSubmissions(
			'/api/v1/bounty/curator/submissions/getReceivedSubmissions',
			{ curatorAddress: currentUser?.loginAddress },
			setReceivedSubmissions,
			setLoadingSubmission
		);
		await fetchSubmissions('/api/v1/bounty/curator/submissions/getSentSubmissions', { userAddress: currentUser?.loginAddress }, setSentSubmissions, setLoadingSubmission);
		setLoadingSubmission(false);
		setIsModalVisible(false);
		setEditSubmission(undefined);
		setIsEditing(false);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const fetchSubmissions = async (url: string, params: Record<string, any>, setData: React.Dispatch<any>, setLoadingSubmission: React.Dispatch<boolean>) => {
		try {
			setLoadingSubmission(true);
			const { data, error } = await nextApiClientFetch<IChildBountySubmission>(url, params);
			if (error) {
				console.error('Error fetching submissions:', error);
				setLoadingSubmission(false);
				return;
			}
			if (Array.isArray(data)) {
				setData([...data]);
			} else {
				console.warn('Fetched data is not an array:', data);
				setData([]);
			}
		} catch (e) {
			console.error('API call failed:', e);
		} finally {
			setLoadingSubmission(false);
		}
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
					className={`w-1/2 cursor-pointer py-2 text-center text-[14px] ${
						activeTab === EPendingCuratorReqType.RECEIVED
							? 'rounded-l-full bg-[#F6F8FA] font-bold text-blue-light-high dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick(EPendingCuratorReqType.RECEIVED)}
				>
					Received Requests
				</div>
				<div
					className={`w-1/2 cursor-pointer py-2 text-center text-[14px] ${
						activeTab === EPendingCuratorReqType.SENT
							? 'rounded-r-full bg-[#F6F8FA] font-bold text-blue-light-high dark:bg-[#4B4B4B] dark:text-white'
							: 'font-medium text-[#475569] dark:text-icon-dark-inactive'
					}`}
					onClick={() => handleTabClick(EPendingCuratorReqType.SENT)}
				>
					Sent Requests
				</div>
			</div>
			{activeSection === 'curatorRequests' && (
				<div>
					{activeTab === EPendingCuratorReqType.RECEIVED && (
						<Alert
							type='info'
							showIcon
							className='mt-4'
							closable
							message='Requests to become a curator for bounties can be viewed here'
						/>
					)}
					<CuratorRequest
						isBountyExpanded={isBountyExpanded}
						bountyRequests={bountyRequests}
						childBountyRequests={childBountyRequests}
						isChildBountyExpanded={isChildBountyExpanded}
						handleBountyClick={handleBountyClick}
						handleChildBountyClick={handleChildBountyClick}
						loadingBounty={isLoadingBounty}
						loadingChildBounty={isLoadingChildBounty}
					/>
				</div>
			)}
			{activeSection === 'submissions' && (
				<div className='pt-5'>
					<CuratorSubmission
						receivedSubmissions={receivedSubmissions}
						setReceivedSubmissions={setReceivedSubmissions}
						isLoading={isloadingSubmissions}
						sentSubmissions={sentSubmissions}
						setSentSubmissions={setSentSubmissions}
						setIsModalVisible={setIsModalVisible}
						setIsEditing={setIsEditing}
						setEditSubmission={setEditSubmission}
						setBountyId={setBountyId}
						activeTab={activeTab}
					/>
				</div>
			)}
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
};

export default RequestTabs;
