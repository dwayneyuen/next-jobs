import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from "@nestjs/graphql";
import { NestFactory } from "@nestjs/core";
import * as fs from "fs";
import { printSchema } from "graphql";
import { UsersResolver } from "../src/graphql/users/users.resolver";
import { join } from "path";

async function generateSchema(): Promise<string> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([UsersResolver]);
  return printSchema(schema);
}

generateSchema().then((schema) => {
  console.log(
    "fs:",
    fs,
    "schema:",
    schema,
    "dirname:",
    join(__dirname, "../graphql/schema.gql"),
  );
  fs.writeFileSync(join(__dirname, "../src/graphql/schema.gql"), schema);
});
