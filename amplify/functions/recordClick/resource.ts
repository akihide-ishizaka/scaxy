import { defineFunction } from "@aws-amplify/backend";

export const recordClick = defineFunction({
  name: "recordClick",
  entry: "./handler.ts",
  timeoutSeconds: 15,
});
