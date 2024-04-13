// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NextPageContext } from 'next';
import { NextComponentType } from 'next';
import { ReactNode } from 'react';

export interface INavHeader {
	className?: string;
	sidedrawer: boolean;
	previousRoute?: string;
	setSidedrawer: React.Dispatch<React.SetStateAction<boolean>>;
	displayName?: string;
	isVerified?: boolean;
	isIdentityExists?: boolean;
}

export interface IPaLogo {
	className?: string;
	sidedrawer?: boolean;
	style?: object;
}

export interface IUserDropdown {
	className?: string;
	displayName: string;
	isVerified: boolean;
	isIdentityExists: boolean;
	setOpenAddressLinkedModal: (pre: boolean) => void;
	setOpenIdentityModal: (pre: boolean) => void;
	children?: ReactNode;
}

export interface ISidebar extends IUserDropdown {
	Component: NextComponentType<NextPageContext, any, any>;
	pageProps: any;
	className?: string;
}

export interface IAppLayout {
	Component: NextComponentType<NextPageContext, any, any>;
	pageProps: any;
	className?: string;
}
