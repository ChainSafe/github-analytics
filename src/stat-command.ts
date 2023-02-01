import fs from "fs";
import { PullRequest } from "./entity";
import { uniq } from "underscore";
import { median as _median } from "mathjs";
import { fetchAllMergedPullRequests } from "./github";
import humanDuration from "humanize-duration";

interface StatCommandOptions {
  input: string | undefined;
  start: string | undefined;
  end: string | undefined;
  query: string | undefined;
}
export async function statCommand(options: StatCommandOptions): Promise<void> {
  let prs: PullRequest[] = [];

  if (options.query) {
    prs = await fetchAllMergedPullRequests(options.query, options.start, options.end);
  } else if (options.input) {
    prs = createPullRequestsByLog(options.input);
  } else {
    console.error("You must specify either --query or --input");
    process.exit(1);
  }

  process.stdout.write(JSON.stringify(createStat(prs), undefined, 2));
}

interface PullRequestStat {
  count: number;
  authorCount: number;
  additionsAverage: number;
  additionsMedian: number;
  deletionsAverage: number;
  deletionsMedian: number;
  leadTimeSecondsAverage: string;
  leadTimeSecondsMedian: string;
  timeToMergeSecondsAverage: string;
  timeToMergeSecondsMedian: string;
  timeToMergeFromFirstReviewSecondsAverage: string;
  timeToMergeFromFirstReviewSecondsMedian: string;
  responseTimeAverage: string;
  responseTimeMedian: string;
}
export function createStat(prs: PullRequest[]): PullRequestStat {
  const leadTimes = prs.map((pr) => pr.leadTimeSeconds);
  const timeToMerges = prs.map((pr) => pr.timeToMergeSeconds);
  const timeToMergeFromFirstReviews = prs
    .map((pr) => pr.timeToMergeFromFirstReviewSeconds)
    .filter((x): x is number => x !== undefined);
  const responseTimes = prs.map((pr) => pr.responseTimeSeconds).filter((x): x is number => x !== undefined);

  return {
    count: prs.length,
    authorCount: uniq(prs.map((pr) => pr.author)).length,
    additionsAverage: average(prs.map((pr) => pr.additions)),
    additionsMedian: median(prs.map((pr) => pr.additions)),
    deletionsAverage: average(prs.map((pr) => pr.deletions)),
    deletionsMedian: median(prs.map((pr) => pr.deletions)),
    leadTimeSecondsAverage: humanDuration(Math.floor(average(leadTimes)) * 1000),
    leadTimeSecondsMedian: humanDuration(Math.floor(median(leadTimes)) * 1000),
    timeToMergeSecondsAverage: humanDuration(Math.floor(average(timeToMerges)) * 1000),
    timeToMergeSecondsMedian: humanDuration(Math.floor(median(timeToMerges)) * 1000),
    timeToMergeFromFirstReviewSecondsAverage: humanDuration(Math.floor(average(timeToMergeFromFirstReviews)) * 1000),
    timeToMergeFromFirstReviewSecondsMedian: humanDuration(Math.floor(median(timeToMergeFromFirstReviews)) * 1000),
    responseTimeAverage: humanDuration(Math.floor(average(responseTimes)) * 1000),
    responseTimeMedian: humanDuration(Math.floor(median(responseTimes)) * 1000),
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

export function createPullRequestsByLog(path: string): PullRequest[] {
  const logs = JSON.parse(fs.readFileSync(path, "utf8"));
  return logs.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        p.firstReviewedAt
      )
  );
}
