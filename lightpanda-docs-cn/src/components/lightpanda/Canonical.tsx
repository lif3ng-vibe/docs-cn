'use client'

import { siteDetails } from '@lightpanda/common/data/siteDetails'
import { useConfig } from 'nextra-theme-docs'
import { useEffect } from 'react'

export const Canonical = () => {
  const nextraConfig = useConfig()

  useEffect(() => {
    if (nextraConfig.normalizePagesResult) {
      /* Old school way because Next's Head component was not working */
      const { activeIndex, activePath } = nextraConfig.normalizePagesResult
      // route 已含镜像 basePath，剥掉后拼回原站 /docs 路径，canonical 指向原站权威页
      const route = activePath[activeIndex]?.route ?? ''
      const docsPath = route.replace(/^\/docs-cn\/lightpanda/, '')
      const href = `${siteDetails.siteUrl}/docs${docsPath}`
      const ogTitle = document.createElement('link')

      ogTitle.setAttribute('rel', 'canonical')
      ogTitle.setAttribute('href', href)

      document.head.appendChild(ogTitle)
      console.log(nextraConfig, nextraConfig.normalizePagesResult.activePath)
    }
  }, [nextraConfig])

  return <></>
}
