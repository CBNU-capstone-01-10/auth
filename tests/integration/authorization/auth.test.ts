import prismaClient from '../../../src/database';
import request from 'supertest';
import testUserData from '../../seeds/user.json';
import app from '../../../src/app';

jest.unmock('../../../src/database');

jest.mock('../../../src/utils/mailer.ts');

describe('Authentication', () => {
  beforeAll(async () => {
    testUserData.localUsers.forEach(async (localUser) => {
      await prismaClient.user.create({
        data: localUser,
      });
    });
  });

  afterAll(async () => {
    await prismaClient.user.deleteMany({});
  });

  describe('Local', () => {
    describe('Signup', () => {
      test('Response_Signup_Page_With_200', (done) => {
        request(app).get('/auth/signup').expect(200).end(done);
      });

      test('Response_Signup_Success_Page_With_200_If_Signup_Success', (done) => {
        request(app)
          .post('/auth/signup')
          .send(testUserData.newLocalUser)
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(200)
          .end(done);
      });

      test('Response_Error_Page_With_409_If_Signup_Request_Include_Conflict_Input', (done) => {
        request(app)
          .post('/auth/signup')
          .send({
            username: testUserData.localUsers[0].username,
            email: testUserData.localUsers[0].local.create.email,
            password: 'strongPassword12!',
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(409)
          .end(done);
      });

      test('Response_Error_Page_With_400_If_Signup_Request_Doest_Not_Include_Username', (done) => {
        request(app)
          .post('/auth/signup')
          .send({
            email: testUserData.signupInput.valid.username,
            password: testUserData.signupInput.valid.password,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      test('Response_Error_Page_With_400_If_Signup_Request_Doest_Not_Include_Email', (done) => {
        request(app)
          .post('/auth/signup')
          .send({
            username: testUserData.signupInput.valid.username,
            password: testUserData.signupInput.valid.password,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      test('Response_Error_Page_With_400_If_Signup_Request_Doest_Not_Include_Password', (done) => {
        request(app)
          .post('/auth/signup')
          .send({
            username: testUserData.signupInput.valid.username,
            email: testUserData.signupInput.valid.email,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      test('Response_Error_Page_With_400_If_Signup_Request_Include_Invalid_Username', (done) => {
        request(app)
          .post('/auth/signup')
          .send({
            username: testUserData.signupInput.invalid.username,
            password: testUserData.signupInput.valid.password,
            email: testUserData.signupInput.valid.email,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      test('Response_Error_Page_With_400_If_Signup_Request_Include_Invalid_Email', (done) => {
        request(app)
          .post('/auth/signup')
          .send({
            username: testUserData.signupInput.valid.username,
            password: testUserData.signupInput.valid.password,
            email: testUserData.signupInput.invalid.email,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });

      test('Response_Error_Page_With_400_If_Signin_Request_Include_Invalid_Password', (done) => {
        request(app)
          .post('/auth/signup')
          .send({
            username: testUserData.signupInput.valid.username,
            password: testUserData.signupInput.invalid.password,
            email: testUserData.signupInput.valid.email,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(400)
          .end(done);
      });
    });

    describe('Verify', () => {
      test('Response_Verification_Success_Page_With_200_If_Verification_Success', async () => {
        const user = await prismaClient.user.findFirst({
          where: {
            username: testUserData.newLocalUser.username,
            local: {
              email: testUserData.newLocalUser.email,
            },
          },
          include: {
            local: true,
          },
        });

        const res = await request(app).get(
          `/auth/signup/verify?user_id=${user?.id}&token=${user?.local?.verify_token}`
        );

        expect(res.status).toEqual(200);
      });

      test('Response_Error_Page_With_400_If_Verification_Request_Include_Invalid_Query_Parameters', (done) => {
        request(app).get('/auth/signup/verify').expect(400).end(done);
      });

      test('Response_Error_Page_With_404_If_Verification_Request_Is_Bad_Request', (done) => {
        request(app)
          .get(
            `/auth/signup/verify?user_id=1234&token=${testUserData.verifyQuery.invalid.token}`
          )
          .expect(400)
          .end(done);
      });
    });

    describe('Signin', () => {
      test('Response_Signin_Page_With_200', (done) => {
        request(app).get('/auth/signin').expect(200).end(done);
      });

      test('Redirect_To_Home_With_302_If_Signin_Success_But_Redirect_Uri_Does_Not_Provided', (done) => {
        request(app)
          .post('/auth/signin')
          .send({
            email: testUserData.newLocalUser.email,
            password: testUserData.newLocalUser.password,
          })
          .set({
            'Content-Type': 'application/x-www-form-urlencoded',
          })
          .expect(302)
          .end(done);
      });

      test('Response_Error_Page_With_400_If_Signin_Failed', (done) => {
        request(app)
          .post('/auth/signin')
          .send({
            email: 'doesNotExist@example.com',
            password: 'strongPassword12!',
          })
          .expect(400)
          .end(done);
      });
    });
  });
});