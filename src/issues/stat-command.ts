import parseISO from "date-fns/parseISO";
import fs from "fs";
import humanDuration from "humanize-duration";
import { median as _median } from "mathjs";
import { Issue } from "../entity";
import { fetchAllIssues } from "../github";

interface StatCommandOptions {
  input: string | undefined;
  start: string | undefined;
  end: string | undefined;
  query: string | undefined;
}
export async function statCommand(options: StatCommandOptions): Promise<void> {
  let issues: Issue[] = [];

  if (options.query) {
    issues = await fetchAllIssues(options.query, options.start, options.end);
  } else if (options.input) {
    issues = createIssuesByLog(options.input);
  } else {
    console.error("You must specify either --query or --input");
    process.exit(1);
  }

  process.stdout.write(JSON.stringify(createStat(issues), undefined, 2));
}

interface GithubAnalytics {
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
export function createStat(issues: Issue[]): GithubAnalytics {
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

export function createIssuesByLog(path: string): Issue[] {
  const logs = JSON.parse(fs.readFileSync(path, "utf8"));
  return logs.map((i: any) => new Issue(i.title, i.author, i.url, i.createdAt, i.closedAt, i.comments));
}
