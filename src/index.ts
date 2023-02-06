import { program } from "commander";
import * as prsCommands from "./prs";
import * as issuesCommands from "./issues";

async function main(): Promise<void> {
  program.version("0.1.0");
  program.name("ga");

  //prs
  const pr = program.command("pr");

  pr.command("stat", { isDefault: true })
    .option("--input <filepath>")
    .option("--start <date>")
    .option("--end <date>")
    .option("--query <search query>")
    .action(prsCommands.statCommand);

  pr.command("log")
    .requiredOption("--output <path>", "location where to output raw data in json")
    .requiredOption("--start <date>", "start date")
    .requiredOption("--end <date>", "end date")
    .requiredOption("--query <search query>", "query for github search")
    .action(prsCommands.logCommand);

  //issues
  const issues = program.command("issues").description("Github repository issues/discoussion stats");

  issues
    .command("stat", { isDefault: true })
    .option("--input <filepath>")
    .option("--start <date>")
    .option("--end <date>")
    .option("--query <search query>")
    .action(issuesCommands.statCommand);

  issues
    .command("log")
    .requiredOption("--output <path>", "location where to output raw data in json")
    .requiredOption("--start <date>", "start date")
    .requiredOption("--end <date>", "end date")
    .requiredOption("--query <search query>", "query for github search")
    .action(issuesCommands.logCommand);

  program.parse(process.argv);
}

main().catch((error) => console.error(error));
