$env:DOCS_SITE = 'https://lif3ng-vibe.github.io'
$env:DOCS_BASE = '/docs-cn/gstack/'
Set-Location $PSScriptRoot\..
npm run build *> build-base.log
Get-Content build-base.log -Tail 2
