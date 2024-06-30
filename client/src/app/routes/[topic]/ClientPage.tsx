"use client";

import { useState } from "react";
import { Wordcloud } from "@visx/wordcloud";
import { scaleLog } from "@visx/scale";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { Text } from "@visx/text";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { submitComment } from "@/utils/actions";

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
