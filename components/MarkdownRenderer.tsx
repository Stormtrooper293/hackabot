
import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const renderContent = () => {
    const lines = content.split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBlockContent = '';
    let inList = false;

    const flushList = (listItems: React.ReactNode[]) => {
      if (listItems.length > 0) {
        elements.push(<ul key={`list-${elements.length}`} className="list-disc list-inside space-y-1 my-2">{listItems}</ul>);
      }
      return [];
    };

    let listItems: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        if (!inCodeBlock) {
          elements.push(
            <pre key={`code-${elements.length}`} className="bg-slate-900 p-3 rounded-md text-sm text-amber-300 overflow-x-auto my-2">
              <code>{codeBlockContent.trim()}</code>
            </pre>
          );
          codeBlockContent = '';
        }
        continue;
      }

      if (inCodeBlock) {
        codeBlockContent += line + '\n';
        continue;
      }
      
      const formatLine = (text: string) => {
        return text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={index}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });
      };

      if (line.startsWith('# ')) {
        listItems = flushList(listItems);
        elements.push(<h1 key={i} className="text-2xl font-bold text-cyan-300 my-3">{formatLine(line.substring(2))}</h1>);
      } else if (line.startsWith('## ')) {
        listItems = flushList(listItems);
        elements.push(<h2 key={i} className="text-xl font-bold text-cyan-300 my-2">{formatLine(line.substring(3))}</h2>);
      } else if (line.startsWith('### ')) {
        listItems = flushList(listItems);
        elements.push(<h3 key={i} className="text-lg font-bold text-cyan-400 my-2">{formatLine(line.substring(4))}</h3>);
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        listItems.push(<li key={i}>{formatLine(line.substring(2))}</li>);
        inList = true;
      } else {
        listItems = flushList(listItems);
        inList = false;
        elements.push(<p key={i} className="my-1 whitespace-pre-wrap">{formatLine(line)}</p>);
      }
    }
    flushList(listItems);

    return elements;
  };

  return <div className="prose-styles">{renderContent()}</div>;
};

export default MarkdownRenderer;