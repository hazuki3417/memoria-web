import { graphql, GraphQLSchema } from "graphql";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { addMocksToSchema } from "@graphql-tools/mock";
import { loadFilesSync } from "@graphql-tools/load-files";
import { join } from "path";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";

// スキーマ定義の読み込み（複数ファイル対応）
const typeDefs = loadFilesSync(
  join(process.cwd(), "src/graphql/schema/**/*.graphql"),
);

// 実行時に使う GraphQLSchema を構築（モック化）
const schema: GraphQLSchema = addMocksToSchema({
  schema: makeExecutableSchema({ typeDefs }),
});

export async function POST(req: NextRequest) {
  const { query, variables, operationName } = await req.json();

  if (operationName === "GetImageConnection") {
    const edge = () => {
      return {
        node: {
          id: nanoid(),
          info: {
            file: { name: "", size: 10, date: "date" },
            size: { width: "", height: "" },
            tags: [],
          },
          src: {
            thumbnail: "",
            original: "",
          },
        },
        cursor: "",
      };
    };

    return NextResponse.json({
      data: {
        images: {
          edges: [
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
            edge(),
          ],
          pageInfo: {
            hasNextPage: true,
            hasPrevPage: true,
            startCursor: "String",
            endCursor: "String",
          },
        },
      },
    });
  }

  const result = await graphql({
    schema,
    source: query,
    variableValues: variables,
    operationName,
  });

  return NextResponse.json(result);
}
