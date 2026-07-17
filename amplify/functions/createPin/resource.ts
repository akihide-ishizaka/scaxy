import { defineFunction } from "@aws-amplify/backend";

export const createPin = defineFunction({
  name: "createPin",
  entry: "./handler.ts",
  timeoutSeconds: 30,
});
