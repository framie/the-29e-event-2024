export type Answer = {
    name: string,
    message: string,
    game: string,
    question?: string,
}

export type Lobby = {
    name: string,
    users: string[],
    currentGame: string,
    messages?: any,
}

export type PageMap = {
    [key: string]: JSX.Element | undefined
}

export type User = {
    name: string,
    active?: boolean,
    points?: number,
    wins?: number,
    losses?: number,
}