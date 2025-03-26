import Terminal from "@terminaldotshop/sdk"

const TERMINAL_BEARER_TOKEN = process.env.TERMINAL_DEV_BEARER_TOKEN

const client = new Terminal({
  bearerToken: TERMINAL_BEARER_TOKEN, // This is the default and can be omitted
  environment: "dev", // defaults to 'production'
})

export async function getCart() {
  const [{ data: products }, { data: cart }] = await Promise.all([
    client.product.list(),
    client.cart.get(),
  ])

  const enrichedItems = cart.items.map((item) => {
    const product = products.find((product) =>
      product.variants.some((variant) => variant.id === item.productVariantID),
    )

    return {
      ...item,
      product,
    }
  })

  const updatedCart = {
    ...cart,
    items: enrichedItems,
  }

  console.log(updatedCart)

  return updatedCart
}
