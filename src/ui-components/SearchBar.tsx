// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SearchOutlined } from '@ant-design/icons';
import { Modal } from 'antd';
import React, { FC, useContext, useState } from 'react';
import styled from 'styled-components';

import { NetworkContext } from '~src/context/NetworkContext';
import ClientOnly, { Search } from './ClientOnly';

interface ISearchBarProps {
	className?: string;
}

const SearchBar: FC<ISearchBarProps> = (props) => {
	const { className } = props;
	const { network } = useContext(NetworkContext);
	const [open, setOpen] = useState(false);
	return (
		<div>
			<button className='flex items-center justify-center outline-none border-none bg-transparent cursor-pointer text-[18px] text-[#485F7D]' onClick={() => setOpen(true)}>
				<SearchOutlined />
			</button>
			<Modal
				title='Search'
				closable={false}
				open={open}
				onCancel={() => setOpen(false)}
				footer={[]}
				className={className}
			>
				<div className='client'>
					<ClientOnly>
						<Search network={network} />
					</ClientOnly>
				</div>
			</Modal>
		</div>
	);
};

export default styled(SearchBar)`
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
	.ant-modal-footer {
		margin: 0px !important;
	}
`;
