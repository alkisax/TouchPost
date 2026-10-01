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


const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const shortenImageUrls = async (urls: string[]) => {
  const shortenedUrls: string[] = [];

  for (let index = 0; index < urls.length; index++) {
    try {
      const response = await axios.post(
        'https://cleanuri.com/api/v1/shorten',
        `url=${encodeURIComponent(urls[index])}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      shortenedUrls.push(response.data.result_url);

      if (index < urls.length - 1) {
        await sleep(1000);
      }
    } catch (error) {
      console.log('CleanURI error:', error);
      throw error;
    }
  }

  return shortenedUrls;
};


