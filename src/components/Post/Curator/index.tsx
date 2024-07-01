// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC, useState } from 'react';
import CautionInfoSVG from '~assets/icons/caution-info.svg';
import { Form, Modal } from 'antd';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import ErrorAlert from '~src/ui-components/ErrorAlert';
import Select from '~src/basic-components/Select';

const Curator: FC = () => {
	const [showModal, setShowModal] = useState(false);
	const [loading] = useState(false);
	const [error] = useState('');

	const [form] = Form.useForm();

	return (
		<>
			<div className='my-2 flex items-center gap-2 rounded-md bg-[#FEF7D1] p-2'>
				<CautionInfoSVG />{' '}
				<span
					className='text-pink_primary dark:text-blue-dark-helper'
					onClick={() => setShowModal(true)}
				>
					Add Curator
				</span>{' '}
				to your referendum to proceed with bounty creation
			</div>
			<Modal
				className='dark:[&>.ant-modal-content>.ant-modal-header>.ant-modal-title]:bg-section-dark-overlay dark:[&>.ant-modal-content]:bg-section-dark-overlay'
				wrapClassName='dark:bg-modalOverlayDark'
				title={<span className='dark:text-white'>Add Curator</span>}
				open={showModal}
				// onOk={(isDeleteModal ? handleDelete : handleReport)}
				confirmLoading={loading}
				onCancel={() => setShowModal(false)}
				destroyOnClose={true}
				zIndex={1067}
				footer={[
					<div
						key='buttons'
						className='mt-4 flex justify-end gap-x-1'
					>
						<CustomButton
							key='back'
							disabled={loading}
							onClick={() => setShowModal(false)}
							text='Back'
							variant='default'
							buttonsize='xs'
						/>
						<CustomButton
							htmlType='submit'
							key='submit'
							disabled={loading}
							// onClick={() => {
							// isDeleteModal ? handleDelete() : handleReport();
							// }}
							variant='primary'
							buttonsize='xs'
						>
							Assign Curator
						</CustomButton>
					</div>
				]}
			>
				<Form
					form={form}
					name='report-post-form'
					// onFinish={isDeleteModal ? handleDelete : handleReport}
					layout='vertical'
					// disabled={formDisabled}
					// validateMessages={{ required: `Please add reason for ${isDeleteModal ? 'deleting' : 'reporting'}` }}
				>
					{error && (
						<ErrorAlert
							errorMsg={error}
							className='mb-4'
						/>
					)}

					<Form.Item
						name='reason'
						label='Reason'
						rules={[{ required: true }]}
						className='dark:'
					>
						<Select
							popupClassName='z-[9999]'
							defaultValue={"It's suspicious or spam"}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
};

export default Curator;
