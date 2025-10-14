
import { use } from "chai";
import chaiHttp from "chai-http";
import app from "../src/index";
import { HttpStatus, ResponseStatus } from "../src/enums/APIStatus";
import { User } from "../src/models/User";
import { UserRepo } from "../src/repositories/user/UserRepo";

const _chai = use(chaiHttp);
const expect = _chai.expect;

let user: User;
let adminUser: User;
let authCookie: AuthCookie;
const userRepo = new UserRepo();

before(async () => {
    user = new User();
    user.firstName = "FirstNameTest2";
    user.lastName = "LastNameTest2";
    user.email = "firstname.lastname2@email.com";
    user.password = "First@123";

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
                    done();
                });
        });
    });
});

interface AuthCookie {
    cookieName: string;
    cookieValue: unknown;
}