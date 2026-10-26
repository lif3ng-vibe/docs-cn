import React from 'react';
import Link from '@docusaurus/Link';
import {IconAgent} from './icons';
import {track} from './shared';
import styles from './usecases.module.css';

// A one-line pointer for readers who would rather hand the setup to a coding
// agent: where the prompts and skills live, and where the markdown starts.
export default function AgentBand({source = 'docs-home'}) {
  return (
    <aside className={styles.agentBand}>
      <IconAgent size={18} />
      <p className={styles.agentText}>
        <strong>你在用编码 Agent 吗？</strong>可以复制下方任一产品的 Agent 提示词，也可以从{' '}
        <Link to="/docs/agent_resources" onClick={() => track('docs_agent_band', {target: 'agent_resources', source})}>
          Agent 资源
        </Link>{' '}
        与{' '}
        <Link to="https://docs.litellm.ai/llms.txt" onClick={() => track('docs_agent_band', {target: 'llms_txt', source})}>
          llms.txt
        </Link>{' '}
        开始。
      </p>
    </aside>
  );
}
