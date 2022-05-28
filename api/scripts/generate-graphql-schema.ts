import * as fs from "fs";
import { join } from "path";
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from "@nestjs/graphql";
import { NestFactory } from "@nestjs/core";
import { printSchema } from "graphql";
import { UsersResolver } from "../src/graphql/users/users.resolver";

async function generateSchema(): Promise<string> {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule);
  await app.init();

  const gqlSchemaFactory = app.get(GraphQLSchemaFactory);
  const schema = await gqlSchemaFactory.create([UsersResolver]);
  return printSchema(schema);
}

generateSchema().then((schema) => {
  fs.writeFileSync(join(__dirname, "../src/graphql/schema.graphql"), schema);
});
