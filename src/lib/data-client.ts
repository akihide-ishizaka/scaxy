"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

export function getDataClient() {
  return generateClient<Schema>();
}
