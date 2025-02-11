import { convertHtmlToMarkdown } from "~src/util/htmlToMarkdown";

const htmlDetectionRegex = /<(br|p|div|span|h[1-6]|ul|ol|li|table|tr|td|th|img|a|strong|em|code|pre)\b[^>]*>|<\/[a-z]+>/i;

const isMixedContent = (content: string): boolean => {
	// Check for Markdown patterns
	const markdownPatterns = {
	  headers: /^#{1,6}\s/m,                    // Headers: # Header
	  links: /\[([^\]]+)\]\(([^)]+)\)/,        // Links: [text](url)
	  lists: /^[-*+]\s/m,                       // Lists: - item
	  emphasis: /[*_]{1,2}[^*_]+[*_]{1,2}/,    // Bold/Italic: *text* or _text_
	};
  
	// Check for HTML patterns
	const htmlPatterns = {
	  tags: /<(br|p|div|span|h[1-6]|ul|ol|li|table|tr|td|th|img|a|strong|em|code|pre)\b[^>]*>|<\/[a-z]+>/i,
	  entities: /&[a-z]+;|&#[0-9]+;/i
	};
  
	const hasMarkdown = Object.values(markdownPatterns).some(pattern => pattern.test(content));
	const hasHTML = Object.values(htmlPatterns).some(pattern => pattern.test(content));

	return hasMarkdown && hasHTML;
};



const getMarkdownContent = (content: string) => {
    if(isMixedContent(content)) {
        return content;
    }
    if(htmlDetectionRegex.test(content)) {
        return convertHtmlToMarkdown(content);
    }
    return content;
};

export default getMarkdownContent;
