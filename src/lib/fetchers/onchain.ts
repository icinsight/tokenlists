import { getAddress, InfuraProvider, JsonRpcProvider } from 'ethers'
import { Network, PartialTokenInfoMap } from '../../types'
import { Multicaller } from '../multicaller'
import ERC20_ABI from '../abi/ERC20.abi.json'

function getProvider(network: Network): InfuraProvider | JsonRpcProvider {
  if (!process.env.INFURA_KEY) throw new Error('Missing INFURA_KEY env var')
  if (network === Network.Gnosis) {
    return new JsonRpcProvider(
      `https://poa-xdai.gateway.pokt.network/v1/lb/${process.env.POKT_KEY}`
    )
  }
  return new InfuraProvider(Number(network), process.env.INFURA_KEY)
}

export async function fetchOnchainMetadata(
  network: Network,
  tokenAddresses: string[]
): Promise<PartialTokenInfoMap> {
  const provider = getProvider(network)
  const multicaller = new Multicaller({ network, provider })

  for (const address of tokenAddresses) {
    multicaller
      .addCall({
        key: `${address}.name`,
        address: getAddress(address),
        function: 'name',
        abi: ERC20_ABI,
      })
      .addCall({
        key: `${address}.symbol`,
        address: getAddress(address),
        function: 'symbol',
        abi: ERC20_ABI,
      })
      .addCall({
        key: `${address}.decimals`,
        address: getAddress(address),
        function: 'decimals',
        abi: ERC20_ABI,
      })
  }

  return multicaller.fetch()
}
