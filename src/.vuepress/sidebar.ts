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
    },
    {
      text: "Go",
      icon: "book",
      prefix: "Go/",
      children: "structure",
    },
    {
      text: "云技术",
      icon: "book",
      prefix: "cloud/",
      children: "structure",
    },
    {
      text: "Python",
      icon: "book",
      prefix: "Python/",
      children: "structure",
    },
    {
      text: "Tools",
      icon: "book",
      prefix: "tool/",
      children: "structure",
    },
    {
      text: "Spring",
      icon: "book",
      prefix: "Spring/",
      children: "structure",
    }
  ],
});
