import { ApplicationFunction } from 'probot'
import { bundleFiles } from './bundle'
import express from 'express'
import OpenApiChecks from './checks'
import { components } from '@octokit/openapi-types'

export const OpenApiBundleProbot: ApplicationFunction = (
  app,
  { getRouter }
) => {
  router(app, { getRouter })
  app.load(OpenApiChecks)
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

const router: ApplicationFunction = (app, { getRouter }) => {
  console.log(getRouter)
  if (getRouter) {
    const router = getRouter('/app')

    // Use any middleware
    router.use(express.static('public'))

    // Add a new route
    router.get('/bundle', async (req, res) => {
      try {
        app.log(req.query)
        console.log(req.query)
        // console.log(req)

        const { installation, repo, branch, owner } = req.query as {
          installation: string
          repo: string
          branch: string
          owner: string
        }

        const octokit = await app.auth(Number.parseInt(installation))
        const { data: branchData } = await octokit.repos.getBranch({
          repo: repo,
          owner: owner,
          branch: branch,
        })
        app.log(branchData)

        const { data: treeData } = await octokit.git.getTree({
          repo: repo,
          owner: owner,
          recursive: '3',
          tree_sha: branchData.commit.sha,
        })
        // app.log(treeData)

        res.send(treeData)

        const files = await Promise.all(
          treeData.tree
            .filter((x) => x.type == 'blob')
            .filter((x) => x.path && x.path.endsWith('.openapi.yaml'))
            .map((x) =>
              octokit.repos.getContent({
                path: x.path as string,
                repo,
                owner,
              })
            )
            .map(async (task) => {
              const { data } = await task
              const { download_url, name } =
                data as components['schemas']['content-file']
              return { raw_url: download_url as string, filename: name }
            })
        )
        // .map((x) => x.data)
        // .map((x) => {
        //   const { download_url, name } = x.data
        //   return { raw_url: download_url, filename: name }
        // })

        // const { data: checksData } = await octokit.checks.create({
        //   owner,
        //   repo,
        //   name: 'OAI Linting',
        //   head_sha: branchData.commit.sha,
        //   status: 'queued',
        //   started_at: new Date(),
        // })

        // app.log(checksData)
        // console.log(`Check Run Id - ${checksData.id}`)

        bundleFiles({
          octokit,
          repo,
          owner,
          ref: `heads/${branch}`,
          files: files,
        })
      } catch (e) {
        console.log(e)
        res.send(JSON.stringify(e, null, 2))
      }
    })
  }
}
