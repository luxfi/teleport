import type { Web3ReactHooks } from '@web3-react/core'
import { BigNumber } from "ethers"
import { useState, useEffect } from "react"

export default function useBalances(
    provider?: ReturnType<Web3ReactHooks['useProvider']>,
    accounts?: string[]
): BigNumber[] | undefined {
    const [balances, setBalances] = useState<BigNumber[] | undefined>()

    useEffect(() => {
        if (provider && accounts?.length) {
            let stale = false

            void Promise.all(accounts.map((account) => provider.getBalance(account))).then((balances) => {
                if (!stale) {
                    setBalances(balances)
                }
            })

            return () => {
                stale = true
                setBalances(undefined)
            }
        }
    }, [provider, accounts])

    return balances
}

