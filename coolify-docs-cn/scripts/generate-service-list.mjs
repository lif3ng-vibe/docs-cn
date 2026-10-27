import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { collectServices, root } from './services-data.mjs'

/**
 * Generate the service list JSON consumed by the Fumadocs service component.
 *
 * @returns {Promise<void>}
 */
async function generateServices() {
  const outputFile = path.join(root, 'src/generated/services.json')
  const services = await collectServices()

  await mkdir(path.dirname(outputFile), { recursive: true })
  await writeFile(outputFile, `${JSON.stringify(services, null, 2)}\n`)
  console.log(`Generated ${path.relative(root, outputFile)} with ${services.length} services.`)
}

generateServices().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
