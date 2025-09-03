// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Divider, Spin } from 'antd';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { parseBalance } from '~src/components/Post/GovernanceSideBar/Modal/VoteData/utils/parseBalaceToReadable';
import { BOUNTIES_LISTING_LIMIT } from '~src/global/listingLimit';
import { getSinglePostLinkFromProposalType, ProposalType } from '~src/global/proposalType';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { EPendingCuratorReqType, IPendingCuratorReq, NotificationStatus, Wallet } from '~src/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import Markdown from '~src/ui-components/Markdown';
import { Pagination } from '~src/ui-components/Pagination';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { CheckCircleOutlined, DownOutlined, ExclamationCircleOutlined, UpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import Address from '~src/ui-components/Address';
import Link from 'next/link';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useApiContext } from '~src/context';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import getAccountsFromWallet from '~src/util/getAccountsFromWallet';
import getEncodedAddress from '~src/util/getEncodedAddress';
import { getMultisigAddressDetails } from '~src/components/DelegationDashboard/utils/getMultisigAddressDetails';

interface Props {
	proposalType: ProposalType.BOUNTIES | ProposalType.CHILD_BOUNTIES;
	title: string;
	reqType: EPendingCuratorReqType;
}
const BountyORChildBountySection = ({ reqType, title, proposalType }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const { loginAddress, loginWallet, multisigAssociatedAddress } = useUserDetailsSelector();
	const [pendingReq, setPendingReq] = useState<IPendingCuratorReq[]>([]);
	const [page, setPage] = useState(1);
	const [loading, setLoading] = useState<boolean>(false);
	const [isExpand, setIsExpand] = useState<boolean>(false);
	const [totalCount, setTotalCount] = useState(0);
	const [multisigData, setMultisigData] = useState<{ threshold: number; signatories: string[] }>({
		signatories: [],
		threshold: 0
	});

	const handleMultisigAddress = async () => {
		if (!api || !apiReady || !loginAddress?.length || !network) return;
		let defaultWallet: Wallet | null = loginWallet;
		if (!defaultWallet) {
			defaultWallet = (window.localStorage.getItem('loginWallet') as Wallet) || null;
		}

		if (!defaultWallet) return;
		//for setting signer
		await getAccountsFromWallet({ api, apiReady, chosenWallet: defaultWallet || loginWallet, loginAddress: '', network });

		const data = await getMultisigAddressDetails(loginAddress);
		if (data?.threshold) {
			const filteredSignaories: string[] = [];

			data?.multi_account_member?.map((addr: { address: string }) => {
				if (getEncodedAddress(addr?.address || '', network) !== getEncodedAddress(multisigAssociatedAddress || '', network)) {
					filteredSignaories?.push(addr?.address);
				}
			});

			setMultisigData({
				signatories: filteredSignaories,
				threshold: data?.threshold || 0
			});
		}
	};

	useEffect(() => {
		handleMultisigAddress();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, network, multisigAssociatedAddress, loginAddress]);

	const getRequests = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<{ data: IPendingCuratorReq[]; totalCount: number }>('/api/v1/bounty/curator/requests/getAllSentOrReceivedCuratorReq', {
			page: page || 1,
			proposalType: proposalType,
			reqType,
			userAddress: loginAddress
		});

		if (data?.data?.length) {
			setTotalCount(data?.totalCount || 0);
			setPendingReq(data?.data);
		} else {
			setPendingReq([]);
			setTotalCount(0);

			console.log('error', error);
		}
		setLoading(false);
	};
	const handleUpdateReq = (index: number, state: any) => {
		const updatedReqs = pendingReq?.map((item) => {
			if (item?.index == index) {
				return { ...item, ...state };
			}
			return item;
		});
		setPendingReq(updatedReqs || []);
	};

	const handleAcceptCuratorReq = async (data: IPendingCuratorReq) => {
		if (!api || !apiReady || !loginAddress) return;

		handleUpdateReq(data?.index, { loading: true });

		let tx;
		if (!!data?.parentBountyIndex && !isNaN(data?.parentBountyIndex)) {
			tx = api.tx.childBounties?.acceptCurator(data?.parentBountyIndex, data?.index);
		} else {
			tx = api.tx.bounties?.acceptCurator(data?.index);
		}
		if (multisigData?.threshold > 0) {
			tx = api?.tx?.multisig?.asMulti(multisigData?.threshold, multisigData?.signatories || [], null, tx, {
				proofSize: null,
				refTime: null
			});
		}

		const onSuccess = () => {
			handleUpdateReq(data?.index, { accepted: true, loading: false });

			queueNotification({
				durationInSeconds: 5,
				header: 'Success!',
				message:
					multisigData?.threshold > 0 ? (
						<div className='text-xs'>
							An approval request has been sent to signatories to confirm transaction.{' '}
							<Link
								href={'https://app.polkasafe.xyz'}
								className='text-xs text-pink_primary'
							>
								View Details
							</Link>
						</div>
					) : (
						'Curator Request Accepted Successfully'
					),
				status: NotificationStatus.SUCCESS
			});
		};

		const onFailed = (message: string) => {
			handleUpdateReq(data?.index, { loading: false });

			queueNotification({
				header: 'Failed!',
				message,
				status: NotificationStatus.ERROR
			});
		};
		await executeTx({
			address: loginAddress,
			api,
			apiReady,
			errorMessageFallback: 'Transaction failed.',
			network,
			onFailed,
			onSuccess,
			tx: tx
		});
	};

	useEffect(() => {
		getRequests();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [loginAddress, reqType, proposalType, page]);

	return (
		<div>
			<div className='my-4 mt-6 flex justify-between'>
				<div className={'flex gap-1 text-base font-semibold dark:text-white'}>
					{title}
					<div className='text-sm font-medium dark:text-icon-dark-inactive'>({totalCount})</div>
				</div>
				{!!totalCount && (
					<div
						onClick={() => setIsExpand(!isExpand)}
						className='px-4 py-1'
					>
						<DownOutlined className={`${isExpand ? '-rotate-180' : ''} transition-transform`} />
					</div>
				)}
			</div>

			<Divider className='m-0 border-[1px] border-solid border-section-light-container dark:border-[#494b4d]' />
			<Spin spinning={loading}>
				{isExpand && (
					<>
						{pendingReq?.map((item) => (
							<div
								key={item.index}
								className={`mt-3 rounded-lg border-solid ${
									item?.expand ? 'border-[1px] border-pink_primary dark:border-pink_primary' : 'border-[0.7px] border-section-light-container'
								} bg-white  dark:border-[#4B4B4B] dark:bg-[#0d0d0d]`}
							>
								<div className='flex items-center justify-between gap-3 px-4 py-2'>
									<div className='flex items-center gap-1'>
										{!!item?.proposer?.length && (
											<>
												<Address
													address={item?.proposer || ''}
													displayInline
													iconSize={20}
												/>

												<Divider
													className='border-[1px] border-solid border-section-light-container  dark:border-[#494b4d]'
													type='vertical'
												/>
											</>
										)}

										<div className='flex items-center gap-1'>
											<ImageIcon
												src={`${theme === 'dark' ? '/assets/activityfeed/darktimer.svg' : '/assets/icons/timer.svg'}`}
												alt='timer'
												className='text-lightBlue dark:text-[#9E9E9E]'
											/>

											<span className=' text-[10px] text-lightBlue dark:text-[#9E9E9E] xl:text-xs'>{dayjs(item?.createdAt)?.format('Do MMM YYYY')}</span>
										</div>
										<Divider
											className='border-[1px] border-solid border-section-light-container dark:border-[#494b4d]'
											type='vertical'
										/>

										<span className='whitespace-nowrap text-base font-bold text-pink_primary'>{parseBalance(String(item?.reward || '0'), 2, true, network)}</span>
									</div>
									<div className='flex items-center gap-3'>
										{reqType == EPendingCuratorReqType.RECEIVED ? (
											!item.accepted ? (
												<CustomButton
													onClick={() => handleAcceptCuratorReq(item)}
													type='primary'
													loading={item?.loading}
													text='Accept'
													height={30}
													width={100}
													className='text-xs tracking-wide'
												/>
											) : (
												<span className='whitespace-nowrap rounded-md bg-[#E0F7E5] px-6 py-1 text-center text-xs font-medium text-[#07641C] dark:bg-[#122d15] dark:text-[#1BC240]'>
													<CheckCircleOutlined /> Accepted
												</span>
											)
										) : (
											<div
												className={
													'flex cursor-default items-center justify-center gap-1.5 rounded-md bg-[#fefced] px-4 py-1 text-center text-xs  font-medium capitalize text-[#EDB10A] dark:bg-[#30250d]'
												}
											>
												<span>
													<ExclamationCircleOutlined />
												</span>
												<span> Pending</span>
											</div>
										)}
										{item?.content && (
											<div
												className='cursor-pointer'
												onClick={() => handleUpdateReq(item?.index, { expand: !item?.expand })}
											>
												{item?.expand ? (
													<UpOutlined className='rounded-full p-2 text-white' />
												) : (
													<DownOutlined className='rounded-full p-2 text-white dark:text-icon-dark-inactive' />
												)}
											</div>
										)}
									</div>
								</div>
								<Divider className='m-0 mt-1 border-[1px] border-solid border-section-light-container dark:border-[#494b4d]' />
								{/* data */}
								<div className='p-4'>
									<Link
										href={`/${getSinglePostLinkFromProposalType(proposalType)}/${item?.index}`}
										target='_blank'
									>
										<span className='text-base font-medium text-lightBlue dark:text-icon-dark-inactive'>#{item?.index} </span>
										<span className='text-base font-medium text-lightBlue hover:underline dark:text-white'>{item?.title}</span>
									</Link>
								</div>
								{item.expand && !!item?.content && (
									<div className='px-3 pb-3'>
										<Markdown
											md={item?.content}
											className='mt-1 text-sm text-lightBlue dark:text-white'
										/>
										<br />
										<Link
											href={`/${getSinglePostLinkFromProposalType(proposalType)}/${item?.index}`}
											target='_blank'
											className='text-pink_primary'
										>
											Read More
										</Link>
									</div>
								)}
							</div>
						))}

						{totalCount > BOUNTIES_LISTING_LIMIT && (
							<div className='mt-6 flex items-center justify-center'>
								<Pagination
									defaultCurrent={1}
									pageSize={BOUNTIES_LISTING_LIMIT}
									total={totalCount}
									showSizeChanger={false}
									current={page}
									theme={theme}
									hideOnSinglePage={true}
									onChange={(page: number) => setPage(page)}
									responsive={true}
								/>
							</div>
						)}
					</>
				)}
			</Spin>
		</div>
	);
};
export default BountyORChildBountySection;
