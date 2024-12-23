// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SearchOutlined } from '@ant-design/icons';
import React, { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import ClientOnly, { Search } from './ClientOnly';
import NewSearch from 'src/components/Search';
import { Modal } from 'antd';
import { allowedNetwork } from '~src/components/Search';
import { dmSans } from 'pages/_app';
import { useNetworkSelector } from '~src/redux/selectors';
import { CloseIcon } from './CustomIcons';
import { useTheme } from 'next-themes';
import { GlobalActions } from '~src/redux/global';
import { useDispatch } from 'react-redux';

interface ISearchBarProps {
	className?: string;
	isSmallScreen?: boolean;
	setSidedrawer: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchBar: FC<ISearchBarProps> = (props) => {
	const { className, isSmallScreen, setSidedrawer } = props;
	const { network } = useNetworkSelector();
	const [open, setOpen] = useState(false);
	const [isSuperSearch, setIsSuperSearch] = useState<boolean>(false);
	const { resolvedTheme: theme } = useTheme();
	const dispatch = useDispatch();
	const isMobile = typeof window !== 'undefined' && window.screen.width < 1024;

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
				if (
					(event.target instanceof HTMLTextAreaElement && event.target.classList.contains('mde-text')) ||
					(event.target instanceof HTMLInputElement && event.target.classList.contains('tox-textfield'))
				)
					return;
				setOpen((prev) => !prev);
			}
		};
		document.addEventListener('keydown', handleKeyDown);
		return () => {
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [open]);

	return allowedNetwork.includes(network?.toUpperCase()) ? (
		<div className={className}>
			{isSmallScreen ? (
				<div className='small-client relative '>
					<SearchOutlined className='absolute left-2.5 top-[11px] z-50' />
					<NewSearch
						openModal={open}
						setOpenModal={setOpen}
						isSuperSearch={isSuperSearch}
						setIsSuperSearch={setIsSuperSearch}
					/>
				</div>
			) : (
				<>
					<div
						className='flex cursor-pointer items-center gap-1 max-sm:gap-0'
						onClick={() => {
							setOpen(true);
							if (isMobile) {
								dispatch(GlobalActions.setIsSidebarCollapsed(true));
								setSidedrawer(false);
							}
						}}
					>
						<button className='flex cursor-pointer items-center justify-center border-none bg-transparent text-[18px] text-lightBlue outline-none dark:text-blue-dark-medium'>
							<SearchOutlined />
						</button>
					</div>
					<NewSearch
						theme={theme}
						openModal={open}
						setOpenModal={setOpen}
						isSuperSearch={isSuperSearch}
						setIsSuperSearch={setIsSuperSearch}
					/>
				</>
			)}
		</div>
	) : (
		<div className={className}>
			{isSmallScreen ? (
				<div className='small-client relative'>
					<SearchOutlined className='absolute left-2.5 top-[11px] z-50' />
					<ClientOnly>
						<Search network={network} />
					</ClientOnly>
				</div>
			) : (
				<>
					<button
						className='flex cursor-pointer items-center justify-center border-none bg-transparent text-[18px] text-lightBlue outline-none dark:text-blue-dark-medium'
						onClick={() => setOpen(true)}
					>
						<SearchOutlined />
					</button>
					<Modal
						wrapClassName='dark:bg-modalOverlayDark [&>.ant-modal-content]:bg-section-dark-overlay'
						title={
							<div className='-mx-6 flex items-center px-6 text-base font-semibold text-bodyBlue dark:border-[#3B444F] dark:bg-section-dark-overlay dark:text-blue-dark-medium'>
								Search
							</div>
						}
						closable={false}
						closeIcon={<CloseIcon className='text-lightBlue dark:text-icon-dark-inactive' />}
						open={open}
						onCancel={() => setOpen(false)}
						footer={[]}
						className={`${className} ${dmSans.className} ${dmSans.variable} dark:[&>.ant-modal-content]:bg-section-dark-overlay`}
					>
						<div className='client'>
							<ClientOnly>
								<Search network={network} />
							</ClientOnly>
						</div>
					</Modal>
				</>
			)}
		</div>
	);
};

export default styled(SearchBar)`
	.small-client .gsc-input-box {
		padding: 0px !important;
		margin: 0px !important;
		border: none !important;
		width: 100% !important;
	}
	.small-client .gsc-input input {
		background-color: white !important;
		border: 1px solid #d2d8e0 !important;
		height: 34px !important;
	}
	.small-client .gsc-control-cse {
		padding: 0px !important;
		border: none !important;
	}
	.small-client .gsc-search-box {
		margin: 0px !important;
	}
	.small-client .gsc-input {
		padding: 0px !important;
	}

	.small-client .gsc-search-button {
		background-color: white !important;
	}

	.small-client .gsc-search-button-v2 {
		background-color: var(--pink_primary) !important;
		cursor: pointer !important;
		border: none !important;
		margin: 0px !important;
		padding: 11px 15px !important;
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
		border-top-left-radius: 0px !important;
		border-top-right-radius: 0px !important;
	}
	.small-client .gsc-results-wrapper-overlay {
		top: 100px !important;
	}
	.client .gsc-control-cse {
		padding: 0px !important;
		border: none !important;
	}
	.client .gsc-search-box {
		margin: 0px !important;
	}
	.client .gsc-input {
		padding: 0px !important;
	}

	.client .gsc-search-button {
		background-color: white !important;
	}

	.client .gsc-search-button-v2 {
		background-color: var(--pink_primary) !important;
		cursor: pointer !important;
		border: none !important;
		margin: 0px !important;
		padding: 11px 15px !important;
		display: flex !important;
		justify-content: center !important;
		align-items: center !important;
		border-top-left-radius: 0px !important;
		border-top-right-radius: 0px !important;
	}
	.client .gsc-results-wrapper-overlay {
		top: 100px !important;
	}
	.client .gsc-input {
		background: transparent !important;
	}
	.ant-modal-footer {
		margin: 0px !important;
	}
`;
