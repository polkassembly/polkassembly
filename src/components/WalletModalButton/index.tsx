// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import styled from 'styled-components';

const WalletModalButton = ({
	onClick,
	icon,
	name
}: {
	onClick: () => void;
	icon?: JSX.Element;
	name: string;
}) => {
	return (
		<StyledButton onClick={onClick}>
			{icon} <StyledName>{name}</StyledName>
		</StyledButton>
	);
};

const StyledButton = styled.div`
	padding: 1.25rem 1rem;
	border-radius: 0.75rem;
	border: 1.5px solid #a9a9a9;
	display: flex;
	align-items: center;
	cursor: pointer;
	transition: 0.3s;
	&:hover {
		border: 1.5px solid #e5007a;
	}
	margin-bottom: 16px;
`;

const StyledName = styled.span`
	font-size: 16px;
	margin-left: 8px;
	font-weight: 500;
`;

export default WalletModalButton;
