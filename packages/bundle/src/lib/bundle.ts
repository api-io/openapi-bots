import { loadConfig, bundle, NormalizedProblem } from '@redocly/openapi-core'
import { ProbotOctokit } from 'probot'
import { title } from 'process'
import * as yaml from 'js-yaml'

type Octokit = InstanceType<typeof ProbotOctokit>
/*
const groupByFiles = (problems : NormalizedProblem[]) => {
  const fileGroups: any = {};
  for (const problem of problems) {
    const absoluteRef = problem.location[0].source.absoluteRef; // TODO: multiple errors
    fileGroups[absoluteRef] = fileGroups[absoluteRef] || {
      fileProblems: [],
      ruleIdPad: 0,
      locationPad: 0
    };
    const mappedProblem = Object.assign(Object.assign({}, problem), {location: problem.location.map(getLineColLocation)});
    fileGroups[absoluteRef].fileProblems.push(mappedProblem);
    fileGroups[absoluteRef].ruleIdPad = Math.max(problem.ruleId.length, fileGroups[absoluteRef].ruleIdPad);
    fileGroups[absoluteRef].locationPad = Math.max(Math.max(... mappedProblem.location.map((loc) => `${
      loc.start.line
    }:${
      loc.start.col
    }`.length)), fileGroups[absoluteRef].locationPad);
  }
  return fileGroups;
};
*/

// function generateAnnotations(problems: NormalizedProblem[]) :  {
// return problems.map(finding=> {
//     const line= getLineColLocation(finding.location[0]);
//     return
// {
//     path: finding.from?.source,
//     start_line: line.start.line,
//     end_line: line.end.line,
//     title: `${
//       finding.ruleId
//     } - ${
//       location.pointer
//     }`,
//     message: finding.message,
//     annotation_level: finding.severity === 'error'
//       ? 'failure'
//       : finding.severity == 'warn'
//         ? 'warning'
//         : 'notice'
// }});

// }

function generateSummary(problems: NormalizedProblem[]) {
  const messages = []
  if (problems.filter((a) => a.severity == 'error').length > 0) {
    messages.push(
      `${problems.filter((a) => a.severity == 'error').length} failure(s) found`
    )
  }
  if (problems.filter((a) => a.severity == 'warn').length > 0) {
    messages.push(
      `${problems.filter((a) => a.severity == 'warn').length} warn(s) found`
    )
  }

  return messages.join('\n')
}

type PromiseReturnType<T> = T extends Promise<infer Return> ? Return : T

type BundleRespnse = PromiseReturnType<ReturnType<typeof bundle>>

export async function bundleFiles({
  octokit,
  repo,
  owner,
  ref,
  files,
}: {
  octokit: Octokit
  repo: string
  owner: string
  ref: string
  files: { raw_url: string; filename: string }[]
}): Promise<void> {
  const config = await loadConfig({ configPath: '.redocly.yaml' })

  const branch = `api-bundle-${Math.floor(Math.random() * 9999)}`

  const reference = await octokit.git.getRef({
    repo,
    owner,
    ref: ref,
  })

  // Create a branch
  await octokit.git.createRef({
    repo,
    owner,
    ref: `refs/heads/${branch}`,
    sha: reference.data.object.sha, // accesses the sha from the heads/master reference we got
  })

  const bundleStream = files.map(async (file) => {
    return {
      ...file,
      bundle: await bundle({ ref: file.raw_url, config }),
    }
  })

  for await (const bundled of bundleStream) {
    if (bundled.bundle.problems) {
      await reportIssues(octokit, owner, repo, ref, bundled)
    }

    // update bundle
    await octokit.repos.createOrUpdateFileContents({
      repo,
      owner,
      path: bundled.filename,
      message: `update bundled ${bundled.filename}`,
      content: Buffer.from(yaml.dump(bundled.bundle.bundle.parsed)).toString(
        'base64'
      ),
      branch, // the branch name we used when creating a Git reference
    })
  }

  await octokit.pulls.create({
    repo,
    owner,
    title: 'API Bundling',
    head: branch,
    base: ref,
    body: 'API bundling!',
    maintainer_can_modify: true,
  })
}

export async function reportIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  bundled: {
    bundle: BundleRespnse
    sha?: string
    filename?: string
    status?:
      | 'added'
      | 'removed'
      | 'changed'
      | 'renamed'
      | 'modified'
      | 'copied'
      | 'unchanged'
    additions?: number
    deletions?: number
    changes?: number
    blob_url?: string
    raw_url?: string
    contents_url?: string
    patch?: string | undefined
    previous_filename?: string | undefined
  }
): Promise<void> {
  const data = await octokit.checks.create({
    owner,
    repo,
    name: title,
    head_sha: ref,
    status: 'in_progress',
    started_at: new Date(),
  })
  const checkRunId = data.data.id

  console.log(`Check Run Id - ${checkRunId}`)

  try {
    await octokit.checks.update({
      owner,
      repo,
      name: data.data.name,
      check_run_id: checkRunId,
      status: 'completed',
      completed_at: new Date(),
      conclusion: 'failure',
      output: {
        title,
        summary: generateSummary(bundled.bundle.problems),
        annotations: bundled.bundle.problems,
      },
    })
  } catch {
    console.log('Unable to post annotation batch')
  }
}
