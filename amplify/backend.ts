import { defineBackend } from "@aws-amplify/backend";
import { auth } from "./auth/resource.ts";
import { postConfirmation } from "./auth/post-confirmation/resource.ts";
import { data } from "./data/resource.ts";
import { storage } from "./storage/resource.ts";
import { createPin } from "./functions/createPin/resource.ts";
import { reportPin } from "./functions/reportPin/resource.ts";
import { recordClick } from "./functions/recordClick/resource.ts";
import { listPinsInBounds } from "./functions/listPinsInBounds/resource.ts";

const backend = defineBackend({
  auth,
  data,
  storage,
  postConfirmation,
  createPin,
  reportPin,
  recordClick,
  listPinsInBounds,
});

export default backend;
