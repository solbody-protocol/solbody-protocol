import { DDO } from '../ddo/DDO'
import { Solbody } from '../solbody/Solbody'

export interface AssetResolved {
  did: string
  ddo: DDO
}

export function isDdo(arg: any): arg is DDO {
  return arg.id !== undefined
}

export async function assetResolve(
  asset: DDO | string,
  solbody: Solbody
): Promise<AssetResolved> {
  if (isDdo(asset)) {
    const did = asset.id
    const ddo = asset
    return { did, ddo }
  } else {
    const ddo = await solbody.assets.resolve(asset)
    const did = ddo.id
    return { did, ddo }
  }
}
