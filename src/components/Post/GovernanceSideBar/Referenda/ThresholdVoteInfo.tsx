// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { FC, useEffect, useState } from 'react';

interface IThresholdVotrInfoProps {
	className?: string;
	referendumId: number;
	tally?: any;
	setOpen: (value: React.SetStateAction<boolean>) => void;
	setThresholdOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ThresholdVoteInfo: FC<IThresholdVotrInfoProps> = ({ className, tally, setOpen, setThresholdOpen }) => {
    
}
