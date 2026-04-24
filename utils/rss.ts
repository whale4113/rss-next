import { escape } from "es-toolkit";

const createElement = (
  type: string,
  props: Record<string, string>,
  ...children: (string | undefined | null)[]
) => {
  const childrenStr = children.filter((item) => item != undefined).join("");
  if (childrenStr === "") {
    return "";
  }

  let propsStr = Object.keys(props)
    .map((key) => `${key}="${props[key]}"`)
    .join(" ");

  if (propsStr !== "") {
    propsStr = " " + propsStr;
  }

  return `<${type}${propsStr}>${childrenStr}</${type}>`;
};

export interface ItemOptions {
  /**
   * The title of the item.
   */
  title?: string;
  /**
   * The URL of the item.
   */
  link?: string;
  /**
   * The item synopsis.
   */
  description?: string;
  /**
   * A string that uniquely identifies the item.
   */
  guid?: string;
  /**
   * Indicates when the item was published.
   */
  pubDate?: string;
}

interface RSSOptions {
  /**
   * The name of the channel. It's how people refer to your service.
   * If you have an HTML website that contains the same information as your RSS file, the title of your channel should be the same as the title of your website.
   */
  title: string;
  /**
   * The URL to the HTML website corresponding to the channel.
   */
  link: string;
  /**
   * Phrase or sentence describing the channel.
   */
  description: string;
  /**
   * A channel may contain any number of <item>s.
   */
  items: ItemOptions[];
}

export class RSS {
  constructor(public readonly options: RSSOptions) {}

  toXML() {
    return createElement(
      "rss",
      {
        "xmlns:atom": "http://www.w3.org/2005/Atom",
        version: "2.0",
      },
      createElement(
        "channel",
        {},
        createElement("title", {}, escape(this.options.title)),
        createElement("link", {}, escape(this.options.link)),
        createElement("description", {}, escape(this.options.description)),
        ...this.options.items.map((item) =>
          createElement(
            "item",
            {},
            createElement(
              "title",
              {},
              item.title ? escape(item.title) : undefined,
            ),
            createElement(
              "link",
              {},
              item.link ? escape(item.link) : undefined,
            ),
            createElement(
              "description",
              {},
              item.description ? escape(item.description) : undefined,
            ),
            createElement(
              "guid",
              {
                isPermaLink: "false",
              },
              item.guid ? escape(item.guid) : undefined,
            ),
            createElement("pubDate", {}, item.pubDate),
          ),
        ),
      ),
    );
  }
}
