import {
  Controller,
  Get,
  Post,
  Body,
  UsePipes,
  ValidationPipe,
  Delete,
  Param,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { KnowledgeService } from './knowledge.service';
import { createCategoryDto } from './dto/createCategory.dto';
import { updateCategoryDto } from './dto/updateCategory.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { createPostDto } from './dto/createPost.dto';
import { updatePostDto } from './dto/updatePost.dto';
import { AdminOnly } from '../../common/decorators/admin-only.decorator';

@Controller('knowledge')
export class KnowledgeController {
  constructor(private service: KnowledgeService) {}

  private readonly knowledgeFileDest = '/uploads/knowledge/';

  // @Public()
  @Get('')
  async getMain() {
    const posts = await this.service.getMain();

    return {
      data: posts,
    };
  }

  // Categories controllers
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('/create-category')
  async createCategory(
    @AdminOnly() permission: any,
    @Body() data: createCategoryDto,
  ) {
    const category = await this.service.createCategory(data);

    return {
      data: category,
      message: ['Категория успешно создана'],
    };
  }

  @Get('/get-categories')
  async getCategories() {
    const categories = await this.service.getCategories();

    return {
      data: categories,
    };
  }

  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('/update-category')
  async updateCategory(
    @AdminOnly() permission: any,
    @Body() data: updateCategoryDto,
  ) {
    const category = await this.service.upadateCategory(data);

    return {
      data: category,
      message: ['Данные успешно обновлены'],
    };
  }

  @Delete('/delete-category/:id')
  async deleteCategory(@AdminOnly() permission: any, @Param('id') id: string) {
    const parsed = +id;
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }

    await this.service.deleteCategory(parsed);

    return {
      message: ['Категория успешно удалена'],
    };
  }

  @Get('/get-nav')
  async getNav() {
    const nav = await this.service.getNav();

    return {
      data: nav,
    };
  }

  // Post controllers
  @Post('/upload-file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads', 'knowledge'),
        filename: (req, file, cb) => {
          file.originalname = Buffer.from(file.originalname, 'latin1').toString(
            'utf8',
          );

          const filenmae = file.originalname.split('.');
          const ext = filenmae.pop();
          // cb(null, `${filenmae.join('.') + '-'+ Date.now()}.${ext}`);
          cb(null, `${'image-' + Date.now()}.${ext}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return {
      file: this.knowledgeFileDest + file.filename,
    };
  }

  @Post('/create-post')
  async createPost(@AdminOnly() permission: any, @Body() data: createPostDto) {
    const post = await this.service.createPost(data);

    return {
      data: {
        postID: post.id,
      },
      message: [`Материал успешно сохранен`],
    };
  }

  @Post('/update-post')
  async updatePost(@AdminOnly() permission: any, @Body() data: updatePostDto) {
    const post = await this.service.updatePost(data);

    return {
      message: ['Материал успешно обновлен'],
    };
  }

  @Get('/get-post/:id')
  async getPost(@Param('id') id: string) {
    const parsed = +id;
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }

    const post = await this.service.getPost(parsed);

    if (!post) {
      return { data: null };
    }

    const neighbours = await this.service.getPostNeighbours(
      post.id,
      post.categoryID,
    );

    return {
      data: {
        ...post,
        ...neighbours,
      },
    };
  }

  @Get('/get-posts/:id')
  async getPosts(@Param('id') id: string) {
    const parsed = +id;
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }

    const posts = await this.service.getPosts(parsed);
    const category = await this.service.getCategory(parsed);

    return {
      data: {
        posts,
        category,
      },
    };
  }

  @Delete('/delete-post/:id')
  async deletePost(@Param('id') id: string) {
    const parsed = +id;
    if (isNaN(parsed)) {
      throw new BadRequestException();
    }

    await this.service.deletePost(parsed);

    return {
      message: ['Материал успешно удален'],
    };
  }

  @Post('/search/')
  async search(@Query('keyword') keyword: string) {
    return await this.service.search(keyword);
  }
}
