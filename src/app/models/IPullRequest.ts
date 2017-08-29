export interface IPullRequest {
    id: string;
    title: string;
    number: number;
    created_at: Date;
    pull_request: { url: string};
    url: string;
    base: { repo: { id: string, name: string } };
    openedBy: { name: string, avatar: string };
    user: {
        avatar_url: string;
        login: string;
    }
}