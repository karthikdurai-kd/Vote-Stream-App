import { redis } from "../../../lib/redis";
import ClientPage from "./ClientPage";

interface PageProps {
  params: {
    topic: string;
  };
}
interface WordElement {
  text: string;
  value: number;
}

// Here destructuring "params"
const Topic = async ({ params }: PageProps) => {
  const { topic } = params;
  // Here we are getting Data from the redis from the particular room with score of 0 to 49. Here "score" denotes how many times that particular word is typed by the users
  // Here output will be in the array like [redis, 3, is, 2, great, 4]
  const initialData = await redis.zrange(`room:${topic}`, 0, 49, {
    withScores: true,
  });

  // After getting data from we need to format it to our need
  const words: { text: string; value: number }[] = [];
  for (let i = 0; i < initialData.length; i += 2) {
    const element = initialData[i];
    const score = initialData[i + 1];

    if (
      element &&
      typeof element === "object" &&
      "text" in element &&
      typeof (element as WordElement).text === "string" &&
      typeof score === "number"
    ) {
      //console.log(`${(element as WordElement).text} ${score}`);
      words.push({ text: (element as WordElement).text, value: score });
    }
  }

  await redis.incr("served-request");
  //console.log(words);

  return <ClientPage topicName={topic} initialData={words} />;
};

export default Topic;
