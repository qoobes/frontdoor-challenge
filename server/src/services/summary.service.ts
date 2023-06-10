import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { OpenAIClient } from "@platohq/nestjs-openai";
import { stringify } from "csv-stringify";
import { encode } from "gpt-tokenizer";
import { Model } from "mongoose";
import { StripHTMLRegex } from "src/constants/expressions";
import { Precision } from "src/constants/precision";
import { Summary } from "src/schemas/summary.schema";
import { Readable } from "stream";

@Injectable()
export class SummariesService {
  constructor(
    @InjectModel("Summary") private summaryModel: Model<Summary>,
    private readonly openAiClient: OpenAIClient,
  ) {}

  async exportSummaries(userId: string, type: string) {
    if (type !== "csv" && type !== "pdf") type = "csv";

    const summaries = await this.summaryModel
      .find({ user: userId })
      .select("-originalText")
      .sort({
        createdAt: "desc",
      })
      .exec();

    if (type === "csv") {
      const data = summaries.map((s) => {
        return {
          name: s.name,
          summarisedText: s.summarisedText,
          tags: s.tags.join(","),
          createdAt: s.createdAt,
        };
      });

      const readable = Readable.from(data);

      const stringifier = stringify({
        header: true,
        columns: {
          name: "Name",
          summarisedText: "Summary",
          tags: "Tags",
          createdAt: "Created At",
        },
      });

      return readable.pipe(stringifier);
    } else {
      // create a pdf
    }
  }

  async updateSummary({
    id,
    name,
    userId,
  }: {
    id: string;
    name: string;
    userId: string;
  }) {
    const summary = await this.summaryModel
      .findOne({ _id: id, user: userId })
      .exec();

    if (!summary) {
      throw new BadRequestException("Summary not found");
    }

    summary.name = name;
    return await summary.save();
  }

  async getAllSummaries(userId: string) {
    return await this.summaryModel
      .find({ user: userId })
      .select("-originalText")
      .sort({
        createdAt: "desc",
      })
      .exec();
  }
  async deleteSummary(id: string, userId: string) {
    return await this.summaryModel
      .findOneAndDelete({ _id: id, user: userId })
      .exec();
  }

  async tagSummary({
    id,
    tag,
    userId,
  }: {
    id: string;
    tag: string;
    userId: string;
  }) {
    const summary = await this.summaryModel
      .findOne({ _id: id, user: userId })
      .exec();

    if (!summary) {
      throw new BadRequestException("Summary not found");
    }

    summary.tags.push(tag);

    return await summary.save();
  }

  async removeTag({
    id,
    tag,
    userId,
  }: {
    id: string;
    tag: string;
    userId: string;
  }) {
    const summary = await this.summaryModel
      .findOne({ _id: id, user: userId })
      .exec();

    if (!summary) {
      throw new BadRequestException("Summary not found");
    }

    summary.tags = summary.tags.filter((t) => t !== tag);

    return await summary.save();
  }

  async createRawSummary({
    name,
    originalText,
    summarisedText,
    tags,
    userId,
  }: {
    name: string;
    originalText: string;
    summarisedText: string;
    tags: string[];
    userId: string;
  }) {
    const summary = new this.summaryModel({
      name,
      originalText,
      summarisedText,
      tags,
      user: userId,
    });

    return await summary.save();
  }

  async generateSummary({
    precision,
    text,
    userId,
  }: {
    text: string;
    userId: string;
    precision: Precision;
  }) {
    const strippedText = text
      .replace(StripHTMLRegex, "")
      .trim()
      .replace("  ", " ");

    const finalTexts: Array<string> = await this.splitText(
      strippedText,
      precision,
    );

    const existingText = await this.summaryModel
      .findOne({ originalText: strippedText })
      .exec();

    if (existingText) {
      if (existingText.user._id !== userId) {
        return existingText;
      }

      this.createRawSummary({
        name: existingText.name,
        originalText: existingText.originalText,
        summarisedText: existingText.summarisedText,
        tags: [],
        userId,
      });
    }

    let summaryArray: Array<string | undefined> = [];

    if (finalTexts.length > 10) {
      throw new BadRequestException(
        "Something went wrong while splitting the text. Please try again later.",
      );
    }

    finalTexts.forEach((t, i) => {
      console.log(`Text ${i} with token count ${encode(t).length}`);
    });

    for (const text of finalTexts) {
      summaryArray.push(await this.generateSummaryForText(text, precision));
    }

    const summary = summaryArray.filter((t) => t).join("\n\n");

    const name = (await this.generateSummaryName(summary)) || "Untitled";

    return await this.createRawSummary({
      name,
      originalText: strippedText,
      summarisedText: summary,
      tags: [],
      userId,
    });
  }

  async generateSummaryName(summary: string) {
    const response = await this.openAiClient.createCompletion({
      model: "text-curie-001",
      prompt:
        "Please give a name containing 30 to 50 characters that outlines what the following list is about: \n \n" +
        summary,
    });

    return response.data.choices[0].text?.trim();
  }

  async generateSummaryForText(
    text: string,
    precision: Precision,
  ): Promise<string | undefined> {
    if (precision === Precision.LOW) {
      // create a summary using a weaker model

      const response = await this.openAiClient.createCompletion({
        model: "text-ada-001",
        prompt: `You are acting as a summarization AI, so take the input and summarize it in as many bullet points as is necessary to get all of the major points across:  \n \n ${text}`,
      });

      return response.data.choices[0].text;
    }

    const response = await this.openAiClient.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content:
            precision === Precision.HIGH
              ? `You are acting as a summarization AI, so take the input and summarize it in as many bullet points as is necessary to get all of the major points across:  \n \n ` +
                text
              : `You are acting as a summarization AI, and for the input text please summarize it to the most important ${10} bullet points for brevity:  \n \n ` +
                text,
        },
      ],
    });

    return response.data.choices[0].message?.content;
  }

  async splitText(text: string, precision: Precision): Promise<Array<string>> {
    const tokens = encode(text);

    const finalText: Array<string> = [];

    let maxTokens = 0;

    // I'm really not sure how useful this is, but I know that there is some way to implement
    // precision that makes sense. I've found that this often provides better results
    // with overly complicated writing (my friend's new book)
    switch (precision) {
      case Precision.LOW:
        maxTokens = 3500;
        break;

      case Precision.MEDIUM:
        maxTokens = 3000;
        break;

      case Precision.HIGH:
        maxTokens = 2000;
        break;
    }

    if (tokens.length <= maxTokens) {
      return [text.trim()];
    }

    text.split("\n").forEach((t) => {
      if (encode(t).length > maxTokens) {
        throw new BadRequestException(
          "Please give me reasonable input. One of the paragraphs is over 1500 words long.",
        );
      }

      finalText.push(t);
    });

    const result = this.splitArray(finalText, maxTokens, [], 0);

    if (!result)
      throw new BadRequestException(
        "Something went wrong while splitting the text. Please try again later.",
      );

    return result.map((r) => r.join("\n\n"));
  }

  splitArray(
    paragraphs: string[],
    maxTokens: number,
    currentArray: string[] = [],
    currentTokenCount: number = 0,
    result: string[][] = [],
  ): string[][] {
    if (paragraphs.length === 0) {
      if (currentArray.length > 0) {
        result.push(currentArray);
      }
      return result;
    }

    const [first, ...remaining] = paragraphs;
    const tokenCount = encode(first).length;
    const newTokenCount = currentTokenCount + tokenCount;

    if (tokenCount > maxTokens) {
      if (currentArray.length > 0) {
        result.push(currentArray);
      }
      result.push([first]);
      return this.splitArray(remaining, maxTokens, [], 0, result);
    } else if (newTokenCount <= maxTokens) {
      const newCurrentArray = [...currentArray, first];
      return this.splitArray(
        remaining,
        maxTokens,
        newCurrentArray,
        newTokenCount,
        result,
      );
    } else {
      if (currentArray.length > 0) {
        result.push(currentArray);
      }
      return this.splitArray([first, ...remaining], maxTokens, [], 0, result);
    }
  }
}
