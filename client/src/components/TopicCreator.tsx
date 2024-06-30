"use client";

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createTopic } from "@/utils/actions";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation

const TopicCreator = () => {
  const router = useRouter(); // Initialize useRouter hook
  // Create State for storing data entered in the "Input" field
  const [inputData, setInputData] = useState("");

  // using "tanstack react query hook useMutuate" for managing API Calls smoothly
  const { mutate, error, isPending } = useMutation({
    mutationFn: createTopic,
    onSuccess: (data: any) => {
      // Redirect to the topic page after successful creation
      router.push(`/routes/${data.topicName}`);
    },
  });

  return (
    <div className="mt-12 flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={inputData}
          onChange={({ target }) => {
            setInputData(target.value);
          }}
          className="bg-white min-w-64"
          placeholder="Enter topic here..."
        />
        <Button
          disabled={isPending}
          onClick={() => {
            mutate({ topicName: inputData });
          }}
        >
          Create
        </Button>
      </div>
      {error ? <p className="text-sm text-red-600">{error.message}</p> : null}
    </div>
  );
};

export default TopicCreator;
