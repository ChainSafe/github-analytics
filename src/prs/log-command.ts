import { writeFileSync } from "fs";
import { fetchAllPullRequests } from "../github";

interface LogCommandOptions {
  output: string;
  start: string;
  end: string;
  query: string;
  format: string;
}
export async function logCommand(options: LogCommandOptions): Promise<void> {
  const prs = await fetchAllPullRequests(
    options.query,
    options.start,
    options.end
  );

  writeFileSync(options.output, JSON.stringify(prs, undefined, 2), {
    encoding: "utf-8",
  });
}
