// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { Button, DatePicker, DatePickerProps, Modal } from 'antd';
import { poppins } from 'pages/_app';
import { dayjs } from 'dayjs-init';

import { CloseIcon } from './CustomIcons';
import styled from 'styled-components';

interface Props {
	className?: boolean;
	open: boolean;
	setOpen: (pre: boolean) => void;
	theme?: string;
	setDeadlineDate: (pre: Date | null) => void;
}

const AddTreasuryProposalDeadlineModal = ({ className, open, setOpen, theme, setDeadlineDate }: Props) => {
	const onChange: DatePickerProps['onChange'] = (dayJSDate) => {
		const date = dayJSDate || dayjs();
		setDeadlineDate(date.toDate());
	};
	return (
		<Modal
			open={open}
			wrapClassName='dark:bg-modalOverlayDark'
			onCancel={(e) => {
				e.stopPropagation();
				e.preventDefault();
				setOpen(false);
				setDeadlineDate(null);
			}}
			footer={
				<div className='-mx-6 border-0 border-t-[1px] border-solid px-6 pt-4 dark:border-separatorDark'>
					<Button
						htmlType='submit'
						key='submit'
						className='h-[32px] rounded-[4px] border-none bg-pink_primary text-xs font-medium tracking-wide text-white hover:bg-pink_secondary'
						onClick={() => setOpen(false)}
					>
						Save
					</Button>
				</div>
			}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
			className={`${poppins.variable} ${poppins.className} ant-modal-content>.ant-modal-header]:bg-section-dark-overlay h-[120px] max-w-full shrink-0 max-sm:w-[100%] ${theme} ${className}`}
			title={
				<div className='-mx-6 border-0 border-b-[1px] border-solid px-6 pb-2 dark:border-separatorDark'>
					<label className='mb-0.5 text-base tracking-wide text-lightBlue dark:text-blue-dark-high'>Add Deadline for completing deliverables</label>
				</div>
			}
		>
			<div className='my-6'>
				<label className='mb-0.5 text-sm text-lightBlue dark:text-blue-dark-high'>Add Deadline</label>
				<DatePicker
					placeholder='DD/MM/YYYY'
					format='DD-MM-YYYY'
					disabledDate={(date) => dayjs(new Date()).format('dd-mm-yyyy') !== date.format('dd-mm-yyyy') && dayjs(new Date()).isAfter(date)}
					onChange={onChange}
					allowClear={false}
					popupClassName={`z-[1060] dark:bg-section-dark-overlay ${theme}`}
					rootClassName='dark:text-blue-dark-high'
					className='h-10 w-full rounded-[4px] dark:bg-section-dark-overlay dark:text-blue-dark-high'
				/>
			</div>
		</Modal>
	);
};

export default styled(AddTreasuryProposalDeadlineModal)`
	.ant-picker-input > input {
		color: ${(props) => (props.theme === 'dark' ? 'white' : '#243A57')} !important;
	}
`;
