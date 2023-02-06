/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import fs from "fs";
import humanDuration from "humanize-duration";
import { median as _median } from "mathjs";
import moment from "moment";
import { PullRequest } from "../entity";
import { fetchAllPullRequests } from "../github";
import { isBot, isTeamMember } from "../util";

interface StatCommandOptions {
  input: string | undefined;
  start: string | undefined;
  end: string | undefined;
  query: string | undefined;
  teamMembers: string | undefined;
}
export async function statCommand(options: StatCommandOptions): Promise<void> {
  let prs: PullRequest[] = [];

  if (options.query) {
    prs = await fetchAllPullRequests(options.query, options.start, options.end);
  } else if (options.input) {
    prs = createPullRequestsByLog(options.input);
  } else {
    console.error("You must specify either --query or --input");
    process.exit(1);
  }
  const teamMembers: string[] =
    options.teamMembers?.toLowerCase().split(",") ?? [];
  process.stdout.write(
    JSON.stringify(createStat(prs, teamMembers), undefined, 2)
  );
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
  };
}
export function createStat(
  prs: PullRequest[],
  teamMembers: string[]
): GithubAnalytics {
  prs = prs.filter((pr) => !isBot(pr.author));
  const externalPullRequests = prs.filter(
    (pr) => !isTeamMember(teamMembers, pr.author)
  );
  const mergedPrs = prs.filter((pr) => pr.mergedAt != undefined);
  const leadTimes = mergedPrs.map((pr) => pr.leadTimeSeconds);
  const timeToMerges = mergedPrs.map((pr) => pr.timeToMergeSeconds);
  const timeToMergeFromFirstReviews = mergedPrs
    .map((pr) => {
      const firstReview = pr.reviews.find((review) => {
        return isTeamMember(teamMembers, review.author);
      });
      const mergedAt = pr.mergedAt ? moment(pr.mergedAt) : moment();
      return firstReview
        ? mergedAt.diff(moment(firstReview.createdAt), "seconds")
        : undefined;
    })
    .filter((x): x is number => x !== undefined);
  const prResponseTime = prs
    .map((pr) => {
      const firstReview = pr.reviews.find((review) => {
        return isTeamMember(teamMembers, review.author);
      });
      return firstReview
        ? moment(firstReview.createdAt).diff(moment(pr.createdAt), "seconds")
        : undefined;
    })
    .filter((x): x is number => x !== undefined);
  return {
    pull_request: {
      pullRequestCount: String(prs.length) + " pull requests",
      externalPullRequestCount:
        String(externalPullRequests.length) + " pull requests",
      additionsAverage:
        String(Math.round(average(prs.map((pr) => pr.additions)))) + " lines",
      additionsMedian:
        Math.round(median(prs.map((pr) => pr.additions))).toString() + " lines",
      deletionsAverage:
        Math.round(average(prs.map((pr) => pr.deletions))).toString() +
        " lines",
      deletionsMedian:
        Math.round(median(prs.map((pr) => pr.deletions))).toString() + " lines",
      leadTimeAverage: humanDuration(Math.floor(average(leadTimes)) * 1000),
      leadTimeMedian: humanDuration(Math.floor(median(leadTimes)) * 1000),
      timeToMergeAverage: humanDuration(
        Math.floor(average(timeToMerges)) * 1000
      ),
      timeToMergeMedian: humanDuration(Math.floor(median(timeToMerges)) * 1000),
      timeToMergeFromFirstReviewAverage: humanDuration(
        Math.floor(average(timeToMergeFromFirstReviews)) * 1000
      ),
      timeToMergeFromFirstReviewMedian: humanDuration(
        Math.floor(median(timeToMergeFromFirstReviews)) * 1000
      ),
      responseTimeAverage: humanDuration(
        Math.floor(average(prResponseTime)) * 1000
      ),
    },
  };
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((prev, current) => prev + current) / numbers.length;
}

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return _median(numbers) as number;
}

export function createPullRequestsByLog(path: string): PullRequest[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const logs = JSON.parse(fs.readFileSync(path, "utf8"));

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return logs.map(
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
        p.closed,
        p.reviews
      )
  );
}
