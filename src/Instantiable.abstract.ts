import Web3 from 'web3'
import Config from './models/Config'
import { Logger, LoggerInstance } from './utils'
import { Solbody } from './solbody/Solbody'

export interface InstantiableConfig {
  solbody: Solbody
  config?: Config
  web3?: Web3
  logger?: Logger
}

export function generateIntantiableConfigFromConfig(
  config: Config
): Partial<InstantiableConfig> {
  return {
    config,
    web3: config.web3Provider,
    logger: LoggerInstance
  }
}

export abstract class Instantiable {
  protected get solbody(): Solbody {
    if (!this._solbody) {
      LoggerInstance.error('Solbody instance is not defined.')
    }
    return this._solbody
  }

  protected get web3(): Web3 {
    if (!this._web3) {
      LoggerInstance.error('Web3 instance is not defined.')
    }
    return this._web3
  }

  protected get config(): Config {
    if (!this._config) {
      LoggerInstance.error('Config instance is not defined.')
    }
    return this._config
  }

  protected get logger(): Logger {
    return LoggerInstance
  }

  protected get instanceConfig(): InstantiableConfig {
    const { solbody, web3, config, logger } = this
    return { solbody, web3, config, logger }
  }

  public static async getInstance(...args: any[]): Promise<any>

  public static async getInstance(config: InstantiableConfig): Promise<any> {
    LoggerInstance.warn('getInstance() methods has needs to be added to child class.')
  }

  protected static setInstanceConfig<T extends Instantiable>(
    instance: T,
    { solbody, config, web3, logger }: InstantiableConfig
  ) {
    instance._solbody = solbody
    instance._config = config
    instance._web3 = web3
    instance._logger = logger
  }

  private _solbody: Solbody

  private _web3: Web3

  private _config: Config

  private _logger: Logger

  protected setInstanceConfig(config: InstantiableConfig) {
    Instantiable.setInstanceConfig(this, config)
  }
}
