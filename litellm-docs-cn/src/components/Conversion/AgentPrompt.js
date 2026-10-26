import React, {useId, useState} from 'react';
import clsx from 'clsx';
import {PROMPTS} from './content';
import {IconAgent, IconCheck, IconCopy} from './icons';
import {track, useCopy} from './shared';
import styles from './styles.module.css';

// A copyable prompt for Claude Code, Codex, Cursor, or any coding agent.
// Collapsed it shows the first lines with a fade; the copy button always
// copies the whole prompt.
export default function AgentPrompt({id, title, text, defaultOpen = false, compact = false}) {
  const prompt = PROMPTS[id] || {};
  const body = text || prompt.text || '';
  const heading = title || prompt.title || 'Agent 提示词';
  const [open, setOpen] = useState(defaultOpen);
  const [copied, copy] = useCopy();
  const bodyId = useId();

  return (
    <div className={clsx(styles.prompt, compact && styles.promptCompact)}>
      <div className={styles.promptHead}>
        <span className={styles.promptIcon}>
          <IconAgent size={18} />
        </span>
        <span className={styles.promptTitle}>
          {heading}
        </span>
        <button
          type="button"
          className={clsx(styles.btnGhost, copied && styles.btnDone)}
          onClick={() => {
            copy(body);
            track('docs_agent_prompt_copied', {prompt: id || heading});
          }}
          aria-label={copied ? '提示词已复制' : `复制 Agent 提示词：${heading}`}>
          {copied ? <IconCheck /> : <IconCopy />}
          <span>{copied ? '已复制' : '复制 Agent 提示词'}</span>
        </button>
      </div>
      <div id={bodyId} className={clsx(styles.promptBody, open && styles.promptBodyOpen)}>
        <pre className={styles.promptText}>{body}</pre>
        <button
          type="button"
          className={clsx(styles.showMore, open && styles.showLess)}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={bodyId}>
          {open ? '收起' : '展开完整提示词'}
        </button>
      </div>
    </div>
  );
}
