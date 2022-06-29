import { graph, file } from "react-native-fula"
import { AssetMeta } from "../types"

const ASSET_META_QUERY = `
  query getAssetsMetas($filter:JSON){
    read(input:{
      collection:"assetsMetas",
      filter: $filter
    }){
      id
      name
      jwe
      ownerId
      date
    }
  } 
`
const ADD_ASSET_META = `
  mutation addAssetMeta($values:JSON){
    create(input:{
      collection:"assetsMetas",
      values: $values
    }){
      id
      name
      jwe
      ownerId
      date
    }
  }
`

export const addAssetMeta = async (meta: AssetMeta): Promise<AssetMeta> => {
  const result = await graph.graphql(ADD_ASSET_META, {
    values: [
      {
        ...meta,
      },
    ],
  })
  return result?.data?.create?.[0]
}

export const getAssetMeta = async (ownerId: string, id: string): Promise<AssetMeta> => {
  const result = await graph.graphql(ASSET_META_QUERY, {
    filter: {
      and: [
        {
          ownerId: { eq: `${ownerId}` },
        },
        {
          id: { eq: `${id}` },
        },
      ],
    },
  })
  return result?.data?.read?.[0]
}
