import BigNumber from 'bignumber.js'
export interface Proposal {
    signature: string
    timestamp: string
    token: string;
    type: 'proposal';
    tokenDecimal: number;
    tokenAddress: string;
    id: string;
    proposalType: number
    proposalStatus: number
    proposalIpfs: string
    votes: BigNumber[], voteCount: BigNumber, title: string;
    description: string
    choices: string[],
    startDate: any;
    startTime: any
    endDate: any;
    endTime: any;
    creator: string;
    blockNumber: number
}
export interface Token {
    address: string;
    decimals: number
    eip2612?: boolean
    logoURI: string
    name: string
    symbol: string;
    isNative: boolean;
}
export interface CurrentTrade {
    to: Token | {} | null;
    from: Token | {} | null;
}
export interface TokenList {
    readonly name: string;
    readonly timestamp: string;
    readonly version: Version;
    readonly tokens: Token[];
    readonly keywords?: string[];
    readonly tags?: Tags;
    readonly logoURI?: string;
}
export interface Version {
    readonly major: number;
    readonly minor: number;
    readonly patch: number;
}
export interface Tags {
    readonly [tagId: string]: {
        readonly name: string;
        readonly description: string;
    };
}
export interface Balance {
    name: string;
    symbol: string;
    decimals: string;
    balance: string;
}
export interface MoralisError {

    statusCode?: number,
    error?: string,
    description: string,
    meta?: MetaError[],
    requestId?: string

}
interface MetaError {

    type: string,
    value: string

}
export interface TokenSelect {
    to: number;
    from: number
}

export interface ChainSelect {
    to: number;
    from: number
}