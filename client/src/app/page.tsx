import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import TopicCreator from "@/components/TopicCreator";
import { redis } from "@/lib/redis";
import { Star } from "lucide-react";

export default async function Home() {
  // Getting number of served request from Redis
  const servedRequest = await redis.get("served-request");

  return (
    <section className="min-h-screen bg-grid-zinc-50">
      <div className="text-center flex flex-col items-center">
        <h1 className="relative leading-snug w-fit tracking-tight text-balance mt-16 font-bold text-[#f43f5e] text-5xl">
          Vote Stream App
        </h1>
      </div>
      {/* "MaxWidthWrapper Compoent is only used to apply uniform styling like margins, padding to all the child component present inside." */}
      <MaxWidthWrapper className="relative pb-24 sm:pb-32 lg:pt-10 xl:pt-5 lg:pb-52">
        {/* App Headline */}
        <div className="px-6 lg:px-0 lg:pt-4">
          <div className="relative mx-auto text-center flex flex-col items-center">
            <h1 className="relative leading-snug w-fit tracking-tight text-balance mt-16 font-bold text-gray-900 text-3xl">
              What do you think about ...
            </h1>

            {/* Input Text Box */}
            <TopicCreator />

            {/* Served Request Count Details */}
            <div className="mt-12 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="flex flex-col gap-1 justify-between items-center sm:items-start">
                <div className="flex gap-0.5">
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />
                  <Star className="h-4 w-4 text-green-600 fill-green-600" />{" "}
                </div>
                <p>
                  <span className="font-semibold">
                    {Math.ceil(Number(servedRequest) / 10) * 10}
                  </span>{" "}
                  served requests
                </p>
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
