import React from 'react';
import { Typography } from 'antd';
const { Text } = Typography;

// Simple Markdown parser for bold (**text**) and italics (*text*)
function parseMarkdown(text) {
  // Bold
  let parsed = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  // Italic
  parsed = parsed.replace(/\*(.*?)\*/g, '<i>$1</i>');
  // Newlines to <br/>
  parsed = parsed.replace(/\n/g, '<br/>');
  return parsed;
}

function parseSteps(content) {
  // Detecta pasos numerados (1. ... 2. ... 3. ...)
  const stepRegex = /^(\d+)\.[ \t]+(.+)/gm;
  const matches = [...content.matchAll(stepRegex)];
  if (matches.length > 1) {
    // Encuentra la primera línea de paso
    const firstStepIdx = content.split(/\n/).findIndex(line => /^\d+\.[ \t]+/.test(line));
    const lines = content.split(/\n/);
    const before = lines.slice(0, firstStepIdx).join('\n').trim();
    const steps = lines.slice(firstStepIdx)
      .map(line => {
        const match = line.match(/^\d+\.[ \t]+(.+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    return { type: 'ol', before, items: steps };
  }
  // Detecta listas con asteriscos
  const bulletRegex = /^\*\s+(.+)/gm;
  const bulletMatches = [...content.matchAll(bulletRegex)];
  if (bulletMatches.length > 0) {
    const lines = content.split(/\n/);
    const firstBulletIdx = lines.findIndex(line => /^\*\s+/.test(line));
    const before = lines.slice(0, firstBulletIdx).join('\n').trim();
    const bullets = lines.slice(firstBulletIdx)
      .map(line => {
        const match = line.match(/^\*\s+(.+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    return { type: 'ul', before, items: bullets };
  }
  return null;
}

const BotFormattedReply = ({ content }) => {
  const list = parseSteps(content);
  if (list) {
    return (
      <div>
        {list.before && (
          <Text style={{ color: 'inherit', fontSize: '15px', display: 'inline-block' }}>
            <span dangerouslySetInnerHTML={{ __html: parseMarkdown(list.before) }} />
            <br/>
          </Text>
        )}
        {list.type === 'ol' ? (
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {list.items.map((step, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                <span dangerouslySetInnerHTML={{ __html: parseMarkdown(step) }} />
              </li>
            ))}
          </ol>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {list.items.map((item, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>
                <span dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }} />
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  // Si no es lista, mostrar texto con formato Markdown
  return (
    <Text style={{ color: 'inherit', fontSize: '15px', display: 'inline-block' }}>
      <span dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }} />
    </Text>
  );
};

export default BotFormattedReply;