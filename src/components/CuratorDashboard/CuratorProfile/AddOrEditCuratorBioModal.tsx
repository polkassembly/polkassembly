// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Modal, Spin } from 'antd';
import classNames from 'classnames';
import { useTheme } from 'next-themes';
import { dmSans } from 'pages/_app';
import { useEffect, useState } from 'react';
import { MessageType } from '~src/auth/types';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import InputTextarea from '~src/basic-components/Input/InputTextarea';
import { NotificationStatus } from '~src/types';
import { CloseIcon } from '~src/ui-components/CustomIcons';
import queueNotification from '~src/ui-components/QueueNotification';
import nextApiClientFetch from '~src/util/nextApiClientFetch';
import { useTranslation } from 'next-i18next';

interface Props {
	className?: string;
	curatorInitialBio: string;
	open: boolean;
	setOpen: (pre: boolean) => void;
	setCuratorInitialBio: (pre: string) => void;
}

const AddOrEditCuratorBioModal = ({ className, curatorInitialBio, setOpen, open, setCuratorInitialBio }: Props) => {
	const { resolvedTheme: theme } = useTheme();
	const { t } = useTranslation('common');
	const [curatorBio, setCuratorBio] = useState<string>(curatorInitialBio);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async () => {
		setLoading(true);
		const { data, error } = await nextApiClientFetch<MessageType>('/api/v1/bounty/curator/editCuratorBio', {
			curatorBio: curatorBio?.trim()
		});
		if (data) {
			queueNotification({
				header: t('success_header'),
				message: t('proposal_created_success'),
				status: NotificationStatus.SUCCESS
			});
			setCuratorInitialBio(curatorBio);
			setOpen(false);
		}
		if (error) {
			console.log(error, 'error');
			queueNotification({
				header: t('error_header'),
				message: error,
				status: NotificationStatus.ERROR
			});
			setCuratorInitialBio(curatorInitialBio || '');
		}
		setLoading(false);
	};

	useEffect(() => {
		setCuratorBio(curatorInitialBio);
	}, [curatorInitialBio]);

	return (
		<>
			<Modal
				open={open}
				onCancel={() => setOpen(false)}
				title={
					<div className='-mx-6 flex items-center gap-1.5 border-0 border-b-[1px] border-solid border-section-light-container px-6 pb-2 text-bodyBlue dark:border-separatorDark dark:text-blue-dark-high'>
						{!curatorInitialBio?.length ? t('add') : t('edit')} {t('curator_bio')}
					</div>
				}
				className={`${dmSans.className} ${dmSans.variable}`}
				closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
				wrapClassName={`${className} dark:bg-modalOverlayDark ${theme} gov1proposal`}
				footer={false}
			>
				<Spin
					spinning={loading}
					className='-mt-4'
				>
					<section className='mt-6'>
						<InputTextarea
							rows={4}
							placeholder={t('curator_bio_placeholder')}
							value={curatorBio || ''}
							onChange={(e) => setCuratorBio(e.target.value)}
							className='dark:border-separatorDark'
						/>
					</section>

					<div className='-mx-6 mt-6 flex justify-end border-0 border-t-[1px] border-solid border-section-light-container px-6 pt-4 dark:border-[#3B444F] dark:border-separatorDark'>
						<CustomButton
							onClick={handleSubmit}
							text={t('submit')}
							variant='primary'
							height={36}
							width={100}
							className={classNames(curatorBio?.trim() === curatorInitialBio ? 'opacity-50' : '')}
							disabled={curatorBio?.trim() === curatorInitialBio}
						/>
					</div>
				</Spin>
			</Modal>
		</>
	);
};

export default AddOrEditCuratorBioModal;
