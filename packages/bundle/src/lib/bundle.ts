import {
  bundle,
  NormalizedProblem,
  RawConfig,
  createConfig,
} from '@redocly/openapi-core'
import { ProbotOctokit } from 'probot'
import { title } from 'process'
import * as yaml from 'js-yaml'
// import { components } from '@octokit/openapi-types'

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
type BundleWithError = BundleRespnse & { problems: BundleRespnse['problems'] }
type BundleWithNoError = BundleRespnse & { bundle: BundleRespnse['bundle'] }
type BundleOrError = BundleWithNoError | BundleWithError

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
  const config = await octokit.config.get<RawConfig>({
    path: '.redocly.yaml',
    owner: owner,
    repo: repo,
  })

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
      ...(await bumdle_file(file, config.config)),
    }
  })

  for await (const bundled of bundleStream) {
    if (hasProblems(bundled)) {
      await reportIssues(octokit, owner, repo, ref, bundled)
    }

    if (hasBundle(bundled)) {
      // update bundle
      await octokit.repos.createOrUpdateFileContents({
        repo,
        owner,
        path: bundled.filename,
        message: `update bundled ${bundled.filename}`,
        content: Buffer.from(yaml.dump(bundled.bundle.parsed)).toString(
          'base64'
        ),
        branch, // the branch name we used when creating a Git reference
      })
    }

    if (isError(bundled)) {
      console.log(bundled.error)
    }
  }

  await octokit.pulls.create({
    repo,
    owner,
    title: 'API Bundling',
    head: branch, //`heads/${branch}`
    base: ref.replace('heads/', ''),
    body: 'API bundling bot',
    maintainer_can_modify: true,
  })
}

async function bumdle_file(
  file: {
    raw_url: string
    filename: string
  },
  config: RawConfig
): Promise<BundleOrError | { error: unknown }> {
  try {
    return await bundle({
      ref: file.raw_url,
      config: await createConfig(config),
      keepUrlRefs: true,
    })
  } catch (error) {
    return { error }
  }
}

// bundle: {source:new Source(file.raw_url, file.raw_url }, parsed: undefined }
//   problems: [
//     {
//       message: error.message,
//       ruleId: '',
//       severity: 'warn',
//       location: [],
//       suggest: ['is it an API file?'],
//       ignored: true,
//     },
//   ],
// }
function hasProblems(
  bundle: BundleWithError | BundleWithNoError | { error: unknown }
): bundle is BundleWithError {
  return (
    (<BundleWithError>bundle).problems !== undefined &&
    (<BundleWithError>bundle).problems.length > 0
  )
}

function isError(
  bundle: BundleWithError | BundleWithNoError | { error: unknown }
): bundle is { error: unknown } {
  return (<{ error: unknown }>bundle).error !== undefined
}

function hasBundle(
  bundle: BundleWithError | BundleWithNoError | { error: unknown }
): bundle is BundleWithNoError {
  return (<BundleWithNoError>bundle).bundle !== undefined
}

export async function reportIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  ref: string,
  bundle: BundleOrError
): Promise<void> {
  const {
    data: { id, name },
  } = await octokit.checks.create({
    owner,
    repo,
    name: title,
    head_sha: ref,
    status: 'in_progress',
    started_at: new Date(),
  })

  try {
    await octokit.checks.update({
      owner,
      repo,
      name: name,
      check_run_id: id,
      status: 'completed',
      completed_at: new Date(),
      conclusion: 'failure',
      output: {
        title,
        summary: generateSummary(bundle.problems),
        annotations: bundle.problems.map(formatAnnotaion(bundle)),
      },
    })
  } catch (error) {
    console.log('Unable to post annotation batch')
    console.log(error)
  }
}
function formatAnnotaion(bundle: BundleWithError) {
  return (value: NormalizedProblem) => {
    return {
      path: bundle.bundle.source.absoluteRef,
      start_line: bundle.bundle.source
        .getLines()
        .indexOf(value.location[0].source.body),
      end_line: bundle.bundle.source
        .getLines()
        .indexOf(value.location[value.location.length - 1].source.body),
      annotation_level: value.severity,
      blob_href: bundle.bundle.source.absoluteRef,
      message: value.message,
      title: value.ruleId,
    }
  }
}
/*
components['schemas']['check-annotation']
 paths['/repos/{owner}/{repo}/check-runs']['post']['requestBody']['content']['application/json']['output']['annotations?']
 
 */
