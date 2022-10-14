import { bundle } from '@redocly/openapi-core';
import { ProbotOctokit, ApplicationFunction } from 'probot';
declare type Octokit = InstanceType<typeof ProbotOctokit>;
export declare const OpenApiBundleProbot: ApplicationFunction;
declare type PromiseReturnType<T> = T extends Promise<infer Return> ? Return : T;
declare type BundleRespnse = PromiseReturnType<ReturnType<typeof bundle>>;
export declare function bundleFiles({ octokit, repo, owner, ref, files, }: {
    octokit: Octokit;
    repo: string;
    owner: string;
    ref: string;
    files: {
        raw_url: string;
        filename: string;
    }[];
}): Promise<void>;
export declare function reportIssues(octokit: Octokit, owner: string, repo: string, ref: string, bundled: {
    bundle: BundleRespnse;
    sha?: string;
    filename?: string;
    status?: 'added' | 'removed' | 'changed' | 'renamed' | 'modified' | 'copied' | 'unchanged';
    additions?: number;
    deletions?: number;
    changes?: number;
    blob_url?: string;
    raw_url?: string;
    contents_url?: string;
    patch?: string | undefined;
    previous_filename?: string | undefined;
}): Promise<void>;
export default OpenApiBundleProbot;
