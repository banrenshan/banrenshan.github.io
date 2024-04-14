import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/",
  {
    text: "博文",
    icon: "pen-to-square",
    link: "/post/"
  },
  {
    text: "事件轴",
    icon: "timeline",
    link: "/timeline/"
  },
  {
    text: "标签",
    icon: "tags",
    link: "/tag/"
  },
  {
    text: "分类",
    icon: "book",
    link: "/category/"
  }
]);
