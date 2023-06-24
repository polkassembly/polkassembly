// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { useRouter } from 'next/router';
import React from 'react';
import { ProposalType, getFirestoreProposalType, getSinglePostLinkFromProposalType } from '~src/global/proposalType';

interface Props{
  timeline:any[];
  proposalType:ProposalType;
}
const LinkCard = ({ timeline, proposalType }: Props) => {
	const router = useRouter();

	return  <div className='bg-white flex flex-wrap drop-shadow-md min-h-[69px] rounded-md w-full mb-6 items-center px-4'>
		{
			timeline?.map((item: any, index: number) => {
				const proposal_type = getFirestoreProposalType(item?.type);
				return (
					<div key={index}
						onClick={() => proposalType !== proposal_type && router.push(`/${getSinglePostLinkFromProposalType(proposal_type as any)}/${item?.type === 'Tip' ? item?.hash : item?.index}`)}
						className={`flex gap-2 text-lg font-medium text-[#243A57] ${proposalType ===  proposal_type ? 'cursor-default' : 'cursor-pointer'}`}>
						<span>{item?.type === 'ReferendumV2' ? 'Opengov Referenda' : item?.type?.split(/(?=[A-Z])/).join(' ')}</span>
						<span className={`${proposalType ===  proposal_type ? 'text-[#243A57] ' : 'text-pink_primary'}`}>#{item?.index}</span>
						<span className='mr-2'>{ index !== timeline.length - 1 && ' >> '}</span>
					</div>
				);
			})
		}
	</div>;
};
export default LinkCard;