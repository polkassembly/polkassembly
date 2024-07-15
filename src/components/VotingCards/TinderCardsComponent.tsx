// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React, { FC } from 'react';

interface ITinderCardsComponent {
	proposal: any;
}

const TinderCardsComponent: FC<ITinderCardsComponent> = (props) => {
	const { proposal } = props;
	console.log('from tinder cards --> ', proposal);
	return (
		<section>
			<h3 className='text-xl font-bold'>{proposal.title}</h3>
			{/* <PostHeading
        method={character?.method}
        motion_method={character?.motion_method}
        postArguments={character?.proposed_call?.args}
        className='mb-5'
    /> */}
		</section>
	);
};

export default TinderCardsComponent;
