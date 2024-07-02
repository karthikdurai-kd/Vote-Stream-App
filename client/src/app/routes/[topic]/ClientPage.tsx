"use client";

import { useEffect, useState } from "react";
import { Wordcloud } from "@visx/wordcloud";
import { scaleLog } from "@visx/scale";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Text } from "@visx/text";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { submitComment } from "@/utils/actions";
import { io } from "socket.io-client";

const socket = io("http://localhost:8080"); // Backend server connection

interface ClientPageProps {
  topicName: string;
  initialData: { text: string; value: number }[];
}

// Colour of Words
const COLORS = ["#143059", "#2F6B9A", "#82a6c2"];

const ClientPage = ({ topicName, initialData }: ClientPageProps) => {
  // Storing the "initialData" which we get from "[topic]" in state hook
  const [words, setWords] = useState(initialData);
  // Storing comments entered by the user in the text box
  const [comment, setComment] = useState("");

  // Creating useEffect hook for connecting to socker.io room in backend server
  useEffect(() => {
    socket.emit("join-room", `room:${topicName}`); // Here we are connecting to socket.io backend server "join-room"
  }, []);

  // Creating useEffect hook for listening to the event sent by the socket.io from backend to frontend
  useEffect(() => {
    socket.on("room-update", (message: string) => {
      // Once we recieve the message from backend socket.io server, we parse message to JSON in order to display them in the front-end
      const data = JSON.parse(message) as {
        text: string;
        value: number;
      }[];

      data.map((newWord) => {
        const isWordAlreadyIncluded = words.some(
          (word) => word.text === newWord.text
        ); // Checking if the particular word from "list of words we got from backend socket.io" is already present in the local user typed words
        if (isWordAlreadyIncluded) {
          // increment that word count so that it gets updated in WordCloud and gets updated in the browser
          setWords((prev) => {
            const before = prev.find((word) => word.text === newWord.text);
            const restOfWords = prev.filter(
              (word) => word.text !== newWord.text
            );
            return [
              ...restOfWords,
              { text: before!.text, value: before!.value + newWord.value },
            ];
          });
        } else if (words.length < 50) {
          // just limiting the words to 50
          setWords((prev) => [...prev, newWord]);
        }
      });
    });

    // Performing Clean up after useeffect hook gets executed
    return () => {
      socket.off("room-update");
    };
  }, [words]);

  // Setting font weight accoridng to word count
  const fontScale = scaleLog({
    domain: [
      Math.min(...words.map((w) => w.value)),
      Math.max(...words.map((w) => w.value)),
    ],
    range: [10, 100],
  });

  // Using "useMutuation" hook to store the comments entered by the user in Redis DB according to word count
  const { mutate, isPending } = useMutation({
    mutationFn: submitComment,
    onSuccess: () => {
      //console.log("Success");
      setComment("");
    },
  });

  return (
    // Displaying Word Cloud
    <div className="w-full flex flex-col items-center justify-center min-h-screen bg-grid-zinc-50 pb-29">
      <MaxWidthWrapper className="flex flex-col items-center gap-6 pt-20">
        <h1 className="text-4xl sm:text-5xl font-bold text-center tracking-tight text-balance">
          What people think about{" "}
          <span className="text-blue-600">{topicName}:</span>
        </h1>
        <p className="text-sm">(updated in real-time)</p>
        <div className="aspect-square max-w-xl flex items-center justify-center">
          <Wordcloud
            words={words}
            width={500}
            height={500}
            fontSize={(data) => fontScale(data.value)}
            font={"Impact"}
            padding={2}
            spiral="archimedean"
            rotate={0}
            random={() => 0.5}
          >
            {(words) =>
              words.map((w, i) => {
                return (
                  <Text
                    key={w.text}
                    fill={COLORS[i % COLORS.length]}
                    textAnchor="middle"
                    transform={`translate(${w.x}, ${w.y})`}
                    fontSize={w.size}
                    fontFamily={w.font}
                  >
                    {w.text}
                  </Text>
                );
              })
            }
          </Wordcloud>
        </div>

        {/* Displaying Text Box for the user to share their opinion or review about the topic */}
        <div className="max-w-lg w-full">
          <Label className="font-semibold tracking-tight text-lg pb-2">
            Here is what I think about
          </Label>
          <div className="mt-1 flex gap-2 items-center">
            <Input
              value={comment}
              onChange={({ target }) => setComment(target.value)}
              placeholder="Type your comments here..."
            />
            <Button
              disabled={isPending}
              onClick={() => mutate({ comment, topicName })}
            >
              Share
            </Button>
          </div>
        </div>
      </MaxWidthWrapper>
    </div>
  );
};

export default ClientPage;
