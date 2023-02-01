import { parseISO } from "date-fns";

export class PullRequest {
  public leadTimeSeconds: number;
  public responseTimeSeconds: number|undefined;
  public timeToMergeSeconds: number;
  public timeToMergeFromFirstReviewSeconds: number | undefined;

  constructor(
    public title: string,
    public author: string | undefined,
    public url: string,
    public createdAt: string,
    public mergedAt: string,
    public additions: number,
    public deletions: number,
    public authoredDate: string,
    public firstReviewedAt: string | undefined
  ) {
    const mergedAtMillis = parseISO(this.mergedAt).getTime();
    this.responseTimeSeconds = this.firstReviewedAt
    ? (parseISO(this.firstReviewedAt).getTime() - parseISO(this.createdAt).getTime())/1000 : undefined;
    this.leadTimeSeconds = (mergedAtMillis - parseISO(this.authoredDate).getTime()) / 1000;
    this.timeToMergeSeconds = (mergedAtMillis - parseISO(this.createdAt).getTime()) / 1000;
    this.timeToMergeFromFirstReviewSeconds = this.firstReviewedAt
      ? (mergedAtMillis - parseISO(this.firstReviewedAt).getTime()) / 1000
      : undefined;
  }
}
