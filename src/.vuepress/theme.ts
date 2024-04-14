import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar.js";
import sidebar from "./sidebar.js";
import { MR_HOPE_AVATAR } from "./logo.js";

export default hopeTheme({
  hostname: "https://banrenshan.github.io",
  pure: false, // 是否开启纯净模式
  toc: true,
  author: {
    name: "banrenshan",
    url: "https://github.com/banrenshan",
  },
  iconAssets: "fontawesome-with-brands",
  logo: "https://theme-hope-assets.vuejs.press/logo.svg",
  repo: "banrenshan/banrenshan.github.io",
  docsDir: "src",
  navbar,
  sidebar,
  footer: "默认页脚",
  displayFooter: false,
  blog: {
    description: "开发人生",
    medias: {
    },
  },
  metaLocales: {
    editLink: "在 GitHub 上编辑此页",
  },
  plugins: {
    blog: true,
    catalog: {
      level: 3
    },
    components: {
      components: ["Badge", "VPCard"],
    },
    mdEnhance: {
      align: true,
      attrs: true,
      codetabs: true,
      component: true,
      demo: true,
      figure: true,
      imgLazyload: true,
      imgSize: true,
      include: true,
      mark: true,
      stylize: [
        {
          matcher: "Recommended",
          replacer: ({ tag }) => {
            if (tag === "em")
              return {
                tag: "Badge",
                attrs: { type: "tip" },
                content: "Recommended",
              };
          },
        },
      ],
      sub: true,
      sup: true,
      tabs: true,
      tasklist: true,
      vPre: true,
    }
  },
});
