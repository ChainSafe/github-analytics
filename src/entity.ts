import { parseISO } from "date-fns";

export class PullRequest {
  public leadTimeSeconds: number;
  public responseTimeSeconds: number | undefined;
  public timeToMergeSeconds: number;
  public timeToMergeFromFirstReviewSeconds: number | undefined;

  constructor(
    public title: string,
    public author: string | undefined,
    public url: string,
    public createdAt: string,
    public mergedAt: string | undefined,
    public additions: number,
    public deletions: number,
    public authoredDate: string,
    public reviews: { createdAt: string; author: string | undefined }[]
  ) {
    const mergedAtMillis = this.mergedAt ? parseISO(this.mergedAt).getTime() : new Date().getTime();
    const firstReviewedAt = this.reviews[0]?.createdAt;
    this.responseTimeSeconds = firstReviewedAt
      ? (parseISO(firstReviewedAt).getTime() - parseISO(this.createdAt).getTime()) / 1000
      : undefined;
    this.leadTimeSeconds = (mergedAtMillis - parseISO(this.authoredDate).getTime()) / 1000;
    this.timeToMergeSeconds = (mergedAtMillis - parseISO(this.createdAt).getTime()) / 1000;
    this.timeToMergeFromFirstReviewSeconds = firstReviewedAt
      ? (mergedAtMillis - parseISO(firstReviewedAt).getTime()) / 1000
      : undefined;
  }
}

export class Issue {
  constructor(
    public title: string,
    public author: string | undefined,
    public url: string,
    public createdAt: string,
    public closedAt: string | undefined,
    public comments: { createdAt: string; author: string | undefined }[]
  ) {}
}
