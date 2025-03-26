import { tool } from "../../packages/opencontrol/src/tool"
import { z } from "zod"
import Terminal from "@terminaldotshop/sdk"

const TERMINAL_BEARER_TOKEN = process.env.TERMINAL_DEV_BEARER_TOKEN

const client = new Terminal({
  bearerToken: TERMINAL_BEARER_TOKEN, // This is the default and can be omitted
  environment: "dev", // defaults to 'production'
})

// Product Tools
const listProducts = tool({
  name: "list_products",
  description: "List all available products from Terminal.shop",
  async run() {
    const products = await client.product.list()
    return products.data
  },
})

const getProduct = tool({
  name: "get_product",
  description: "Get details of a specific product by ID",
  args: z.object({
    productId: z
      .string()
      .describe("The product ID (e.g., prd_XXXXXXXXXXXXXXXXXXXXXXXXX)"),
  }),
  async run(input) {
    const product = await client.product.get(input.productId)
    return product.data
  },
})

// Profile Tools
const getProfile = tool({
  name: "get_profile",
  description: "Get the current user's profile information",
  async run() {
    const profile = await client.profile.me()
    return profile.data
  },
})

const updateProfile = tool({
  name: "update_profile",
  description: "Update the current user's profile information",
  args: z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
  }),
  async run({ email, name }) {
    const profile = await client.profile.update({
      email,
      name,
    })
    return profile.data
  },
})

// Address Tools
const listAddresses = tool({
  name: "list_addresses",
  description: "List all saved addresses for the current user",
  async run() {
    const addresses = await client.address.list()
    return addresses.data
  },
})

const getAddress = tool({
  name: "get_address",
  description: "Get details of a specific address by ID",
  args: z.object({
    addressId: z
      .string()
      .describe("The address ID (e.g., shp_XXXXXXXXXXXXXXXXXXXXXXXXX)"),
  }),
  async run({ addressId }) {
    const address = await client.address.get(addressId)
    return address.data
  },
})

const createAddress = tool({
  name: "create_address",
  description: "Create a new shipping address",
  args: z.object({
    city: z.string(),
    country: z.string(),
    name: z.string(),
    street1: z.string(),
    zip: z.string(),
    street2: z.string().optional(),
  }),
  async run({ city, country, name, street1, zip, street2 }) {
    const address = await client.address.create({
      city,
      country,
      name,
      street1,
      zip,
      street2,
    })
    return address.data
  },
})

const deleteAddress = tool({
  name: "delete_address",
  description: "Delete a shipping address by ID",
  args: z.object({
    addressId: z
      .string()
      .describe("The address ID (e.g., shp_XXXXXXXXXXXXXXXXXXXXXXXXX)"),
  }),
  async run(input) {
    const result = await client.address.delete(input.addressId)
    return result.data
  },
})

// Card Tools
const listCards = tool({
  name: "list_cards",
  description: "List all saved credit cards for the current user",
  async run() {
    const cards = await client.card.list()
    return cards.data
  },
})

const getCard = tool({
  name: "get_card",
  description: "Get details of a specific credit card by ID",
  args: z.object({
    cardId: z
      .string()
      .describe("The card ID (e.g., crd_XXXXXXXXXXXXXXXXXXXXXXXXX)"),
  }),
  async run(input) {
    const card = await client.card.get(input.cardId)
    return card.data
  },
})

const createCard = tool({
  name: "create_card",
  description:
    "Attach a new credit card (via Stripe token) to the current user",
  args: z.object({
    token: z
      .string()
      .describe(
        "Stripe token representing the card (e.g., tok_1N3T00LkdIwHu7ixt44h1F8k)",
      ),
  }),
  async run({ token }) {
    const card = await client.card.create({ token })
    return card.data
  },
})

const collectCard = tool({
  name: "collect_card",
  description: "Create a temporary URL for collecting credit card information",
  async run() {
    const response = await client.card.collect()
    return response.data
  },
})

// Cart Tools
const getCart = tool({
  name: "get_cart",
  description: "Get the current user's cart contents",
  async run() {
    const cart = await client.cart.get()
    return cart.data
  },
})

const addCartItem = tool({
  name: "add_cart_item",
  description:
    "Add an item to the current user's cart. This is the default when a user would like to place an order. Adding items to cart does not automatically place the order.",
  args: z.object({
    productVariantID: z.string().describe("The product variant ID to add"),
    quantity: z.number().min(1).describe("Quantity to add"),
  }),
  async run({ productVariantID, quantity }) {
    const response = await client.cart.setItem({
      productVariantID,
      quantity,
    })
    return response.data
  },
})

const setCartAddress = tool({
  name: "set_cart_address",
  description: "Set the shipping address for the current user's cart",
  args: z.object({
    addressID: z.string().describe("The address ID to use for shipping"),
  }),
  async run({ addressID }) {
    const response = await client.cart.setAddress({ addressID })
    return response.data
  },
})

const setCartCard = tool({
  name: "set_cart_card",
  description: "Set the payment card for the current user's cart",
  args: z.object({
    cardID: z.string().describe("The card ID to use for payment"),
  }),
  async run({ cardID }) {
    const response = await client.cart.setCard({
      cardID,
    })
    return response.data
  },
})

const convertCartToOrder = tool({
  name: "convert_cart_to_order",
  description:
    "Convert the current user's cart to an order. Always double check before calling this.",
  async run() {
    const response = await client.cart.convert()
    return response.data
  },
})

const clearCart = tool({
  name: "clear_cart",
  description: "Clear all items from the current user's cart",
  async run() {
    const response = await client.cart.clear()
    return response.data
  },
})

// Order Tools
const listOrders = tool({
  name: "list_orders",
  description: "List all orders for the current user",
  async run() {
    const orders = await client.order.list()
    return orders.data
  },
})

const getOrder = tool({
  name: "get_order",
  description: "Get details of a specific order by ID",
  args: z.object({
    orderId: z
      .string()
      .describe("The order ID (e.g., ord_XXXXXXXXXXXXXXXXXXXXXXXXX)"),
  }),
  async run(input) {
    const order = await client.order.get(input.orderId)
    return order.data
  },
})

const _createOrder = tool({
  name: "create_order",
  description:
    "Create an order directly, bypassing the cart. Use with caution. Do not use this unless specifically requested by the user to order directly. The default should always be to add items to the cart.",
  args: z.object({
    addressID: z.string().describe("The shipping address ID"),
    cardID: z.string().describe("The payment card ID"),
    variants: z
      .record(
        z.string().describe("Product Variant ID"),
        z.number().min(1).describe("Quantity"),
      )
      .describe(
        "An object mapping product variant IDs to quantities (e.g., { var_XXXXXXXXXXXXXXXXXXXXXXXXX: 1 })",
      ),
  }),
  async run(input) {
    const order = await client.order.create({
      addressID: input.addressID,
      cardID: input.cardID,
      variants: input.variants,
    })
    return order.data
  },
})

// Subscription Tools
const listSubscriptions = tool({
  name: "list_subscriptions",
  description: "List all subscriptions for the current user",
  async run() {
    const subscriptions = await client.subscription.list()
    return subscriptions.data
  },
})

const getSubscription = tool({
  name: "get_subscription",
  description: "Get details of a specific subscription by ID",
  args: z.object({
    subscriptionId: z
      .string()
      .describe("The subscription ID (e.g., sub_XXXXXXXXXXXXXXXXXXXXXXXXX)"),
  }),
  async run(input) {
    const subscription = await client.subscription.get(input.subscriptionId)
    return subscription.data
  },
})

const createSubscription = tool({
  name: "create_subscription",
  description: "Create a new subscription for the current user",
  args: z.object({
    addressID: z.string().describe("The shipping address ID"),
    cardID: z.string().describe("The payment card ID"),
    productVariantID: z
      .string()
      .describe("The product variant ID to subscribe to"),
    quantity: z.number().min(1).describe("The quantity for the subscription"),
  }),
  async run({ addressID, cardID, productVariantID, quantity }) {
    // @ts-ignore
    const subscription = await client.subscription.create({
      addressID,
      cardID,
      productVariantID,
      quantity,
    })
    return subscription.data
  },
})

const cancelSubscription = tool({
  name: "cancel_subscription",
  description: "Cancel a subscription by ID",
  args: z.object({
    subscriptionId: z
      .string()
      .describe(
        "The subscription ID to cancel (e.g., sub_XXXXXXXXXXXXXXXXXXXXXXXXX)",
      ),
  }),
  async run(input) {
    const result = await client.subscription.delete(input.subscriptionId)
    return result.data
  },
})

// Token Tools
const listTokens = tool({
  name: "list_tokens",
  description: "List all personal access tokens for the current user",
  async run() {
    const tokens = await client.token.list()
    return tokens.data
  },
})

const getToken = tool({
  name: "get_token",
  description: "Get details of a specific personal access token by ID",
  args: z.object({
    tokenId: z
      .string()
      .describe("The token ID (e.g., pat_XXXXXXXXXXXXXXXXXXXXXXXXX)"),
  }),
  async run(input) {
    const token = await client.token.get(input.tokenId)
    return token.data
  },
})

const createToken = tool({
  name: "create_token",
  description: "Create a new personal access token",
  async run() {
    const token = await client.token.create()
    return token.data
  },
})

const deleteToken = tool({
  name: "delete_token",
  description: "Delete a personal access token by ID",
  args: z.object({
    tokenId: z
      .string()
      .describe("The token ID to delete (e.g., pat_XXXXXXXXXXXXXXXXXXXXXXXXX)"),
  }),
  async run(input) {
    const result = await client.token.delete(input.tokenId)
    return result.data
  },
})

// Email Tools
const subscribeEmail = tool({
  name: "subscribe_email",
  description: "Subscribe an email address to Terminal updates",
  args: z.object({
    email: z.string().email().describe("The email address to subscribe"),
  }),
  async run(input) {
    const email = await client.email.create({
      email: input.email,
    })
    return email.data
  },
})

// Keep the existing think tool
const think = tool({
  name: "think",
  description:
    "Use the tool to think about something. It will not obtain new information or change the database, but just append the thought to the log. Use it when complex reasoning or some cache memory is needed.",
  args: z.object({
    thought: z.string(),
  }),
  async run(input) {
    return { thought: input.thought }
  },
})

export const tools = [
  listProducts,
  getProduct,
  getProfile,
  updateProfile,
  listAddresses,
  getAddress,
  createAddress,
  deleteAddress,
  listCards,
  getCard,
  createCard,
  collectCard,
  getCart,
  addCartItem,
  setCartAddress,
  setCartCard,
  convertCartToOrder,
  clearCart,
  listOrders,
  getOrder,
  listSubscriptions,
  getSubscription,
  createSubscription,
  cancelSubscription,
  listTokens,
  getToken,
  createToken,
  deleteToken,
  subscribeEmail,
  think,
]
