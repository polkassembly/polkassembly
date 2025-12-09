// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useEffect } from 'react';
import PostAudit from '../PostTimeline/Audit';
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { trackEvent } from 'analytics';
import ImageIcon from '~src/ui-components/ImageIcon';

const { Panel } = Collapse;

interface Props {
	auditData?: any;
	videoData?: any;
	theme: string | undefined;
	className?: string;
}

const AuditTab = ({ auditData, videoData, className }: Props) => {
	const currentUser = useUserDetailsSelector();
	useEffect(() => {
		trackEvent('audit_dropdown_clicked', 'clicked_audit_dropdown', {
			isWeb3Login: currentUser?.web3signup,
			userId: currentUser?.id || '',
			userName: currentUser?.username || ''
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	return (
		<div className={`${className}`}>
			<Collapse
				size='large'
				className={'border-section-light-container bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
				expandIconPosition='end'
				expandIcon={({ isActive }: { isActive?: boolean }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
			>
				<Panel
					header={
						<div className='channel-header flex items-center gap-[6px]'>
							<ImageIcon
								src='/assets/icons/auditIcon.svg'
								alt='auditIcon'
							/>
							<h3 className='mb-0 ml-1 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>Audit</h3>
						</div>
					}
					key='1'
				>
					<PostAudit
						auditData={auditData}
						videoData={videoData}
					/>
				</Panel>
			</Collapse>
		</div>
	);
};

export default AuditTab;
