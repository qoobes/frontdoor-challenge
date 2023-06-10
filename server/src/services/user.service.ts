import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import * as Joi from "joi";
import * as jwt from "jsonwebtoken";
import { Model } from "mongoose";
import { User } from "src/schemas/user.schema";

@Injectable()
export class UserService {
  constructor(
    @InjectModel("User") private userModel: Model<User>,
    private configService: ConfigService,
  ) {}

  async login({ email, password }: { email: string; password: string }) {
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new Error("User not found");
    }

    const result = await bcrypt.compare(password, user.password);

    if (!result) {
      throw new Error("Password is incorrect");
    }

    return await this.generateJWTPair(user._id.toString());
  }

  async register({
    email,
    password,
    username,
  }: {
    email: string;
    password: string;
    username: string;
  }) {
    Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      username: Joi.string().min(3).required(),
    }).validate({ email, password, username });

    const existingUser = await this.userModel.findOne({ email }).exec();

    if (existingUser) {
      throw new BadRequestException("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new this.userModel({
      email,
      password: hashedPassword,
      username,
    });

    await user.save();

    return await this.generateJWTPair(user._id.toString());
  }

  async generateSignedUrl(userId: string) {
    const payload = { ownerId: userId };

    const tokenSecret = this.configService.get("JWT_SECRET");

    const token = jwt.sign(payload, tokenSecret, {
      expiresIn: "1d",
    });

    return token;
  }

  async getUserFromSignedUrl(token: string) {
    const payload = jwt.verify(
      token,
      this.configService.get("JWT_SECRET")!,
    ) as { ownerId: string };

    if (!payload || !payload.ownerId) {
      throw new Error("Invalid token");
    }

    return await this.userModel.findById(payload.ownerId).exec();
  }

  async generateJWTPair(userId: string) {
    const payload = { id: userId };

    const tokenSecret = this.configService.get("JWT_SECRET");
    const refreshSecret = this.configService.get("JWT_REFRESH_SECRET");

    const token = jwt.sign(payload, tokenSecret, {
      expiresIn: "30d",
    });

    const refreshToken = jwt.sign(payload, refreshSecret, {
      expiresIn: "30d",
    });

    return { token, refreshToken };
  }

  async validateRefreshToken(refreshToken: string) {
    const payload = jwt.verify(
      refreshToken,
      this.configService.get("JWT_REFRESH_SECRET")!,
    ) as { id: string };

    if (!payload || !payload.id) {
      throw new Error("Invalid token");
    }

    return await this.generateJWTPair(payload.id);
  }

  async validateToken(token: string) {
    const payload = jwt.verify(
      token,
      this.configService.get("JWT_SECRET")!,
    ) as { id: string };

    if (!payload || !payload.id) {
      throw new Error("Invalid token");
    }

    return await this.userModel.findById(payload.id).exec();
  }
}
