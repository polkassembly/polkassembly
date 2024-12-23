// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
'use client';

import { Context, createContext, Dispatch, PropsWithChildren, SetStateAction, useMemo, useState } from 'react';

export interface IQuoteCommentContext {
	quotedText: string;
	setQuotedText: Dispatch<SetStateAction<string>>;
}

export const QuoteCommentContext: Context<IQuoteCommentContext> = createContext({} as IQuoteCommentContext);

function QuoteCommentContextProvider({ children }: PropsWithChildren) {
	const [quotedText, setQuotedText] = useState('');

	const providerValue = useMemo(() => ({ quotedText, setQuotedText }), [quotedText, setQuotedText]);

	return <QuoteCommentContext.Provider value={providerValue}>{children}</QuoteCommentContext.Provider>;
}

export default QuoteCommentContextProvider;
