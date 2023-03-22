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
			api.derive.accounts.info(`${address}`, (info) => {
				console.log('identity:', info.identity);
				setIdentity(info.identity);
			})
				.then(unsub => { unsubscribe = unsub; })
				.catch(e => console.error(e));
		});

		return () => unsubscribe && unsubscribe();
	}, [addresses, api, apiReady]);

	const judgements = identity ? identity.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid) : [];
	const displayJudgements = judgements.map(([,jud]) => jud.toString()).join(', ');
	const isGood = judgements.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);

	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	const icon = isGood ? <CheckCircleFilled style={{ color: color, verticalAlign:'middle' }} /> : <MinusCircleFilled style={{ color: color, verticalAlign:'middle' }} />;
	return (
		<div className={className}>
			<TitleBio bio={bio} title={title} bioClassName='text-sidebarBlue mt-0' titleClassName='text-sidebarBlue mt-0' />
			<Divider className='m-0 mt-4' />
			<Collapse className='bg-white m-0 p-0 border-none outline-none shadow-none content-border' expandIconPosition='right'>
				<Collapse.Panel
					className='m-0 p-0 border-none outline-none shadow-none'
					header={
						<p className='m-0 p-0 py-1 rounded-none flex items-center gap-x-2'>
							<WalletIcon className='text-[#FFBF60] text-base' />
							<span className='text-sidebarBlue font-semibold text-sm'>Addresses</span>
						</p>
					}
					key="1"
				>
					<div className='p-0 -m-4 flex flex-col rounded-[4px] bg-gray-50'>
						{
							addresses && Array.isArray(addresses) && addresses.slice(0, 5).map((address) => {
								return (
									<Address disableAddressClick={true} disableHeader={true} identiconSize={24} ethIdenticonSize={30} shortenAddressLength={10} key={address} className='text-sidebarBlue p-3 py-4 border-0 border-b border-solid border-b-[#E1E6EB]' address={address} />
								);
							})
						}
					</div>
				</Collapse.Panel>
				<Collapse.Panel
					className='m-0 p-0 border-none outline-none shadow-none'
					header={
						<p className='m-0 p-0 py-1 rounded-none flex items-center gap-x-2'>
							<IdentityIcon className='text-[#FFBF60] text-base' />
							<span className='text-sidebarBlue font-semibold text-sm'>On-chain Identity</span>
						</p>
					}
					key="2"
				>
					<div className='-m-4 flex flex-col rounded-[4px] bg-gray-50 py-4 px-2'>
						{addresses && addresses.length > 0 ? <>
							{identity && <Row gutter={[8, 40]}>
								<Col span={12}>
									<div className='text-[#485F7D] font-medium text-sm'>Account</div>
									<Address className='text-xs mt-1' textClassName='text-xs text-[#5E7087]' displayInline={true} identiconSize={28} address={`${addresses[0]}`}/>
								</Col>
								{identity?.legal && <Col span={12}>
									<div className='text-[#485F7D] font-medium text-sm'>Legal</div>
									<p className=' text-[#5E7087] text-sm font-normal mt-1'>{identity.legal}</p>
								</Col>}
								{identity?.email && <Col span={12}>
									<div className='text-[#485F7D] font-medium text-sm'>
										<EmailIcon className='mr-1' />
										<span>Email</span>
									</div>
									<a href={`mailto:${identity.email}`} className='block text-[#5E7087] text-sm font-normal mt-1 truncate'>{identity.email}</a>
								</Col>}
								{identity?.riot && <Col span={12}>
									<div className='text-[#485F7D] font-medium text-sm'>
										<RiotIcon className='mr-1' />
										<span>Riot</span>
									</div>
									<p className=' text-[#5E7087] text-sm font-normal mt-1'>{identity.riot}</p>
								</Col>}
								{identity?.twitter && <Col span={12}>
									<div className='text-[#485F7D] font-medium text-sm'>
										<TwitterIcon className='mr-1' />
										<span>Twitter</span>
									</div>
									<a href={`https://twitter.com/${identity.twitter.substring(1)}`} className='text-[#5E7087] text-sm font-normal mt-1'>{identity.twitter}</a>
								</Col>}
								{identity?.judgements?.length > 0 && <Col span={12}>
									<div className='text-[#485F7D] font-medium text-sm'>Judgements</div>
									<p className=' text-[#5E7087] text-sm font-normal mt-1'>{icon} {displayJudgements}</p>
								</Col>}
								{identity?.web && <Col span={12}>
									<div className='text-[#485F7D] font-medium text-sm'>Web</div>
									<p className=' text-[#5E7087] text-sm font-normal mt-1'>{identity.web}</p>
								</Col>}
							</Row>}
						</> : <p>No address attached to this account</p>}
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