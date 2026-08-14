import type { Word } from "./types.ts";

/**
 * 合并两次热门话题并根据**内容**去重，保留热度值最高的记录
 *
 * via https://github.com/justjavac/weibo-trending-hot-search/issues/11#issuecomment-1428187183
 */
export function mergeWords(
  words: Word[],
  another: Word[],
): Word[] {
  const obj: Record<string, { url: string; hot?: number }> = {};
  for (const w of words.concat(another)) {
    const existing = obj[w.title];
    if (!existing || (w.hot !== undefined && (existing.hot === undefined || w.hot > existing.hot))) {
      obj[w.title] = { url: w.url, hot: w.hot };
    }
  }
  return Object.entries(obj).map(([title, { url, hot }]) => ({
    url,
    title,
    hot,
  }));
}

export async function createReadme(words: Word[]): Promise<string> {
  const readmePath = "./README.md";
  let readme = "";
  try {
    readme = await Deno.readTextFile(readmePath);
  } catch {
    // If README.md doesn't exist, start with a minimal header
    readme = "# weibo-wenyu-hot-search\n微博文娱热搜\n\n";
  }

  const list = createList(words);

  // If markers exist, replace the section between them. Use non-greedy match to avoid spanning multiple sections.
  if (readme.includes("<!-- BEGIN -->") && readme.includes("<!-- END -->")) {
    return readme.replace(/<!-- BEGIN -->[\s\S]*?<!-- END -->/, list);
  }

  // Otherwise, append the list (with markers) to the end of the README
  if (!readme.endsWith("\n")) readme += "\n";
  return readme + "\n" + list;
}

export function createList(words: Word[]): string {
  return `<!-- BEGIN -->
<!-- 最后更新时间 ${Date()} -->
${words.map((x) =>
    x.hot
      ? `1. [${x.title}](https://s.weibo.com/${x.url}) - ${x.hot}`
      : `1. [${x.title}](https://s.weibo.com/${x.url})`
  ).join("\n")}
<!-- END -->`;
}

export function createArchive(words: Word[], date: string): string {
  return `# ${date}\n
共 ${words.length} 条\n
${createList(words)}\n`;
}
