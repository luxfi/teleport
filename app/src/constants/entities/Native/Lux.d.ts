import { Currency } from '../Currency';
import { NativeCurrency } from '../NativeCurrency';
import { Token } from '../Token';
export declare class Lux extends NativeCurrency {
    protected constructor(chainId: number);
    get wrapped(): Token;
    private static _cache;
    static onChain(chainId: number): Lux;
    equals(other: Currency): boolean;
}
