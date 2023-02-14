import { program } from "commander";
import * as prsCommands from "./prs";
import * as issuesCommands from "./issues";

async function main(): Promise<void> {
  program.version("0.1.0");
  program.name("ga");

  //prs
  const pr = program.command("pr");

  pr.command("stat", { isDefault: true })
    .option("--human", "Display values in human friendly format", false)
    .option("--input <filepath>", "Location of file with raw data")
    .option("--start <date>", "Filters by date created. Format YYYY-MM-DD")
    .option("--end <date>", "Filters by date created. Format YYYY-MM-DD")
    .option(
      "--query <search query>",
      'Github search query for repositories. Example: "repo:microsoft/vscode repo:microsoft/TypeScript"'
    )
    .option(
      "--teamMembers <teamMembers>",
      "Comma separated github usernames of team members"
    )
    .action(prsCommands.statCommand);

  pr.command("log")
    .requiredOption(
      "--output <path>",
      "Location where to output raw data in json"
    )
    .requiredOption(
      "--start <date>",
      "Filters by date created. Format YYYY-MM-DD"
    )
    .requiredOption(
      "--end <date>",
      "Filters by date created. Format YYYY-MM-DD"
    )
    .requiredOption(
      "--query <search query>",
      'Github search query for repositories. Example: "repo:microsoft/vscode repo:microsoft/TypeScript"'
    )
    .action(prsCommands.logCommand);

  //issues
  const issues = program
    .command("issues")
    .description("Github repository issues/discoussion stats");

  issues
    .command("stat", { isDefault: true })
    .option("--human", "Display values in human friendly format", false)
    .option("--input <filepath>", "Location of file with raw data")
    .option("--start <date>", "Filters by date created. Format YYYY-MM-DD")
    .option("--end <date>", "Filters by date created. Format YYYY-MM-DD")
    .option(
      "--query <search query>",
      'Github search query for repositories. Example: "repo:microsoft/vscode repo:microsoft/TypeScript"'
    )
    .option(
      "--teamMembers <teamMembers>",
      "Comma separated github usernames of team members"
    )
    .action(issuesCommands.statCommand);

  issues
    .command("log")
    .requiredOption(
      "--output <path>",
      "Location where to output raw data in json"
    )
    .requiredOption(
      "--start <date>",
      "Filters by date created. Format YYYY-MM-DD"
    )
    .requiredOption(
      "--end <date>",
      "Filters by date created. Format YYYY-MM-DD"
    )
    .requiredOption(
      "--query <search query>",
      'Github search query for repositories. Example: "repo:microsoft/vscode repo:microsoft/TypeScript"'
    )
    .action(issuesCommands.logCommand);

  program.parse(process.argv);
}

main().catch((error) => console.error(error));
