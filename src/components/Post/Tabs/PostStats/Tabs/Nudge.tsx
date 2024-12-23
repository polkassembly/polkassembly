// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import NudgeIcon from '~assets/icons/analytics/nudge-icon.svg';
import styled from 'styled-components';

interface INudgeProps {
	text: string;
}

const StyledNudge = styled.div`
	border: 1px solid #796eec !important;
	background-color: #b6b0fb36;
`;
const Nudge = ({ text }: INudgeProps) => {
	return (
		<StyledNudge className='mb-5 flex gap-1 rounded-lg px-2 py-2 sm:px-5 md:items-center'>
			<NudgeIcon className='m-0 h-auto w-10 fill-blue-light-high dark:fill-white md:h-6 md:w-6' />
			<span className='break-words text-sm font-medium text-blue-light-high dark:text-white'>{text}</span>
		</StyledNudge>
	);
};

export default Nudge;
