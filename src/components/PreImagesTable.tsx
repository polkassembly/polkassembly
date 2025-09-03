// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

/* eslint-disable sort-keys */
import { ProfileOutlined } from '@ant-design/icons';
import { ApiPromise } from '@polkadot/api';
import { Modal, Tooltip, message } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import { useRouter } from 'next/router';
import React, { FC, useEffect, useState } from 'react';
import ReactJson from 'react-json-view';
import NameLabel from 'src/ui-components/NameLabel';
import { PostEmptyState } from 'src/ui-components/UIStates';
import formatBnBalance from 'src/util/formatBnBalance';
import styled from 'styled-components';
import LoadingState from '~src/basic-components/Loading/LoadingState';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useApiContext } from '~src/context';
import { useNetworkSelector, useUserDetailsSelector } from '~src/redux/selectors';
import { IPreimagesListing, NotificationStatus } from '~src/types';
import ImageIcon from '~src/ui-components/ImageIcon';
import queueNotification from '~src/ui-components/QueueNotification';
import executeTx from '~src/util/executeTx';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import copyToClipboard from '~src/util/copyToClipboard';
import Loader from '~src/ui-components/Loader';
import Table from '~src/basic-components/Tables/Table';
import { CopyIcon, SubscanIcon } from '~src/ui-components/CustomIcons';
import { useTheme } from 'next-themes';

interface IPreImagesTableProps {
	preimages: IPreimagesListing[];
	theme?: string;
}

interface IUnnoteOrUnreqrestedButtonProps {
	proposer: string;
	hash: string;
	api?: ApiPromise;
	apiReady: boolean;
	network: string;
	substrateAddresses?: (string | null)[];
	isUnrequesting?: boolean;
	onConfirm: () => void;
}

const UnnoteOrUnrequestedButton = ({ proposer, hash, api, apiReady, network, substrateAddresses, onConfirm, isUnrequesting = false }: IUnnoteOrUnreqrestedButtonProps) => {
	const [loading, setLoading] = useState<boolean>(false);
	const isProposer = substrateAddresses?.includes(getSubstrateAddress(proposer) || proposer);

	if (!isProposer) return null;

	const handleSubmit = async () => {
		if (!api || !apiReady) {
			return;
		}
		setLoading(true);

		let preimageTx;
		if (isUnrequesting) {
			preimageTx = api.tx.preimage.unrequestPreimage(hash);
		} else {
			preimageTx = api.tx.preimage.unnotePreimage(hash);
		}

		const onSuccess = () => {
			onConfirm();
			setLoading(false);
			queueNotification({
				header: 'Success!',
				message: 'Preimage Cleared Successfully',
				status: NotificationStatus.SUCCESS
			});
		};

		const onFailed = (message: string) => {
			setLoading(false);
			queueNotification({
				header: 'Failed!',
				message,
				status: NotificationStatus.ERROR
			});
		};
		if (!preimageTx) return;

		await executeTx({
			address: proposer,
			api,
			apiReady,
			errorMessageFallback: 'Transaction failed.',
			network,
			onFailed,
			onSuccess,
			tx: preimageTx
		});
	};

	return (
		<div className='flex items-center space-x-2'>
			<Tooltip
				placement='top'
				title={isUnrequesting ? 'Unrequest' : 'Unnote'}
				trigger={'hover'}
			>
				<button
					onClick={handleSubmit}
					className='h-4 w-4 rounded-[4px] border border-grey_border bg-white '
					disabled={loading}
				>
					<ImageIcon
						src='/assets/icons/close-icon.svg'
						alt='close icon'
						imgClassName='w-full h-full'
						imgWrapperClassName='flex cursor-pointer justify-center text-sm text-grey_border dark:text-white'
					/>
				</button>
			</Tooltip>
			<div>{loading && <Loader />}</div>
		</div>
	);
};

const PreImagesTable: FC<IPreImagesTableProps> = (props) => {
	const { network } = useNetworkSelector();
	const router = useRouter();
	const { resolvedTheme: theme } = useTheme();
	const [preimages, setPreimages] = useState(props.preimages);
	const [modalArgs, setModalArgs] = useState<any>(null);
	const { api, apiReady } = useApiContext();
	const { addresses } = useUserDetailsSelector();
	const [messageApi, contextHolder] = message.useMessage();

	const substrateAddresses = addresses?.map((address) => {
		return getSubstrateAddress(address);
	});

	useEffect(() => {
		if (!router?.query?.hash) return;
		setModalArgs(preimages?.[0]?.proposedCall.args);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]);

	const success = () => {
		messageApi.open({
			content: 'Hash copied to clipboard',
			type: 'success'
		});
	};

	const handleModalArgs = async (args: any) => {
		Object.entries(args).map(([name, value]) => {
			if (typeof value === 'string' && value.length > 1000) {
				args[name] = 'Large data. Please check on subscan';
			} else if (Array.isArray(value) && value.length > 1000) {
				args[name] = 'Large data. Please check on subscan';
			} else if (typeof value === 'object') {
				handleModalArgs(value);
			}
		});
	};

	const columns: ColumnsType<any> = [
		{
			title: 'Hash',
			dataIndex: 'hash',
			key: 'hash',
			width: 300,
			render: (hash, obj) => (
				<div className='flex items-center space-x-[6px]'>
					<span className='font-medium text-sidebarBlue dark:text-white'>{`${hash.substring(0, 6)}...${hash.substring(hash.length - 6)}`}</span>
					<Tooltip title='Copy'>
						<span
							className='mt-[2px] cursor-pointer'
							onClick={(e) => {
								e.preventDefault();
								copyToClipboard(hash);
								success();
							}}
						>
							{contextHolder}
							<CopyIcon className='scale-75 text-2xl text-lightBlue dark:text-icon-dark-inactive' />
						</span>
					</Tooltip>
					<Tooltip title='Subscan'>
						<span
							className='cursor-pointer'
							onClick={() => window.open(`https://${network}.subscan.io/extrinsic/${obj?.statusHistory?.extrinsicIndex}`, '_blank')}
						>
							<SubscanIcon className='-ml-0.5 scale-[65%] text-2xl text-lightBlue dark:text-icon-dark-inactive' />
						</span>
					</Tooltip>
				</div>
			)
		},
		{
			title: 'Author',
			dataIndex: 'proposer',
			key: 'author',
			width: 250,
			render: (proposer) => <NameLabel defaultAddress={proposer} />
		},
		{
			title: 'Deposit',
			dataIndex: 'deposit',
			key: 'deposit',
			width: 120,
			render: (deposit) => (
				<span className='whitespace-pre font-medium text-sidebarBlue dark:text-white'>{deposit && formatBnBalance(deposit, { numberAfterComma: 2, withUnit: true }, network)}</span>
			)
		},
		{
			title: 'Arguments',
			dataIndex: 'proposedCall',
			key: 'proposedCall',
			width: 265,
			render: (proposedCall) =>
				proposedCall &&
				proposedCall.section &&
				proposedCall.method && (
					<div className='flex items-center'>
						<code className='rounded-md px-2 dark:bg-separatorDark dark:text-white'>
							{proposedCall.section}.{proposedCall.method?.length > 6 ? `${proposedCall.method?.slice(0, 6)}...` : proposedCall.method}
						</code>
						{proposedCall.args && (
							<ProfileOutlined
								className='ml-2 cursor-pointer rounded-md p-1 text-base hover:text-pink_primary dark:font-normal dark:text-white dark:hover:text-blue-dark-helper'
								onClick={async () => {
									await handleModalArgs(proposedCall.args);
									setModalArgs(proposedCall.args);
								}}
							/>
						)}
					</div>
				)
		},
		{
			title: 'Size',
			dataIndex: 'length',
			key: 'length',
			width: 65,
			render: (length) => <span className='font-medium text-sidebarBlue dark:text-white'>{length}</span>
		},
		{
			title: 'Status',
			dataIndex: 'status',
			key: 'status',
			width: 135,
			render: (status, obj) => (
				<div className='flex items-center justify-start space-x-4'>
					<span className='font-medium text-sidebarBlue dark:text-white'>{status}</span>
					{status == 'Noted' && (
						<UnnoteOrUnrequestedButton
							proposer={obj.proposer}
							hash={obj.hash}
							api={api}
							apiReady={apiReady}
							network={network}
							substrateAddresses={substrateAddresses}
							onConfirm={() => {
								setPreimages((prev) => {
									return prev.filter((preimage: any) => preimage.hash !== obj.hash && preimage.proposer !== obj.proposer);
								});
							}}
						/>
					)}
					{status == 'Requested' && (
						<UnnoteOrUnrequestedButton
							proposer={obj.proposer}
							isUnrequesting
							hash={obj.hash}
							api={api}
							apiReady={apiReady}
							network={network}
							substrateAddresses={substrateAddresses}
							onConfirm={() => {
								setPreimages((prev) => {
									return prev.filter((preimage: any) => preimage.hash !== obj.hash && preimage.proposer !== obj.proposer);
								});
							}}
						/>
					)}
				</div>
			)
		}
	];

	if (preimages) {
		if (!preimages || !preimages.length) return <PostEmptyState />;

		const tableData: any[] = [];

		preimages.forEach((preImageObj: any, index: number) => {
			tableData.push({ key: index, ...preImageObj });
		});

		return (
			<div>
				<Table
					theme={theme}
					columns={columns}
					dataSource={tableData}
					pagination={false}
					scroll={{ x: 1000 }}
				/>

				<Modal
					wrapClassName='dark:bg-modalOverlayDark'
					open={Boolean(modalArgs)}
					title={<div className='dark:bg-section-dark-overlay dark:text-blue-dark-high'>Arguments</div>}
					onOk={() => setModalArgs(null)}
					onCancel={() => setModalArgs(null)}
					className={'dark:[&>.ant-modal-content]:bg-section-dark-overlay '}
					footer={[
						<CustomButton
							type='default'
							text='Close'
							key='back'
							onClick={() => setModalArgs(null)}
							className='border-none dark:bg-transparent dark:text-white'
						/>
					]}
				>
					{modalArgs && (
						<div className='max-h-[60vh] w-full overflow-auto'>
							<ReactJson
								theme={theme === 'dark' ? 'bright' : 'rjv-default'}
								style={{ color: 'white', background: 'var(--section-dark-overlay)' }}
								src={modalArgs}
								iconStyle='circle'
								enableClipboard={false}
								displayDataTypes={false}
							/>
						</div>
					)}
				</Modal>
			</div>
		);
	}

	// Loading state
	return <LoadingState />;
};

export default styled(React.memo(PreImagesTable))`
	.ant-table-wrapper .ant-table-thead > tr > th,
	.ant-table-wrapper .ant-table-thead > tr > td {
		background: ${(props: any) => (props.theme === 'dark' ? 'black' : 'white')} !important;
	}
	.ant-table-row .ant-table-row-level-0 {
		background: ${(props: any) => (props.theme === 'dark' ? '#1E1E1E' : 'white')} !important;
	}
`;
