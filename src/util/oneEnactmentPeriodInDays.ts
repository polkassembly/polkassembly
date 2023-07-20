// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

interface IOneEnactmentPeriodInDays {
  [index: string]: number;
}

export const oneEnactmentPeriodInDays: IOneEnactmentPeriodInDays = {
	moonbase: 1,
	moonbeam: 7,
	moonriver: 7
};
