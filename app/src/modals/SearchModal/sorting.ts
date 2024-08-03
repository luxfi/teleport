
import { useMemo } from 'react'
import { Field } from 'state/swap/action'
import { useAllTokenBalances } from 'state/swap/hooks'
import { Balance, Token, TokenSelect } from 'state/types'

// compare two token amounts with highest one coming first
function balanceComparator(balanceA?: TokenSelect[Field.INPUT], balanceB?: TokenSelect[Field.OUTPUT]) {
  if (balanceA && balanceB) {
    console.log('returning here balanceA && balanceB')
    return balanceA > balanceB ? -1 : balanceA === balanceB ? 0 : 1
  } else if (balanceA && balanceA > 0) {
    return -1
  } else if (balanceB && balanceB > 0) {
    return 1
  }

  return 0
}

function getTokenComparator(balances: Balance[]): (tokenA: Token, tokenB: Token) => number {
  return function sortTokens(tokenA: Token, tokenB: Token): number {
    // -1 = a is first
    // 1 = b is first

    // sort by balances
    const balanceA = balances.find(bal => bal.symbol === tokenA.symbol)?.balance || '0'
    const balanceB = balances.find(bal => bal.symbol === tokenB.symbol)?.balance || '0'
    console.log('balanceA', balanceA, balanceB)
    const balanceComp = balanceComparator(parseFloat(balanceA), parseFloat(balanceB))
    if (balanceComp !== 0) return balanceComp

    if (tokenA.symbol && tokenB.symbol) {
      // sort by symbol
      return tokenA.symbol.toLowerCase() < tokenB.symbol.toLowerCase() ? -1 : 1
    } else {
      return tokenA.symbol ? -1 : tokenB.symbol ? -1 : 0
    }
  }
}

export function useTokenComparator(inverted: boolean): (tokenA: Token, tokenB: Token) => number {
  const balances = useAllTokenBalances()
  const comparator = useMemo(() => getTokenComparator(balances ?? []), [balances])
  return useMemo(() => {

    if (inverted) {
      return (tokenA: Token, tokenB: Token) => {
        return comparator(tokenA, tokenB) * -1
      }
    } else {
      return comparator
    }
  }, [inverted, comparator])
}
