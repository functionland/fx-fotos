import { graph, file } from "react-native-fula"

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
export const addAssetMeta = async (meta: {
  id: string
  name: string
  jwe: file.FileRef
  ownerId: string
  date: string
}) => {
  const result = await graph.graphql(ADD_ASSET_META, {
    values: [
      {
        ...meta,
      },
    ],
  })
  return result?.data?.create?.[0]
}

export const getAssetsMetas = async (ownerId: string) => {
  const result = await graph.graphql(ASSET_META_QUERY, {
    filter: { ownerId: { eq: `${ownerId}` } },
  })
  return result?.data?.read
}
