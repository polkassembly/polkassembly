// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useContext } from 'react';

import { ApiContext } from './ApiContext';
import { ModalContext } from './ModalContext';
// import { NetworkContext } from './NetworkContext';
import { PostDataContext } from './PostDataContext';
import { CommentsDataContext } from './CommentDataContext';
import { QuoteCommentContext } from './QuoteCommentContext';
import { PeopleChainApiContext } from './PeopleChainApiContext';

const useModalContext = () => {
	return useContext(ModalContext);
};

const useApiContext = () => {
	return useContext(ApiContext);
};

function usePostDataContext() {
	return useContext(PostDataContext);
}

function useCommentDataContext() {
	return useContext(CommentsDataContext);
}

function useQuoteCommentContext() {
	return useContext(QuoteCommentContext);
}

function usePeopleChainApiContext() {
	return useContext(PeopleChainApiContext);
}

export { useModalContext, useApiContext, usePostDataContext, useCommentDataContext, useQuoteCommentContext, usePeopleChainApiContext };
