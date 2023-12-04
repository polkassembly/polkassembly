// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Collapse } from 'antd';
import ExpandIcon from '~assets/icons/expand.svg';
import CollapseIcon from '~assets/icons/collapse.svg';
import ProgressReportIcon from '~assets/icons/progressIcon.svg';

import React, { FC } from 'react';
const { Panel } = Collapse;

interface IProgressReport {
	className?: string;
}

const ProgressReport: FC<IProgressReport> = (className) => {
	return (
		<div className={`${className}`}>
			<Collapse
				size='large'
				className={'bg-white dark:border-separatorDark dark:bg-section-dark-overlay'}
				expandIconPosition='end'
				expandIcon={({ isActive }) => {
					return isActive ? <ExpandIcon /> : <CollapseIcon />;
				}}
				// theme={theme}
			>
				<Panel
					header={
						<div className='channel-header flex items-center gap-[6px]'>
							<ProgressReportIcon />
							<h3 className='mb-0 ml-1 mt-[2px] text-[16px] font-semibold leading-[21px] tracking-wide text-blue-light-high dark:text-blue-dark-high md:text-[18px]'>
								Progress Reports
							</h3>
						</div>
					}
					key='1'
				>
					{/* <Form
						className={className}
						form={form}
						onFinish={handleSubmit}
						onValuesChange={(_, allValues) => {
							setIsFormValid(!!allValues.reason && !!allValues.password);
						}}
					>
						<p className='text-[14px] text-blue-light-high dark:text-blue-dark-high'>
							Please note that this action is irreversible and all the data associated with your account will be permanently deleted.
						</p>
						<Modal
							wrapClassName='dark:bg-modalOverlayDark'
							closable={true}
							maskClosable={true}
							title={Title}
							open={showModal}
							closeIcon={
								<div onClick={dismissModal}>
									<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />
								</div>
							}
							footer={[
								<Divider
									key='divider'
									style={{ background: '#D2D8E0', flexGrow: 1 }}
									className='my-4 dark:bg-separatorDark'
								/>,
								<Button
									key='cancel'
									onClick={dismissModal}
									className='inline-flex items-center justify-center rounded-md border border-solid border-pink_primary px-8 py-5 text-sm font-semibold leading-7 text-pink_primary outline-none dark:bg-transparent'
								>
									Cancel
								</Button>,
								<Button
									htmlType='submit'
									key='delete'
									onClick={() => {
										form.submit();
									}}
									loading={loading}
									disabled={!isFormValid}
									style={{ opacity: !isFormValid ? 0.6 : 1 }}
									className='mr-6 inline-flex items-center justify-center rounded-md border-none bg-pink_primary px-8 py-5 text-sm font-semibold leading-7 text-white outline-none'
								>
									Delete
								</Button>
							]}
							className={`${className} ${poppins.variable} ${poppins.className} w-[604px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
						>
							<Divider
								style={{ background: '#D2D8E0', flexGrow: 1 }}
								className='my-4 dark:bg-separatorDark'
							/>

							<article className='mt-5 px-6'>
								<label
									className='text-sm font-normal text-lightBlue dark:text-blue-dark-medium'
									htmlFor='reason'
								>
									Reason for deleting account
								</label>
								<Form.Item
									name='reason'
									className='m-0 mt-0.5'
								>
									<Select
										onChange={(value) => {
											if (value === 'other') {
												setIsOther(true);
											} else {
												if (isOther) {
													setIsOther(false);
												}
											}
										}}
										size='large'
										placeholder='Select a reason'
										className='select-reason rounded-md border-grey_border dark:text-white'
										popupClassName='z-[1060] dark:border-0 dark:border-none dark:bg-section-dark-background'
									>
										<Option value='I use another platform for my governance needs'>I use another platform for my governance needs</Option>
										<Option value='I do not hold any DOT and would not be using Polkassembly anymore'>I do not hold any DOT and would not be using Polkassembly.</Option>
										<Option value='I have a duplicate account'>I have a duplicate account</Option>
										<Option
											htmlFor='other'
											value='other'
										>
											Other
										</Option>
									</Select>
								</Form.Item>
								{isOther ? (
									<Form.Item
										name='other'
										className='mt-4'
									>
										<Input.TextArea
											placeholder='Other reason'
											id='other'
											className='dark:border-separatorDark dark:bg-transparent dark:text-blue-dark-high dark:focus:border-[#91054F]'
										/>
									</Form.Item>
								) : null}
							</article>
							<article className='mt-6 px-6'>
								<label
									className='text-sm font-normal text-lightBlue dark:text-blue-dark-medium'
									htmlFor='password'
								>
									Please enter your password to continue
								</label>
								<Form.Item
									name='password'
									className='m-0 mt-0.5'
								>
									<Input.Password
										placeholder='Enter Password'
										className='h-[40px] rounded-md border-grey_border px-4 py-3 dark:border-white dark:bg-transparent dark:text-blue-dark-high dark:hover:border-[#91054f] dark:focus:border-[#91054F] [&>input]:bg-transparent dark:[&>input]:text-blue-dark-high'
										id='password'
									/>
								</Form.Item>
								<div className='my-2.5 text-right text-pink_primary'>
									<Link
										onClick={dismissModal}
										href='/request-reset-password'
									>
										Forgot Password?
									</Link>
								</div>
								{error && (
									<div className='mb-4'>
										<FilteredError text={error} />
									</div>
								)}
							</article>
						</Modal>
						<Button
							onClick={openModal}
							htmlType='submit'
							className='text-md mt-5 flex items-center justify-center rounded-lg border-none bg-[#F53C3C] px-7 py-5 font-semibold leading-7 text-white outline-none'
						>
							Delete My Account
						</Button>
					</Form> */}
					<h1 className='text-white'>hello</h1>
				</Panel>
			</Collapse>
		</div>
	);
};

export default ProgressReport;
