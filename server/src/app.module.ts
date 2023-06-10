import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { OpenAIModule } from "@platohq/nestjs-openai";
import * as Joi from "joi";
import configuration from "src/config/configuration";
import { AuthController } from "src/controllers/auth.controller";
import { SummariesController } from "src/controllers/summary.controller";
import { SummarySchema } from "src/schemas/summary.schema";
import { UserSchema } from "src/schemas/user.schema";
import { SummariesService } from "src/services/summary.service";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UserService } from "./services/user.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid("development", "production", "test", "provision")
          .default("development"),
        PORT: Joi.number().default(5000),
        DATABASE_HOST: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_REFRESH_SECRET: Joi.string().required(),
        OPENAI_API_KEY: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    OpenAIModule.register({
      apiKey: process.env.OPENAI_API_KEY || "",
    }),
    MongooseModule.forRoot(process.env.DATABASE_HOST || ""),
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    MongooseModule.forFeature([{ name: "Summary", schema: SummarySchema }]),
  ],
  controllers: [AppController, AuthController, SummariesController],
  providers: [AppService, UserService, SummariesService],
})
export class AppModule {}
