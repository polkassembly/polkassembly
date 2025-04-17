// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import {
	MDXEditor,
	headingsPlugin,
	listsPlugin,
	thematicBreakPlugin,
	markdownShortcutPlugin,
	linkPlugin,
	imagePlugin,
	tablePlugin,
	codeBlockPlugin,
	codeMirrorPlugin,
	diffSourcePlugin,
	toolbarPlugin,
	BoldItalicUnderlineToggles,
	BlockTypeSelect,
	InsertTable,
	InsertThematicBreak,
	ListsToggle,
	CodeToggle,
	DiffSourceToggleWrapper,
	Separator,
	StrikeThroughSupSubToggles,
	MDXEditorMethods,
	ButtonWithTooltip,
	quotePlugin
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import classNames from 'classnames';
import { dmSans } from 'pages/_app';
import { MutableRefObject, useEffect, useState } from 'react';
import styled from 'styled-components';
import { IMG_BB_API_KEY } from '~src/global/apiKeys';
import { useUserDetailsSelector } from '~src/redux/selectors';
import { FileGifOutlined, EllipsisOutlined, FileImageOutlined, LinkOutlined } from '@ant-design/icons';
import Popover from '~src/basic-components/Popover';
import { useQuoteCommentContext } from '~src/context';
import algoliasearch from 'algoliasearch/lite';
import { useTheme } from 'next-themes';
import ImageUploadModal from './ImageUploadModal';
import GifUploadModal from './GifUploadModal';
import CreateLinkModal from './CreateLinkModal';

const ALGOLIA_APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
const ALGOLIA_SEARCH_API_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY;
export const algolia_client = algoliasearch(ALGOLIA_APP_ID || '', ALGOLIA_SEARCH_API_KEY || '');

interface EditorProps {
	className?: string;
	markdown: string;
	onChange: (markdown: string) => void;
	readOnly?: boolean;
	theme?: 'dark' | 'light';
	id: string;
	height?: number;
	autofocus?: boolean;
	isUsedInCreatePost?: boolean;
	editorRef: MutableRefObject<MDXEditorMethods | null>;
}
const MAX_MENTION_SUGGESTIONS = 6;

const InitializedMDXEditor = ({ markdown, onChange, readOnly = false, id, className, autofocus = false, isUsedInCreatePost = false, editorRef: ref, height }: EditorProps) => {
	const { resolvedTheme: theme } = useTheme();
	const { username } = useUserDetailsSelector();
	const { quotedText } = useQuoteCommentContext();
	const [isGifModalVisible, setIsGifModalVisible] = useState(false);
	const [isImageModalVisible, setIsImageModalVisible] = useState(false);
	const [isLinkModalVisible, setIsLinkModalVisible] = useState(false);

	useEffect(() => {
		if (quotedText) {
			ref.current?.insertMarkdown(`> ${quotedText}` || '');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [quotedText]);

	const imageUploadHandler = async (image: File): Promise<string> => {
		try {
			const formData = new FormData();
			formData.append('image', image, `${id}_${username}_${new Date().valueOf()}.jpg`);

			const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMG_BB_API_KEY}`, {
				body: formData,
				method: 'POST'
			});

			const result = await response.json();
			const url = result?.data?.url;

			if (!url) {
				throw new Error('Failed to upload image');
			}

			return url;
		} catch (error) {
			console.error('Error in uploading image: ', error);
			return '';
		}
	};

	const handleMentionSuggestions = (editor: MDXEditorMethods, textContent: string, cursorPosition: number, theme: string) => {
		const textBeforeCursor = textContent.substring(0, cursorPosition);
		const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

		// Remove any existing suggestion popover
		const existingPopover = document.querySelectorAll('.mention-suggestions');
		existingPopover.forEach((popover) => {
			if (popover) {
				popover.remove();
			}
		});

		// Remove any existing mention items
		const existingMentionItems = document.querySelectorAll('.mention-item');
		existingMentionItems.forEach((item) => {
			const popover = item.closest('.mention-suggestions');
			if (popover) {
				popover.remove();
			}
		});

		if (lastAtSymbol !== -1) {
			const searchText = textBeforeCursor.substring(lastAtSymbol + 1);
			if (searchText.length > 0) {
				const queries = [
					{
						indexName: 'polkassembly_users',
						params: {
							hitsPerPage: MAX_MENTION_SUGGESTIONS,
							restrictSearchableAttributes: ['username']
						},
						query: searchText
					},
					{
						indexName: 'polkassembly_addresses',
						params: {
							hitsPerPage: MAX_MENTION_SUGGESTIONS,
							restrictSearchableAttributes: ['address']
						},
						query: searchText
					}
				];

				algolia_client.search(queries, { strategy: 'none' }).then((hits) => {
					const usernameHits = hits.results[0]?.hits || [];
					const addressHits = hits.results[1]?.hits || [];

					const usernameResults = usernameHits.map((user: Record<string, any>) => ({
						text: `@${user.username}`,
						value: `[@${user.username}](/user/${user.username})`
					}));

					const addressResults = addressHits.map((user: Record<string, any>) => ({
						text: `@${user.address}`,
						value: `[@${user.address}](/address/${user.address})`
					}));

					const suggestions = [...usernameResults, ...addressResults];
					if (suggestions.length > 0) {
						// Show suggestions in a popover
						const popover = document.createElement('div');
						popover.className = 'mention-suggestions';
						popover.style.position = 'absolute';
						popover.style.backgroundColor = theme === 'dark' ? '#1C1D1F' : '#F5F6F8';
						popover.style.border = `1px solid ${theme === 'dark' ? 'var(--separatorDark)' : '#D2D8E0'}`;
						popover.style.borderRadius = '4px';
						popover.style.fontSize = '12px';
						popover.style.maxHeight = '150px';
						popover.style.overflowY = 'auto';
						popover.style.zIndex = '1000';
						popover.style.width = '250px';
						popover.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';

						suggestions.forEach((suggestion) => {
							const item = document.createElement('div');
							item.className = 'mention-item';
							item.style.padding = '8px 12px';
							item.style.cursor = 'pointer';
							item.style.color = theme === 'dark' ? '#ffffff' : 'var(--lightBlue)';
							item.style.transition = 'background-color 0.2s';
							item.textContent = suggestion.text;

							item.addEventListener('mouseover', () => {
								item.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#f3f4f6';
							});

							item.addEventListener('mouseout', () => {
								item.style.backgroundColor = 'transparent';
							});

							item.onclick = () => {
								// Get the current markdown content
								const currentContent = editor.getMarkdown();

								// Find the last @ symbol in the content
								const lastIndex = currentContent.lastIndexOf('@');
								if (lastIndex === -1) return;

								// Find the end of the @ mention (space or end of string)
								const endIndex = currentContent.indexOf(' ', lastIndex);
								const mentionEnd = endIndex === -1 ? currentContent.length : endIndex;

								// Add a space after the suggestion if there isn't one already
								const needsSpace = mentionEnd < currentContent.length && currentContent[mentionEnd] !== ' ';
								const spaceToAdd = needsSpace ? ' ' : '';

								// Replace the @mention with the suggestion
								const newContent = currentContent.substring(0, lastIndex) + suggestion.value + spaceToAdd + currentContent.substring(mentionEnd);

								// Update the editor content
								editor.setMarkdown(newContent);
								editor.focus();
								onChange(newContent);

								// Remove the popover
								popover.remove();
							};
							popover.appendChild(item);
						});

						// Position the popover relative to the cursor
						const selection = window.getSelection();
						if (selection && selection.rangeCount > 0) {
							const range = selection.getRangeAt(0);
							const rect = range.getBoundingClientRect();
							popover.style.top = `${rect.bottom + window.scrollY + 5}px`;
							popover.style.left = `${rect.left + window.scrollX}px`;

							// Add click outside handler
							const handleClickOutside = (e: MouseEvent) => {
								if (!popover.contains(e.target as Node)) {
									popover.remove();
									document.removeEventListener('click', handleClickOutside);
								}
							};

							document.addEventListener('click', handleClickOutside);
							document.body.appendChild(popover);
						}
					}
				});
			}
		}
	};

	// Add autocomplete functionality
	const handleChange = (newMarkdown: string) => {
		onChange(newMarkdown);
		const editor = ref.current;
		if (!editor) return;

		// Get the current selection from the editor
		const editorElement = document.querySelector('.mdxeditor');
		if (!editorElement) return;

		const selection = window.getSelection();
		if (!selection || !selection.rangeCount) return;

		const range = selection.getRangeAt(0);
		const container = range.startContainer;

		// Only process if we're in a text node
		if (container.nodeType !== Node.TEXT_NODE) return;

		const textContent = container.textContent || '';
		const cursorPosition = range.startOffset;

		handleMentionSuggestions(editor, textContent, cursorPosition, theme as string);
	};

	const ExtraTools = () => (
		<DiffSourceToggleWrapper>
			<div className='flex items-center gap-1'>
				<ListsToggle options={['bullet', 'number']} />
				<Separator />
				<InsertTable />
				<InsertThematicBreak />
				<Separator />
			</div>
		</DiffSourceToggleWrapper>
	);

	const toolbarContents = () => (
		<div className='flex items-center gap-1 md:gap-1'>
			<BoldItalicUnderlineToggles />
			<StrikeThroughSupSubToggles options={['Strikethrough']} />
			<CodeToggle />
			<Separator />
			<BlockTypeSelect />
			<Separator />
			<ButtonWithTooltip
				onClick={() => setIsLinkModalVisible(true)}
				title='Select Link'
			>
				<LinkOutlined className='mt-0.5 text-lg text-lightBlue dark:text-icon-dark-inactive' />
			</ButtonWithTooltip>

			<ButtonWithTooltip
				onClick={() => setIsImageModalVisible(true)}
				title='Select Image'
			>
				<FileImageOutlined className='mt-0.5 text-lg text-lightBlue dark:text-icon-dark-inactive' />
			</ButtonWithTooltip>
			<ButtonWithTooltip
				onClick={() => setIsGifModalVisible(true)}
				title='Select GIF'
			>
				<FileGifOutlined className='mt-0.5 text-lg text-lightBlue dark:text-icon-dark-inactive' />
			</ButtonWithTooltip>
			{!isUsedInCreatePost ? (
				<Popover
					content={<ExtraTools />}
					trigger='click'
					placement='bottom'
					arrow={false}
					className={classNames(className)}
					overlayClassName={className}
				>
					<ButtonWithTooltip title='More options'>
						<EllipsisOutlined className='text-xl text-lightBlue dark:text-icon-dark-inactive' />
					</ButtonWithTooltip>
				</Popover>
			) : (
				<ExtraTools />
			)}
		</div>
	);

	const plugins = [
		headingsPlugin(),
		listsPlugin(),
		thematicBreakPlugin(),
		markdownShortcutPlugin(),
		linkPlugin({ disableAutoLink: true }),
		quotePlugin(),
		imagePlugin({
			disableImageSettingsButton: true
		}),
		tablePlugin(),
		codeBlockPlugin(),
		codeMirrorPlugin(),
		diffSourcePlugin()
	];

	if (!readOnly) {
		plugins.push(
			toolbarPlugin({
				toolbarClassName: classNames(dmSans.className, dmSans.variable, 'toolbar '),
				toolbarContents: toolbarContents
			})
		);
	}

	return (
		<div className={classNames(theme === 'dark' ? 'dark-theme' : 'light-theme', className)}>
			<GifUploadModal
				className={className}
				editorRef={ref}
				setOpen={setIsGifModalVisible}
				isGifModalVisible={isGifModalVisible}
			/>
			<ImageUploadModal
				className={className}
				editorRef={ref}
				setOpen={setIsImageModalVisible}
				isImageModalVisible={isImageModalVisible}
				imageUploadHandler={imageUploadHandler}
			/>
			<CreateLinkModal
				className={className}
				editorRef={ref}
				setOpen={setIsLinkModalVisible}
				isLinkModalVisible={isLinkModalVisible}
			/>
			<MDXEditor
				markdown={markdown || ''}
				ref={ref}
				onChange={handleChange}
				readOnly={readOnly}
				className={classNames(
					className,
					dmSans.className,
					dmSans.variable,
					!readOnly
						? 'rounded-md border-[1px] border-solid border-section-light-container bg-transparent text-bodyBlue dark:border-separatorDark dark:bg-[#0d0d0d] dark:text-white'
						: ''
				)}
				// key={id}
				autoFocus={autofocus}
				contentEditableClassName={classNames(
					'max-w-full p-0',
					`min-h-[${height || 300}px]`,
					dmSans.className,
					dmSans.variable,
					theme === 'dark' ? 'prose-invert' : '',
					'focus:outline-none'
				)}
				plugins={plugins}
			/>
		</div>
	);
};

export default styled(InitializedMDXEditor)<{ theme?: 'dark' | 'light' }>`
	.mdxeditor {
		overflow-y: auto;
		p {
			margin-bottom: 8px;
			margin-top: 8px;
			font-weight: 400;
			line-height: 1.5;
		}
		h1,
		h2,
		h3,
		h4,
		h5,
		h6 {
			margin-bottom: 8px;
			margin-top: 8px;
			font-weight: 600;
			line-height: 1.5;
		}

		h1 {
			font-size: 1.5rem;
			line-height: 1.5;
			font-weight: 600;
			margin-bottom: 8px;
		}

		h2 {
			font-size: 1.25rem;
			line-height: 1.5;
			font-weight: 600;
			margin-bottom: 8px;
		}

		h3 {
			font-size: 1.125rem;
			line-height: 1.5;
			font-weight: 600;
			margin-bottom: 8px;
		}

		h4 {
			font-size: 1rem;
			line-height: 1.5;
			font-weight: 600;
			margin-bottom: 8px;
		}

		h5 {
			font-size: 0.875rem;
			line-height: 1.5;
			font-weight: 600;
			margin-bottom: 8px;
		}

		h6 {
			font-size: 0.75rem;
			line-height: 1.5;
			font-weight: 600;
			margin-bottom: 8px;
		}

		a {
			color: var(--pink_primary);
			text-decoration: none;
			margin-bottom: 8px;
		}

		ul,
		ol {
			margin-bottom: 8px;
			margin-top: 8px;
			padding-left: 24px;
		}

		ul {
			list-style-type: disc;
		}

		ol {
			list-style-type: decimal;
		}

		/* Nested list styling */
		ul ul,
		ol ul {
			margin-bottom: 4px;
			margin-top: 4px;
			list-style-type: circle;
		}

		ul ul ul,
		ol ul ul,
		ol ol ul,
		ul ol ul {
			list-style-type: square;
		}

		/* List items spacing */
		li {
			margin-bottom: 4px;
		}

		/* Task lists */
		li[data-checked='true'] {
			color: var(--pink_primary);
			text-decoration: line-through;
		}

		/* Ensure proper indentation for multi-line list items */
		li p {
			margin-bottom: 0px;
		}

		.mdxeditor-diff-source-wrapper {
			padding: 0px 1rem;
			color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
			height: ${({ height }) => (height ? `${height}px` : '300px')};
		}

		.cm-editor {
			background-color: transparent;
			color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
			height: ${({ height }) => (height ? `${height}px` : '300px')};
		}
		.cm-content {
			background-color: transparent;
		}
		[class*='_contentEditable'] {
			color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
		}

		h1 {
			font-size: 1.5rem;
			font-weight: 600;
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

		blockquote {
			border-left: 3px solid var(--pink_primary) !important;
			margin: 1rem 0;
			padding-left: 1rem;
			border-color: var(--pink_primary) !important;
			font-style: italic;
			color: ${({ theme }) => (theme === 'dark' ? '#F5F6F8' : 'var(--lightBlue)')};
			p {
				display: flex;
				align-items: center;
				margin-bottom: 0 !important;
				padding: 4px 0px !important;
			}
		}

		.toolbar {
			display: flex;
			flex-wrap: wrap;
			gap: 4px;
			align-items: center;
			margin-bottom: 1rem;
			background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
			border-bottom: 1px solid ${({ theme }) => (theme === 'dark' ? 'var(--separatorDark)' : '#D2D8E0')};
			button {
				padding: 4px;
				border-radius: 0px;
				display: flex;
				align-items: center;
				justify-content: center;
				cursor: pointer;

				&[aria-label='Block type'] {
					background-color: var(--pink_primary);
					color: white;
					border-radius: 0.25rem;
					width: 100px;
					padding: 4px 0rem 4px 8px;
					font-size: 12px;
					span {
						color: ${({ theme }) => (theme === 'dark' ? '#F5F6F8' : 'white')};
					}
				}

				svg {
					width: 1.25rem;
					height: 1.25rem;
					color: ${({ theme }) => (theme === 'dark' ? '#F5F6F8' : 'var(--lightBlue)')};
				}

				&:hover {
					background-color: var(--pink_primary);
					svg {
						color: white;
					}
				}
			}
		}

		[class*='_toolbarToggleItem'] {
			&[aria-checked='true'] {
				background-color: var(--pink_primary);
				color: white;
				svg {
					color: white;
				}
			}
		}

		.code-block {
			border-radius: 0.375rem;
			padding: 0.5rem;
			margin: 1rem 0;
			font-family: monospace;
			background-color: ${({ theme }) => (theme === 'dark' ? '#2d2d2d' : '#f9fafb')};
			border: 1px solid ${({ theme }) => (theme === 'dark' ? '#404040' : '#e5e7eb')};
		}

		table {
			border-collapse: collapse;
			width: 100%;
			margin: 1rem 0;

			th,
			td {
				border: 1px solid ${({ theme }) => (theme === 'dark' ? '#404040' : '#e5e7eb')};
				padding: 0.5rem;
			}
		}

		blockquote {
			border-left: 4px solid ${({ theme }) => (theme === 'dark' ? '#404040' : '#e5e7eb')};
			margin: 1rem 0;
			padding-left: 1rem;
			font-style: italic;
		}
	}

	@media (max-width: 768px) {
		.toolbar {
			padding: 0.25rem;
			gap: 0.25rem;
			button {
				padding: 2px;
				svg {
					width: 1rem;
					height: 1rem;
					color: ${({ theme }) => (theme === 'dark' ? '#F5F6F8' : 'var(--lightBlue)')};
				}

				&:hover {
					background-color: var(--pink_primary);
					svg {
						color: white;
					}
				}
			}
		}
	}

	[class*='_imageWrapper_uazmk_922'] {
		max-width: 90% !important;
		max-height: none !important;
		height: auto !important;
		resize: none !important;

		img {
			max-width: 90% !important;
		}
	}

	[class*='_linkDialogPopoverContent_uazmk_600'],
	[class*='_dialogContent_uazmk_602'] {
		// display: none;
		background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
		color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};

		h2 {
			color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
		}

		label {
			color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
		}

		input {
			background-color: transparent;
			border: 1px solid ${({ theme }) => (theme === 'dark' ? 'var(--separatorDark)' : '#D2D8E0')};
			color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
		}

		button {
			background-color: var(--pink_primary);
			color: white;
			border: none;
		}
		[class*='_secondaryButton'] {
			background-color: transparent;
			color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
			border: 1px solid ${({ theme }) => (theme === 'dark' ? 'var(--separatorDark)' : '#D2D8E0')};
		}
	}
	[class*='_selectContent'] {
		background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
	}

	// Select Item Styles
	[class*='_selectItem'] {
		background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};

		&[data-highlighted] {
			background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
		}
	}

	// Select Item Text Styles
	[class*='_selectItemText'] {
		background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
	}

	// Select Item Indicator Styles
	[class*='_selectItemIndicator'] {
		background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
	}

	.ant-popover-inner {
		background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
		border-color: ${({ theme }) => (theme === 'dark' ? 'var(--separatorDark)' : '#D2D8E0')};
		padding: 4px 8px;
		color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
	}
	.ant-popover-inner-content {
		color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
		font-size: 12px;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.ant-popover-arrow-content {
		background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
		color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};
	}

	.ant-popover-content {
		background-color: ${({ theme }) => (theme === 'dark' ? '#1C1D1F' : '#F5F6F8')};
		color: ${({ theme }) => (theme === 'dark' ? '#ffffff' : 'var(--lightBlue)')};

		button {
			justify-content: flex-start;
			padding: 0.25rem;
			border-radius: 0px;
			color: ${({ theme }) => (theme === 'dark' ? '#9E9E9E' : 'var(--lightBlue)')};

			&:hover {
				background-color: ${({ theme }) => (theme === 'dark' ? '#2a2a2a' : '#f3f4f6')};
			}
			svg {
				height: 1.25rem;
				width: 1.25rem;
			}
		}
	}
`;
