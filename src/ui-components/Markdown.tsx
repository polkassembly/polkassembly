// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import styled from 'styled-components';
import remarkGfm from 'remark-gfm';
import { useTheme } from 'next-themes';
import HighlightMenu from './HighlightMenu';

interface Props {
	className?: string;
	isPreview?: boolean;
	isAutoComplete?: boolean;
	md: string;
	imgHidden?: boolean;
	theme?: string;
	disableQuote?: boolean;
	isUsedInComments?: boolean;
}

const StyledMarkdown = styled(ReactMarkdown)`
	&,
	&.mde-preview-content {
		font-size: 14px;
		margin-bottom: 0;
		overflow-wrap: break-word;
		max-width: 100%;
		color: ${(props: any) => (props.theme == 'dark' ? 'white' : '#243A57')} !important;

		* {
			max-width: 100% !important;
			overflow-x: auto !important;
		}
		.hide-image img {
			display: none !important;
		}

		th,
		td {
			border: 1px solid;
			border-color: ${(props: any) => (props.theme == 'dark' ? 'white' : '#243A57')} !important;
			padding: 0.5rem;
		}

		hr {
			margin: 1rem 0;
		}

		p,
		span,
		blockquote,
		ul,
		ol,
		dl,
		table {
			line-height: 160%;
			margin: 0 0 0.5rem 0;
			color: ${(props: any) => (props.theme == 'dark' ? '#fff' : '#243A57')} !important;
			font-weight: ${(props: any) => (props.theme == 'dark' ? '300' : '500')} !important;
			border: ${(props: any) => (props.theme == 'dark' ? 'white' : '#243A57')} !important;
		}

		h1 {
			font-size: 1.5rem;
			margin-bottom: 2rem;
			display: table;
			vertical-align: center;
		}

		h2 {
			font-size: 1.3rem;
			margin: 2rem 0 1rem 0;
			font-weight: ${(props: any) => (props.theme == 'dark' ? '400' : '500')} !important;
			display: table;
			vertical-align: center;
		}

		h3,
		h4 {
			font-size: 1.2rem;
			margin-bottom: 0.8rem;
			font-weight: ${(props: any) => (props.theme == 'dark' ? '400' : '500')} !important;
			display: table;
			vertical-align: center;
		}

		ul,
		ol {
			padding-left: 2rem;
			font-weight: ${(props: any) => (props.theme == 'dark' ? '300' : '500')} !important;

			li {
				padding-left: 0.8rem;
				margin-bottom: 1.2rem;
				font-weight: ${(props: any) => (props.theme == 'dark' ? '300' : '500')} !important;
			}

			li > input {
				display: none;
			}
		}

		a {
			color: ${(props: any) => (props.theme == 'dark' ? '#FF60B5' : '#e5007a')} !important;

			&:hover {
				text-decoration: none;
				color: ${(props: any) => (props.theme == 'dark' ? '#FF60B5' : '#c40061')} !important;
			}
		}
		&.hide-blockquote blockquote {
			display: none !important;
		}
		&.hide-blockquote code {
			word-wrap: break-word;
			word-break: break-all;
			font-size: 12px;
			margin: 0;
			border-radius: 3px;
			white-space: pre-wrap;
			&::before,
			&::after {
				letter-spacing: -0.2em;
			}
			padding-left: 4px;
			padding-right: 4px;
			background-color: ${(props: any) => (props.theme === 'dark' ? '#222' : '#fbfbfd')} !important;
			color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#000')} !important;
		}
		&.hide-blockquote .quote {
			display: none !important;
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
			overflow-x: auto !important;
			margin: 2rem 0;
		}

		.comments-image p > img,
		.comments-image img {
			display: block;
			overflow-x: auto !important;
			margin: 0.5rem 0;
			object-fit: contain !important;
			width: 100% !important;
			height: auto !important;
			max-width: 100% !important;
		}

		pre {
			background-color: ${(props: any) => (props.theme === 'dark' ? '#2c2f32' : '#ebf0f5')} !important;
			overflow: auto;
			border-radius: 0.3rem;
		}

		code {
			font-size: 12px;
			margin: 0;
			border-radius: 3px;
			white-space: pre-wrap;
			&::before,
			&::after {
				letter-spacing: -0.2em;
			}

			padding-left: 4px;
			padding-right: 4px;
			background-color: ${(props: any) => (props.theme === 'dark' ? '#222' : '#fbfbfd')} !important;
			color: ${(props: any) => (props.theme === 'dark' ? '#fff' : '#000')} !important;
		}
		ol,
		ul {
			padding-left: 20px;
			list-style-position: inside;
		}

		ol {
			counter-reset: item;
			list-style-type: none;

			> li {
				counter-increment: item;
				margin-bottom: 0.5rem;

				&::before {
					content: counter(item) '. ';
					font-weight: bold;
				}
			}

			ul {
				list-style-type: none;
				counter-reset: sub-item 'a';

				li {
					display: list-item;
					counter-increment: sub-item;
					margin-bottom: 0.5rem;

					&::before {
						content: counter(sub-item, lower-alpha) '. ';
						margin-right: 5px;
					}

					&::marker {
						content: '';
					}
				}
			}
		}

		ul:not(ol ul) {
			list-style-type: disc;

			li::marker {
				font-size: 1em;
				color: ${(props: any) => (props.theme == 'dark' ? '#fff' : '#243A57')} !important;
			}
		}
	}

	&.mde-preview-content {
		h1,
		h2,
		h3,
		h4 {
			border-bottom: none;
		}

		h1,
		h2 {
			font-size: 1.3rem;
			font-weight: 400;
		}

		h3,
		h4 {
			font-size: 1.2rem;
			font-weight: 500;
		}

		h3 {
			font-family: font_default !important;
		}
		p mark {
			margin-top: -3px;
			margin-right: -2px;
			font-weight: 500;
			color: #000 !important;
		}
	}

	&.mde-autocomplete-content {
		margin-top: 4px !important;
		color: ${(props: any) => (props.theme === 'dark' ? '#fff' : ' var(--bodyBlue)')} !important;
		font-weight: 700;

		mark {
			margin-top: -3px;
			margin-right: -2px;
			font-weight: 500;
			color: #485f7d !important;
			background: none !important;
		}

		&:hover {
			color: pink_primary !important;
		}
	}
	@media (max-width: 600px) {
		.hide-blockquote code {
			font-size: 10px;
			padding: 2px;
		}
	}
`;

/* eslint-disable @next/next/no-img-element */
const CustomImage = ({ src = '', alt = '' }: { src?: string; alt?: string }) => (
	<img
		src={src}
		alt={alt || 'Image'}
		style={{
			display: 'block',
			maxHeight: '80vh',
			width: 'auto',
			maxWidth: '100%',
			objectFit: 'contain'
		}}
	/>
);

const Markdown = ({ className, isPreview = false, isAutoComplete = false, md, imgHidden = false, isUsedInComments = false, disableQuote = false }: Props) => {
	const sanitisedMd = md?.replace(/\\n/g, '\n');
	const { resolvedTheme: theme } = useTheme();
	const markdownRef = useRef<HTMLDivElement>(null);

	const [isSmallScreen, setIsSmallScreen] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsSmallScreen(window.innerWidth < 640);
		};
		handleResize();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	return (
		<div
			ref={markdownRef}
			className='selection:bg-[#B5D7FE] selection:text-blue-light-high dark:selection:bg-[#275C98] dark:selection:text-white'
		>
			<HighlightMenu
				markdownRef={markdownRef}
				isUsedInComments={isUsedInComments}
			/>
			<StyledMarkdown
				className={`${className} ${isPreview && 'mde-preview-content'} ${imgHidden && 'hide-image'} ${isUsedInComments && 'comments-image'} ${disableQuote && 'hide-blockquote'} ${
					isAutoComplete && 'mde-autocomplete-content'
				} dark-text-white w-full`}
				rehypePlugins={[rehypeRaw, remarkGfm]}
				linkTarget='_blank'
				theme={theme as any}
				components={isSmallScreen || isUsedInComments ? { img: CustomImage } : {}}
			>
				{sanitisedMd}
			</StyledMarkdown>
		</div>
	);
};

export default Markdown;
