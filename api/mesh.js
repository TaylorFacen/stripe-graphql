// These are required to get the now cli to bundle them
import "@graphql-mesh/graphql"
import "@graphql-mesh/openapi"

import { getMesh, processConfig } from "@graphql-mesh/runtime";
import { ApolloServer } from "apollo-server-micro";

export default async (req, res) => {
    // Literal config object replaces .meshrc.yaml for serverless
    const parsedConfig = await processConfig({
      "sources": [
        {
          "name": "Stripe",
          "handler": {
            "openapi": {
              "source": "https://raw.githubusercontent.com/stripe/openapi/master/openapi/spec3.json",
              "baseUrl": process.env.STRIPE_BASE_URL,
              headers: {
                Authorization: req.headers.authorization
              }              
            }
          }
        }
      ]
    });
  
    const { schema, contextBuilder: context } = await getMesh(parsedConfig);
  
    return new ApolloServer({
      schema,
      context,
      introspection: true, // Required for Hasura Remote Schema introspection
      playground: true, // Optional: Default is `false` in production
    }).createHandler({ path: "/api/mesh" })(req, res);
  };
  
  export const config = {
    api: {
      bodyParser: false
    }
  };