import { load } from "cheerio";
import { Temporal } from "@js-temporal/polyfill";
import { ItemOptions, RSS } from "@/utils/rss";
import { isDefined } from "@/utils/types";

export async function GET(request: Request): Promise<Response> {
  const urlInstance = new URL(request.url);

  const albumId = urlInstance.searchParams.get("album_id");

  const targetUrl = `https://mp.weixin.qq.com/mp/appmsgalbum?action=getalbum&album_id=${albumId}`;

  const response = await fetch(targetUrl);
  const html = await response.text();

  const $ = load(html);

  const title = $(".album__label-title").text();

  const items: ItemOptions[] = (
    await Promise.all(
      $(".album__list")
        .children()
        .toArray()
        .map(async (item) => {
          const $item = $(item);

          const link = $item.attr("data-link");
          if (!link) {
            return null;
          }

          const response = await fetch(link, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            },
          });
          const itemDetailHtml = await response.text();
          const $itemDetail = load(itemDetailHtml);

          const desc = $itemDetail('meta[name="description"]').attr("content");
          if (!itemDetailHtml.includes("description")) {
            console.log(itemDetailHtml);
          }

          const timestamp = $item.find(".js_article_create_time").text();
          const pubDate = new Date(parseInt(timestamp, 10) * 1000);

          const style = $item.find(".album__item-img").attr("style");
          const [, imageUrl] = /url\((.*)\)/.exec(style ?? "") ?? [];

          return {
            guid: $item.attr("data-msgid"),
            title: $item.attr("data-title") ?? "",
            link,
            pubDate: Temporal.Instant.from(
              pubDate.toISOString(),
            ).toLocaleString("zh-CN"),
            description: `<img src="${imageUrl}" /><p>${desc}</p>`,
          };
        }),
    )
  ).filter(isDefined);

  const rss = new RSS({
    title,
    link: targetUrl,
    description: "",
    items,
  });

  return new Response(rss.toXML(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
