/** 展示一张带淡出预览的提示卡片，附一个可访问的展开/收起按钮。 */
export const SetupPrompt = ({ children }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="setup-prompt" data-expanded={expanded}>
      <div className="setup-prompt-header">
        <span>智能体提示</span>
      </div>
      <div id="setup-prompt-content">{children}</div>
      <button
        type="button"
        className="setup-prompt-toggle"
        aria-expanded={expanded}
        aria-controls="setup-prompt-content"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? '收起' : '展开'}
      </button>
    </div>
  );
};