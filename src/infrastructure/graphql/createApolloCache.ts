import { InMemoryCache } from "@apollo/client"

/** 部分Queryで取得する埋込設定は、未取得Fieldを既存Cacheから失わせない。 */
export const createApolloCache = () =>
  new InMemoryCache({
    typePolicies: {
      User: { fields: { preferences: { merge: true } } },
      Community: { fields: { mySettings: { merge: true } } },
    },
  })
