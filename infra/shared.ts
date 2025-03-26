import { isPermanentStage, domain } from "./stage"

export const router = isPermanentStage
  ? new sst.aws.Router("Router", {
      domain: {
        name: domain,
        aliases: ["*." + domain],
        dns: sst.cloudflare.dns({
          zone: "2eeb3aac61ad26f10be95c5365bd8b89",
        }),
      },
    })
  : sst.aws.Router.get("Router", "E1XWRGCYGTFB7Z")

export const vpc =
  $app.stage === "production"
    ? sst.aws.Vpc.get("Vpc", "")
    : sst.aws.Vpc.get("Vpc", "vpc-069d2d529d3288945")

export const auth = new sst.Linkable("Auth", {
  properties: {
    url: "https://openauth.console.sst.dev",
  },
})

export const storage = new sst.aws.Bucket("Storage")

export const cluster = new sst.aws.Cluster("Cluster", {
  vpc,
})
