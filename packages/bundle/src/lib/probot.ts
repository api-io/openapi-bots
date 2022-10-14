import { ApplicationFunction } from 'probot'
import { bundleFiles } from './bundle'

export const OpenApiBundleProbot: ApplicationFunction = (app) => {
  app.on('push', async (context): Promise<string> => {
    const push = context.payload
    const repo = push.repository.name
    const owner = push.sender.login
    const octokit = context.octokit
    const ref = push.ref
    const compare = await octokit.repos.compareCommits(
      context.repo({ base: push.before, head: push.after })
    )
    const files = compare.data.files?.filter((a) =>
      a.filename.endsWith('.openapi')
    )

    if (!files) return 'no changes'
    files.map((x) => x.raw_url)
    await bundleFiles({ octokit, repo, owner, ref, files })
    return 'ok'
  })
}

export default OpenApiBundleProbot
