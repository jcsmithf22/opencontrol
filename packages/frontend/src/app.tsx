import { LanguageModelV1Prompt } from "ai"
import { createEffect, ErrorBoundary, For, onCleanup, Suspense } from "solid-js"
import { createStore } from "solid-js/store"
import SYSTEM_PROMPT from "./system.txt?raw"
import { hc } from "hono/client"
import { type App } from "../../opencontrol/src"
import { client } from "./client"
import { createQuery } from "@tanstack/solid-query"

const providerMetadata = {
  anthropic: {
    cacheControl: {
      type: "ephemeral",
    },
  },
}

// Define initial system messages once
const getInitialPrompt = (): LanguageModelV1Prompt => [
  {
    role: "system",
    content: SYSTEM_PROMPT,
    providerMetadata: {
      anthropic: {
        cacheControl: {
          type: "ephemeral",
        },
      },
    },
  },
  {
    role: "system",
    content: `The current date is ${new Date().toDateString()}`,
    providerMetadata: {
      anthropic: {
        cacheControl: {
          type: "ephemeral",
        },
      },
    },
  },
]

export function App() {
  let root: HTMLDivElement | undefined
  let textarea: HTMLTextAreaElement | undefined

  const cartQuery = createQuery(() => ({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await client.cart.$get()
      return response.json()
    },
    throwOnError: true,
  }))

  /* THIS IS THE SCHEMA FOR THE BELOW FUNCTION AI
   * {
  "type": "object",
  "properties": {
    "data": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string",
            "description": "Unique object identifier.\nThe format and length of IDs may change over time.",
            "example": "ord_XXXXXXXXXXXXXXXXXXXXXXXXX"
          },
          "index": {
            "type": "integer",
            "description": "Zero-based index of the order for this user only.",
            "example": 0
          },
          "shipping": {
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "The recipient's name.",
                "example": "John Doe"
              },
              "street1": {
                "type": "string",
                "description": "Street of the address.",
                "example": "123 Main St"
              },
              "street2": {
                "type": "string",
                "description": "Apartment, suite, etc. of the address.",
                "example": "Apt 1"
              },
              "city": {
                "type": "string",
                "description": "City of the address.",
                "example": "Anytown"
              },
              "province": {
                "type": "string",
                "description": "Province or state of the address.",
                "example": "CA"
              },
              "country": {
                "type": "string",
                "minLength": 2,
                "maxLength": 2,
                "description": "ISO 3166-1 alpha-2 country code of the address.",
                "example": "US"
              },
              "zip": {
                "type": "string",
                "description": "Zip code of the address.",
                "example": "12345"
              },
              "phone": {
                "type": "string",
                "description": "Phone number of the recipient.",
                "example": "5555555555"
              }
            },
            "required": [
              "name",
              "street1",
              "city",
              "country",
              "zip"
            ],
            "description": "Shipping address of the order.",
            "example": {
              "name": "John Doe",
              "street1": "123 Main St",
              "street2": "Apt 1",
              "city": "Anytown",
              "province": "CA",
              "zip": "12345",
              "country": "US",
              "phone": "5555555555"
            }
          },
          "amount": {
            "type": "object",
            "properties": {
              "shipping": {
                "type": "integer",
                "description": "Shipping amount of the order, in cents (USD).",
                "example": 800
              },
              "subtotal": {
                "type": "integer",
                "description": "Subtotal amount of the order, in cents (USD).",
                "example": 4400
              }
            },
            "required": [
              "shipping",
              "subtotal"
            ],
            "description": "The subtotal and shipping amounts of the order.",
            "example": {
              "subtotal": 4400,
              "shipping": 800
            }
          },
          "tracking": {
            "type": "object",
            "properties": {
              "service": {
                "type": "string",
                "description": "Shipping service of the order.",
                "example": "USPS Ground Advantage"
              },
              "number": {
                "type": "string",
                "description": "Tracking number of the order.",
                "example": "92346903470167000000000019"
              },
              "url": {
                "type": "string",
                "description": "Tracking URL of the order.",
                "example": "https://tools.usps.com/go/TrackConfirmAction_input?origTrackNum=92346903470167000000000019"
              }
            },
            "description": "Tracking information of the order.",
            "example": {
              "service": "USPS Ground Advantage",
              "number": "92346903470167000000000019",
              "url": "https://tools.usps.com/go/TrackConfirmAction_input?origTrackNum=92346903470167000000000019"
            }
          },
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": {
                  "type": "string",
                  "description": "Unique object identifier.\nThe format and length of IDs may change over time.",
                  "example": "itm_XXXXXXXXXXXXXXXXXXXXXXXXX"
                },
                "description": {
                  "type": "string",
                  "description": "Description of the item in the order."
                },
                "amount": {
                  "type": "integer",
                  "description": "Amount of the item in the order, in cents (USD).",
                  "example": 4400
                },
                "quantity": {
                  "type": "integer",
                  "minimum": 0,
                  "description": "Quantity of the item in the order.",
                  "example": 2
                },
                "productVariantID": {
                  "type": "string",
                  "description": "ID of the product variant of the item in the order.",
                  "example": "var_XXXXXXXXXXXXXXXXXXXXXXXXX"
                }
              },
              "required": [
                "id",
                "amount",
                "quantity"
              ],
              "example": {
                "id": "itm_XXXXXXXXXXXXXXXXXXXXXXXXX",
                "amount": 4400,
                "quantity": 2,
                "productVariantID": "var_XXXXXXXXXXXXXXXXXXXXXXXXX"
              }
            },
            "description": "Items in the order.",
            "example": [
              {
                "id": "itm_XXXXXXXXXXXXXXXXXXXXXXXXX",
                "amount": 4400,
                "quantity": 2,
                "productVariantID": "var_XXXXXXXXXXXXXXXXXXXXXXXXX"
              }
            ]
          }
        },
        "required": [
          "id",
          "shipping",
          "amount",
          "tracking",
          "items"
        ],
        "description": "An order from the Terminal shop.",
        "example": {
          "id": "ord_XXXXXXXXXXXXXXXXXXXXXXXXX",
          "index": 0,
          "shipping": {
            "name": "John Doe",
            "street1": "123 Main St",
            "street2": "Apt 1",
            "city": "Anytown",
            "province": "CA",
            "zip": "12345",
            "country": "US",
            "phone": "5555555555"
          },
          "amount": {
            "subtotal": 4400,
            "shipping": 800
          },
          "tracking": {
            "service": "USPS Ground Advantage",
            "number": "92346903470167000000000019",
            "url": "https://tools.usps.com/go/TrackConfirmAction_input?origTrackNum=92346903470167000000000019"
          },
          "items": [
            {
              "id": "itm_XXXXXXXXXXXXXXXXXXXXXXXXX",
              "amount": 4400,
              "quantity": 2,
              "productVariantID": "var_XXXXXXXXXXXXXXXXXXXXXXXXX"
            }
          ]
        }
      },
      "description": "List of orders.",
      "example": [
        {
          "id": "ord_XXXXXXXXXXXXXXXXXXXXXXXXX",
          "index": 0,
          "shipping": {
            "name": "John Doe",
            "street1": "123 Main St",
            "street2": "Apt 1",
            "city": "Anytown",
            "province": "CA",
            "zip": "12345",
            "country": "US",
            "phone": "5555555555"
          },
          "amount": {
            "subtotal": 4400,
            "shipping": 800
          },
          "tracking": {
            "service": "USPS Ground Advantage",
            "number": "92346903470167000000000019",
            "url": "https://tools.usps.com/go/TrackConfirmAction_input?origTrackNum=92346903470167000000000019"
          },
          "items": [
            {
              "id": "itm_XXXXXXXXXXXXXXXXXXXXXXXXX",
              "amount": 4400,
              "quantity": 2,
              "productVariantID": "var_XXXXXXXXXXXXXXXXXXXXXXXXX"
            }
          ]
        }
      ]
    }
  },
  "required": [
    "data"
  ]
}*/
  const ordersQuery = createQuery(() => ({
    queryKey: ["orders"],
    queryFn: async () => {
      const response = await client.order.$get()
      return response.json()
    },
    throwOnError: true,
  }))

  const toolDefs = client.mcp
    .$post({
      json: {
        jsonrpc: "2.0",
        method: "tools/list",
        id: "1",
      },
    })
    .then((response) => response.json())
    .then((response) =>
      "tools" in response.result ? response.result.tools : [],
    )

  const [store, setStore] = createStore<{
    prompt: LanguageModelV1Prompt
    isProcessing: boolean
    rate: boolean
  }>({
    rate: false,
    prompt: getInitialPrompt(),
    isProcessing: false,
  })

  createEffect(() => {
    const messages = store.prompt
    console.log("scrolling to bottom")
    root?.scrollTo(0, root?.scrollHeight)
    return messages.length
  }, 0)

  createEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && store.isProcessing) {
        setStore("isProcessing", false)
        textarea?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyDown)
    })
  })

  function clearConversation() {
    setStore("prompt", getInitialPrompt())
  }

  async function send(message: string) {
    setStore("isProcessing", true)
    setStore("prompt", store.prompt.length, {
      role: "user",
      content: [
        {
          type: "text",
          text: message,
          providerMetadata: store.prompt.length === 1 ? providerMetadata : {},
        },
      ],
    })

    while (true) {
      if (!store.isProcessing) {
        console.log("Processing cancelled by user")
        break
      }

      const response = await client.generate.$post({
        json: {
          prompt: store.prompt,
          mode: {
            type: "regular",
            tools: (await toolDefs).map((tool: any) => ({
              type: "function",
              name: tool.name,
              description: tool.description,
              parameters: {
                ...tool.inputSchema,
              },
            })),
          },
          inputFormat: "messages",
          temperature: 1,
        },
      })

      if (!store.isProcessing) continue

      if (!response.ok) {
        if (response.status === 400) {
          setStore("prompt", (val) => {
            val.splice(2, 1)
            console.log(val)
            return [...val]
          })
        }
        if (response.status === 429) {
          setStore("rate", true)
        }
        await new Promise((resolve) => setTimeout(resolve, 1000))
        continue
      }

      const result = await response.json()

      if (result.text) {
        setStore("prompt", store.prompt.length, {
          role: "assistant",
          content: [
            {
              type: "text",
              text: result.text,
            },
          ],
        })
      }

      setStore("rate", false)

      if (result.finishReason === "stop") {
        setStore("isProcessing", false)
        break
      }

      if (result.finishReason === "tool-calls") {
        for (const item of result.toolCalls!) {
          console.log("calling tool", item.toolName, item.args)
          setStore("prompt", store.prompt.length, {
            role: "assistant",
            content: [
              {
                type: "tool-call",
                toolName: item.toolName,
                args: JSON.parse(item.args),
                toolCallId: item.toolCallId,
              },
            ],
          })

          const response = await client.mcp
            .$post({
              json: {
                jsonrpc: "2.0",
                id: "2",
                method: "tools/call",
                params: {
                  name: item.toolName,
                  arguments: JSON.parse(item.args),
                },
              },
            })
            .then((r) => r.json())
          if ("content" in response.result) {
            setStore("prompt", store.prompt.length, {
              role: "tool",
              content: [
                {
                  type: "tool-result",
                  toolName: item.toolName,
                  toolCallId: item.toolCallId,
                  result: response.result.content,
                },
              ],
            })
          } else break
        }
      }
    }
    setStore("isProcessing", false)
    cartQuery.refetch()
    textarea?.focus()
  }

  return (
    <div data-component="root" ref={root}>
      <div data-slot="sidebar">
        <div data-component="shopping-cart">
          <h3>Shopping Cart</h3>
          {/* An error while fetching will be caught by the ErrorBoundary */}
          <ErrorBoundary
            fallback={<div data-slot="cart-error">Something went wrong!</div>}
          >
            {/* Suspense will trigger a loading state while the data is being fetched */}
            <Suspense
              fallback={<div data-slot="cart-loading">Loading cart...</div>}
            >
              {cartQuery.data && (
                <div data-slot="cart-details">
                  <div data-slot="cart-items">
                    <h4>Items ({cartQuery.data.items.length})</h4>
                    <For each={cartQuery.data.items}>
                      {(item) => (
                        <div data-slot="cart-item">
                          <div data-slot="item-name">{item.product?.name}</div>
                          <div data-slot="item-quantity">
                            Qty: {item.quantity}
                          </div>
                          <div data-slot="item-price">
                            ${(item.subtotal / 100).toFixed(2)}
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                  <div data-slot="cart-summary">
                    <div data-slot="summary-row">
                      <span>Subtotal:</span>
                      <span>
                        ${(cartQuery.data.amount.subtotal / 100).toFixed(2)}
                      </span>
                    </div>
                    <div data-slot="summary-row">
                      <span>Shipping:</span>
                      <span>
                        $
                        {((cartQuery.data.amount.shipping ?? 0) / 100).toFixed(
                          2,
                        )}
                      </span>
                    </div>
                    <div data-slot="summary-row" data-total="true">
                      <span>Total:</span>
                      <span>
                        ${((cartQuery.data.amount.total ?? 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
        <div data-component="order-history">
          <h3>Order History</h3>
          <ErrorBoundary
            fallback={<div data-slot="order-error">Something went wrong!</div>}
          >
            <Suspense
              fallback={<div data-slot="order-loading">Loading orders...</div>}
            >
              {ordersQuery.data && (
                <div data-slot="order-details">
                  <For each={ordersQuery.data}>
                    {(order) => (
                      <div data-slot="order">
                        <div data-slot="order-id">Order #{order.id}</div>
                        <div data-slot="order-date">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div data-slot="order-total">
                          ${((order.amount.total ?? 0) / 100).toFixed(2)}
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              )}
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
      <div data-component="messages">
        <For each={store.prompt}>
          {(item) => (
            <>
              {item.role === "user" && item.content[0].type === "text" && (
                <div data-slot="message" data-user={true}>
                  {item.content[0].text}
                </div>
              )}

              {item.role === "assistant" &&
                item.content[0].type === "tool-call" &&
                (() => {
                  const [showArgs, setShowArgs] = createStore({
                    visible: false,
                  })

                  const toggleArgs = () => {
                    setShowArgs("visible", (prev) => !prev)
                  }

                  return (
                    <div data-slot="message" data-tool={true}>
                      <div data-slot="tool-header" onClick={toggleArgs}>
                        <span data-slot="tool-icon">🔧</span>
                        <span data-slot="tool-name">
                          {item.content[0].toolName}
                        </span>
                        <span data-slot="tool-expand">
                          {showArgs.visible ? "−" : "+"}
                        </span>
                      </div>
                      {showArgs.visible && (
                        <div data-slot="tool-args">
                          <pre>
                            {JSON.stringify(item.content[0].args, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )
                })()}

              {/* Show assistant text messages */}
              {item.role === "assistant" && item.content[0].type === "text" && (
                <div data-slot="message" data-assistant={true}>
                  {item.content[0].text}
                </div>
              )}

              {/* Show system messages, but not the first ones (initial prompts) */}
              {item.role === "system" && store.prompt.indexOf(item) > 1 && (
                <div data-slot="message" data-system={true}>
                  {item.content}
                </div>
              )}
            </>
          )}
        </For>
        {/* Loading indicator bar */}
        {store.isProcessing && (
          <div data-slot="thinking-bar">
            <div data-slot="thinking-spinner">
              <div data-slot="spinner-inner"></div>
            </div>
            <div data-slot="thinking-text">
              {store.rate && "Rate limited, retrying..."}
              {!store.rate && "Thinking"}
            </div>
          </div>
        )}

        <div data-slot="spacer"></div>
      </div>
      <div data-component="footer">
        {store.prompt.length > 2 && !store.isProcessing && (
          <div data-slot="clear">
            <button data-component="clear-button" onClick={clearConversation}>
              Clear
            </button>
          </div>
        )}
        <div data-slot="chat">
          <textarea
            autofocus
            ref={textarea}
            disabled={store.isProcessing}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !store.isProcessing) {
                send(e.currentTarget.value)
                e.currentTarget.value = ""
                e.preventDefault()
              }
            }}
            data-component="input"
            placeholder={
              store.isProcessing
                ? "Processing... (Press Esc to cancel)"
                : "Type your message here"
            }
          />
        </div>
      </div>
    </div>
  )
}
