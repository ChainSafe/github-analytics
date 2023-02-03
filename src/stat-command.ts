import fs from "fs";
import { Issue, PullRequest } from "./entity";
import { median as _median } from "mathjs";
import { fetchAllIssues, fetchAllPullRequests } from "./github";
import humanDuration from "humanize-duration";
import parseISO from "date-fns/parseISO";

interface StatCommandOptions {
  input: string | undefined;
  start: string | undefined;
  end: string | undefined;
  query: string | undefined;
}
export async function statCommand(options: StatCommandOptions): Promise<void> {
  let prs: PullRequest[] = [];
  let issues: Issue[] = [];

  if (options.query) {
    prs = await fetchAllPullRequests(options.query, options.start, options.end);
    issues = await fetchAllIssues(options.query, options.start, options.end);
  } else if (options.input) {
    ({ prs, issues } = createPullRequestsByLog(options.input));
  } else {
    console.error("You must specify either --query or --input");
    process.exit(1);
  }

  process.stdout.write(JSON.stringify(createStat(prs, issues), undefined, 2));
}

interface GithubAnalytics {
  pull_request: {
    pullRequestCount: string;
    externalPullRequestCount: string;
    additionsAverage: string;
    additionsMedian: string;
    deletionsAverage: string;
    deletionsMedian: string;
    leadTimeAverage: string;
    leadTimeMedian: string;
    timeToMergeAverage: string;
    timeToMergeMedian: string;
    timeToMergeFromFirstReviewAverage: string;
    timeToMergeFromFirstReviewMedian: string;
    responseTimeAverage: string;
    responseTimeMedian: string;
  };
  issues: {
    issueCount: string;
    externalIssueCount: string;
    closedIssueCount: string;
    responseTimeAverage: string;
    responseTimeMedian: string;
    timeToCloseAverage: string;
    timeToCloseMedian: string;
  };
}
export function createStat(prs: PullRequest[], issues: Issue[]): GithubAnalytics {
  const mergedPrs = prs.filter((pr) => pr.mergedAt != undefined);
  const leadTimes = mergedPrs.map((pr) => pr.leadTimeSeconds);
  const timeToMerges = mergedPrs.map((pr) => pr.timeToMergeSeconds);
  const timeToMergeFromFirstReviews = mergedPrs
    .map((pr) => pr.timeToMergeFromFirstReviewSeconds)
    .filter((x): x is number => x !== undefined);
  const prResponseTime = prs.map((pr) => pr.responseTimeSeconds).filter((x): x is number => x !== undefined);

  const closedIssues = issues.filter((i) => i.closedAt != undefined);
  const issueResponseTimes = issues.map((i) => {
    const comment = i.comments[0];
    if (comment) {
      return parseISO(comment.createdAt).getTime() - parseISO(i.createdAt).getTime();
    } else {
      return new Date().getTime() - parseISO(i.createdAt).getTime();
    }
  });
  const closeTimes = closedIssues.map((i) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return parseISO(i.closedAt!).getTime() - parseISO(i.createdAt).getTime();
  });
  return {
    issues: {
      issueCount: issues.length + " issues",
      externalIssueCount: issues.length + " issues",
      closedIssueCount: closedIssues.length + " issues",
      responseTimeAverage: humanDuration(average(issueResponseTimes)),
      responseTimeMedian: humanDuration(median(issueResponseTimes)),
      timeToCloseAverage: humanDuration(average(closeTimes)),
      timeToCloseMedian: humanDuration(median(closeTimes)),
    },
    pull_request: {
      pullRequestCount: prs.length + " pull requests",
      externalPullRequestCount: prs.length + " pull requests",
      additionsAverage: Math.round(average(prs.map((pr) => pr.additions))) + " lines",
      additionsMedian: Math.round(median(prs.map((pr) => pr.additions))) + " lines",
      deletionsAverage: Math.round(average(prs.map((pr) => pr.deletions))) + " lines",
      deletionsMedian: Math.round(median(prs.map((pr) => pr.deletions))) + " lines",
      leadTimeAverage: humanDuration(Math.floor(average(leadTimes)) * 1000),
      leadTimeMedian: humanDuration(Math.floor(median(leadTimes)) * 1000),
      timeToMergeAverage: humanDuration(Math.floor(average(timeToMerges)) * 1000),
      timeToMergeMedian: humanDuration(Math.floor(median(timeToMerges)) * 1000),
      timeToMergeFromFirstReviewAverage: humanDuration(Math.floor(average(timeToMergeFromFirstReviews)) * 1000),
      timeToMergeFromFirstReviewMedian: humanDuration(Math.floor(median(timeToMergeFromFirstReviews)) * 1000),
      responseTimeAverage: humanDuration(Math.floor(average(prResponseTime)) * 1000),
      responseTimeMedian: humanDuration(Math.floor(median(prResponseTime)) * 1000),
    },
  };
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((prev, current) => prev + current) / numbers.length;
}

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return _median(numbers);
}

export function createPullRequestsByLog(path: string): { issues: Issue[]; prs: PullRequest[] } {
  const logs = JSON.parse(fs.readFileSync(path, "utf8"));
  return {
    issues: logs.issues.map((i: any) => new Issue(i.title, i.author, i.url, i.createdAt, i.closedAt, i.comments)),
    prs: logs.prs.map(
      (p: any) =>
        new PullRequest(
          p.title,
          p.author,
          p.url,
          p.createdAt,
          p.mergedAt,
          p.additions,
          p.deletions,
          p.authoredDate,
          p.reviews
        )
    ),
  };
}
