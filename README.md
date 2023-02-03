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

The following command aggregates PullRequests of microsoft/vscode and microsoft/TypesScript which merged between `--start` and `--end`.  You can filter PullRequests by `--query` option.  See also <https://docs.github.com/en/github/searching-for-information-on-github/searching-issues-and-pull-requests> if you want to know what you can specify for `--query`

```bash
GITHUB_TOKEN=... ga --start=2020-07-01T00:00:00 --end=2020-07-30T23:59:59 --query="repo:microsoft/vscode repo:microsoft/TypeScript"
```

output is

```json
{
  "count": 258,
  "authorCount": 77,
  "additionsAverage": 107.89147286821705,
  "additionsMedian": 19,
  "deletionsAverage": 41.97286821705426,
  "deletionsMedian": 3,
  "leadTimeSecondsAverage": 578271,
  "leadTimeSecondsMedian": 58163,
  "timeToMergeSecondsAverage": 735697,
  "timeToMergeSecondsMedian": 82453,
  "timeToMergeFromFirstReviewSecondsAverage": 426871,
  "timeToMergeFromFirstReviewSecondsMedian": 15432
}
```

* count: the number of merged PullRequests
* authorCount: the number of author who creates PullRequests
* additionsAverage: the average of number of added lines
* additionsMedian: the median of number of added lines
* deletionsAverage: the average of number of deleted lines
* deletionsMedian: the median of number of deleted lines
* leadTimeSecondsAverage: the average of seconds between a first commit date and a PullRequest merged date
* leadTimeSecondsMedian: the median of seconds between a first commit date and a PullRequest merged date
* timeToMergeSecondsAverage: the average of seconds between a PullRequest created and a PullRequest merged
* timeToMergeSecondsMedian: the median of seconds between a PullRequest created and a PullRequest merged
* timeToMergeFromFirstReviewSecondsAverage: the average of seconds between a first review  and a PullRequest merged.
* timeToMergeFromFirstReviewSecondsMedian: the median of seconds between a first review  and a PullRequest merged.

If you want to know about leadTime and timeToMerge for details, See https://sourcelevel.io/blog/5-metrics-engineering-managers-can-extract-from-pull-requests

```bash
|------------- lead time -------------|
                |--- time to merge ---|
---------------------------------------
^               ^                     ^
first commit    create PullRequest    merge PullRequest
```

### log command

If you want to get raw information about PullRequests, you can use `log` command.
Use the `--format` option if you need other formats (ex. csv).
