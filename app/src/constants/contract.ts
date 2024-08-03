import contractsJSON from './contracts.json'

const networkIds = Object.keys(contractsJSON)
const networkNames = networkIds.reduce(
    (sum: string[], id: string) => (sum = sum.concat(Object.keys(contractsJSON[id]))),
    []
)

const contractsByChainIdAndNetwork = networkIds.reduce((sum: any, id: string) => {
    sum[id] = networkNames.reduce((contracts: any, name: string) => {
        contracts[name] = contractsJSON[id][name] ? contractsJSON[id][name]['contracts'] : null
        return contracts
    }, {})
    return sum
}, {})


/**
 * Get the contracts in the form of { networkId: { contractName: KEY } }
 *
 * By the way, this function is terrible. Change it at your own peril
 **/
const getContractsByKey = (key: string) =>
    Object.keys(contractsByChainIdAndNetwork).reduce((sum: string[], id: string) => {
        Object.keys(contractsByChainIdAndNetwork[id]).forEach((networkName: string) => {
            const networks = Object.keys(contractsByChainIdAndNetwork[id])
            sum[id] = networks.reduce((coll: any, network: any) => {
                const contracts = contractsByChainIdAndNetwork[id][network]
                if (!!contracts) {
                    Object.keys(contracts).forEach((contractName: string) => {
                        coll[contractName] = contracts[contractName][key]
                    })
                }
                return coll
            }, {})
        })
        return sum
    }, [])

export const addresses = getContractsByKey('address')
export const abis = getContractsByKey('abi')
