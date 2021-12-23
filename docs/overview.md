# Overview

Here is an overview of all ot the main functions and submodules:

### Solbody instance
Create/get datatoken, get dtfactory, user orders (history)

```
import { Solbody } from '@solbodyprotocol/lib'
const solbody = await Solbody.getInstance(config)
```

Then use the following submodules...

# Assets
Publish, get, list, search, order, consume/download
```Typescript
solbody.asset.getInstance(config: InstantiableConfig): Promise<Assets>;
```
```Typescript
solbody.asset.create(metadata: Metadata, publisher: Account, services?: Service[], dtAddress?: string, cap?: string, name?: string, symbol?: string, providerUri?: string): SubscribablePromise<CreateProgressStep, DDO>;
```
```Typescript
solbody.asset.ownerAssets(owner: string): Promise<QueryResult>;
```
```Typescript
solbody.asset.resolve(did: string): Promise<DDO>;
```
```Typescript
solbody.asset.resolveByDTAddress(dtAddress: string, offset?: number, page?: number, sort?: number): Promise<DDO[]>;
```
```Typescript
solbody.asset.editMetadata(ddo: DDO, newMetadata: EditableMetadata): Promise<DDO>;
```
```Typescript
solbody.asset.updateMetadata(ddo: DDO, consumerAccount: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.asset.editServiceTimeout(ddo: DDO, serviceIndex: number, timeout: number): Promise<DDO>;
```
```Typescript
solbody.asset.creator(did: string): Promise<string>;
```
```Typescript
solbody.asset.query(query: SearchQuery): Promise<QueryResult>;
```
```Typescript
solbody.asset.search(text: string): Promise<QueryResult>;
```
```Typescript
solbody.asset.getServiceByType(did: string, serviceType: string): Promise<Service>;
```
```Typescript
solbody.asset.getServiceByIndex(did: string, serviceIndex: number): Promise<Service>;
```
```Typescript
solbody.asset.createAccessServiceAttributes(creator: Account, cost: string, datePublished: string, timeout?: number, providerUri?: string): Promise<ServiceAccess>;
```
```Typescript
solbody.asset.initialize(did: string, serviceType: string, consumerAddress: string, serviceIndex: number, serviceEndpoint: string): Promise<any>;
```
```Typescript
solbody.asset.order(did: string, serviceType: string, payerAddress: string, serviceIndex?: number, mpAddress?: string, consumerAddress?: string, searchPreviousOrders?: boolean): Promise<string>;
```
```Typescript
solbody.asset.download(did: string, txId: string, tokenAddress: string, consumerAccount: Account, destination: string): Promise<string | true>;
```
```Typescript
solbody.asset.simpleDownload(dtAddress: string, serviceEndpoint: string, txId: string, account: string): Promise<string>;
```
```Typescript
solbody.asset.getOrderHistory(account: Account, serviceType?: string, fromBlock?: number): Promise<Order[]>;
```

# Datatoken Pool
Create, add/remove liquidity, check liquidity, price, buy datatokens

```Typescript
solbody.pool.
```
```Typescript
solbody.pool.createDTPool(account: string, token: string, amount: string, weight: string, fee: string): Promise<string>;
```
```Typescript
solbody.pool.getDTAddress(poolAddress: string): Promise<string>;
```
```Typescript
solbody.pool.getOceanReserve(poolAddress: string): Promise<string>;
```
```Typescript
solbody.pool.getDTReserve(poolAddress: string): Promise<string>;
```
```Typescript
solbody.pool.getMaxBuyQuantity(poolAddress: string, tokenAddress: string): Promise<string>;
```
```Typescript
solbody.pool.getOceanMaxBuyQuantity(poolAddress: string): Promise<string>;
```
```Typescript
solbody.pool.getDTMaxBuyQuantity(poolAddress: string): Promise<string>;
```
```Typescript
solbody.pool.calcInGivenOut(poolAddress: string, tokenInAddress: string, tokenOutAddress: string, tokenOutAmount: string): Promise<string>;
```
```Typescript
solbody.pool.calcOutGivenIn(poolAddress: string, tokenInAddress: string, tokenOutAddress: string, tokenInAmount: string): Promise<string>;
```
```Typescript
solbody.pool.calcPoolOutGivenSingleIn(poolAddress: string, tokenInAddress: string, tokenInAmount: string): Promise<string>;
```
```Typescript
solbody.pool.calcSingleInGivenPoolOut(poolAddress: string, tokenInAddress: string, poolShares: string): Promise<string>;
```
```Typescript
solbody.pool.calcSingleOutGivenPoolIn(poolAddress: string, tokenOutAddress: string, poolShares: string): Promise<string>;
```
```Typescript
solbody.pool.calcPoolInGivenSingleOut(poolAddress: string, tokenOutAddress: string, tokenOutAmount: string): Promise<string>;
```
```Typescript
solbody.pool.getPoolSharesRequiredToRemoveDT(poolAddress: string, dtAmount: string): Promise<string>;
```
```Typescript
solbody.pool.getDTRemovedforPoolShares(poolAddress: string, poolShares: string): Promise<string>;
```
```Typescript
solbody.pool.getPoolSharesRequiredToRemoveOcean(poolAddress: string, oceanAmount: string): Promise<string>;
```
```Typescript
solbody.pool.getOceanRemovedforPoolShares(poolAddress: string, poolShares: string): Promise<string>;
```
```Typescript
solbody.pool.getTokensRemovedforPoolShares(poolAddress: string, poolShares: string): Promise<TokensReceived>;
```
```Typescript
solbody.pool.getDTMaxAddLiquidity(poolAddress: string): Promise<string>;
```
```Typescript
solbody.pool.getOceanMaxAddLiquidity(poolAddress: string): Promise<string>;
```
```Typescript
solbody.pool.getMaxAddLiquidity(poolAddress: string, tokenAddress: string): Promise<string>;
```
```Typescript
solbody.pool.getMaxRemoveLiquidity(poolAddress: string, tokenAddress: string): Promise<string>;
```
```Typescript
solbody.pool.getDTMaxRemoveLiquidity(poolAddress: string): Promise<string>;
```
```Typescript
solbody.pool.getOceanMaxRemoveLiquidity(poolAddress: string): Promise<string>;
```
```Typescript
solbody.pool.buyDT(account: string, poolAddress: string, dtAmountWanted: string, maxOceanAmount: string, maxPrice?: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.pool.sellDT(account: string, poolAddress: string, dtAmount: string, oceanAmountWanted: string, maxPrice?: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.pool.addDTLiquidity(account: string, poolAddress: string, amount: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.pool.removeDTLiquidity(account: string, poolAddress: string, amount: string, maximumPoolShares: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.pool.addOceanLiquidity(account: string, poolAddress: string, amount: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.pool.removeOceanLiquidity(account: string, poolAddress: string, amount: string, maximumPoolShares: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.pool.removePoolLiquidity(account: string, poolAddress: string, poolShares: string, minDT?: string, minOcean?: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.pool.getDTPrice(poolAddress: string): Promise<string>;
```
```Typescript
solbody.pool.searchPoolforDT(dtAddress: string): Promise<string[]>;
```
```Typescript
solbody.pool.getOceanNeeded(poolAddress: string, dtRequired: string): Promise<string>;
```
```Typescript
solbody.pool.getOceanReceived(poolAddress: string, dtSold: string): Promise<string>;
```
```Typescript
solbody.pool.getDTNeeded(poolAddress: string, OceanRequired: string): Promise<string>;
```
```Typescript
solbody.pool.getPoolsbyCreator(account?: string): Promise<PoolDetails[]>;
```
```Typescript
solbody.pool.getPoolDetails(poolAddress: string): Promise<PoolDetails>;
```
```Typescript
solbody.pool.getPoolLogs(poolAddress: string, account?: string): Promise<PoolTransaction[]>;
```
```Typescript
solbody.pool.getAllPoolLogs(account: string): Promise<PoolTransaction[]>;
```

# Fixed rate exchange
Create, price, buy datatokens  

```Typescript
solbody.exchange.create(dataToken: string, rate: string, address: string): Promise<string>;
```
```Typescript
solbody.exchange.generateExchangeId(dataToken: string, owner: string): Promise<string>;
```
```Typescript
solbody.exchange.buyDT(exchangeId: string, dataTokenAmount: string, address: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.exchange.getNumberOfExchanges(): Promise<number>;
```
```Typescript
solbody.exchange.setRate(exchangeId: string, newRate: number, address: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.exchange.activate(exchangeId: string, address: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.exchange.deactivate(exchangeId: string, address: string): Promise<TransactionReceipt>;
```
```Typescript
solbody.exchange.getRate(exchangeId: string): Promise<string>;
```
```Typescript
solbody.exchange.getSupply(exchangeId: string): Promise<string>;
```
```Typescript
solbody.exchange.getOceanNeeded(exchangeId: string, dataTokenAmount: string): Promise<string>;
```
```Typescript
solbody.exchange.getExchange(exchangeId: string): Promise<FixedPriceExchange>;
```
```Typescript
solbody.exchange.getExchanges(): Promise<string[]>;
```
```Typescript
solbody.exchange.isActive(exchangeId: string): Promise<boolean>;
```
```Typescript
solbody.exchange.CalcInGivenOut(exchangeId: string, dataTokenAmount: string): Promise<string>;
```
```Typescript
solbody.exchange.searchforDT(dataTokenAddress: string, minSupply: string): Promise<FixedPriceExchange[]>;
```
```Typescript
solbody.exchange.getExchangesbyCreator(account?: string): Promise<FixedPriceExchange[]>;
```
```Typescript
solbody.exchange.getExchangeSwaps(exchangeId: string, account?: string): Promise<FixedPriceSwap[]>;
```
```Typescript
solbody.exchange.getAllExchangesSwaps(account: string): Promise<FixedPriceSwap[]>;
```

# Compute-to-data
consume/start, stop, results, status, define-service

```Typescript
solbody.compute.start(did: string, txId: string, tokenAddress: string, consumerAccount: Account, algorithmDid?: string, algorithmMeta?: MetadataAlgorithm, output?: Output, serviceIndex?: string, serviceType?: string, algorithmTransferTxId?: string, algorithmDataToken?: string): Promise<ComputeJob>;
```
```Typescript
solbody.compute.stop(consumerAccount: Account, did: string, jobId: string): Promise<ComputeJob>;
```
```Typescript
solbody.compute.delete(consumerAccount: Account, did: string, jobId: string): Promise<ComputeJob>;
```
```Typescript
solbody.compute.status(consumerAccount: Account, did?: string, jobId?: string): Promise<ComputeJob[]>;
```
```Typescript
solbody.compute.result(consumerAccount: Account, did: string, jobId: string): Promise<ComputeJob>;
```
```Typescript
solbody.compute.createServerAttributes(serverId: string, serverType: string, cost: string, cpu: string, gpu: string, memory: string, disk: string, maxExecutionTime: number): Server;
```
```Typescript
solbody.compute.createContainerAttributes(image: string, tag: string, checksum: string): Container;
```
```Typescript
solbody.compute.createClusterAttributes(type: string, url: string): Cluster;
```
```Typescript
solbody.compute.createProviderAttributes(type: string, description: string, cluster: Cluster, containers: Container[], servers: Server[]): {
        type: string;
        description: string;
        environment: {
            cluster: Cluster;
            supportedServers: Server[];
            supportedContainers: Container[];
        };
    };
```
```Typescript
solbody.compute.createComputeService(consumerAccount: Account, cost: string, datePublished: string, providerAttributes: any, computePrivacy?: ServiceComputePrivacy, timeout?: number, providerUri?: string): ServiceCompute;
```
```Typescript
solbody.compute.order(consumerAccount: string, datasetDid: string, serviceIndex: number, algorithmDid?: string, algorithmMeta?: MetadataAlgorithm, mpAddress?: string): SubscribablePromise<OrderProgressStep, string>;
```
