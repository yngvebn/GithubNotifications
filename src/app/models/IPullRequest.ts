export interface IPullRequest {
    title: string;
    number: number;
    createdAt: Date;
    url: string;
    repository: { id: string, name: string };
    openedBy: { name: string, avatar: string };
}