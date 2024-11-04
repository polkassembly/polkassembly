// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Modal } from 'antd';
import { poppins } from 'pages/_app';
import React from 'react';
import { styled } from 'styled-components';
import Alert from '~src/basic-components/Alert';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import ImageIcon from '~src/ui-components/ImageIcon';
import { useTranslation } from 'next-i18next';

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	className: string;
}

const DelegateInfoModal = ({ openModal, setOpenModal, className }: Props) => {
	const { t } = useTranslation('common');

	return (
		<Modal
			title={
				<div
					className={`${poppins.variable} ${poppins.className} flex items-center p-[14px] text-sm font-semibold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}
				>
					<span className='mt-1'>{t('how_to_delegate')}</span>
				</div>
			}
			open={openModal}
			footer={false}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={`${className} ${poppins.variable} ${poppins.className} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => setOpenModal(false)}
			closeIcon={<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div className='px-[14px] pb-[18px]'>
				<div className='rounded-xl border border-solid border-[#D2D8E0] bg-[#D2D8E047] p-[10px]'>
					<div className='mb-2 flex items-center gap-2'>
						<ImageIcon
							src='/assets/delegation-tracks/small-become-delegate-1.svg'
							alt={t('delegate_icon')}
							className=''
							imgWrapperClassName=''
						/>
						<span className={`${poppins.variable} ${poppins.className} text-base font-semibold text-blue-light-high dark:text-blue-dark-high`}>{t('step')} 1</span>
					</div>
					<div className={`${poppins.variable} ${poppins.className} flex max-w-[380px] flex-col text-sm`}>
						<span className='mb-1 text-xs font-semibold text-blue-light-high dark:text-blue-dark-high'>{t('select_track')}</span>
						<span className='text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{t('select_track_description')}</span>
					</div>
				</div>

				<div className='my-2 flex items-center justify-center'>
					<ImageIcon
						src='/assets/delegation-tracks/small-become-arrow.svg'
						alt={t('double_arrow_icon')}
					/>
				</div>

				<div className='rounded-xl border border-solid border-[#D2D8E0] bg-[#D2D8E047] p-[10px]'>
					<div className='mb-2 flex items-center gap-2'>
						<ImageIcon
							src='/assets/delegation-tracks/small-become-delegate-2.svg'
							alt={t('delegate_icon')}
							className=''
							imgWrapperClassName=''
						/>
						<span className={`${poppins.variable} ${poppins.className} text-base font-semibold text-blue-light-high dark:text-blue-dark-high`}>{t('step')} 2</span>
					</div>
					<div className={`${poppins.variable} ${poppins.className} flex max-w-[380px] flex-col text-sm`}>
						<span className='mb-1 text-xs font-semibold text-blue-light-high dark:text-blue-dark-high'>{t('select_delegate')}</span>
						<span className='text-xs font-normal text-blue-light-high dark:text-blue-dark-high'>{t('select_delegate_description')}</span>
					</div>
				</div>

				<Alert
					type='info'
					showIcon
					message={
						<span className={`${poppins.variable} ${poppins.className} text-xs text-blue-light-medium dark:text-blue-dark-high`}>
							{t('learn_more_about_delegation')}
							<a
								href='https://docs.polkassembly.io/opengov/learn-about-referenda/voting-on-a-referendum/delegating-voting-power'
								className='ml-[3px] text-[#407BFF] underline'
								target='_blank'
								rel='noreferrer'
							>
								{t('click_here')}
							</a>
						</span>
					}
					className='mt-4 rounded-lg border-none dark:bg-infoAlertBgDark'
				/>
			</div>
		</Modal>
	);
};

export default styled(DelegateInfoModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
