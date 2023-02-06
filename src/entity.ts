import moment from "moment";

export class PullRequest {
  public leadTimeSeconds: number;
  public timeToMergeSeconds: number;

  constructor(
    public title: string,
    public author: string | undefined,
    public url: string,
    public createdAt: string,
    public mergedAt: string | undefined,
    public additions: number,
    public deletions: number,
    public authoredDate: string,
    public closed: boolean,
    public reviews: { createdAt: string; author: string | undefined }[]
  ) {
    const mergedAtParsed = this.mergedAt ? moment(this.mergedAt) : moment();
    this.leadTimeSeconds = mergedAtParsed.diff(
      moment(this.authoredDate),
      "seconds"
    );
    this.timeToMergeSeconds = mergedAtParsed.diff(
      moment(this.createdAt),
      "seconds"
    );
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
