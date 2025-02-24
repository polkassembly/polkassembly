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
	isProposerTab?: boolean;
}

const UserInfoTab = ({ className, isProposerTab }: Props) => {
	const {
		postData: { proposer, beneficiaries }
	} = usePostDataContext();
	let postAddr: any = [];
	postAddr = isProposerTab ? [proposer] : beneficiaries?.map((beneficiary: any) => (typeof beneficiary.address === 'string' ? beneficiary?.address : beneficiary?.address?.value));
	return (
		<div className={`${className}`}>
			<Collapse
				size='large'
				className={'my-custom-collapse border-section-light-container bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
			>
				<Panel
					header={
						<div className='channel-header flex items-center gap-[6px]'>
							{isProposerTab ? (
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
								{isProposerTab ? 'Proposer' : postAddr.length > 1 ? 'Beneficiaries' : 'Beneficiary'}
							</h3>
						</div>
					}
					key='userInfoTab'
				>
					<div>
						{postAddr?.map((addr: any, index: number) => (
							<>
								<ProfileData address={addr} />
								{!isProposerTab && postAddr.length > 1 && index !== postAddr.length - 1 && (
									<Divider
										style={{ background: '#D2D8E0', flexGrow: 1 }}
										className='mt-3 dark:bg-separatorDark'
									/>
								)}
							</>
						))}
					</div>
				</Panel>
			</Collapse>
		</div>
	);
};

export default styled(UserInfoTab)`
	@media (max-width: 816px) and (min-width: 319px) {
		.my-custom-collapse .ant-collapse-content-box {
			padding: 24px 8px !important;
		}
	}

	@media (max-width: 430px) and (min-width: 319px) {
		.tags-container {
			display: block !important;
		}
		.verified-container {
			max-width: 112px !important;
		}
	}
	@media (max-width: 365px) and (min-width: 320px) {
		.delegation-buttons {
			padding: 16px 6px !important;
		}
	}
`;
