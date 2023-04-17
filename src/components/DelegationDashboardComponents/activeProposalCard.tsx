// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Divider } from 'antd';
import { IPostListing } from 'pages/api/v1/listing/on-chain-posts';
import React from 'react';
import Address from '~src/ui-components/Address';

interface Props{
  proposal: IPostListing;
}

const ActiveProposalCard = ({ proposal }: Props) => {
	console.log(proposal);
	return <div className='border-solid px-6 py-6 border-[1px] border-[#D2D8E0] rounded-[6px]'>
		<h2 className='text-sm text-medium text-[#243A57]'>SubWallet Proposes to Build the Web3 Multiverse Gateway for Polkadot & Kusama ecosystem - Milestone 1 & 2</h2>
		<div className='flex mt-[10px] items-center gap-1 text-xs font-normal text-[#485F7D]'>By:<Address address='0x4b809cCF39fF19B0ef43172c3578a188Ffb6a1f3'/>
			<Divider type="vertical" style={{ border: '1px solid #485F7D', marginLeft: '4px', marginRight: '4px' }}/>
		</div>
	</div>;

};
export default ActiveProposalCard;
