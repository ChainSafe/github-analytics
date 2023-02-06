import { writeFileSync } from "fs";
import { fetchAllIssues } from "../github";

interface LogCommandOptions {
  output: string;
  start: string;
  end: string;
  query: string;
  format: string;
}
export async function logCommand(options: LogCommandOptions): Promise<void> {
  const issues = await fetchAllIssues(options.query, options.start, options.end);

  writeFileSync(options.output, JSON.stringify(issues, undefined, 2), { encoding: "utf-8" });
}
