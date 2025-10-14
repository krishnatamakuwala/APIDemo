
import { use } from "chai";
import chaiHttp from "chai-http";
import app from "../src/index";
import { HttpStatus, ResponseStatus } from "../src/enums/APIStatus";
import { User } from "../src/models/User";
import { UserRepo } from "../src/repositories/user/UserRepo";

const _chai = use(chaiHttp);
const expect = _chai.expect;

let user: User, user2: User;
let adminUser: User;
let authCookie: AuthCookie;
const userRepo = new UserRepo();

before(async () => {
    user = new User();
    user.firstName = "FirstNameTest2";
    user.lastName = "LastNameTest2";
    user.email = "firstname.lastname2@email.com";
    user.password = "First@123";

    user2 = new User();
    user2.firstName = "FirstNameTest2";
    user2.lastName = "LastNameTest2";
    user2.email = "firstname.lastname2@email.com";
    user2.password = "First@123";

    adminUser = new User();
    adminUser.email = "firstname.lastname@email.com";
    adminUser.password = "First@123";
})

describe("Testing User CRUD", () => {
    describe("Login user", () => {
        it("it should let user login for future operations", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: adminUser.email,
                    password: adminUser.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully logged in.");
                    expect(res).to.have.cookie("X-Auth-Token");

                    const resCookie = res.header["set-cookie"][0].split(";")[0].split("=");
                    authCookie = {
                        cookieName: resCookie[0],
                        cookieValue: resCookie[1]
                    }

                    done();
                });
        });
    });

    describe("/POST create", () => {
        it("it should not create user without required fields", done => {
            _chai
                .request(app)
                .post("/api/v1/users/create")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    firstName: user.firstName,
                    lastName: user.lastName
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Email address is required.")
                    done();
                });
        });

        it("it should not create user with first name or last name as empty string", done => {
            _chai
                .request(app)
                .post("/api/v1/users/create")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    firstName: "",
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("First name can not be empty.");
                });

            _chai
                .request(app)
                .post("/api/v1/users/create")
                .send({
                    firstName: user.firstName,
                    lastName: "",
                    email: user.email,
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Last name can not be empty.");
                    done();
                });
        });

        it("it should not create user with invalid email", done => {
            _chai
                .request(app)
                .post("/api/v1/users/create")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: "firstname.lastname@email.",
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid email address.");
                    done();
                });
        });

        it("it should not create user with invalid password", done => {
            _chai
                .request(app)
                .post("/api/v1/users/create")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: "first@123"
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Password must be between 8 and 30 character, having at least one lower case, one upper case, one number, and one special character.");
                    done();
                });
        });

        it("it should not create user without login or without auth token", done => {
            _chai
                .request(app)
                .post("/api/v1/users/create")
                .send({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Auth token must be provided.");
                    done();
                });
        });

        it("it should not create user with wrong or invalid auth token", done => {
            _chai
                .request(app)
                .post("/api/v1/users/create")
                .set('Cookie', `${authCookie.cookieName}=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UifQ.FJtknc9j9frRg0N4Iua2Q6DmaMaCJsCz5uawiJxVDic`)
                .send({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid JWT Token.");
                    done();
                });
        });

        it("it should create user", done => {
            _chai
                .request(app)
                .post("/api/v1/users/create")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Created);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully created a user.");

                    userRepo.getByEmail(user.email, false, true).then((_user) => {
                        if (_user) {
                            user.userId = _user.userId;
                        }
                    });

                    done();
                });
        });

        it("it should not create user with existing email", done => {
            _chai
                .request(app)
                .post("/api/v1/users/create")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Warning);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("User email already exists.");
                    done();
                });
        });
    });

    describe("/PATCH update", () => {
        it("it should not update user without user id", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("User id is required.");
                    done();
                });
        });

        it("it should not update user if user id is not a number", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: "2t",
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("User id must be a number.");
                    done();
                });
        });

        it("it should not update user if user id is negative or zero", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: 0,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("User id must be > 0.");
                    done();
                });
        });

        it("it should not update user with first name or last name as empty string", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: Number(user.userId),
                    firstName: "",
                    lastName: user.lastName,
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("First name can not be empty.");
                });

            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .send({
                    userId: Number(user.userId),
                    firstName: user.firstName,
                    lastName: "",
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Last name can not be empty.");
                    done();
                });
        });

        it("it should not update user with invalid email", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: Number(user.userId),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: "firstname.lastname@email."
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid email address.");
                    done();
                });
        });

        it("it should not update user if there is no change in any data", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: Number(user.userId),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Warning);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("There is no change in any data.");
                    done();
                });
        });

        it("it should not update user without login or without auth token", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .send({
                    userId: Number(user.userId),
                    firstName: "ChangedFirstName",
                    lastName: user.lastName,
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Auth token must be provided.");
                    done();
                });
        });

        it("it should not update user with wrong or invalid auth token", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UifQ.FJtknc9j9frRg0N4Iua2Q6DmaMaCJsCz5uawiJxVDic`)
                .send({
                    userId: Number(user.userId),
                    firstName: "ChangedFirstName",
                    lastName: user.lastName,
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid JWT Token.");
                    done();
                });
        });

        it("it should update user if only first name is changed", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: Number(user.userId),
                    firstName: "ChangedFirstName",
                    lastName: user.lastName,
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully updated a user.");
                    done();
                });
            user.firstName = "ChangedFirstName";
        });

        it("it should update user if only last name is changed", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: Number(user.userId),
                    firstName: user.firstName,
                    lastName: "ChangedLastName",
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully updated a user.");
                    done();
                });
            user.lastName = "ChangedLastName";
        });

        it("it should update user if only email is changed", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: Number(user.userId),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: "changed.email2@email.com"
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully updated a user.");
                    done();
                });
            user.email = "changed.email2@email.com";
        });

        it("it should update user if all data is changed", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: Number(user.userId),
                    firstName: "ChangedFirstName2",
                    lastName: "ChangedLastName2",
                    email: "changed.email3@email.com"
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully updated a user.");
                    done();
                });
            user.firstName = "ChangedFirstName2";
            user.lastName = "ChangedLastName2";
            user.email = "changed.email3@email.com";
        });

        it("it should not update user with existing email", done => {
            _chai
                .request(app)
                .patch("/api/v1/users/update")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: Number(user.userId),
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: adminUser.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Warning);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("User email already exists.");
                    done();
                });
        });
    });

    describe("/DELETE delete", () => {
        it("it should not delete user without email or password field", done => {
            _chai
                .request(app)
                .delete("/api/v1/users/delete")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Email address is required.");
                });

            _chai
                .request(app)
                .delete("/api/v1/users/delete")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    email: user.email
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Password is required.");
                    done();
                });
        });

        it("it should not delete user with invalid email", done => {
            _chai
                .request(app)
                .delete("/api/v1/users/delete")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    email: "firstname.lastname@email.",
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid email address.");
                    done();
                });
        });

        it("it should not delete user with invalid password", done => {
            _chai
                .request(app)
                .delete("/api/v1/users/delete")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    email: user.email,
                    password: "first@123"
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Password must be between 8 and 30 character, having at least one lower case, one upper case, one number, and one special character.");
                    done();
                });
        });

        it("it should not delete user without login or without auth token", done => {
            _chai
                .request(app)
                .delete("/api/v1/users/delete")
                .send({
                    email: user.email,
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Auth token must be provided.");
                    done();
                });
        });

        it("it should not delete user with wrong or invalid auth token", done => {
            _chai
                .request(app)
                .delete("/api/v1/users/delete")
                .set('Cookie', `${authCookie.cookieName}=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UifQ.FJtknc9j9frRg0N4Iua2Q6DmaMaCJsCz5uawiJxVDic`)
                .send({
                    email: user.email,
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid JWT Token.");
                    done();
                });
        });

        it("it should not delete user with invalid credentials", done => {
            _chai
                .request(app)
                .delete("/api/v1/users/delete")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    email: user.email,
                    password: "Wrong@123"
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid credentials.");
                    done();
                });
        });

        it("it should not delete admin user", done => {
            _chai
                .request(app)
                .delete("/api/v1/users/delete")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    email: adminUser.email,
                    password: adminUser.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Warning);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Deletion of admin user is not permitted.");
                    done();
                });
        });

        it("it should delete user", done => {
            _chai
                .request(app)
                .delete("/api/v1/users/delete")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    email: user.email,
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully deleted a user.");

                    userRepo.create(user2).then(() => {
                        userRepo.getByEmail(user2.email, false, true).then((_user) => {
                            if (_user) {
                                user2.userId = _user.userId;
                            }
                            done();
                        });
                    });
                });
        });
    });

    describe("/POST findOne", () => {
        it("it should not get user without user id", done => {
            _chai
                .request(app)
                .post("/api/v1/users/findOne")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({})
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("User id is required.");
                    done();
                });
        });

        it("it should not get user if user id is not a number", done => {
            _chai
                .request(app)
                .post("/api/v1/users/findOne")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: "2t"
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("User id must be a number.");
                    done();
                });
        });

        it("it should not get user if user id is negative or zero", done => {
            _chai
                .request(app)
                .post("/api/v1/users/findOne")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: 0
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("User id must be > 0.");
                    done();
                });
        });

        it("it should not get user without login or without auth token", done => {
            _chai
                .request(app)
                .post("/api/v1/users/findOne")
                .send({
                    userId: Number(user.userId)
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Auth token must be provided.");
                    done();
                });
        });

        it("it should not get user with wrong or invalid auth token", done => {
            _chai
                .request(app)
                .post("/api/v1/users/findOne")
                .set('Cookie', `${authCookie.cookieName}=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UifQ.FJtknc9j9frRg0N4Iua2Q6DmaMaCJsCz5uawiJxVDic`)
                .send({
                    userId: Number(user.userId)
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid JWT Token.");
                    done();
                });
        });

        it("it should not get user if user not exists", done => {
            _chai
                .request(app)
                .post("/api/v1/users/findOne")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: 999
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("User not found.");
                    expect(res.body).to.not.have.property("data");
                    done();
                });
        });

        it("it should not get user if user is deleted", done => {
            _chai
                .request(app)
                .post("/api/v1/users/findOne")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: Number(user.userId)
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("User not found.");
                    expect(res.body).to.not.have.property("data");
                    done();
                });
        });

        it("it should get user", done => {
            _chai
                .request(app)
                .post("/api/v1/users/findOne")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    userId: Number(user2.userId)
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully fetched user data.");
                    expect(res.body).to.have.property("data");
                    expect(res.body.data).to.have.property("firstName");
                    expect(res.body.data.firstName).to.be.a("string");
                    expect(res.body.data).to.have.property("lastName");
                    expect(res.body.data.lastName).to.be.a("string");
                    expect(res.body.data).to.have.property("email");
                    expect(res.body.data.email).to.be.a("string");
                    done();
                });
        });
    });

    describe("/POST count", () => {
        it("it should not get all users count without config", done => {
            _chai
                .request(app)
                .post("/api/v1/users/count")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({})
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Grid configuration is required.");
                    done();
                });
        });

        it("it should not get all users count if config is not valid", done => {
            _chai
                .request(app)
                .post("/api/v1/users/count")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    config: {
                        recordPerPage: 1,
                        totalPage: 1,
                        currentPage: 0,
                        orders: 1
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Order configuration must be an array of object.");
                    done();
                });
        });

        it("it should not get all users count without login or without auth token", done => {
            _chai
                .request(app)
                .post("/api/v1/users/count")
                .send({
                    config: {
                        recordPerPage: 10,
                        totalPage: 1,
                        currentPage: 0,
                        orders: []
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Auth token must be provided.");
                    done();
                });
        });

        it("it should not get all users count with wrong or invalid auth token", done => {
            _chai
                .request(app)
                .post("/api/v1/users/count")
                .set('Cookie', `${authCookie.cookieName}=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UifQ.FJtknc9j9frRg0N4Iua2Q6DmaMaCJsCz5uawiJxVDic`)
                .send({
                    config: {
                        recordPerPage: 10,
                        totalPage: 1,
                        currentPage: 0,
                        orders: []
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid JWT Token.");
                    done();
                });
        });

        it("it should get all users count", done => {
            _chai
                .request(app)
                .post("/api/v1/users/count")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    config: {
                        recordPerPage: 10,
                        totalPage: 1,
                        currentPage: 0,
                        orders: []
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully fetched users count.");
                    expect(res.body).to.have.property("data");
                    expect(res.body.data).to.have.property("count");
                    expect(Number(res.body.data.count)).to.be.greaterThan(0);
                    done();
                });
        });

        it("it should get 1 user count matching specific email", done => {
            _chai
                .request(app)
                .post("/api/v1/users/count")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    config: {
                        recordPerPage: 10,
                        totalPage: 1,
                        currentPage: 0,
                        orders: [],
                        searchText: "firstname.lastname2"
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully fetched users count.");
                    expect(res.body).to.have.property("data");
                    expect(res.body.data).to.have.property("count");
                    expect(Number(res.body.data.count)).to.equal(1);
                    done();
                });
        });
    });

    describe("/POST / get all", () => {
        it("it should not get all users without config", done => {
            _chai
                .request(app)
                .post("/api/v1/users/")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({})
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Grid configuration is required.");
                    done();
                });
        });

        it("it should not get all users if config is not valid", done => {
            _chai
                .request(app)
                .post("/api/v1/users/")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    config: {
                        recordPerPage: 1,
                        totalPage: 1,
                        currentPage: 0,
                        orders: 1
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.BadRequest);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Order configuration must be an array of object.");
                    done();
                });
        });

        it("it should not get all users without login or without auth token", done => {
            _chai
                .request(app)
                .post("/api/v1/users/")
                .send({
                    config: {
                        recordPerPage: 10,
                        totalPage: 1,
                        currentPage: 0,
                        orders: []
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Auth token must be provided.");
                    done();
                });
        });

        it("it should not get all users with wrong or invalid auth token", done => {
            _chai
                .request(app)
                .post("/api/v1/users/")
                .set('Cookie', `${authCookie.cookieName}=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UifQ.FJtknc9j9frRg0N4Iua2Q6DmaMaCJsCz5uawiJxVDic`)
                .send({
                    config: {
                        recordPerPage: 10,
                        totalPage: 1,
                        currentPage: 0,
                        orders: []
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid JWT Token.");
                    done();
                });
        });

        it("it should get 1 users", done => {
            _chai
                .request(app)
                .post("/api/v1/users/")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    config: {
                        recordPerPage: 1,
                        totalPage: 2,
                        currentPage: 0,
                        orders: []
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully fetched users.");
                    expect(res.body).to.have.property("data");
                    expect(res.body.data).to.be.an("array");
                    expect(res.body.data).to.have.lengthOf.at.most(1);
                    done();
                });
        });

        it("it should get 10 users", done => {
            _chai
                .request(app)
                .post("/api/v1/users/")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    config: {
                        recordPerPage: 10,
                        totalPage: 1,
                        currentPage: 0,
                        orders: []
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully fetched users.");
                    expect(res.body).to.have.property("data");
                    expect(res.body.data).to.be.an("array");
                    expect(res.body.data).to.have.lengthOf.at.most(10);
                    done();
                });
        });

        it("it should get 1 user matching specific email", done => {
            _chai
                .request(app)
                .post("/api/v1/users/")
                .set('Cookie', `${authCookie.cookieName}=${authCookie.cookieValue}`)
                .send({
                    config: {
                        recordPerPage: 10,
                        totalPage: 1,
                        currentPage: 0,
                        orders: [],
                        searchText: "firstname.lastname2"
                    }
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully fetched users.");
                    expect(res.body).to.have.property("data");
                    expect(res.body.data).to.be.an("array");
                    expect(res.body.data).to.have.lengthOf(1);
                    expect(res.body.data[0]).to.have.property("email");
                    expect(res.body.data[0].email).to.equal(user2.email);
                    done();
                });
        });
    });
});

interface AuthCookie {
    cookieName: string;
    cookieValue: unknown;
}