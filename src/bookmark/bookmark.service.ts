import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookmarkDto, EditBookmarkDto } from './dto';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}

  async getBookmarks(userId: number) {
    try {
      const bookMarks = await this.prisma.bookmark.findMany({
        where: {
          userId,
        },
      });

      if (bookMarks.length <= 0)
        throw new ForbiddenException(`No bookmarks found by id: ${userId}`);

      return bookMarks;
    } catch (err) {
      throw new ForbiddenException(`No bookmarks found by id: ${userId}`);
    }
  }

  async getBookmarkById(userId: number, bookmarkId: number) {
    try {
      const bookmark = await this.prisma.bookmark.findFirst({
        where: {
          id: bookmarkId,
          userId,
        },
      });

      if (Object.keys(bookmark).length === 0)
        throw new ForbiddenException(`No bookmarks found by id: ${bookmarkId}`);

      return bookmark;
    } catch (err) {
      throw new ForbiddenException(`No bookmarks found by id: ${bookmarkId}`);
    }
  }

  async createBookMark(userId: number, dto: CreateBookmarkDto) {
    try {
      const bookmark = await this.prisma.bookmark.create({
        data: {
          userId,
          ...dto,
        },
      });

      return { ...bookmark, ...{ message: 'Bookmark created!' } };
    } catch (err) {
      throw new ForbiddenException('Bookmark with same title already exists');
    }
  }

  async editBookmarkById(
    userId: number,
    bookmarkId: number,
    dto: EditBookmarkDto,
  ) {
    try {
      // get the bookmark by id
      const bookmark = await this.prisma.bookmark.findUnique({
        where: {
          id: bookmarkId,
        },
      });

      // check if user owns the bookmark
      if (!bookmark || bookmark.userId !== userId) {
        throw new ForbiddenException('Access to resources denied');
      }

      return {
        ...this.prisma.bookmark.update({
          where: {
            id: bookmarkId,
          },
          data: {
            ...dto,
          },
        }),
        ...{ message: 'Bookmark successfully updated!' },
      };
    } catch (err) {
      throw new Error(err);
    }
  }

  async deleteBookmarkById(userId: number, bookmarkId: number) {
    // get the bookmark by id
    const bookmark = await this.prisma.bookmark.findUnique({
      where: {
        id: bookmarkId,
      },
    });

    // check if user owns the bookmark
    if (!bookmark || bookmark.userId !== userId) {
      throw new ForbiddenException('Access to resources denied');
    }

    return {
      ...this.prisma.bookmark.delete({
        where: {
          id: bookmarkId,
        },
      }),
      ...{ message: 'Bookmark successfully delete!' },
    };
  }
  catch(err) {
    throw new Error(err);
  }
}
