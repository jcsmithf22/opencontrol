import { hc } from "hono/client"
import { App } from "../../opencontrol/src"
import { createSignal } from "solid-js"

const ENDPOINT = import.meta.env.DEV
  ? "http://localhost:3000"
  : import.meta.env.VITE_OPENCONTROL_ENDPOINT

export const [password, setPassword] = createSignal()
export const client = hc<App>(ENDPOINT || "", {
  async fetch(...args: Parameters<typeof fetch>): Promise<Response> {
    const [input, init] = args
    const request = input instanceof Request ? input : new Request(input, init)
    const headers = new Headers(request.headers)
    headers.set("authorization", `Bearer ${password()}`)
    return fetch(
      new Request(request, {
        ...init,
        headers,
      }),
    )
  },
})
