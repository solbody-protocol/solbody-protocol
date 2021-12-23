/**
 * Additional Information of Assets Metadata.
 * @see https://github.com/solbodyprotocol/OEPs/tree/master/8#additional-information
 */
export interface AdditionalInformation {
  /**
   * Details of what the resource is. For a dataset, this attribute
   * explains what the data represents and what it can be used for.
   * @type {string}
   * @example "Weather information of UK including temperature and humidity"
   */
  description?: string

  /**
   * The party holding the legal copyright. Empty by default.
   * @type {string}
   * @example "Met Office"
   */
  copyrightHolder?: string

  /**
   * Example of the concept of this asset. This example is part
   * of the metadata, not an external link.
   * @type {string}
   * @example "423432fsd,51.509865,-0.118092,2011-01-01T10:55:11+00:00,7.2,68"
   */
  workExample?: string

  /**
   * Mapping of links for data samples, or links to find out more information.
   * Links may be to either a URL or another Asset. We expect marketplaces to
   * converge on agreements of typical formats for linked data: The Solbody Protocol
   * itself does not mandate any specific formats as these requirements are likely
   * to be domain-specific.
   * @type {any[]}
   * @example
   * [
   *    {
   *      anotherSample: "http://data.ceda.ac.uk/badc/ukcp09/data/gridded-land-obs/gridded-land-obs-daily/",
   *    },
   *    {
   *      fieldsDescription: "http://data.ceda.ac.uk/badc/ukcp09/",
   *    },
   *  ]
   */
  links?: { [name: string]: string }[]

  /**
   * The language of the content. Please use one of the language
   * codes from the {@link https://tools.ietf.org/html/bcp47 IETF BCP 47 standard}.
   * @type {String}
   * @example "en"
   */
  inLanguage?: string

  /**
   * Categories used to describe this content. Empty by default.
   * @type {string[]}
   * @example ["Economy", "Data Science"]
   */
  categories?: string[]

  /**
   * Keywords or tags used to describe this content. Empty by default.
   * @type {string[]}
   * @example ["weather", "uk", "2011", "temperature", "humidity"]
   */
  tags?: string[]

  /**
   * An indication of update latency - i.e. How often are updates expected (seldom,
   * annually, quarterly, etc.), or is the resource static that is never expected
   * to get updated.
   * @type {string}
   * @example "yearly"
   */
  updateFrequency?: string

  /**
   * A link to machine-readable structured markup (such as ttl/json-ld/rdf)
   * describing the dataset.
   * @type {StructuredMarkup[]}
   */
  structuredMarkup?: {
    uri: string
    mediaType: string
  }[]
}import defaultDispenserABI from '@solbodyprotocol/contracts/artifacts/Dispenser.json'
import { TransactionReceipt } from 'web3-core'
import { Contract } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils/types'
import Web3 from 'web3'
import {
  SubscribablePromise,
  Logger,
  getFairGasPrice,
  setContractDefaults
} from '../utils'
import { DataTokens } from '../datatokens/Datatokens'
import Decimal from 'decimal.js'
import { ConfigHelperConfig } from '../utils/ConfigHelper'

export interface DispenserToken {
  active: boolean
  owner: string
  minterApproved: boolean
  isTrueMinter: boolean
  maxTokens: string
  maxBalance: string
  balance: string
}

export enum DispenserMakeMinterProgressStep {
  // eslint-disable-next-line no-unused-vars
  MakeDispenserMinter,
  // eslint-disable-next-line no-unused-vars
  AcceptingNewMinter
}

export enum DispenserCancelMinterProgressStep {
  // eslint-disable-next-line no-unused-vars
  MakeOwnerMinter,
  // eslint-disable-next-line no-unused-vars
  AcceptingNewMinter
}

export class SolbodyDispenser {
  public GASLIMIT_DEFAULT = 1000000
  /** Solbody related functions */
  public dispenserAddress: string
  public dispenserABI: AbiItem | AbiItem[]
  public web3: Web3
  public contract: Contract = null
  private logger: Logger
  public datatokens: DataTokens
  public startBlock: number
  private config: ConfigHelperConfig

  /**
   * Instantiate Dispenser
   * @param {any} web3
   * @param {String} dispenserAddress
   * @param {any} dispenserABI
   */
  constructor(
    web3: Web3,
    logger: Logger,
    dispenserAddress: string = null,
    dispenserABI: AbiItem | AbiItem[] = null,
    datatokens: DataTokens,
    config?: ConfigHelperConfig
  ) {
    this.web3 = web3
    this.config = config
    this.dispenserAddress = dispenserAddress
    this.startBlock = (config && config.startBlock) || 0
    this.dispenserABI = dispenserABI || (defaultDispenserABI.abi as AbiItem[])
    this.datatokens = datatokens
    if (web3)
      this.contract = setContractDefaults(
        new this.web3.eth.Contract(this.dispenserABI, this.dispenserAddress),
        this.config
      )
    this.logger = logger
  }

  /**
   * Get dispenser status for a datatoken
   * @param {String} dataTokenAddress
   * @return {Promise<FixedPricedExchange>} Exchange details
   */
  public async status(dataTokenAddress: string): Promise<DispenserToken> {
    try {
      const result: DispenserToken = await this.contract.methods
        .status(dataTokenAddress)
        .call()
      result.maxTokens = this.web3.utils.fromWei(result.maxTokens)
      result.maxBalance = this.web3.utils.fromWei(result.maxBalance)
      result.balance = this.web3.utils.fromWei(result.balance)
      return result
    } catch (e) {
      this.logger.warn(`No dispenser available for data token: ${dataTokenAddress}`)
    }
    return null
  }

  /**
   * Activates a new dispener.
   * @param {String} dataToken
   * @param {Number} maxTokens max amount of tokens to dispense
   * @param {Number} maxBalance max balance of user. If user balance is >, then dispense will be rejected
   * @param {String} address User address (must be owner of the dataToken)
   * @return {Promise<TransactionReceipt>} TransactionReceipt
   */
  public async activate(
    dataToken: string,
    maxTokens: string,
    maxBalance: string,
    address: string
  ): Promise<TransactionReceipt> {
    let estGas
    const gasLimitDefault = this.GASLIMIT_DEFAULT
    try {
      estGas = await this.contract.methods
        .activate(
          dataToken,
          this.web3.utils.toWei(maxTokens),
          this.web3.utils.toWei(maxBalance)
        )
        .estimateGas({ from: address }, (err, estGas) => (err ? gasLimitDefault : estGas))
    } catch (e) {
      estGas = gasLimitDefault
    }
    let trxReceipt = null
    try {
      trxReceipt = await this.contract.methods
        .activate(
          dataToken,
          this.web3.utils.toWei(maxTokens),
          this.web3.utils.toWei(maxBalance)
        )
        .send({
          from: address,
          gas: estGas + 1,
          gasPrice: await getFairGasPrice(this.web3, this.config)
        })
    } catch (e) {
      this.logger.error(`ERROR: Failed to activate dispenser: ${e.message}`)
    }
    return trxReceipt
  }

  /**
   * Deactivates a dispener.
   * @param {String} dataToken
   * @param {String} address User address (must be owner of the dispenser)
   * @return {Promise<TransactionReceipt>} TransactionReceipt
   */
  public async deactivate(
    dataToken: string,
    address: string
  ): Promise<TransactionReceipt> {
    let estGas
    const gasLimitDefault = this.GASLIMIT_DEFAULT
    try {
      estGas = await this.contract.methods
        .deactivate(dataToken)
        .estimateGas({ from: address }, (err, estGas) => (err ? gasLimitDefault : estGas))
    } catch (e) {
      estGas = gasLimitDefault
    }
    let trxReceipt = null
    try {
      trxReceipt = await this.contract.methods.deactivate(dataToken).send({
        from: address,
        gas: estGas + 1,
        gasPrice: await getFairGasPrice(this.web3, this.config)
      })
    } catch (e) {
      this.logger.error(`ERROR: Failed to deactivate dispenser: ${e.message}`)
    }
    return trxReceipt
  }

  /**
   * Make the dispenser minter of the datatoken
   * @param {String} dataToken
   * @param {String} address User address (must be owner of the datatoken)
   * @return {Promise<TransactionReceipt>} TransactionReceipt
   */
  public makeMinter(
    dataToken: string,
    address: string
  ): SubscribablePromise<DispenserMakeMinterProgressStep, TransactionReceipt> {
    return new SubscribablePromise(async (observer) => {
      observer.next(DispenserMakeMinterProgressStep.MakeDispenserMinter)
      let estGas
      const gasLimitDefault = this.GASLIMIT_DEFAULT
      const minterTx = await this.datatokens.proposeMinter(
        dataToken,
        this.dispenserAddress,
        address
      )
      if (!minterTx) {
        return null
      }
      observer.next(DispenserMakeMinterProgressStep.AcceptingNewMinter)
      try {
        estGas = await this.contract.methods
          .acceptMinter(dataToken)
          .estimateGas({ from: address }, (err, estGas) =>
            err ? gasLimitDefault : estGas
          )
      } catch (e) {
        estGas = gasLimitDefault
      }
      let trxReceipt = null
      try {
        trxReceipt = await this.contract.methods.acceptMinter(dataToken).send({
          from: address,
          gas: estGas + 1,
          gasPrice: await getFairGasPrice(this.web3, this.config)
        })
      } catch (e) {
        this.logger.error(`ERROR: Failed to accept minter role: ${e.message}`)
      }
      return trxReceipt
    })
  }

  /**
   * Cancel minter role of dispenser and make the owner minter of the datatoken
   * @param {String} dataToken
   * @param {String} address User address (must be owner of the dispenser)
   * @return {Promise<TransactionReceipt>} TransactionReceipt
   */
  public cancelMinter(
    dataToken: string,
    address: string
  ): SubscribablePromise<DispenserCancelMinterProgressStep, TransactionReceipt> {
    return new SubscribablePromise(async (observer) => {
      observer.next(DispenserCancelMinterProgressStep.MakeOwnerMinter)
      let estGas
      const gasLimitDefault = this.GASLIMIT_DEFAULT
      try {
        estGas = await this.contract.methods
          .removeMinter(dataToken)
          .estimateGas({ from: address }, (err, estGas) =>
            err ? gasLimitDefault : estGas
          )
      } catch (e) {
        estGas = gasLimitDefault
      }
      let trxReceipt = null
      try {
        trxReceipt = await this.contract.methods.removeMinter(dataToken).send({
          from: address,
          gas: estGas + 1,
          gasPrice: await getFairGasPrice(this.web3, this.config)
        })
      } catch (e) {
        this.logger.error(`ERROR: Failed to remove minter role: ${e.message}`)
      }
      if (!trxReceipt) {
        return null
      }
      observer.next(DispenserCancelMinterProgressStep.AcceptingNewMinter)
      const minterTx = await this.datatokens.approveMinter(dataToken, address)
      return minterTx
    })
  }

  /**
   * Request tokens from dispenser
   * @param {String} dataToken
   * @param {String} amount
   * @param {String} address User address
   * @return {Promise<TransactionReceipt>} TransactionReceipt
   */
  public async dispense(
    dataToken: string,
    address: string,
    amount: string = '1'
  ): Promise<TransactionReceipt> {
    let estGas
    const gasLimitDefault = this.GASLIMIT_DEFAULT
    try {
      estGas = await this.contract.methods
        .dispense(dataToken, this.web3.utils.toWei(amount))
        .estimateGas({ from: address }, (err, estGas) => (err ? gasLimitDefault : estGas))
    } catch (e) {
      estGas = gasLimitDefault
    }
    let trxReceipt = null
    try {
      trxReceipt = await this.contract.methods
        .dispense(dataToken, this.web3.utils.toWei(amount))
        .send({
          from: address,
          gas: estGas + 1,
          gasPrice: await getFairGasPrice(this.web3, this.config)
        })
    } catch (e) {
      this.logger.error(`ERROR: Failed to dispense tokens: ${e.message}`)
    }
    return trxReceipt
  }

  /**
   * Withdraw all tokens from the dispenser (if any)
   * @param {String} dataToken
   * @param {String} address User address (must be owner of the dispenser)
   * @return {Promise<TransactionReceipt>} TransactionReceipt
   */
  public async ownerWithdraw(
    dataToken: string,
    address: string
  ): Promise<TransactionReceipt> {
    let estGas
    const gasLimitDefault = this.GASLIMIT_DEFAULT
    try {
      estGas = await this.contract.methods
        .ownerWithdraw(dataToken)
        .estimateGas({ from: address }, (err, estGas) => (err ? gasLimitDefault : estGas))
    } catch (e) {
      estGas = gasLimitDefault
    }
    let trxReceipt = null
    try {
      trxReceipt = await this.contract.methods.ownerWithdraw(dataToken).send({
        from: address,
        gas: estGas + 1,
        gasPrice: await getFairGasPrice(this.web3, this.config)
      })
    } catch (e) {
      this.logger.error(`ERROR: Failed to withdraw tokens: ${e.message}`)
    }
    return trxReceipt
  }

  /**
   * Check if tokens can be dispensed
   * @param {String} dataToken
   * @param {String} address User address that will receive datatokens
   * @return {Promise<Boolean>}
   */
  public async isDispensable(
    dataToken: string,
    address: string,
    amount: string = '1'
  ): Promise<Boolean> {
    const status = await this.status(dataToken)
    if (!status) return false
    // check active
    if (status.active === false) return false
    // check maxBalance
    const userBalance = new Decimal(await this.datatokens.balance(dataToken, address))
    if (userBalance.greaterThanOrEqualTo(status.maxBalance)) return false
    // check maxAmount
    if (new Decimal(String(amount)).greaterThan(status.maxTokens)) return false
    // check dispenser balance
    const contractBalance = new Decimal(status.balance)
    if (contractBalance.greaterThanOrEqualTo(amount) || status.isTrueMinter === true)
      return true
    return false
  }
}import defaultFixedRateExchangeABI from '@solbodyprotocol/contracts/artifacts/FixedRateExchange.json'
import BigNumber from 'bignumber.js'
import { TransactionReceipt } from 'web3-core'
import { Contract, EventData } from 'web3-eth-contract'
import { AbiItem } from 'web3-utils/types'
import Web3 from 'web3'
import {
  SubscribablePromise,
  Logger,
  getFairGasPrice,
  setContractDefaults
} from '../utils'
import { DataTokens } from '../datatokens/Datatokens'
import { ConfigHelperConfig } from '../utils/ConfigHelper'

const MAX_AWAIT_PROMISES = 10

export interface FixedPriceExchange {
  exchangeID?: string
  exchangeOwner: string
  dataToken: string
  baseToken: string
  fixedRate: string
  active: boolean
  supply: string
}

export interface FixedPriceSwap {
  exchangeID: string
  caller: string
  baseTokenAmount: string
  dataTokenAmount: string
}

export enum FixedRateCreateProgressStep {
  CreatingExchange,
  ApprovingDatatoken
}

export class SolbodyFixedRateExchange {
  public GASLIMIT_DEFAULT = 1000000
  /** Solbody related functions */
  public solbodyAddress: string = null
  public fixedRateExchangeAddress: string
  public fixedRateExchangeABI: AbiItem | AbiItem[]
  public web3: Web3
  public contract: Contract = null
  private logger: Logger
  public datatokens: DataTokens
  public startBlock: number
  private config: ConfigHelperConfig

  /**
   * Instantiate FixedRateExchange
   * @param {any} web3
   * @param {String} fixedRateExchangeAddress
   * @param {any} fixedRateExchangeABI
   * @param {String} solbodyAddress
   */
  constructor(
    web3: Web3,
    logger: Logger,
    fixedRateExchangeAddress: string = null,
    fixedRateExchangeABI: AbiItem | AbiItem[] = null,
    solbodyAddress: string = null,
    datatokens: DataTokens,
    config?: ConfigHelperConfig
  ) {
    this.web3 = web3
    this.fixedRateExchangeAddress = fixedRateExchangeAddress
    this.config = config
    this.startBlock = (config && config.startBlock) || 0
    this.fixedRateExchangeABI =
      fixedRateExchangeABI || (defaultFixedRateExchangeABI.abi as AbiItem[])
    this.solbodyAddress = solbodyAddress
    this.datatokens = datatokens
    if (web3)
      this.contract = setContractDefaults(
        new this.web3.eth.Contract(
          this.fixedRateExchangeABI,
          this.fixedRateExchangeAddress
        ),
        this.config
      )
    this.logger = logger
  }

  /**
   * Creates new exchange pair between Solbody Token and data token.
   * @param {String} dataToken Data Token Contract Address
   * @param {Number} rate exchange rate
   * @param {String} address User address
   * @param {String} amount Optional, amount of datatokens to be approved for the exchange
   * @return {Promise<TransactionReceipt>} TransactionReceipt
   */
  public create(
    dataToken: string,
    rate: string,
    address: string,
    amount?: string
  ): SubscribablePromise<FixedRateCreateProgressStep, TransactionReceipt> {
    return this.createExchange(this.solbodyAddress, dataToken, rate, address, amount)
  }

  /**
   * Creates new exchange pair between Solbody Token and data token.
   * @param {String} dataToken Data Token Contract Address
   * @param {Number} rate exchange rate
   * @param {String} address User address
   * @param {String} amount Optional, amount of datatokens to be approved for the exchange
   * @return {Promise<TransactionReceipt>} TransactionReceipt
   */
  public createExchange(
    baseToken: string,
    dataToken: string,
    rate: string,
    address: string,
    amount?: string
  ): SubscribablePromise<FixedRateCreateProgressStep, TransactionReceipt> {
    return new SubscribablePromise(async (observer) => {
      observer.next(FixedRateCreateProgressStep.CreatingExchange)
      let estGas
      const gasLimitDefault = this.GASLIMIT_DEFAULT
      try {
        estGas = await this.contract.methods
          .create(baseToken, dataToken, this.web3.utils.toWei(rate))
          .estimateGas({ from: address }, (err, estGas) =>
            err ? gasLimitDefault : estGas
          )
      } catch (e) {
        estGas = gasLimitDefault
      }
      let exchangeId = null
      let trxReceipt = null
      try {
        trxReceipt = await this.contract.methods
          .create(baseToken, dataToken, this.web3.utils.toWei(rate))
          .send({
            from: address,
            gas: estGas + 1,
            gasPrice: await getFairGasPrice(this.web3, this.config)
          })
        exchangeId = trxReceipt.events.ExchangeCreated.returnValues[0]
      } catch (e) {
        this.logger.error(`ERROR: Failed to create new exchange: ${e.message}`)
      }
      if (amount && exchangeId) {
        observer.next(FixedRateCreateProgressStep.ApprovingDatatoken)
        this.datatokens.approve(dataToken, this.fixedRateExchangeAddress, amount, address)
      }
      return trxReceipt
    })
  }

  /**
   * Creates unique exchange identifier.
   * @param {String} dataToken Data Token Contract Address
   * @param {String} owner Owner of the exchange
   * @return {Promise<string>} exchangeId
   */
  public async generateExchangeId(dataToken: string, owner: string): Promise<string> {
    const exchangeId = await this.contract.methods
      .generateExchangeId(this.solbodyAddress, dataToken, owner)
      .call()
    return exchangeId
  }

  /**
   * Atomic swap
   * @param {String} exchangeId ExchangeId
   * @param {Number} dataTokenAmount Amount of Data Tokens
   * @param {String} address User address
   * @return {Promise<TransactionReceipt>} transaction receipt
   */
  public async buyDT(
    exchangeId: string,
    dataTokenAmount: string,
    address: string
  ): Promise<TransactionReceipt> {
    const gasLimitDefault = this.GASLIMIT_DEFAULT
    let estGas
    try {
      estGas = await this.contract.methods
        .swap(exchangeId, this.web3.utils.toWei(String(dataTokenAmount)))
        .estimateGas({ from: address }, (err, estGas) => (err ? gasLimitDefault : estGas))
    } catch (e) {
      estGas = gasLimitDefault
    }
    try {
      const trxReceipt = await this.contract.methods
        .swap(exchangeId, this.web3.utils.toWei(String(dataTokenAmount)))
        .send({
          from: address,
          gas: estGas + 1,
          gasPrice: await getFairGasPrice(this.web3, this.config)
        })
      return trxReceipt
    } catch (e) {
      this.logger.error(`ERROR: Failed to buy datatokens: ${e.message}`)
      return null
    }
  }

  /**
   * Gets total number of exchanges
   * @param {String} exchangeId ExchangeId
   * @param {Number} dataTokenAmount Amount of Data Tokens
   * @return {Promise<Number>} no of available exchanges
   */
  public async getNumberOfExchanges(): Promise<number> {
    const numExchanges = await this.contract.methods.getNumberOfExchanges().call()
    return numExchanges
  }

  /**
   * Set new rate
   * @param {String} exchangeId ExchangeId
   * @param {Number} newRate New rate
   * @param {String} address User account
   * @return {Promise<TransactionReceipt>} transaction receipt
   */
  public async setRate(
    exchangeId: string,
    newRate: number,
    address: string
  ): Promise<TransactionReceipt> {
    const gasLimitDefault = this.GASLIMIT_DEFAULT
    let estGas
    try {
      estGas = await this.contract.methods
        .setRate(exchangeId, this.web3.utils.toWei(String(newRate)))
        .estimateGas({ from: address }, (err, estGas) => (err ? gasLimitDefault : estGas))
    } catch (e) {
      estGas = gasLimitDefault
    }
    const trxReceipt = await this.contract.methods
      .setRate(exchangeId, this.web3.utils.toWei(String(newRate)))
      .send({
        from: address,
        gas: estGas + 1,
        gasPrice: await getFairGasPrice(this.web3, this.config)
      })
    return trxReceipt
  }

  /**
   * Activate an exchange
   * @param {String} exchangeId ExchangeId
   * @param {String} address User address
   * @return {Promise<TransactionReceipt>} transaction receipt
   */
  public async activate(
    exchangeId: string,
    address: string
  ): Promise<TransactionReceipt> {
    const exchange = await this.getExchange(exchangeId)
    if (!exchange) return null
    if (exchange.active === true) return null
    const gasLimitDefault = this.GASLIMIT_DEFAULT
    let estGas
    try {
      estGas = await this.contract.methods
        .toggleExchangeState(exchangeId)
        .estimateGas({ from: address }, (err, estGas) => (err ? gasLimitDefault : estGas))
    } catch (e) {
      estGas = gasLimitDefault
    }
    const trxReceipt = await this.contract.methods.toggleExchangeState(exchangeId).send({
      from: address,
      gas: estGas + 1,
      gasPrice: await getFairGasPrice(this.web3, this.config)
    })
    return trxReceipt
  }

  /**
   * Deactivate an exchange
   * @param {String} exchangeId ExchangeId
   * @param {String} address User address
   * @return {Promise<TransactionReceipt>} transaction receipt
   */
  public async deactivate(
    exchangeId: string,
    address: string
  ): Promise<TransactionReceipt> {
    const exchange = await this.getExchange(exchangeId)
    if (!exchange) return null
    if (exchange.active === false) return null
    const gasLimitDefault = this.GASLIMIT_DEFAULT
    let estGas
    try {
      estGas = await this.contract.methods
        .toggleExchangeState(exchangeId)
        .estimateGas({ from: address }, (err, estGas) => (err ? gasLimitDefault : estGas))
    } catch (e) {
      estGas = gasLimitDefault
    }
    const trxReceipt = await this.contract.methods.toggleExchangeState(exchangeId).send({
      from: address,
      gas: estGas + 1,
      gasPrice: await getFairGasPrice(this.web3, this.config)
    })
    return trxReceipt
  }

  /**
   * Get Rate
   * @param {String} exchangeId ExchangeId
   * @return {Promise<string>} Rate (converted from wei)
   */
  public async getRate(exchangeId: string): Promise<string> {
    const weiRate = await this.contract.methods.getRate(exchangeId).call()
    return this.web3.utils.fromWei(weiRate)
  }

  /**
   * Get Supply
   * @param {String} exchangeId ExchangeId
   * @return {Promise<string>} Rate (converted from wei)
   */
  public async getSupply(exchangeId: string): Promise<string> {
    const weiRate = await this.contract.methods.getSupply(exchangeId).call()
    return this.web3.utils.fromWei(weiRate)
  }

  /**
   * getSolbodyNeeded
   * @param {String} exchangeId ExchangeId
   * @param {Number} dataTokenAmount Amount of Data Tokens
   * @return {Promise<string>} Solbody amount needed
   */
  public async getSolbodyNeeded(
    exchangeId: string,
    dataTokenAmount: string
  ): Promise<string> {
    const weiRate = await this.contract.methods
      .CalcInGivenOut(exchangeId, this.web3.utils.toWei(dataTokenAmount))
      .call()
    return this.web3.utils.fromWei(weiRate)
  }

  /**
   * Get exchange details
   * @param {String} exchangeId ExchangeId
   * @return {Promise<FixedPricedExchange>} Exchange details
   */
  public async getExchange(exchangeId: string): Promise<FixedPriceExchange> {
    const result: FixedPriceExchange = await this.contract.methods
      .getExchange(exchangeId)
      .call()
    result.fixedRate = this.web3.utils.fromWei(result.fixedRate)
    result.supply = this.web3.utils.fromWei(result.supply)
    result.exchangeID = exchangeId
    return result
  }

  /**
   * Get all exchanges
   * @param {String} exchangeId ExchangeId
   * @return {Promise<String[]>} Exchanges list
   */
  public async getExchanges(): Promise<string[]> {
    return await this.contract.methods.getExchanges().call()
  }

  /**
   * Check if an exchange is active
   * @param {String} exchangeId ExchangeId
   * @return {Promise<Boolean>} Result
   */
  public async isActive(exchangeId: string): Promise<boolean> {
    const result = await this.contract.methods.isActive(exchangeId).call()
    return result
  }

  /**
   * Calculates how many basetokens are needed to get specifyed amount of datatokens
   * @param {String} exchangeId ExchangeId
   * @param {String} dataTokenAmount dataTokenAmount
   * @return {Promise<String>} Result
   */
  public async CalcInGivenOut(
    exchangeId: string,
    dataTokenAmount: string
  ): Promise<string> {
    const result = await this.contract.methods
      .CalcInGivenOut(exchangeId, this.web3.utils.toWei(dataTokenAmount))
      .call()
    return this.web3.utils.fromWei(result)
  }

  public async searchforDT(
    dataTokenAddress: string,
    minSupply: string
  ): Promise<FixedPriceExchange[]> {
    const result: FixedPriceExchange[] = []
    const events = await this.contract.getPastEvents('ExchangeCreated', {
      filter: { datatoken: dataTokenAddress.toLowerCase() },
      fromBlock: this.startBlock,
      toBlock: 'latest'
    })
    let promises = []
    for (let i = 0; i < events.length; i++) {
      promises.push(this.getExchange(events[i].returnValues[0]))
      if (promises.length > MAX_AWAIT_PROMISES || i === events.length - 1) {
        const results = await Promise.all(promises)
        for (let j = 0; j < results.length; j++) {
          const constituents = results[j]
          if (
            constituents.active === true &&
            constituents.dataToken.toLowerCase() === dataTokenAddress.toLowerCase()
          ) {
            const supply = new BigNumber(constituents.supply)
            const required = new BigNumber(minSupply)
            if (supply.gte(required)) {
              result.push(constituents)
            }
          }
        }
        promises = []
      }
    }
    return result
  }

  /**
   * Get all exchanges, filtered by creator(if any)
   * @param {String} account
   * @return {Promise<FixedPricedExchange[]>}
   */
  public async getExchangesbyCreator(account?: string): Promise<FixedPriceExchange[]> {
    const result: FixedPriceExchange[] = []
    const events = await this.contract.getPastEvents('ExchangeCreated', {
      filter: {},
      fromBlock: this.startBlock,
      toBlock: 'latest'
    })
    for (let i = 0; i < events.length; i++) {
      if (!account || events[i].returnValues[3].toLowerCase() === account.toLowerCase())
        result.push(await this.getExchange(events[i].returnValues[0]))
    }
    return result
  }

  /**
   * Get all swaps for an exchange, filtered by account(if any)
   * @param {String} exchangeId
   * @param {String} account
   * @return {Promise<FixedPricedSwap[]>}
   */
  public async getExchangeSwaps(
    exchangeId: string,
    account?: string
  ): Promise<FixedPriceSwap[]> {
    const result: FixedPriceSwap[] = []
    const events = await this.contract.getPastEvents('Swapped', {
      filter: { exchangeId: exchangeId },
      fromBlock: this.startBlock,
      toBlock: 'latest'
    })
    for (let i = 0; i < events.length; i++) {
      if (!account || events[i].returnValues[1].toLowerCase() === account.toLowerCase())
        result.push(this.getEventData(events[i]))
    }
    return result
  }

  /**
   * Get all swaps for an account
   * @param {String} account
   * @return {Promise<FixedPricedSwap[]>}
   */
  public async getAllExchangesSwaps(account: string): Promise<FixedPriceSwap[]> {
    const result: FixedPriceSwap[] = []
    const events = await this.contract.getPastEvents('ExchangeCreated', {
      filter: {},
      fromBlock: this.startBlock,
      toBlock: 'latest'
    })
    for (let i = 0; i < events.length; i++) {
      const swaps: FixedPriceSwap[] = await this.getExchangeSwaps(
        events[i].returnValues[0],
        account
      )
      swaps.forEach((swap) => {
        result.push(swap)
      })
    }
    return result
  }

  private getEventData(data: EventData): FixedPriceSwap {
    const result: FixedPriceSwap = {
      exchangeID: data.returnValues[0],
      caller: data.returnValues[1],
      baseTokenAmount: this.web3.utils.fromWei(data.returnValues[2]),
      dataTokenAmount: this.web3.utils.fromWei(data.returnValues[3])
    }
    return result
  }
}
