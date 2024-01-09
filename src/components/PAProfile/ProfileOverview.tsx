// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import React from 'react';
import classNames from 'classnames';
import { ProfileDetailsResponse } from '~src/auth/types';

interface Props {
	className?: string;
	theme?: string;
	addressWithIdentity?: string;
	userProfile: ProfileDetailsResponse;
}

const ProfileOverview = ({ className }: Props) => {
	return <div className={classNames(className, '')}>hello</div>;
};

export default ProfileOverview;
