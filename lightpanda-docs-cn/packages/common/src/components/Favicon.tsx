// Stub of @lightpanda/common/components/Favicon — mirrors the live site's favicon links (CDN-hosted).
const CDN = 'https://cdn.lightpanda.io/website/assets/images/favicon'

export const Favicon = () => (
  <>
    <link rel="apple-touch-icon" sizes="57x57" href={`${CDN}/apple-icon-57x57.png`} />
    <link rel="apple-touch-icon" sizes="60x60" href={`${CDN}/apple-icon-60x60.png`} />
    <link rel="apple-touch-icon" sizes="72x72" href={`${CDN}/apple-icon-72x72.png`} />
    <link rel="apple-touch-icon" sizes="76x76" href={`${CDN}/apple-icon-76x76.png`} />
    <link rel="apple-touch-icon" sizes="114x114" href={`${CDN}/apple-icon-114x114.png`} />
    <link rel="apple-touch-icon" sizes="120x120" href={`${CDN}/apple-icon-120x120.png`} />
    <link rel="apple-touch-icon" sizes="144x144" href={`${CDN}/apple-icon-144x144.png`} />
    <link rel="apple-touch-icon" sizes="152x152" href={`${CDN}/apple-icon-152x152.png`} />
    <link rel="apple-touch-icon" sizes="180x180" href={`${CDN}/apple-icon-180x180.png`} />
    <link rel="icon" type="image/png" sizes="192x192" href={`${CDN}/android-icon-192x192.png`} />
    <link rel="icon" type="image/png" sizes="32x32" href={`${CDN}/favicon-32x32.png`} />
    <link rel="icon" type="image/png" sizes="96x96" href={`${CDN}/favicon-96x96.png`} />
  </>
)
