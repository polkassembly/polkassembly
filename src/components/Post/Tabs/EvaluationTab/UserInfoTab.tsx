// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse, Divider } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import React from 'react';
import { usePostDataContext } from '~src/context';
import ProfileData from '~src/ui-components/ProfileData';
import styled from 'styled-components';
import ImageIcon from '~src/ui-components/ImageIcon';
const { Panel } = Collapse;

interface Props {
	className?: string;
	item?: string;
}

const UserInfoTab = ({ className, item }: Props) => {
	const {
		postData: { proposer, beneficiaries }
	} = usePostDataContext();
	let postAddr: any = [];
	if (item === 'proposer') {
		postAddr.push(proposer);
	} else {
		postAddr = beneficiaries;
	}

	return (
		<div className={`${className}`}>
			<Collapse
				size='large'
				className={'my-custom-collapse bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
			>
				<Panel
					header={
						<div className='channel-header flex items-center gap-[6px]'>
							{item === 'proposer' ? (
								<ImageIcon
									src='/assets/icons/proposerIcon.svg'
									alt='proposerIcon'
								/>
							) : (
								<ImageIcon
									src='/assets/icons/BeneficiariesIcon.svg'
									alt='beneficiaryIcon'
								/>
							)}
							<h3 className='mb-0 ml-1 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>
								{item === 'proposer' ? 'Proposer' : 'Beneficiary(ies)'}
							</h3>
						</div>
					}
					key='1'
				>
					<div>
						{postAddr?.map((addr: any, index: number) => (
							<React.Fragment key={index}>
								{item === 'proposer' && <ProfileData address={addr} />}
								{item === 'beneficiary' && <ProfileData address={addr?.address} />}
								{addr.length > 1 && index !== addr.length - 1 && item === 'beneficiary' && (
									<Divider
										style={{ background: '#D2D8E0', flexGrow: 1 }}
										className='mt-3 dark:bg-separatorDark'
									/>
								)}
							</React.Fragment>
						))}
					</div>
				</Panel>
			</Collapse>
		</div>
	);
};

export default styled(UserInfoTab)`
	.ant-collapse > .ant-collapse-item:last-child,
	.ant-collapse > .ant-collapse-item:last-child > .ant-collapse-header {
		border-radius: 14px !important;
	}

	.ant-collapse {
		border-radius: 14px !important;
	}
`;
