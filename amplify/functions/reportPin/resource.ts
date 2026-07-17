import { defineFunction } from "@aws-amplify/backend";

export const reportPin = defineFunction({
  name: "reportPin",
  entry: "./handler.ts",
  timeoutSeconds: 30,
});
