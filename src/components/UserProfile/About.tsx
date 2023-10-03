// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CheckCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { Col, Collapse, Divider, Row } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useApiContext } from '~src/context';
import Address from '~src/ui-components/Address';
import { EmailIcon, IdentityIcon, RiotIcon, TwitterIcon, WalletIcon } from '~src/ui-components/CustomIcons';
import { TitleBio } from './Details';

interface IAboutProps {
	title?: string;
	bio?: string;
	addresses?: string[];
	className?: string;
}

const About: FC<IAboutProps> = (props) => {
	const { bio, title, addresses, className } = props;
	const { api, apiReady } = useApiContext();
	const [identity, setIdentity] = useState<DeriveAccountRegistration | null>(null);

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		let unsubscribe: () => void;

		addresses?.forEach((address) => {
			api.derive.accounts
				.info(`${address}`, (info) => {
					setIdentity(info.identity);
				})
				.then((unsub) => {
					unsubscribe = unsub;
				})
				.catch((e) => console.error(e));
		});

		return () => unsubscribe && unsubscribe();
	}, [addresses, api, apiReady]);

	const judgements = identity ? identity.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid) : [];
	const displayJudgements = judgements.map(([, jud]) => jud.toString()).join(', ');
	const isGood = judgements.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);

	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	const icon = isGood ? <CheckCircleFilled style={{ color: color, verticalAlign: 'middle' }} /> : <MinusCircleFilled style={{ color: color, verticalAlign: 'middle' }} />;
	return (
		<div className={className}>
			<TitleBio
				bio={bio}
				title={title}
				bioClassName='text-sidebarBlue mt-0'
				titleClassName='text-sidebarBlue mt-0'
			/>
			<Divider className='m-0 mt-4' />
			<Collapse
				className='content-border m-0 border-none bg-white p-0 shadow-none outline-none'
				expandIconPosition='right'
			>
				<Collapse.Panel
					className='m-0 border-none p-0 shadow-none outline-none'
					header={
						<p className='m-0 flex items-center gap-x-2 rounded-none p-0 py-1'>
							<WalletIcon className='text-base text-[#FFBF60]' />
							<span className='text-sm font-semibold text-sidebarBlue'>Addresses</span>
						</p>
					}
					key='1'
				>
					<div className='-m-4 flex flex-col rounded-[4px] bg-gray-50 p-0'>
						{addresses &&
							Array.isArray(addresses) &&
							addresses.slice(0, 5).map((address) => {
								return (
									<Address
										disableHeader={true}
										iconSize={24}
										ethIdenticonSize={30}
										addressMaxLength={10}
										key={address}
										className='border-0 border-b border-solid border-b-[#E1E6EB] p-3 py-4 text-sidebarBlue'
										address={address}
									/>
								);
							})}
					</div>
				</Collapse.Panel>
				<Collapse.Panel
					className='m-0 border-none p-0 shadow-none outline-none'
					header={
						<p className='m-0 flex items-center gap-x-2 rounded-none p-0 py-1'>
							<IdentityIcon className='text-base text-[#FFBF60]' />
							<span className='text-sm font-semibold text-sidebarBlue'>On-chain Identity</span>
						</p>
					}
					key='2'
				>
					<div className='-m-4 flex flex-col rounded-[4px] bg-gray-50 px-2 py-4'>
						{addresses && addresses.length > 0 ? (
							<>
								{identity && (
									<Row gutter={[8, 40]}>
										<Col span={12}>
											<div className='text-sm font-medium text-lightBlue'>Account</div>
											<Address
												className='mt-1'
												usernameClassName='text-xs'
												displayInline={true}
												iconSize={28}
												address={`${addresses[0]}`}
											/>
										</Col>
										{identity?.legal && (
											<Col span={12}>
												<div className='text-sm font-medium text-lightBlue'>Legal</div>
												<p className=' mt-1 text-sm font-normal text-[#5E7087]'>{identity.legal}</p>
											</Col>
										)}
										{identity?.email && (
											<Col span={12}>
												<div className='text-sm font-medium text-lightBlue'>
													<EmailIcon className='mr-1' />
													<span>Email</span>
												</div>
												<a
													href={`mailto:${identity.email}`}
													className='mt-1 block truncate text-sm font-normal text-[#5E7087]'
												>
													{identity.email}
												</a>
											</Col>
										)}
										{identity?.riot && (
											<Col span={12}>
												<div className='text-sm font-medium text-lightBlue'>
													<RiotIcon className='mr-1' />
													<span>Riot</span>
												</div>
												<p className=' mt-1 text-sm font-normal text-[#5E7087]'>{identity.riot}</p>
											</Col>
										)}
										{identity?.twitter && (
											<Col span={12}>
												<div className='text-sm font-medium text-lightBlue'>
													<TwitterIcon className='mr-1' />
													<span>Twitter</span>
												</div>
												<a
													href={`https://twitter.com/${identity.twitter.substring(1)}`}
													className='mt-1 text-sm font-normal text-[#5E7087]'
												>
													{identity.twitter}
												</a>
											</Col>
										)}
										{identity?.judgements?.length > 0 && (
											<Col span={12}>
												<div className='text-sm font-medium text-lightBlue'>Judgements</div>
												<p className=' mt-1 text-sm font-normal text-[#5E7087]'>
													{icon} {displayJudgements}
												</p>
											</Col>
										)}
										{identity?.web && (
											<Col span={12}>
												<div className='text-sm font-medium text-lightBlue'>Web</div>
												<p className=' mt-1 text-sm font-normal text-[#5E7087]'>{identity.web}</p>
											</Col>
										)}
									</Row>
								)}
							</>
						) : (
							<p>No address attached to this account</p>
						)}
					</div>
				</Collapse.Panel>
			</Collapse>
		</div>
	);
};

export default styled(About)`
	.content-border .ant-collapse-content {
		border: none !important;
	}
`;
