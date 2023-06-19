import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';

// Others
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';

describe('App (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
    await app.listen(5500);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:5500');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'usama.ikraam@gmail.com',
      password: 'Pass@123',
    };

    describe('SignUp', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody({ password: dto.password })
          .expectStatus(400)
          .inspect();
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody({ email: dto.email })
          .expectStatus(400)
          .inspect();
      });

      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signUp').expectStatus(400).inspect();
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post('/auth/signUp')
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });

    describe('SignIn', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody({ password: dto.password })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody({ email: dto.email })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum.spec().post('/auth/signIn').expectStatus(400).inspect();
      });

      it('should signin', () => {
        return pactum
          .spec()
          .post('/auth/signIn')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200);
      });
    });

    describe('Edit user', () => {
      it('should edit user', () => {
        const dto: EditUserDto = {
          firstName: 'Usama',
          email: 'usama.ikraam@gmail.com',
        };

        return pactum
          .spec()
          .patch('/users/editMe')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks/getBookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(403)
          .expectJson({
            statusCode: 403,
            message: 'No bookmarks found by id: 28', // user id maters
            error: 'Forbidden',
          });
      });
    });

    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'First Bookmark',
        link: 'https://www.youtube.com/watch?v=d6WC5n9G_sM',
        description: 'xxx',
      };
      it('should create bookmark', () => {
        return pactum
          .spec()
          .post('/bookmarks/createBookmark')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('should get bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks/getBookmarks')
          .withHeaders({ Authorization: 'Bearer $S{userAt}' })
          .expectStatus(200)
          .expectJsonLength(1)
          .inspect();
      });
    });

    describe('Get bookmark by id', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('/bookmarks/getBookmarkById/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{bookmarkId}');
      });
    });

    describe('Edit bookmark', () => {
      const dto: EditBookmarkDto = {
        title:
          'Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)',
        description:
          'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
      };

      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('/bookmarks/updateBookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('/bookmarks/deleteBookmark/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });

      it('should get empty bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks/getBookmarks')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(403)
          .expectJson({
            statusCode: 403,
            message: 'No bookmarks found by id: 28', // user id maters
            error: 'Forbidden',
          });
      });
    });
  });

  it.todo('should pass');
});
