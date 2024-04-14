import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    {
      text: "指南",
      icon: "laptop-code",
      prefix: "gudie/",
      link: "gudie/",
      children: "structure",
    },
    {
      text: "文章",
      icon: "book",
      prefix: "post/",
      children: "structure",
    }
  ],
});
