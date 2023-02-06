# Github Analytics

This is a tool to collect various Gtihub Analytics not currently tracked by GithHub.
Some of the things you could analyze are response times (time till first comment/review) for new issues and pull requests, the time required to merge PRs, and statistics on community-opened issues and pull requests.
It is useful to measure the productivity and health of your team as well as community support and usage.

Many thanks to `shibayu36` who created the initial implementation for pull request stats.

## Installation

```bash
npm install -g @chainsafe/github-analytics
yarn global add @chainsafe/github-analytics
```

## Usage

To use this tool, you will need to obtain Github Personal Access Token (PAT) which you can do by following [Github's instructions](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). The minimum required permissions are: repo(repo:status, public_repo), read:org, read:discussions.

### Issues stats

The following command aggregates Issues of web3.js and web3.js-chainlink-plugin which merged between `--start` and `--end`.  You can additionally filter Issues by the `--query` option.  See also <https://docs.github.com/en/github/searching-for-information-on-github/searching-issues-and-pull-requests> if you want to know what you can specify for `--query`

```bash
GITHUB_TOKEN=... ga issues stat --start="2023-01-01T00:00:00" --end="2023-02-01" --query="repo:web3/web3.js repo:chainsafe/web3.js-plugin-chainlink" --teamMembers=avkos,jdevcs,luu-alex,mconnelly8,Muhammad-Altabba,nikoulai,spacesailor24
```

output is

```json
{
 "issues": {
    "issueCount": "30 issues",
    "externalIssueCount": "11 issues",
    "externalIssueClosedCount": "4 issues",
    "responseTimeAverage": "2 weeks, 17 hours, 54 minutes, 51.9395454545021 seconds", //only external issues
    "responseTimeMedian": "6 days, 8 hours, 33 minutes, 1 second", //only external issues
    "timeToCloseAverage": "1 week, 4 days, 4 hours, 28 minutes, 55.75 seconds", //only external issues
    "timeToCloseMedian": "1 week, 2 days, 22 hours, 45 minutes, 30.5 seconds" //only external issues
  }
}
```

* response time: diff between an Issue created and the first comment by a team member
* timeToClose: diff between an Issue created and an Issue closed

#### log command

If you want to get raw information about PullRequests, you can use a `pr log` command.

### PullRequest stats

The following command aggregates PullRequests of web3.js and web3.js-chainlink-plugin which merged between `--start` and `--end`.  You can additionally filter PullRequests by the `--query` option.  See also <https://docs.github.com/en/github/searching-for-information-on-github/searching-issues-and-pull-requests> if you want to know what you can specify for `--query`

```bash
GITHUB_TOKEN=... ga pr stat --start="2023-01-01T00:00:00" --end="2023-02-01" --query="repo:web3/web3.js repo:chainsafe/web3.js-plugin-chainlink" --teamMembers=avkos,jdevcs,luu-alex,mconnelly8,Muhammad-Altabba,nikoulai,spacesailor24
```

output is

```json
{
  "pull_request": {
    "pullRequestCount": "34 pull requests",
    "externalPullRequestCount": "6 pull requests",
    "additionsAverage": "618 lines",
    "additionsMedian": "115 lines",
    "deletionsAverage": "1328 lines",
    "deletionsMedian": "25 lines",
    "leadTimeAverage": "5 days, 13 hours, 16 minutes, 12 seconds",
    "leadTimeMedian": "3 days, 5 hours, 50 minutes, 15 seconds",
    "timeToMergeAverage": "4 days, 22 hours, 51 minutes, 14 seconds",
    "timeToMergeMedian": "2 days, 7 hours, 17 minutes, 5 seconds",
    "timeToMergeFromFirstReviewAverage": "3 days, 4 hours, 58 minutes, 49 seconds",
    "timeToMergeFromFirstReviewMedian": "1 day, 7 hours, 14 minutes, 14 seconds",
    "responseTimeAverage": "2 days, 12 hours, 55 minutes, 59 seconds"
  }
}
```

* leadTime: diff between a first commit and a PullRequest merged date
* timeToMerge: diff between a PullRequest created and a PullRequest merged
* timeToMergeFromFirstReview: diff between a first review and a PullRequest merged.

If you want to know about leadTime and timeToMerge for details, See <https://sourcelevel.io/blog/5-metrics-engineering-managers-can-extract-from-pull-requests>

```bash
|------------- lead time ---------------------------------|
                |--- response time ---|
                |---------- time to merge ----------------|
-----------------------------------------------------------
^               ^                     ^                   ^
first commit    create PullRequest    first review        PullRequest merged
```

#### log command

If you want to get raw information about PullRequests, you can use `ga pr log` command.
