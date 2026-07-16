'use client';

interface Props { content: string; className?: string; }

export default function Markdown({ content, className = '' }: Props) {
  const html = content
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3 style="color:#9b8dff;font-size:0.78rem;font-weight:700;margin:0.75rem 0 0.3rem;text-transform:uppercase;letter-spacing:0.06em">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^(\d+)\. (.+)$/gm, '<li style="list-style:decimal;margin-left:1.2rem;color:#c0c0e0;font-size:0.875rem;line-height:1.7">$2</li>')
    .replace(/^[-•] (.+)$/gm, '<li style="list-style:disc;margin-left:1rem;color:#c0c0e0;font-size:0.875rem;line-height:1.7">$1</li>')
    .replace(/→/g, '<strong style="color:#7c6af7">→</strong>')
    .replace(/\n\n/g, '</p><p style="margin-bottom:0.5rem;color:#c0c0e0;font-size:0.875rem;line-height:1.7">')
    .replace(/\n/g, '<br/>');

  return (
    <div className={`prose-forge ${className}`}
      dangerouslySetInnerHTML={{ __html: `<p style="margin-bottom:0.5rem;color:#c0c0e0;font-size:0.875rem;line-height:1.7">${html}</p>` }} />
  );
}
