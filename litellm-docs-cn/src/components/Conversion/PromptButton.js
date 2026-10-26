import React from 'react';
import clsx from 'clsx';
import {PROMPTS} from './content';
import {IconAgent, IconCheck} from './icons';
import {track, useCopy} from './shared';
import styles from './transit.module.css';

// A small "Copy agent prompt" button for diagrams and maps: one click puts the
// prompt for that product on the clipboard, ready for Claude Code, Codex, or
// Cursor. The full prompt text lives in content.js and in the page markdown.
export default function PromptButton({id, source, label = '复制 Agent 提示词', size = 'sm', className}) {
  const prompt = PROMPTS[id];
  const [copied, copy] = useCopy();
  if (!prompt) return null;
  return (
    <button
      type="button"
      className={clsx(styles.promptBtn, size === 'md' && styles.promptBtnMd, copied && styles.promptBtnDone, className)}
      title={`${prompt.title}。可粘贴到 Claude Code、Codex、Cursor 或任何编码 Agent 中。`}
      aria-label={copied ? '提示词已复制' : `复制 Agent 提示词：${prompt.title}`}
      onClick={() => {
        copy(prompt.text);
        track('docs_agent_prompt_copied', {prompt: id, source});
      }}>
      {copied ? <IconCheck size={size === 'md' ? 16 : 14} /> : <IconAgent size={size === 'md' ? 16 : 14} />}
      <span>{copied ? '已复制' : label}</span>
    </button>
  );
}
