import { type SchemaTypeDefinition } from "sanity";

import { profile } from "./profile";
import { post } from "./post";
import { comment } from "./comment";
import { chat } from "./chat";
import { message } from "./message";
import { messageRequest } from "./messageRequest";
import { soundPad } from "./soundPad";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [profile, post, comment, chat, message, messageRequest, soundPad],
};
