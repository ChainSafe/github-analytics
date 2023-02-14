import fs from "fs";
import humanDuration from "humanize-duration";
import { median as _median } from "mathjs";
import moment from "moment";
import { Issue } from "../entity";
import { fetchAllIssues } from "../github";
import { isTeamMember } from "../util";

interface StatCommandOptions {
  human: boolean | undefined;
  input: string | undefined;
  start: string | undefined;
  end: string | undefined;
  query: string | undefined;
  teamMembers: string | undefined;
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

  const teamMembers: string[] =
    options.teamMembers?.toLowerCase().split(",") ?? [];
  process.stdout.write(
    JSON.stringify(createStat(issues, teamMembers, options.human ?? false), undefined, 2)
  );
}

interface GithubAnalytics {
  issues: {
    issueCount: string;
    externalIssueCount: string;
    externalIssueClosedCount: string;
    responseTimeAverage: string;
    responseTimeMedian: string;
    timeToCloseAverage: string;
    timeToCloseMedian: string;
  };
}
export function createStat(
  issues: Issue[],
  teamMembers: string[],
  human: boolean
): GithubAnalytics {
  const externalIssues = issues.filter(
    (i) => !isTeamMember(teamMembers, i.author)
  );
  const closedIssues = externalIssues.filter((i) => i.closedAt != undefined);
  const issueResponseTimes = externalIssues.map((i) => {
    const comment = i.comments.find((c) => isTeamMember(teamMembers, c.author));
    if (comment) {
      return moment(comment.createdAt).diff(
        moment(i.createdAt),
        "milliseconds"
      );
    } else {
      const end = i.closedAt ? moment(i.closedAt) : moment();
      return end.diff(moment(i.createdAt), "milliseconds");
    }
  });
  const closeTimes = closedIssues.map((i) => {
    return moment(i.closedAt).diff(moment(i.createdAt), "milliseconds");
  });
  if(human) {
    return {
      issues: {
        issueCount: String(issues.length) + " issues",
        externalIssueCount: String(externalIssues.length) + " issues",
        externalIssueClosedCount: String(closedIssues.length) + " issues",
        responseTimeAverage: humanDuration(average(issueResponseTimes)),
        responseTimeMedian: humanDuration(median(issueResponseTimes)),
        timeToCloseAverage: humanDuration(average(closeTimes)),
        timeToCloseMedian: humanDuration(median(closeTimes)),
      },
    };
  } else {
    return {
      issues: {
        issueCount: String(issues.length),
        externalIssueCount: String(externalIssues.length),
        externalIssueClosedCount: String(closedIssues.length),
        responseTimeAverage: String(average(issueResponseTimes)),
        responseTimeMedian: String(median(issueResponseTimes)),
        timeToCloseAverage: String(average(closeTimes)),
        timeToCloseMedian: String(median(closeTimes)),
      },
    };
  }
}

function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((prev, current) => prev + current) / numbers.length;
}

function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return _median(numbers) as number;
}

export function createIssuesByLog(path: string): Issue[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const logs = JSON.parse(fs.readFileSync(path, "utf8"));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return logs.map(
    (i: any) =>
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
      new Issue(i.title, i.author, i.url, i.createdAt, i.closedAt, i.comments)
  );
}
