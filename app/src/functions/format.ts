import { getAddress } from '@ethersproject/address'
import { formatUnits } from '@ethersproject/units'
import { BigNumberish } from '@ethersproject/bignumber'
import { TokenSelect } from 'state/types'
import { Field } from 'state/swap/action'
import { isAddress } from './validate'

export const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, chars = 4): string {
  try {
    if (!isAddress(address)) return;
    const parsed = getAddress(address)
    return `${parsed.substring(0, chars + 2)}...${parsed.substring(42 - chars)}`
  } catch (error) {
    throw Error(`Invalid 'address' parameter '${address}'.`)
  }
}

// shorten string to its maximum length using three dots
export function shortenString(string: string, length: number): string {
  if (!string) return ''
  if (length < 5) return string
  if (string.length <= length) return string
  return string.slice(0, 4) + '...' + string.slice(string.length - length + 5, string.length)
}

export const formatBalance = (value: BigNumberish, decimals = 18, maxFraction = 0) => {
  const formatted = formatUnits(value, decimals)
  if (maxFraction > 0) {
    const split = formatted.split('.')
    if (split.length > 1) {
      return split[0] + '.' + split[1].substr(0, maxFraction)
    }
  }
  return formatted
}
export const numberWithCommas = (num: number | string) => {
  const values = num.toString().split('.')
  return values[0].replace(/.(?=(?:.{3})+$)/g, '$&,') + (values.length == 2 ? '.' + values[1] : '')
}
