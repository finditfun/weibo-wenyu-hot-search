import type { Word } from "./types.ts";

/**
 * 合并两次热门话题并根据**内容**去重，新的覆盖旧的
 *
 * via https://github.com/justjavac/weibo-trending-hot-search/issues/11#issuecomment-1428187183
 */
export function mergeWords(
  words: Word[],
  another: Word[],
): Word[] {
  const obj: Record<string, { url: string; hot?: number }> = {};
  for (const w of words.concat(another)) {
    obj[w.title] = { url: w.url, hot: w.hot };
  }
  return Object.entries(obj).map(([title, { url, hot }]) => ({
    url,
    title,
    hot,
  }));
}

export async function createReadme(words: Word[]): Promise<string> {
  const readme = await Deno.readTextFile("./README.md");
  return readme.replace(/<!-- BEGIN -->[\W\w]*<!-- END -->/, createList(words));
}

export function createList(words: Word[]): string {
  return `<!-- BEGIN -->
<!-- 最后更新时间 ${Date()} -->
${
    words.map((x) =>
      x.hot
        ? `1. [${x.title}](https://s.weibo.com/${x.url}) - ${x.hot}`
        : `1. [${x.title}](https://s.weibo.com/${x.url})`
    )
      .join("\n")
  }
<!-- END -->`;
}

export function createArchive(words: Word[], date: string): string {
  return `# ${date}\n
共 ${words.length} 条\n
${createList(words)}
`;
}
