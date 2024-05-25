// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import { DeriveAccountFlags, DeriveAccountInfo, DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { web3Accounts, web3Enable, web3FromSource } from '@polkadot/extension-dapp';
import { web3Enable as snapEnable } from '@polkagate/extension-dapp';
import { InjectedExtension } from '@polkadot/extension-inject/types';
import { stringToHex } from '@polkadot/util';
import { Col, Form, Row } from 'antd';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { EMembersType } from 'pages/members';
import React, { useContext, useEffect, useState } from 'react';
import ContentForm from 'src/components/ContentForm';
import CouncilVotes from 'src/components/Profile/CouncilVotes';
import TitleForm from 'src/components/TitleForm';
import { ApiContext } from 'src/context/ApiContext';
import { APPNAME } from 'src/global/appName';
import { NotificationStatus } from 'src/types';
import AddressComponent from 'src/ui-components/Address';
import BackToListingView from 'src/ui-components/BackToListingView';
import FilteredError from 'src/ui-components/FilteredError';
import Loader from 'src/ui-components/Loader';
import Markdown from 'src/ui-components/Markdown';
import queueNotification from 'src/ui-components/QueueNotification';
import getEncodedAddress from 'src/util/getEncodedAddress';
import styled from 'styled-components';

import { MessageType, ProfileDetails } from '~src/auth/types';
import SkeletonButton from '~src/basic-components/Skeleton/SkeletonButton';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import { useNetworkSelector } from '~src/redux/selectors';
import { Tabs } from '~src/ui-components/Tabs';
import getSubstrateAddress from '~src/util/getSubstrateAddress';
import nextApiClientFetch from '~src/util/nextApiClientFetch';

interface Props {
	className?: string;
	profileDetails: ProfileDetails;
	loading?: boolean;
	error?: any;
}

// const CouncilEmoji = () => <span aria-label="council member" className='councilMember' role="img">👑</span>;

const SetOnChainIdentityButton = dynamic(() => import('src/components/Settings/setOnChainIdentityButton'), {
	loading: () => <SkeletonButton active />,
	ssr: false
});

const Profile = ({ className, profileDetails }: Props): JSX.Element => {
	const { network } = useNetworkSelector();
	const { resolvedTheme: theme } = useTheme();

	const router = useRouter();
	const { address, username, membersType } = router.query;

	const aboutDescription = profileDetails?.bio;
	const aboutTitle = profileDetails?.title;

	const { api, apiReady } = useContext(ApiContext);
	const [identity, setIdentity] = useState<DeriveAccountRegistration | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [flags, setFlags] = useState<DeriveAccountFlags | undefined>(undefined);
	const [title, setTitle] = useState(aboutTitle || '');
	const [description, setDescription] = useState(aboutDescription || '');
	const [canEdit, setCanEdit] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>('');

	const noDescription = `This page belongs to address (${address}). Only this user can edit this description and the title. If you own this address, edit this page and tell us more about yourself.`;

	useEffect(() => {
		const getAccounts = async (): Promise<undefined> => {
			const extensions = await web3Enable(APPNAME);

			/** to enable metamask snap */
			const metamaskSnap = await snapEnable('onlysnap');
			metamaskSnap && extensions.push(...metamaskSnap);

			if (extensions.length === 0) {
				return;
			}

			const accounts = await web3Accounts();

			if (accounts.length === 0) {
				return;
			}

			accounts.forEach((account) => {
				if (getEncodedAddress(account.address, network) === address) {
					setCanEdit(true);
				}
			});

			return;
		};

		getAccounts();
	}, [address, network]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		let unsubscribe: () => void;

		api.derive.accounts
			.info(`${address}`, (info: DeriveAccountInfo) => {
				setIdentity(info.identity);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();
	}, [address, api, apiReady]);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		if (!address) {
			return;
		}

		let unsubscribe: () => void;

		api.derive.accounts
			.flags(`${address}`, (result: DeriveAccountFlags) => {
				setFlags(result);
			})
			.then((unsub) => {
				unsubscribe = unsub;
			})
			.catch((e) => console.error(e));

		return () => unsubscribe && unsubscribe();
	}, [address, api, apiReady]);

	const judgements = identity ? identity.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid) : [];
	const displayJudgements = judgements.map(([, jud]) => jud.toString()).join(', ');
	const isGood = judgements.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);

	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	const icon = isGood ? <CheckCircleFilled style={{ color: color, verticalAlign: 'middle' }} /> : <MinusCircleFilled style={{ color: color, verticalAlign: 'middle' }} />;

	const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setTitle(event.currentTarget.value);
		return event.currentTarget.value;
	};
	const onDescriptionChange = (data: string) => {
		setDescription(data);
		return data.length ? data : null;
	};

	const handleEdit = () => {
		setIsEditing(true);
	};

	const handleSend = async () => {
		const extensions = await web3Enable(APPNAME);

		/** to enable metamask snap */
		const metamaskSnap = await snapEnable('onlysnap');
		metamaskSnap && extensions.push(...metamaskSnap);

		if (!address) return console.log('Missing address in query');

		if (!extensions || !extensions.length) {
			queueNotification({
				header: 'Failed',
				message: 'No web 3 account integration could be found. To be able to vote on-chain, visit this page on a computer with polkadot-js entension.',
				status: NotificationStatus.ERROR
			});
			return;
		}

		const accounts = await web3Accounts();

		if (accounts.length === 0) {
			queueNotification({
				header: 'Failed',
				message: 'You need at least one account in Polkadot-js extenstion to login.',
				status: NotificationStatus.ERROR
			});
			return;
		}

		let injected: InjectedExtension | undefined = undefined;

		for (let i = 0; i < accounts.length; i++) {
			if (getEncodedAddress(accounts[i].address, network) === address) {
				injected = await web3FromSource(accounts[i].meta.source);
			}
		}

		if (!injected) {
			queueNotification({
				header: 'Failed',
				message: 'Address not available.',
				status: NotificationStatus.ERROR
			});
			return;
		}

		const signRaw = injected && injected.signer && injected.signer.signRaw;

		if (!signRaw) {
			queueNotification({
				header: 'Failed',
				message: 'Signer not available.',
				status: NotificationStatus.ERROR
			});
			return;
		}

		let substrate_address;
		if (!String(address).startsWith('0x')) {
			substrate_address = getSubstrateAddress(String(address));
			if (!substrate_address) return console.error('Invalid address');
		} else {
			substrate_address = address;
		}

		// TODO: metamask specefic sign message
		const signMessage = `<Bytes>about::network:${network}|address:${substrate_address}|title:${title || ''}|description:${description || ''}|image:</Bytes>`;

		const { signature } = await signRaw({
			address: `${substrate_address}`,
			data: stringToHex(signMessage),
			type: 'bytes'
		});

		setLoading(true);

		const { data, error: fetchError } = await nextApiClientFetch<MessageType>('api/v1/auth/actions/changeAbout', {
			address: `${substrate_address}`,
			description: description || '',
			image: '',
			network,
			signature,
			title: title || '',
			wallet: injected.name || ''
		});

		if (fetchError) {
			queueNotification({
				header: 'Failed',
				message: fetchError,
				status: NotificationStatus.ERROR
			});
			setError(fetchError);
		}

		if (data) {
			queueNotification({
				header: 'SUCCESS.',
				message: data.message || 'Profile Updated.',
				status: NotificationStatus.SUCCESS
			});
		}
		setIsEditing(false);
		setLoading(false);
	};

	if (!apiReady) {
		return <Loader text={'Initializing Connection...'} />;
	}

	const votingTab = (
		<div>
			{isEditing ? (
				<Form>
					<h3>Update Profile</h3>
					<TitleForm onChange={onTitleChange} />
					<ContentForm onChange={onDescriptionChange} />

					<div className={'mt-[3rem] flex flex-col items-center justify-center'}>
						<CustomButton
							onClick={handleSend}
							disabled={loading}
							variant='primary'
							htmlType='submit'
						>
							{loading ? <>Creating</> : 'Update'}
						</CustomButton>
					</div>
					{error && <FilteredError text={error} />}
				</Form>
			) : (
				<div className='mb-[1rem]'>
					<>
						{canEdit ? (
							<div className={'mt-[3rem] flex flex-col items-center justify-center'}>
								<CustomButton
									onClick={handleEdit}
									disabled={loading}
									htmlType='submit'
									variant='primary'
								>
									{loading ? <>Creating</> : 'Update'}
								</CustomButton>
							</div>
						) : null}
					</>
				</div>
			)}
			{membersType ? <CouncilVotes address={`${address}`} /> : null}
		</div>
	);

	const descriptionTab = (
		<div>
			<div className='p-3 lg:p-6'>
				<h2>{username}</h2>
				{address ? (
					<>
						{identity && (
							<Row gutter={[8, 40]}>
								<Col span={8}>
									<div className='mb-1 text-[12px] font-medium text-sidebarBlue dark:text-icon-dark-inactive'>Account</div>
									<AddressComponent address={`${address}`} />
								</Col>
								{identity?.email && (
									<Col span={8}>
										<div className='mb-1 text-[12px] font-medium text-sidebarBlue dark:text-icon-dark-inactive'>Email</div>
										<a
											href={`mailto:${identity.email}`}
											className='text-navBlue hover:text-pink_primary dark:text-white'
										>
											{identity.email}
										</a>
									</Col>
								)}
								{identity?.legal && (
									<Col span={8}>
										<div className='mb-1 text-[12px] font-medium text-sidebarBlue dark:text-icon-dark-inactive'>Legal</div>
										<div className='text-navBlue dark:text-white'>{identity.legal}</div>
									</Col>
								)}
								{identity?.riot && (
									<Col span={8}>
										<div className='mb-1 text-[12px] font-medium text-sidebarBlue dark:text-icon-dark-inactive'>Riot</div>
										<div className='text-navBlue dark:text-white'>{identity.riot}</div>
									</Col>
								)}
								{identity?.judgements?.length > 0 && (
									<Col span={8}>
										<div className='mb-1 text-[12px] font-medium text-sidebarBlue dark:text-icon-dark-inactive'>Judgements</div>
										<div className='text-navBlue dark:text-white'>
											{icon} {displayJudgements}
										</div>
									</Col>
								)}
								{identity?.web && (
									<Col span={8}>
										<div className='mb-1 text-[12px] font-medium text-sidebarBlue dark:text-icon-dark-inactive'>Web</div>
										<div className='text-navBlue dark:text-white'>{identity.web}</div>
									</Col>
								)}
								{identity?.twitter && (
									<Col span={8}>
										<div className='mb-1 text-[12px] font-medium text-sidebarBlue dark:text-icon-dark-inactive'>Web</div>
										<a
											href={`https://twitter.com/${identity.twitter.substring(1)}`}
											className='text-navBlue hover:text-pink_primary dark:text-white'
										>
											{identity.twitter}
										</a>
									</Col>
								)}
							</Row>
						)}
					</>
				) : (
					<p>No address attached to this account</p>
				)}
			</div>
		</div>
	);

	const tabItems = [
		// eslint-disable-next-line sort-keys
		{ label: 'Description', key: 'description', children: descriptionTab },
		// eslint-disable-next-line sort-keys
		{ label: 'Voting History', key: 'voting_history', children: votingTab }
	];

	return (
		<div className={className}>
			<BackToListingView postCategory={membersType as EMembersType} />

			<div className='mb-4 mt-6 flex flex-col md:flex-row'>
				<p className='mb-4 w-full rounded-md bg-white p-6 text-sm font-medium text-sidebarBlue shadow-md dark:bg-section-dark-overlay dark:text-white md:mb-0 md:mr-4 md:text-base'>
					<Markdown
						theme={theme}
						md={profileDetails?.bio || noDescription}
					/>
				</p>
				<SetOnChainIdentityButton />
			</div>

			<div className='w-full rounded-md bg-white p-3 drop-shadow-md dark:bg-section-dark-overlay lg:p-6'>
				<h2 className='dashboard-heading mb-4 dark:text-white'>{profileDetails?.title || 'Untitled'}</h2>
				<Tabs
					theme={theme}
					type='card'
					className='ant-tabs-tab-bg-white font-medium text-sidebarBlue'
					items={tabItems}
				/>
			</div>
		</div>
	);
};

export default styled(Profile)`
	.ant-tabs-tab-bg-white dark:bg-section-dark-background .ant-tabs-tab:not(.ant-tabs-tab-active) {
		background-color: transparent;
		border-top-color: white;
		border-left-color: white;
		border-right-color: white;
		border-bottom-color: #e1e6eb;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-tab-active {
		border-top-color: #e1e6eb;
		border-left-color: #e1e6eb;
		border-right-color: #e1e6eb;
		border-radius: 6px 6px 0 0 !important;
	}

	.ant-tabs-tab-bg-white dark:bg-section-dark-overlay .ant-tabs-nav:before {
		border-bottom: 1px solid #e1e6eb;
	}
`;
