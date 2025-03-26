import theme from "toolbeam-docs-theme"
import starlight from "@astrojs/starlight"
import { defineConfig } from "astro/config"
import { rehypeHeadingIds } from "@astrojs/markdown-remark"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import config from "./config"

const url = "https://opencontrol.ai"

// https://astro.build/config
export default defineConfig({
  site: url,
  trailingSlash: "always",
  devToolbar: {
    enabled: false,
  },
  experimental: {
    svg: true,
  },
  integrations: [
    starlight({
      plugins: [theme()],
      title: "OpenControl",
      description: "Control your infrastructure with AI.",
      head: [
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/favicon.ico",
            sizes: "48x48",
          },
        },
        // Add light/dark mode favicon
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/favicon.svg",
            media: "(prefers-color-scheme: light)",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/favicon-dark.svg",
            media: "(prefers-color-scheme: dark)",
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "og:image",
            content: `${url}/social-share.png`,
          },
        },
        {
          tag: "meta",
          attrs: {
            property: "twitter:image",
            content: `${url}/social-share.png`,
          },
        },
      ],
      logo: {
        light: "./src/assets/logo-light.svg",
        dark: "./src/assets/logo-dark.svg",
        replacesTitle: true,
      },
      social: {
        github: config.github,
        discord: config.discord,
      },
      lastUpdated: true,
      editLink: {
        baseUrl: `${config.github}/edit/master/www/`,
      },
      components: {
        Hero: "./src/components/Hero.astro",
      },
      customCss: ["./src/custom.css", "./src/styles/lander.css"],
      sidebar: [
        { label: "Intro", slug: "docs" },
        "docs/tools",
        "docs/usage",
        "docs/how-it-works",
      ],
    }),
  ],
  markdown: {
    rehypePlugins: [
      rehypeHeadingIds,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
    ],
  },
})
