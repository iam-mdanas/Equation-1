/**
 * EQUATION 1 — Mathematical Expression Renderer
 * Renders LaTeX equations using KaTeX.
 */

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  displayMode?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  math,
  displayMode = false,
  className = '',
}) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode,
        throwOnError: false,
        output: 'html',
      });
    } catch (err) {
      console.warn('KaTeX render error:', err);
      return `<span class="text-rose-400 font-mono text-xs">${math}</span>`;
    }
  }, [math, displayMode]);

  return (
    <span
      className={`inline-block select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
