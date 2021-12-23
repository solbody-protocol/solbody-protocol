import Config from '../models/Config'
import fs from 'fs'
import { homedir } from 'os'
// eslint-disable-next-line import/no-named-default
import { default as DefaultContractsAddresses } from '@solbodyprotocol/contracts/artifacts/address.json'
import Logger from './Logger'

export interface ConfigHelperConfig extends Config {
  networkId: number
  network: string
  subgraphUri: string
  explorerUri: string
  solbodyTokenSymbol: string
  transactionBlockTimeout: number
  transactionConfirmationBlocks: number
  transactionPollingTimeout: number
  gasFeeMultiplier: number
}

const configHelperNetworksBase: ConfigHelperConfig = {
  networkId: null,
  network: 'unknown',
  metadataCacheUri: 'https://aquarius.solbodyprotocol.com',
  nodeUri: 'http://localhost:8545',
  providerUri: 'http://127.0.0.1:8030',
  subgraphUri: null,
  explorerUri: null,
  solbodyTokenAddress: null,
  solbodyTokenSymbol: 'SOLBODY',
  factoryAddress: '0x1234',
  poolFactoryAddress: null,
  fixedRateExchangeAddress: null,
  dispenserAddress: null,
  metadataContractAddress: null,
  startBlock: 0,
  transactionBlockTimeout: 50,
  transactionConfirmationBlocks: 1,
  transactionPollingTimeout: 750,
  gasFeeMultiplier: 1
}

export const configHelperNetworks: ConfigHelperConfig[] = [
  {
    ...configHelperNetworksBase
  },
  {
    // barge
    ...configHelperNetworksBase,
    networkId: 8996,
    network: 'development',
    metadataCacheUri: 'http://127.0.0.1:5000',
    rbacUri: 'http://127.0.0.1:3000'
  },
  {
    ...configHelperNetworksBase,
    networkId: 3,
    network: 'ropsten',
    nodeUri: 'https://ropsten.infura.io/v3',
    providerUri: 'https://provider.ropsten.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.ropsten.solbodyprotocol.com',
    explorerUri: 'https://ropsten.etherscan.io',
    startBlock: 9227563
  },
  {
    ...configHelperNetworksBase,
    networkId: 4,
    network: 'rinkeby',
    nodeUri: 'https://rinkeby.infura.io/v3',
    providerUri: 'https://provider.rinkeby.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.rinkeby.solbodyprotocol.com',
    explorerUri: 'https://rinkeby.etherscan.io',
    startBlock: 7294090
  },
  {
    ...configHelperNetworksBase,
    networkId: 1,
    network: 'mainnet',
    nodeUri: 'https://mainnet.infura.io/v3',
    providerUri: 'https://provider.mainnet.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.mainnet.solbodyprotocol.com',
    explorerUri: 'https://etherscan.io',
    startBlock: 11105459,
    transactionBlockTimeout: 150,
    transactionConfirmationBlocks: 5,
    transactionPollingTimeout: 1750,
    gasFeeMultiplier: 1.05
  },
  {
    ...configHelperNetworksBase,
    networkId: 137,
    network: 'polygon',
    nodeUri: 'https://polygon-mainnet.infura.io/v3',
    providerUri: 'https://provider.polygon.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.polygon.solbodyprotocol.com',
    explorerUri: 'https://polygonscan.com',
    solbodyTokenSymbol: 'mSOLBODY',
    startBlock: 11005222,
    gasFeeMultiplier: 1.05
  },
  {
    ...configHelperNetworksBase,
    networkId: 1287,
    network: 'moonbeamalpha',
    nodeUri: 'https://rpc.testnet.moonbeam.network',
    providerUri: 'https://provider.moonbeamalpha.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.moonbeamalpha.solbodyprotocol.com',
    explorerUri: 'https://moonbase-blockscout.testnet.moonbeam.network/',
    startBlock: 90707
  },
  {
    ...configHelperNetworksBase,
    networkId: 2021000,
    network: 'gaiaxtestnet',
    nodeUri: 'https://rpc.gaiaxtestnet.solbodyprotocol.com',
    providerUri: 'https://provider.gaiaxtestnet.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.gaiaxtestnet.solbodyprotocol.com',
    explorerUri: 'https://blockscout.gaiaxtestnet.solbodyprotocol.com'
  },
  {
    ...configHelperNetworksBase,
    networkId: 2021001,
    network: 'catenaxtestnet',
    nodeUri: 'https://rpc.catenaxtestnet.solbodyprotocol.com',
    providerUri: 'https://provider.catenaxtestnet.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.catenaxtestnet.solbodyprotocol.com',
    explorerUri: 'https://blockscout.catenaxtestnet.solbodyprotocol.com',
    metadataCacheUri: 'https://aquarius.catenaxtestnet.solbodyprotocol.com'
  },
  {
    ...configHelperNetworksBase,
    networkId: 80001,
    network: 'mumbai',
    nodeUri: 'https://polygon-mumbai.infura.io/v3',
    providerUri: 'https://provider.mumbai.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.mumbai.solbodyprotocol.com',
    explorerUri: 'https://mumbai.polygonscan.com'
  },
  {
    ...configHelperNetworksBase,
    networkId: 56,
    network: 'bsc',
    nodeUri: 'https://bsc-dataseed.binance.org',
    providerUri: 'https://provider.bsc.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.bsc.solbodyprotocol.com',
    explorerUri: 'https://bscscan.com/',
    gasFeeMultiplier: 1.05
  },
  {
    ...configHelperNetworksBase,
    networkId: 44787,
    network: 'celoalfajores',
    nodeUri: 'https://alfajores-forno.celo-testnet.org',
    providerUri: 'https://provider.celoalfajores.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.celoalfajores.solbodyprotocol.com',
    explorerUri: 'https://alfajores-blockscout.celo-testnet.org'
  },
  {
    ...configHelperNetworksBase,
    networkId: 246,
    network: 'energyweb',
    nodeUri: 'https://rpc.energyweb.org',
    providerUri: 'https://provider.energyweb.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.energyweb.solbodyprotocol.com',
    explorerUri: 'https://explorer.energyweb.org',
    gasFeeMultiplier: 1.05
  },
  {
    ...configHelperNetworksBase,
    networkId: 1285,
    network: 'moonriver',
    nodeUri: 'https://moonriver.api.onfinality.io/public',
    providerUri: 'https://provider.moonriver.solbodyprotocol.com',
    subgraphUri: 'https://subgraph.moonriver.solbodyprotocol.com',
    explorerUri: 'https://blockscout.moonriver.moonbeam.network',
    gasFeeMultiplier: 1.05
  }
]

export class ConfigHelper {
  /* Load contract addresses from env ADDRESS_FILE (generated by solbody-contracts) */
  public getAddressesFromEnv(network: string): Partial<ConfigHelperConfig> {
    // use the defaults first
    let configAddresses: Partial<ConfigHelperConfig>
    if (DefaultContractsAddresses[network]) {
      const {
        DTFactory,
        BFactory,
        FixedRateExchange,
        Dispenser,
        Metadata,
        Solbody,
        chainId,
        startBlock
      } = DefaultContractsAddresses[network]
      configAddresses = {
        factoryAddress: DTFactory,
        poolFactoryAddress: BFactory,
        fixedRateExchangeAddress: FixedRateExchange,
        dispenserAddress: Dispenser,
        metadataContractAddress: Metadata,
        solbodyTokenAddress: Solbody,
        networkId: chainId,
        startBlock: startBlock,
        ...(process.env.AQUARIUS_URI && { metadataCacheUri: process.env.AQUARIUS_URI })
      }
    }
    // try ADDRESS_FILE env
    if (fs && process.env.ADDRESS_FILE) {
      try {
        const data = JSON.parse(
          fs.readFileSync(
            process.env.ADDRESS_FILE ||
              `${homedir}/.solbody/solbody-contracts/artifacts/address.json`,
            'utf8'
          )
        )
        const {
          DTFactory,
          BFactory,
          FixedRateExchange,
          Dispenser,
          Metadata,
          Solbody,
          chainId,
          startBlock
        } = data[network]
        configAddresses = {
          factoryAddress: DTFactory,
          poolFactoryAddress: BFactory,
          fixedRateExchangeAddress: FixedRateExchange,
          dispenserAddress: Dispenser,
          metadataContractAddress: Metadata,
          solbodyTokenAddress: Solbody,
          networkId: chainId,
          startBlock: startBlock,
          ...(process.env.AQUARIUS_URI && { metadataCacheUri: process.env.AQUARIUS_URI })
        }
      } catch (e) {
        // console.error(`ERROR: Could not load local contract address file: ${e.message}`)
        // return null
      }
    }
    return configAddresses
  }

  public getConfig(network: string | number, infuraProjectId?: string): Config {
    const filterBy = typeof network === 'string' ? 'network' : 'networkId'
    let config = configHelperNetworks.find((c) => c[filterBy] === network)

    if (!config) {
      Logger.error(`No config found for given network '${network}'`)
      return null
    }

    const contractAddressesConfig = this.getAddressesFromEnv(config.network)
    config = { ...config, ...contractAddressesConfig }

    const nodeUri = infuraProjectId
      ? `${config.nodeUri}/${infuraProjectId}`
      : config.nodeUri

    return { ...config, nodeUri }
  }
}
