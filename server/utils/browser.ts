import { createError } from 'h3'

/** Playwright stays out of the Vercel bundle. The GitHub Action installs it for the crawler. */
export async function launchBrowser(options: Record<string, unknown>) {
  if (process.env.VERCEL || process.env.NETLIFY) {
    throw createError({
      statusCode: 501,
      message: 'Scraping runs in the GitHub Action, not on the web server.'
    })
  }

  const specifier = 'playwright'
  const mod = (await import(/* @vite-ignore */ specifier)) as {
    chromium: { launch: (opts: Record<string, unknown>) => Promise<{ close: () => Promise<void> }> }
  }
  return mod.chromium.launch(options)
}
