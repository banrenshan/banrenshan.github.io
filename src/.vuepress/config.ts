import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",
  lang: "zh-CN",
  title: "心之所向，素履以往",
  description: "心之所向，素履以往",
  theme,
});
