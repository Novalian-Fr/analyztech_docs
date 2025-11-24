import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const CopyMarkdownButton = ({ generateMarkdown, tabName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const markdown = generateMarkdown();
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="copy-markdown-button"
      title={`Copy ${tabName} documentation as Markdown`}
    >
      {copied ? (
        <>
          <Check size={18} />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy size={18} />
          <span>Copy as Markdown</span>
        </>
      )}
    </button>
  );
};

export default CopyMarkdownButton;
