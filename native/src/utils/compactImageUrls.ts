// native/src/utils/compactImageUrls.ts
import axios from "axios";

type CompactImageUrls = {
  prefix: string;
  paths: string[];
};

export const compactImageUrls = (urls: string[]): CompactImageUrls => {
  if (urls.length === 0) {
    return {
      prefix: "",
      paths: [],
    };
  }

  let prefix = urls[0];

  for (const url of urls.slice(1)) {
    while (!url.startsWith(prefix) && prefix.length > 0) {
      prefix = prefix.slice(0, -1);
    }
  }

  const paths = urls.map((url) => url.slice(prefix.length));

  return {
    prefix,
    paths,
  };
};

// Shortens each image URL one by one and returns the shortened URLs.
// qork.me is a free URL-shortening service used here as a fallback: https://qork.me
//για V1/testing και πιθανώς μικρό production app, αλλά όχι κάτι στο οποίο θα να βασίζεται για πάντα ένα σοβαρό προϊόν χωρίς fallback.
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const shortenImageUrls = async (urls: string[]) => {
  const shortenedUrls: string[] = [];

  for (let index = 0; index < urls.length; index++) {
    const response = await axios.get("https://qork.me/api/shorten", {
      params: {
        url: urls[index],
      },
    });

    const shortUrl = response.data.href;

    if (!shortUrl) {
      throw new Error("qork shortening failed.");
    }

    shortenedUrls.push(shortUrl);

    if (index < urls.length - 1) {
      await sleep(1000);
    }
  }

  return shortenedUrls;
};
