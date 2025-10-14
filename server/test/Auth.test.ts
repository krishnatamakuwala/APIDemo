
import { use } from "chai";
import chaiHttp from "chai-http";
import app from "../src/index";
import { HttpStatus, ResponseStatus } from "../src/enums/APIStatus";
import { User } from "../src/models/User";
import { UserRepo } from "../src/repositories/user/UserRepo";

const _chai = use(chaiHttp);
const expect = _chai.expect;

let user: User;
const userRepo = new UserRepo();

before(async () => {
    user = new User();
    user.firstName = "FirstNameTest";
    user.lastName = "LastNameTest";
    user.email = "firstname.lastname@email.com";
    user.password = "First@123";

    await userRepo.deleteAllTestUser();
})

describe("Testing User Auth", () => {
    describe("/POST register", () => {
        it("it should not register user without required fields", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/register")
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

        it("it should not register user with first name or last name as empty string", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/register")
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
                .post("/api/v1/auth/register")
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

        it("it should not register user with invalid email", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/register")
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

        it("it should not register user with invalid password", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/register")
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

        it("it should register user", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/register")
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
                    done();
                });
        });

        it("it should not register user with existing email", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/register")
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

    describe("/POST login", () => {
        it("it should not let user login with invalid email", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/login")
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
                    expect(res).to.not.have.cookie("X-Auth-Token");
                    done();
                });
        });

        it("it should not let user login with invalid password", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/login")
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
                    expect(res).to.not.have.cookie("X-Auth-Token");
                    done();
                });
        });

        it("it should not let user login with invalid credentials", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: user.email,
                    password: "Wrong@123"
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.UnAuthorised);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Error);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Invalid login credentials.");
                    expect(res).to.not.have.cookie("X-Auth-Token");
                    done();
                });
        });

        it("it should let user login", done => {
            _chai
                .request(app)
                .post("/api/v1/auth/login")
                .send({
                    email: user.email,
                    password: user.password
                })
                .end((err, res) => {
                    expect(res).to.have.status(HttpStatus.Ok);
                    expect(res.body).to.have.property("status");
                    expect(res.body.status).to.equal(ResponseStatus.Success);
                    expect(res.body).to.have.property("message");
                    expect(res.body.message).to.equal("Successfully logged in.");
                    expect(res).to.have.cookie("X-Auth-Token");
                    done();
                });
        });
    });
});