import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { Stringifier } from "csv-stringify";
import { Response } from "express";
import { Precision } from "src/constants/precision";
import { AuthGuard, AuthedRequest, Public } from "src/services/auth.guard";
import { SummariesService } from "src/services/summary.service";
import { UserService } from "src/services/user.service";

@UseGuards(AuthGuard)
@Controller("summaries")
export class SummariesController {
  constructor(
    private userService: UserService,
    private summaryService: SummariesService,
  ) {}

  @Patch("/")
  async updateSummary(
    @Body()
    body: {
      id: string;
      name: string;
    },
    @Req() req: AuthedRequest,
  ) {
    const summary = await this.summaryService.updateSummary({
      id: body.id,
      name: body.name,
      userId: req.user.id,
    });

    return summary;
  }

  @Post("/generate")
  async summarise(
    @Body()
    body: {
      text: string;
      precision: Precision;
    },
    @Req() req: AuthedRequest,
  ) {
    const summary = await this.summaryService.generateSummary({
      text: body.text,
      userId: req.user.id,
      precision: body.precision || Precision.MEDIUM,
    });

    return {
      _id: summary._id,
      summarisedText: summary.summarisedText,
      tags: summary.tags,
      createdAt: summary.createdAt,
      user: summary.user._id,
      name: summary.name,
    };
  }

  @Get("/")
  async getAllSummaries(@Req() req: AuthedRequest) {
    const summaries = await this.summaryService.getAllSummaries(req.user.id);

    return summaries.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  @Get("/viewToken")
  async generateViewToken(@Req() req: AuthedRequest) {
    const viewToken = await this.userService.generateSignedUrl(req.user.id);

    return { token: viewToken };
  }

  @Public()
  @Get("/export")
  async exportSummary(
    @Res() res: Response,
    @Query()
    body: {
      type: string;
      viewToken: string;
    },
  ) {
    const user = await this.userService.getUserFromSignedUrl(body.viewToken);

    if (!user) {
      throw new UnauthorizedException("Invalid view token");
    }

    const stream = await this.summaryService.exportSummaries(
      user.id,
      body.type,
    );

    if (stream instanceof Stringifier) {
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=export.csv");

      stream.pipe(res);
    }
  }

  @Post("/delete")
  async deleteSummary(
    @Body()
    body: {
      id: string;
    },
    @Req() req: AuthedRequest,
  ) {
    const summary = await this.summaryService.deleteSummary(
      body.id,
      req.user.id,
    );

    return summary;
  }

  @Post("/tag")
  async tagSummary(
    @Body()
    body: {
      id: string;
      tag: string;
    },
    @Req() req: AuthedRequest,
  ) {
    return await this.summaryService.tagSummary({
      id: body.id,
      tag: body.tag,
      userId: req.user.id,
    });
  }

  @Post("/untag")
  async removeTag(
    @Body()
    body: {
      id: string;
      tag: string;
    },
    @Req() req: AuthedRequest,
  ) {
    return await this.summaryService.removeTag({
      id: body.id,
      tag: body.tag,
      userId: req.user.id,
    });
  }
}
