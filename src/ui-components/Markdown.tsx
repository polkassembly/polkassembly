// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import styled from 'styled-components';
import remarkGfm from 'remark-gfm';

interface Props {
	className?: string;
	isPreview?: boolean;
	md: string;
}

const Markdown = ({ className, isPreview=false, md }: Props) => {
	return <ReactMarkdown
		className={isPreview ? `${className} mde-preview-content` : className}
		rehypePlugins={[rehypeRaw, remarkGfm]}
		linkTarget='_blank'
	>
		{md}
	</ReactMarkdown>;
};

export default styled(Markdown)`
	table, th, td {
		border: 1px solid;
		padding: 0.5rem;
	}

	&, &.mde-preview-content {
		font-size: 15px;
		margin-bottom: 0;
		overflow-wrap: break-word;

		p, blockquote, ul, ol, dl, table {
			line-height: 160%;
			margin: 0 0 0.5rem 0;
			color: #243A57 !important;
			font-weight: 500 !important;
			font-size: 14px !important;
		}

		h1 {
			font-size: 1.5rem;
			margin-bottom: 2rem;
		}

		h2 {
			font-size: 1.3rem;
			margin: 2rem 0 1rem 0;
		}

		h3, h4 {
			font-size: 1.2rem;
			margin-bottom: 0.8rem;
		}

		ul, ol {
			padding-left: 2rem;

			li {
				padding-left: 0.8rem;
				margin-bottom: 1.2rem;
			}

			li > input {
				display: none;
			}
		}

		a {
			color: pink_primary !important;

			&:hover {
				text-decoration: none;
				color: pink_secondary;
			}
		}

		blockquote {
			margin: 1rem 0;
			padding: 0 1em;
			color: grey_primary;
			border-left-style: solid;
			border-left-width: 0.25rem;
			border-left-color: grey_primary;
			font-size: 0.9rem;
				& > :first-child {
					margin-top: 0;
				}
				& > :last-child {
					margin-bottom: 0;
				}
		}

		img {
			max-width: 100%;
			margin: 2rem 0;
		}

		pre {
			background-color: grey_light;
			padding: 1.6rem;
			overflow: auto;
			border-radius: 0.3rem;
		}

		code {
			font-size: 12px;
			margin: 0;
			border-radius: 3px;
			color: #c7254e;
			white-space: pre-wrap;
			&::before, &::after {
				letter-spacing: -0.2em;
			}
			margin-bottom: -6px; //offset for horizontal scrollbar
			padding-left: 4px;
			padding-right: 4px;
			background-color: #fbfbfd;
		}
	}

	&.mde-preview-content {

		h1, h2, h3, h4 {
			border-bottom: none;
		}

		h1, h2 {
			font-size: 1.3rem;
			font-weight: 400;
		}

		h3, h4 {
			font-size: 1.2rem;
			font-weight: 500;
		}

		h3 {
			font-family: font_default !important;
		}
	}
`;
