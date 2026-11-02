// Stub of @lightpanda/common/components/Version — client-rendered on the live site;
// renders a badge linking to browser releases.
'use client'

export const Version = () => (
  <a
    href="https://github.com/lightpanda-io/browser/releases"
    target="_blank"
    rel="noreferrer nofollower"
    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
    style={{ textDecoration: 'none' }}
  >
    Lightpanda browser releases
  </a>
)
