import React from 'react';
import clsx from 'clsx';
import {IconCheck, IconCopy} from './icons';
import {track, useCopy} from './shared';
import styles from './styles.module.css';

// A single copyable command on the dark terminal surface.
export default function Command({code, note, id, small = false}) {
  const [copied, copy] = useCopy();
  return (
    <div className={clsx(styles.terminal, small && styles.terminalSmall)}>
      {note && <div className={styles.termComment}># {note}</div>}
      <pre className={styles.termCode}>
        {code.split('\n').map((line, i) => (
          <span key={i} className={styles.termLine}>
            <span className={styles.termPrompt} aria-hidden="true">
              {/^\s|^-/.test(line) ? ' ' : '$'}
            </span>
            {line}
            {'\n'}
          </span>
        ))}
      </pre>
      <button
        type="button"
        className={clsx(styles.termCopy, copied && styles.termCopyDone)}
        onClick={() => {
          copy(code);
          track('docs_install_copied', {command: id || code.slice(0, 40)});
        }}
        aria-label={copied ? '命令已复制' : '复制命令'}>
        {copied ? <IconCheck /> : <IconCopy />}
        <span>{copied ? '已复制' : '复制'}</span>
      </button>
    </div>
  );
}
