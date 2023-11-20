import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Knowledge, KnowledgeCategory } from '@prisma/client';
import { createCategoryDto } from './dto/createCategory.dto';
import { updateCategoryDto } from './dto/updateCategory.dto';
import { createPostDto } from './dto/createPost.dto';
import { updatePostDto } from './dto/updatePost.dto';

@Injectable()
export class KnowledgeService {
  constructor(private prisma: PrismaService) {}

  // Categories services
  async createCategory(data: createCategoryDto): Promise<KnowledgeCategory> {
    return this.prisma.knowledgeCategory.create({ data });
  }

  async getCategories(): Promise<KnowledgeCategory[]> {
    return this.prisma.knowledgeCategory.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'desc' }],
    });
  }

  async upadateCategory(data: updateCategoryDto): Promise<KnowledgeCategory> {
    return this.prisma.knowledgeCategory.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async deleteCategory(id: number): Promise<KnowledgeCategory> {
    return this.prisma.knowledgeCategory.delete({
      where: {
        id: id,
      },
    });
  }

  async getNav(): Promise<KnowledgeCategory[]> {
    return this.prisma.knowledgeCategory.findMany({
      where: {
        posts: {
          some: {},
        },
      },
      include: {
        posts: {
          where: {
            toMain: false,
          },
          select: {
            title: true,
            id: true,
          },
          orderBy: {
            sort: 'asc',
          },
        },
      },
      orderBy: [{ sort: 'asc' }, { id: 'desc' }],
    });
  }

  // Posts services
  async createPost(data: createPostDto): Promise<Knowledge> {
    return this.prisma.knowledge.create({ data });
  }

  async updatePost(data: updatePostDto): Promise<Knowledge> {
    return this.prisma.knowledge.update({
      where: {
        id: data.id,
      },
      data,
    });
  }

  async getPost(id: number): Promise<Knowledge> {
    return this.prisma.knowledge.findUnique({
      where: {
        id,
      },
    });
  }

  async getPostNeighbours(
    postID: number,
    categoryID: number,
  ): Promise<NonNullable<unknown>> {
    //random query... pi***c
    const randomPick = (values: string[]) => {
      const index = Math.floor(Math.random() * values.length);
      return values[index];
    };
    const items = await this.prisma.knowledge.findMany({
      where: {
        categoryID,
        NOT: { id: postID },
      },
      select: { id: true },
    });
    const itemCount = items.length;

    const randomNumber = (min: number, max: number) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    const orderBy = randomPick(['id', 'title', 'createdAt', `preview`]);
    const orderDir = randomPick([`asc`, `desc`]);

    const [prev, next, neighbours] = await this.prisma.$transaction([
      this.prisma.knowledge.findFirst({
        take: -1,
        where: {
          categoryID,
          id: {
            lt: postID,
          },
          toMain: false,
        },
        select: {
          title: true,
          id: true,
        },
      }),

      this.prisma.knowledge.findFirst({
        where: {
          categoryID,
          id: {
            gt: postID,
          },
          toMain: false,
        },
        select: {
          title: true,
          id: true,
        },
      }),

      this.prisma.knowledge.findMany({
        orderBy: { [orderBy]: orderDir },
        take: 5,
        // skip: randomNumber(0, itemCount - 1),
        where: {
          categoryID,
          NOT: {
            id: postID,
          },
          toMain: false,
        },
        select: {
          title: true,
          id: true,
        },
      }),
    ]);

    return {
      prev,
      next,
      neighbours,
    };
  }

  async getPosts(id: number) {
    return await this.prisma.knowledge.findMany({
      where: {
        categoryID: id,
        toMain: false,
      },
      select: {
        title: true,
        id: true,
        preview: true,
        categoryID: true,
        category: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: {
        sort: 'asc',
      },
    });
  }

  async getCategory(id: number): Promise<KnowledgeCategory> {
    return this.prisma.knowledgeCategory.findUnique({
      where: { id },
    });
  }

  async deletePost(id: number): Promise<Knowledge> {
    return this.prisma.knowledge.delete({
      where: {
        id,
      },
    });
  }

  async search(keyword: string) {
    return await this.prisma.knowledge.findMany({
      where: {
        OR: [
          {
            title: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            body: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
        ],
      },
      select: {
        title: true,
        id: true,
        preview: true,
        categoryID: true,
        category: {
          select: {
            name: true,
            id: true,
          },
        },
      },
    });
  }

  async getMain(): Promise<Knowledge[]> {
    return await this.prisma.knowledge.findMany({
      where: {
        toMain: true,
      },
      orderBy: {
        sort: 'asc',
      },
    });
  }
}
