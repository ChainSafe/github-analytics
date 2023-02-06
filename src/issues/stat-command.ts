import fs from "fs";
import humanDuration from "humanize-duration";
import { median as _median } from "mathjs";
import moment from "moment";
import { Issue } from "../entity";
import { fetchAllIssues } from "../github";
import { isTeamMember } from "../util";

interface StatCommandOptions {
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

  const teamMembers: string[] = options.teamMembers?.toLowerCase().split(",") ?? [];
  process.stdout.write(JSON.stringify(createStat(issues, teamMembers), undefined, 2));
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
export function createStat(issues: Issue[], teamMembers: string[]): GithubAnalytics {
  const externalIssues = issues.filter((i) => !isTeamMember(teamMembers, i.author));
  const closedIssues = externalIssues.filter((i) => i.closedAt != undefined);
  const issueResponseTimes = externalIssues.map((i) => {
    const comment = i.comments.find((c) => isTeamMember(teamMembers, c.author));
    if (comment) {
      return moment(comment.createdAt).diff(moment(i.createdAt), "milliseconds");
    } else {
      const end = i.closedAt ? moment(i.closedAt) : moment();
      return end.diff(moment(i.createdAt), "milliseconds");
    }
  });
  const closeTimes = closedIssues.map((i) => {
    return moment(i.createdAt).diff(moment(i.closedAt), "milliseconds");
  });
  return {
    issues: {
      issueCount: issues.length + " issues",
      externalIssueCount: externalIssues.length + " issues",
      externalIssueClosedCount: closedIssues.length + " issues",
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
