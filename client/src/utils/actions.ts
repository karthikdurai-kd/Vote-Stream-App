import { redis } from "@/lib/redis";
import wordFreq from "./wordFrequency";

// This function is used for stroring about the topic entered by the user
export const createTopic = async ({ topicName }: { topicName: string }) => {
  const regexExp = /^[a-zA-Z-]+$/; // This is a regular expression for testing "topic data" entered by the user. Validation here is "topic name" must be a string that consist of letter "a-z", "A-Z", and also "hypen -"

  // Topic enter by the user is null || exceeds certain limit
  if (!topicName || topicName.length > 50) {
    throw new Error("Topic must be between 1 and 50 characters");
  }

  // Topic entered by the server does not pass "regex validation"
  if (!regexExp.test(topicName)) {
    // console.log("Regex test error");
    throw new Error("Only letters and hyphens are allowed in the name");
  }

  // If there is no validation error in the topic name, then data is saved in "Redis" database
  await redis.sadd("topics", topicName); // Saving Data as "Set Data Structure" in Redis where each data is present only once and it will not allow any duplicates

  // Return the topicName to be used in the onSuccess callback
  return { topicName };
};

// This function is used for storing the comments entered by the user in RedisDB in a format "word: number of times typed by the user", for example "redis is very redis nice" and data will be saved in redis as set datastructure - "redis - 2", "is - 1" like that ...
export const submitComment = async ({
  comment,
  topicName,
}: {
  comment: string;
  topicName: string;
}) => {
  // Getting words count using "wordFrequency" function
  const words = wordFreq(comment);
  await Promise.all(
    words.map(async (word) => {
      await redis.zadd(
        `room:${topicName}`,
        { incr: true },
        { member: word, score: word.value }
      );
    })
  );

  // Incrementing served request
  await redis.incr("served-request");

  // Publish the words in the channel so that whoever listens to that channel will recieve the message. This will go the backend server and backend server will trigger "scoket.io" event and forwards the message to all the users who are connected to this room
  await redis.publish(`room:${topicName}`, words);

  return comment;
};
