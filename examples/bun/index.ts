import { create } from "../../packages/opencontrol/src"
import { createMistral } from "@ai-sdk/mistral"
import { tools } from "./tools"
import { Hono } from "hono"

import HTML from "../../frontend/dist/index.html"

const models = {
  mistral: createMistral({
    apiKey: process.env.MISTRAL_API_KEY,
  })("mistral-small-latest"),
}

const app = create({
  model: models.mistral,
  tools,
})

export default app
