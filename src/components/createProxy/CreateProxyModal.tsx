// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider, Modal } from 'antd';
import { dmSans } from 'pages/_app';
import React, { useEffect, useState } from 'react';
import { styled } from 'styled-components';
import { ArrowDownIcon, CloseIcon, ProxyIcon } from '~src/ui-components/CustomIcons';
import Image from 'next/image';
import CustomButton from '~src/basic-components/buttons/CustomButton';
import BN from 'bn.js';
import { useApiContext } from '~src/context';
import { formatedBalance } from '~src/util/formatedBalance';
import { chainProperties } from '~src/global/networkConstants';
import { useNetworkSelector } from '~src/redux/selectors';

interface Props {
	openModal: boolean;
	setOpenModal: (pre: boolean) => void;
	setOpenProxyMainModal: (pre: boolean) => void;
	className: string;
}

const CreateProxyModal = ({ openModal, setOpenModal, className, setOpenProxyMainModal }: Props) => {
	const { api, apiReady } = useApiContext();
	const { network } = useNetworkSelector();
	const [baseDeposit, setBaseDeposit] = useState<BN>(new BN(0));
	const [depositFactor, setDepositFactor] = useState<BN>(new BN(0));
	const [dropdownVisible, setDropdownVisible] = useState(false);
	const unit = `${chainProperties[network]?.tokenSymbol}`;

	const fetchBaseDeposit = async (api: any) => {
		try {
			const baseDeposit = api?.consts?.proxy?.proxyDepositBase || new BN(0);
			const depositFactor = api?.consts?.proxy?.proxyDepositFactor || new BN(0);
			return { baseDeposit: new BN(baseDeposit.toString()), depositFactor: new BN(depositFactor.toString()) };
		} catch (error) {
			console.error('Failed to fetch base deposit value:', error);
			return { baseDeposit: new BN(0), depositFactor: new BN(0) };
		}
	};

	useEffect(() => {
		if (!api && !apiReady) return;

		fetchBaseDeposit(api).then(({ baseDeposit, depositFactor }) => {
			setBaseDeposit(baseDeposit);
			setDepositFactor(depositFactor);
		});
	}, [api, apiReady]);

	return (
		<Modal
			title={
				<div>
					<div
						className={`${dmSans.className} ${dmSans.variable} flex items-center px-6 py-4 text-sm font-semibold text-bodyBlue dark:bg-section-dark-overlay dark:text-blue-dark-high`}
					>
						<span className='flex items-center gap-x-2 text-xl font-semibold text-bodyBlue hover:text-pink_primary dark:text-blue-dark-high dark:hover:text-pink_primary'>
							<ProxyIcon className='userdropdown-icon text-2xl' />
							<span>Proxy</span>
						</span>
					</div>
					<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
				</div>
			}
			open={openModal}
			footer={
				<div className=''>
					<Divider className='m-0 bg-section-light-container p-0 dark:bg-separatorDark' />
					<div className={`${dmSans.className} ${dmSans.variable} px-6 py-4`}>
						<CustomButton
							onClick={() => {
								setOpenModal(false);
								setOpenProxyMainModal(true);
							}}
							height={40}
							className='w-full'
							text="Let's Begin"
							variant='solid'
						/>
					</div>
				</div>
			}
			zIndex={1008}
			wrapClassName={' dark:bg-modalOverlayDark rounded-[14px]'}
			className={`${className} ${dmSans.className} ${dmSans.variable} w-[605px] rounded-[14px] dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
			onCancel={() => setOpenModal(false)}
			closeIcon={<CloseIcon className=' text-lightBlue dark:text-icon-dark-inactive' />}
		>
			<div className='flex flex-col items-center justify-center p-4'>
				<Image
					src={'/assets/icons/proxy-modal-icon.svg'}
					alt='proxy-icon'
					width={303}
					height={175}
					className='mt-1'
				/>
				<div className='mt-7 px-[14px]'>
					<div className='flex items-start gap-2 text-blue-light-high dark:text-blue-dark-high'>
						<div className='mt-2 h-1 w-[4px] rounded-full bg-blue-light-high dark:bg-blue-dark-high'></div>{' '}
						<span>Proxies are helpful because they let you delegate efficiently and add a layer of security.</span>
					</div>
					<div className='flex items-start gap-2 text-blue-light-high dark:text-blue-dark-high'>
						<div className='mt-2 h-1 w-[6px] rounded-full bg-blue-light-high dark:bg-blue-dark-high'></div>{' '}
						<span>Rather than using funds in a single account, smaller accounts with unique roles can complete tasks on behalf of the main stash account.</span>
					</div>
				</div>
				<div className='mt-6 w-full rounded-md  bg-[#F6F7F9] p-4 dark:bg-[#29323C33]'>
					<div
						className='flex cursor-pointer items-center justify-between'
						onClick={() => setDropdownVisible((prev) => !prev)}
					>
						<span className={` ${dmSans.className} ${dmSans.variable} text-sm font-medium text-blue-light-medium dark:text-blue-dark-medium`}>Total Amount Required</span>
						<span className={` ${dmSans.className} ${dmSans.variable} text-base font-semibold text-blue-light-high dark:text-blue-dark-high`}>
							{formatedBalance(baseDeposit.add(depositFactor).toString(), unit, 3)} {unit}
							<ArrowDownIcon className={`ml-3 text-xs transition-transform duration-200 max-sm:ml-2 ${dropdownVisible ? 'rotate-180' : ''}`} />
						</span>
					</div>
					{dropdownVisible && (
						<>
							<Divider className='border-l-1 my-3 border-[#D2D8E0] dark:border-icon-dark-inactive max-sm:hidden' />
							<div className='mt-2 space-y-2 text-sm text-blue-light-medium dark:text-blue-dark-medium'>
								<div className={`${dmSans.className} ${dmSans.variable} flex items-center justify-between text-sm font-medium text-blue-light-medium dark:text-blue-dark-medium`}>
									<span>Deposit Base</span>
									<span className='text-blue-light-high dark:text-blue-dark-high'>
										{formatedBalance(baseDeposit.toString(), unit, 3)} {unit}
									</span>
								</div>
								<div className={`${dmSans.className} ${dmSans.variable} flex items-center justify-between text-sm font-medium text-blue-light-medium dark:text-blue-dark-medium`}>
									<span>Deposit Factor</span>
									<span className='text-blue-light-high dark:text-blue-dark-high'>
										{formatedBalance(depositFactor.toString(), unit, 3)} {unit}
									</span>
								</div>
							</div>
						</>
					)}
				</div>
			</div>
		</Modal>
	);
};

export default styled(CreateProxyModal)`
	.ant-modal-content {
		padding: 0px !important;
		border-radius: 14px;
	}
`;
