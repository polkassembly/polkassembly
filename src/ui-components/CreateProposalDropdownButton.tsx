// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import styled from 'styled-components';
import { FC } from 'react';
import CreatePencilIcon from '~assets/icons/create-pencil-icon.svg';
import { poppins } from 'pages/_app';
import { ArrowDownIcon } from './CustomIcons';

const StyledButtonContainer = styled.div`
	.card {
		padding: 2px;
		width: 200px;
		background: #0b0d15 !important;
		text-align: center;
		border-radius: 11.5px;
		position: relative;
		z-index: 10;
	}

	@property --angle {
		syntax: '<angle>';
		initial-value: 0deg;
		inherits: false;
	}

	.card::after,
	.card::before {
		content: '';
		position: absolute;
		height: 100%;
		width: 100%;
		background-image: conic-gradient(from var(--angle), #4ffaff, #3c76f4, #0437a7, #4ffaff);
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		z-index: -10;
		padding: 2px;
		border-radius: 11.5px;
		animation: 3s spin linear infinite;
	}
	.card::before {
		filter: blur(1.5rem);
		opacity: 0.3;
	}
	@keyframes spin {
		from {
			--angle: 0deg;
		}
		to {
			--angle: 360deg;
		}
	}
`;

const CreateProposalDropdownButton: FC = () => (
	<StyledButtonContainer>
		<div className='card mx-4'>
			<div className='flex items-center justify-center gap-[6px] rounded-[10.5px] bg-white py-[2px] dark:bg-section-dark-background'>
				<CreatePencilIcon />
				<span className={`${poppins.variable} ${poppins.className} py-[6px] font-medium leading-4 text-[#0A3EAF] dark:text-[#49CFFC]`}>Create</span>
				<ArrowDownIcon className='text-sm text-[#0A3EAF] dark:text-[#49CFFC]' />
			</div>
		</div>
	</StyledButtonContainer>
);

export default CreateProposalDropdownButton;
