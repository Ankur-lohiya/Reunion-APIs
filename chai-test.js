const app = require("./app");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);

//authenticate api test
chai
  .request(app)
  .post("/api/authenticate")
  .send({ email: "abcd@gmail.com", password: "this_is_test" })
  .end((err, res) => {
    if (err) console.log(err);
    else {
      chai.assert.equal(res.status, 200, JSON.parse(res.text).message);
      chai.assert.equal(
        JSON.parse(res.text).message,
        "User logged in successfully",
        "Login failed"
      );
      console.log("authenticate api Test passed");
      return;
    }
  });

//follow api test
id = "63c758b09e70b09da5a36031";
chai
  .request(app)
  .post("/api/follow/" + id)
  .set({
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2M3NTg4ODllNzBiMDlkYTVhMzYwMmUiLCJpYXQiOjE2NzQxMDE3ODcsImV4cCI6MTY3NDEyNjk4N30.VpcUpHz3CLERTFYGMHhbtq19JUzzpXm-YYhkK6jdhrg",
  })
  .send()
  .end((err, res) => {
    if (err) console.log(err);
    else {
      chai.assert.equal(res.status, 200, JSON.parse(res.text).message);
      chai.assert.equal(
        JSON.parse(res.text).message,
        "Following completed successfully",
        JSON.parse(res.text).message
      );
      console.log("follow api Test passed");
      return;
    }
  });

//unfollow api test
id = "63c758b09e70b09da5a36031";
chai
  .request(app)
  .post("/api/unfollow/" + id)
  .set({
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2M3NTg4ODllNzBiMDlkYTVhMzYwMmUiLCJpYXQiOjE2NzQxMDE3ODcsImV4cCI6MTY3NDEyNjk4N30.VpcUpHz3CLERTFYGMHhbtq19JUzzpXm-YYhkK6jdhrg",
  })
  .send()
  .end((err, res) => {
    if (err) console.log(err);
    else {
      chai.assert.equal(res.status, 200, JSON.parse(res.text).message);
      chai.assert.equal(
        JSON.parse(res.text).message,
        "Unfollowing completed successfully",
        JSON.parse(res.text).message
      );
      console.log("unfollow api Test passed");
      return;
    }
  });

//user api test
chai
  .request(app)
  .get("/api/user")
  .set({
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2M3NTg4ODllNzBiMDlkYTVhMzYwMmUiLCJpYXQiOjE2NzQxMDE3ODcsImV4cCI6MTY3NDEyNjk4N30.VpcUpHz3CLERTFYGMHhbtq19JUzzpXm-YYhkK6jdhrg",
  })
  .end((err, res) => {
    if (err) console.log(err);
    else {
      chai.assert.equal(res.status, 200, JSON.parse(res.text).message);
      chai.assert.equal(
        JSON.parse(res.text).message,
        "User info fetched successfully",
        JSON.parse(res.text).message
      );
      console.log("get user api Test passed");
      return;
    }
  });

// post api test
chai
  .request(app)
  .post("/api/posts/")
  .set({
    Authorization:
      "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2M2M3NTg4ODllNzBiMDlkYTVhMzYwMmUiLCJpYXQiOjE2NzQxMDE3ODcsImV4cCI6MTY3NDEyNjk4N30.VpcUpHz3CLERTFYGMHhbtq19JUzzpXm-YYhkK6jdhrg",
  })
  .send({ title: "test title", description: "test description" })
  .end((err, res) => {
    if (err) console.log(err);
    else {
      chai.assert.equal(res.status, 200, JSON.parse(res.text).message);
      chai.assert.equal(
        JSON.parse(res.text).message,
        "Post added successfully",
        JSON.parse(res.text).message
      );
      console.log("post api Test passed");
      return;
    }
  });

console.log(app);
