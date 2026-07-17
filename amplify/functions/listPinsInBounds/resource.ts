import { defineFunction } from "@aws-amplify/backend";

export const listPinsInBounds = defineFunction({
  name: "listPinsInBounds",
  entry: "./handler.ts",
  timeoutSeconds: 30,
});
