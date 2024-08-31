import { Modal } from 'antd';
import classNames from 'classnames';
import { poppins } from 'pages/_app';
import React from 'react';
import { styled } from 'styled-components';
import { CloseIcon } from '~src/ui-components/CustomIcons';

const ProfileBalanceModal = ({ className, setOpen, open }: { className: string; setOpen: (pre: boolean) => void; open: boolean }) => {
	return (
		<Modal
			open={open}
			onCancel={() => setOpen(false)}
			className={classNames('max-md:w-full dark:[&>.ant-modal-content]:bg-section-dark-overlay', poppins.className, poppins.variable)}
			footer={<div>footer</div>}
			title={
				<div className=''>
					<div className='pt-3'>Heading</div>
				</div>
			}
			wrapClassName={`${className} m-0 p-0 dark:bg-modalOverlayDark`}
			closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div></div>
		</Modal>
	);
};

export default styled(ProfileBalanceModal)`
	.ant-modal-header {
		padding: 0px 16px !important;
		margin: -24px -24px !important;
		background: radial-gradient(99.69% 25520% at 1.22% 0%, #42122c 0%, #a6075c 32.81%, #952863 77.08%, #e5007a 100%) !important;
		height: 56px !important;
	}
	.ant-modal-content {
		margin-top: 20px !important;
	}
	.ant-modal-content .ant-modal-close {
		margin-top: -12px !important;
	}
	.ant-modal-footer {
		margin-top: 40px !important;
	}
`;
