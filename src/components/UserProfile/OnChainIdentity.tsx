// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { CloseOutlined, RightOutlined, CheckCircleFilled, MinusCircleFilled } from '@ant-design/icons';
import { Col, Modal, Row } from 'antd';
import React, { FC, useState } from 'react';
import Address from '~src/ui-components/Address';
import { EmailIcon, IdentityIcon, RiotIcon, TwitterIcon } from '~src/ui-components/CustomIcons';
import { TOnChainIdentity } from './Details';

interface IOnChainIdentityProps {
	addresses: string[];
	onChainIdentity: TOnChainIdentity;
}

const OnChainIdentity: FC<IOnChainIdentityProps> = (props) => {
	const { addresses, onChainIdentity } = props;
	const [open, setOpen] = useState(false);
	const toggleOpen = () => setOpen((prev) => !prev);

	const judgements = onChainIdentity ? onChainIdentity.judgements.filter(([, judgement]): boolean => !judgement.isFeePaid) : [];
	const displayJudgements = judgements.map(([, jud]) => jud.toString()).join(', ');
	const isGood = judgements.some(([, judgement]): boolean => judgement.isKnownGood || judgement.isReasonable);
	const isBad = judgements.some(([, judgement]): boolean => judgement.isErroneous || judgement.isLowQuality);

	const color: 'brown' | 'green' | 'grey' = isGood ? 'green' : isBad ? 'brown' : 'grey';
	const icon = isGood ? <CheckCircleFilled style={{ color: color, verticalAlign: 'middle' }} /> : <MinusCircleFilled style={{ color: color, verticalAlign: 'middle' }} />;
	return (
		<>
			<div>
				<button
					onClick={toggleOpen}
					className='flex w-full cursor-pointer items-center gap-x-[6.5px] border-none bg-transparent text-sm font-semibold text-white outline-none'
				>
					<IdentityIcon className='text-xl text-[#FFBF60]' />
					<span>On-chain Identity</span>
					<RightOutlined className='ml-auto text-base text-[#D6DBE2]' />
				</button>
				<Modal
					zIndex={999}
					className='min-w-[648px]'
					title={<h3 className='text-xl font-semibold text-[#1D2632]'>On-chain identity</h3>}
					closeIcon={<CloseOutlined className='text-sm text-[#485F7D]' />}
					onCancel={toggleOpen}
					open={open}
					footer={[]}
				>
					<div className='mt-6'>
						{addresses && addresses.length > 0 ? (
							<>
								{onChainIdentity && (
									<Row gutter={[8, 40]}>
										<Col span={8}>
											<div className='text-sm font-medium text-[#485F7D]'>Account</div>
											<Address
												className='mt-1 text-xs'
												textClassName='text-xs text-[#5E7087]'
												displayInline={true}
												identiconSize={28}
												address={`${addresses[0]}`}
											/>
										</Col>
										{onChainIdentity?.legal && (
											<Col span={8}>
												<div className='text-sm font-medium text-[#485F7D]'>Legal</div>
												<p className=' mt-1 text-sm font-normal text-[#5E7087]'>{onChainIdentity.legal}</p>
											</Col>
										)}
										{onChainIdentity?.email && (
											<Col span={8}>
												<div className='text-sm font-medium text-[#485F7D]'>
													<EmailIcon className='mr-1' />
													<span>Email</span>
												</div>
												<a
													target='_blank'
													rel='noreferrer'
													href={`mailto:${onChainIdentity.email}`}
													className=' mt-1 text-sm font-normal text-[#5E7087]'
												>
													{onChainIdentity.email}
												</a>
											</Col>
										)}
										{onChainIdentity?.riot && (
											<Col span={8}>
												<div className='text-sm font-medium text-[#485F7D]'>
													<RiotIcon className='mr-1' />
													<span>Riot</span>
												</div>
												<a
													target='_blank'
													rel='noreferrer'
													href={`https://matrix.to/#/${onChainIdentity.riot}`}
													className=' mt-1 text-sm font-normal text-[#5E7087]'
												>
													{onChainIdentity.riot}
												</a>
											</Col>
										)}
										{onChainIdentity?.twitter && (
											<Col span={8}>
												<div className='text-sm font-medium text-[#485F7D]'>
													<TwitterIcon className='mr-1' />
													<span>Twitter</span>
												</div>
												<a
													target='_blank'
													rel='noreferrer'
													href={`https://twitter.com/${onChainIdentity.twitter.substring(1)}`}
													className='mt-1 text-sm font-normal text-[#5E7087]'
												>
													{onChainIdentity.twitter}
												</a>
											</Col>
										)}
										{judgements?.length > 0 && (
											<Col span={8}>
												<div className='text-sm font-medium text-[#485F7D]'>Judgements</div>
												<p className=' mt-1 text-sm font-normal text-[#5E7087]'>
													{icon} {displayJudgements}
												</p>
											</Col>
										)}
										{onChainIdentity?.web && (
											<Col span={8}>
												<div className='text-sm font-medium text-[#485F7D]'>Web</div>
												<p className=' mt-1 text-sm font-normal text-[#5E7087]'>{onChainIdentity.web}</p>
											</Col>
										)}
									</Row>
								)}
							</>
						) : (
							<p>No address attached to this account</p>
						)}
					</div>
				</Modal>
			</div>
		</>
	);
};

export default OnChainIdentity;
