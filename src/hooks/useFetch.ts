// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { useEffect, useReducer, useRef } from 'react';

interface State<T> {
  data?: T;
  error?: Error;
}

type Cache<T> = { [url: string]: T };

// discriminated union type
type Action<T> =
  | { type: 'loading' }
  | { type: 'fetched'; payload: T }
  | { type: 'error'; payload: Error };

function useFetch<T = unknown>(url?: string, options?: RequestInit): State<T> {
	const cache = useRef<Cache<T>>({});

	// Used to prevent state update if the component is unmounted
	const cancelRequest = useRef<boolean>(false);

	const initialState: State<T> = {
		data: undefined,
		error: undefined
	};

	// Keep state logic separated
	const fetchReducer = (state: State<T>, action: Action<T>): State<T> => {
		switch (action.type) {
		case 'loading':
			return { ...initialState };
		case 'fetched':
			return { ...initialState, data: action.payload };
		case 'error':
			return { ...initialState, error: action.payload };
		default:
			return state;
		}
	};

	const [state, dispatch] = useReducer(fetchReducer, initialState);

	useEffect(() => {
		// Do nothing if the url is not given
		if (!url) return;

		cancelRequest.current = false;

		const fetchData = async () => {
			dispatch({ type: 'loading' });

			// If a cache exists for this url, return it
			if (cache.current[url]) {
				dispatch({ payload: cache.current[url], type: 'fetched' });
				return;
			}

			try {
				const response = await fetch(url, options);
				if (!response.ok) {
					throw new Error(response.statusText);
				}

				const data = (await response.json()) as T;
				cache.current[url] = data;
				if (cancelRequest.current) return;

				dispatch({ payload: data, type: 'fetched' });
			} catch (error) {
				if (cancelRequest.current) return;

				dispatch({ payload: error as Error, type: 'error' });
			}
		};

		void fetchData();

		// Use the cleanup function for avoiding a possibly...
		// ...state update after the component was unmounted
		return () => {
			cancelRequest.current = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [url]);

	return state;
}

export default useFetch;
