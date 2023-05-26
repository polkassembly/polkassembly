// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import DelegationProfile from '~src/ui-components/DelegationProfile';

interface Props {
  className?: string;
}
const ResultPeople = ({ className }: Props) => {
	return <div className={` ${className} mt-4`}>
		<DelegationProfile address='EwumVhgig59n5JbwCKcCjMt1eNRcQjcnHCcgu79XbBhQmr3' isSearch = {true} className='py-8 px-4'/>
	</div>;
};
export default ResultPeople;