// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { useState } from 'react';
import { CollapseIcon, ExpandIcon } from '~src/ui-components/CustomIcons';
import ProfileIcon from '~assets/icons/profile-icon.svg';
import EditPencilIcon from '~assets/icons/edit-pencil.svg';
import PasswordDotIcon from '~assets/icons/password-dot.svg';
import { Collapse } from '../../Notifications/common-ui/Collapse';
import { Divider } from 'antd';
import { useUserDetailsContext } from '~src/context';
import ChangeUsername from '../Modals/ChangeUsername';
import ChangeEmail from '../Modals/ChangeEmail';
import ChangePassword from '../Modals/ChangePassword';
import TwoFactorAuth from '../../TwoFactorAuth';
import { useTheme } from 'next-themes';

const { Panel } = Collapse;

const Row = ({ label, data, handleEdit }: { label: string; data: string; handleEdit: any }) => (
	<div className='flex items-baseline justify-between'>
		<div>
<<<<<<< HEAD
			<label className='text-[#485F7D] text-[14px] dark:text-blue-dark-medium' htmlFor={label}>{label}</label>
			<p className='font-medium text-blue-light-high dark:text-blue-dark-high'>{
				label === 'Password' ?
					<div className='flex gap-1 mt-2'>
						{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => <PasswordDotIcon key={id} />)}
					</div> :
					data ? data : `${label} not linked. Please Add ${label}`
			}</p>
=======
			<label
				className='text-[14px] text-[#485F7D]'
				htmlFor={label}
			>
				{label}
			</label>
			<p className='font-medium text-[#243A57]'>
				{label === 'Password' ? (
					<div className='mt-2 flex gap-1'>
						{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
							<PasswordDotIcon key={id} />
						))}
					</div>
				) : data ? (
					data
				) : (
					`${label} not linked. Please Add ${label}`
				)}
			</p>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
		</div>
		<span
			className='flex cursor-pointer items-center gap-1 text-[14px] font-medium text-[#485F7D] text-pink_primary'
			onClick={handleEdit}
		>
			<EditPencilIcon /> Edit
		</span>
	</div>
);

export enum ModalType {
	USERNAME = 'username',
	EMAIL = 'email',
	PASSWORD = 'password'
}

const ProfileSettings = () => {
	const { username, email, web3signup } = useUserDetailsContext();
	const [showModal, setShowModal] = useState<ModalType | null>(null);
	const { id } = useUserDetailsContext();
	const { resolvedTheme:theme } =  useTheme();
	return (
		<Collapse
			size='large'
			className={'bg-white dark:bg-section-dark-overlay dark:border-[#90909060]'}
			expandIconPosition='end'
			theme={theme}
			expandIcon={({ isActive }) => {
				return isActive ? <CollapseIcon className='text-lightBlue dark:text-blue-dark-medium' /> : <ExpandIcon className='text-lightBlue dark:text-blue-dark-medium'/>;
			}}
		>
			<Panel
				header={
<<<<<<< HEAD
					<div className='flex items-center gap-[6px] channel-header dark:bg-section-dark-overlay'>
						<ProfileIcon />
						<h3 className='font-semibold text-[16px] text-blue-light-high dark:text-blue-dark-high md:text-[18px] tracking-wide leading-[21px] mb-0 mt-[2px]'>
							Profile Settings
						</h3>
=======
					<div className='channel-header flex items-center gap-[6px]'>
						<ProfileIcon />
						<h3 className='mb-0 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-[#243A57] md:text-[18px]'>Profile Settings</h3>
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
					</div>
				}
				key='1'
			>
<<<<<<< HEAD
				<div className='flex flex-col gap-6 b-red'>
					<Row label='Username' data={username || ''} handleEdit={() => setShowModal(ModalType.USERNAME)} />
					<Divider className='m-0 text-[#D2D8E0] dark:text-separatorDark' />
					<Row label='Email' data={email || ''} handleEdit={() => setShowModal(ModalType.EMAIL)} />
					<Divider className='m-0 text-[#D2D8E0] dark:text-separatorDark' />
					{!web3signup && <Row label='Password' data={username || ''} handleEdit={() => setShowModal(ModalType.PASSWORD)} />}
=======
				<div className='flex flex-col gap-6'>
					<Row
						label='Username'
						data={username || ''}
						handleEdit={() => setShowModal(ModalType.USERNAME)}
					/>
					<Divider className='m-0 text-[#D2D8E0]' />
					<Row
						label='Email'
						data={email || ''}
						handleEdit={() => setShowModal(ModalType.EMAIL)}
					/>
					<Divider className='m-0 text-[#D2D8E0]' />
					{!web3signup && (
						<Row
							label='Password'
							data={username || ''}
							handleEdit={() => setShowModal(ModalType.PASSWORD)}
						/>
					)}
>>>>>>> 540916d451d46767ebc2e85c3f2c900218f76d29
				</div>
				<ChangeUsername
					theme={theme}
					onCancel={() => setShowModal(null)}
					username={username || ''}
					open={showModal === ModalType.USERNAME}
				/>
				<ChangePassword
					theme={theme}
					onCancel={() => setShowModal(null)}
					open={showModal === ModalType.PASSWORD}
				/>
				<ChangeEmail
					theme={theme}
					onCancel={() => setShowModal(null)}
					email={email || ''}
					open={showModal === ModalType.EMAIL}
				/>
				{id && <TwoFactorAuth className='mt-2' />}
			</Panel>
		</Collapse>
	);
};

export default ProfileSettings;
