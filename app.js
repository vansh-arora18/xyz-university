const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const port = process.env.PORT || 8008;
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const csvFilePath = "<path to csv file>";
const csv = require("csvtojson");

dotenv.config({ path: "chandigarh.env" });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());

app.use(
  session({
    secret: "our little secret",
    resave: false,
    saveUninitialized: false,
  })
);

var values = [];

app.use(passport.initialize());
app.use(passport.session());

const mongoose = require("mongoose");

mongoose.connect(process.env.LINKDB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const contactSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  Country: String,
  Subject: String,
  Email: String,
});

const dataSchema = new mongoose.Schema({
  Name: String,
  Section: String,
  Batch: String,
  UID: String,
  Placed: String,
  Leet: String,
  TPP: String,
  Cgpa: String,
  Clubs_Joined: [],
  Sports_Enrolled: [],
  CR: String,
  Internship: String,
  DOB: String,
  Gender: String,
  Phone_Number: String,
  Father_Number: String,
  Father_Name: String,
  Address: String,
  Tenth_Marks: String,
  Twelveth_Marks: String,
  cumail: String,
  Mentor: String,
});

const MentorSchema = new mongoose.Schema({
  Mentor_Name: String,
  Section: String,
  Batch: String,
  Emp_id: String,
  Phone_Number: String,
  cumail: String,
});

dataSchema.plugin(passportLocalMongoose);
userSchema.plugin(passportLocalMongoose);
MentorSchema.plugin(passportLocalMongoose);
contactSchema.plugin(passportLocalMongoose);

const Users = mongoose.model("Users", userSchema);
const UsersData = mongoose.model("UsersData", dataSchema);
const MentorsData = mongoose.model("MentorsData", MentorSchema);
const contactData = mongoose.model("ContactData", contactSchema);

passport.use(Users.createStrategy());
passport.serializeUser(Users.serializeUser());
passport.deserializeUser(Users.deserializeUser());

let batch = new Set();
UsersData.find({}, (err, stud) => {
  stud.forEach((student) => {
    batch.add(student.Batch);
  });
});

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/mentor", (req, res) => {
  res.render("mentor", { success: "" });
});

app.get("/lab_assistant", (req, res) => {
  res.render("assistant");
});

app.post("/mentor", (req, res) => {
  const data = new MentorsData({
    Mentor_Name: req.body.Mentor_Name,
    Section: req.body.Section,
    Emp_id: req.body.Emp_id,
    Phone_Number: req.body.Phone_Number,
    cumail: req.body.cumail,
  });
  data.save(data).then(() => console.log("saved"));

  res.render("mentor", { success: "Data Added Successfully" });
});

app.get("/add_data", (req, res) => {
  res.render("add_data");
});

// csv()
//   .fromFile("information.csv")
//   .then((jsonObj) => {
//     UsersData.insertMany(jsonObj, (err) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log("data saved");
//       }
//     });
//   });

// csv()
//   .fromFile("in.csv")
//   .then((jsonObj) => {
//     MentorsData.insertMany(jsonObj, (err) => {
//       if (err) {
//         console.log(err);
//       } else {
//         console.log("data saved");
//       }
//     });
//   });

app.get("/search/:UID", (req, res) => {
  UsersData.find({ UID: req.params.UID }, (err, student) => {
    if (!err) {
      res.render("student_data", { student: student[0] });
    }
  });
});

app.post("/editdata", (req, res) => {
  const obj = {
    Name: req.body.Name,
    Section: req.body.Section,
    Batch: req.body.Batch,
    UID: req.body.UID,
    Placed: req.body.Placed,
    Leet: req.body.Leet,
    TPP: req.body.TPP,
    Cgpa: req.body.Cgpa,
    Clubs_Joined: req.body.Clubs_Joined,
    Sports_Enrolled: req.body.Sports_Enrolled,
    CR: req.body.CR,
    Internship: req.body.Internship,
    DOB: req.body.DOB,
    Gender: req.body.Gender,
    Phone_Number: req.body.Phone_Number,
    Father_Number: req.body.Father_Number,
    Father_Name: req.body.Father_Name,
    Address: req.body.Address,
    Tenth_Marks: req.body.Tenth_Marks,
    Twelveth_Marks: req.body.Twelveth_Marks,
    cumail: req.body.cumail,
    Mentor: req.body.Mentor,
  };
  UsersData.updateOne({ UID: req.body.UID }, obj, (err) => {
    if (!err) {
      res.render("search", {
        name: "UPDATE",
        success: "Data Updated Successfully",
        batch: batch,
      });
    } else {
      console.log(err);
    }
  });
});

app.post("/edit", (req, res) => {
  UsersData.find({ UID: req.body.UID }, (err, student) => {
    if (!err) {
      res.render("edit", {
        student: student[0],
      });
    }
  });
});

const section = new Set();

app.post("/search", (req, res) => {
  UsersData.find({ Batch: req.body.Batch }, (err, result) => {
    result.forEach((res) => {
      section.add(res.Section);
    });

    console.log(section);
    res.render("search_sec", {
      batch: req.body.Batch,
      name: req.body.value,
      success: " ",
      section: section,
    });
  });
});

app.post("/search_sec", (req, res) => {
  // console.log(req.body);
  const namess = req.body.value.toUpperCase();
  UsersData.find({ Batch: req.body.batch }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      let value = docs.filter((x) => {
        return x.Section === req.body.Section;
      });
      values = [...value];
      if (values.length == 0) {
        res.render("noData", { name: namess });
      } else {
        res.render("tabledata", {
          values: values,
          name: namess,
        });
      }
    }
  });
});

app.get("/deleteSection", (req, res) => {
  res.render("deleteSection", {
    name: "DELETE SECTION",
    success: " ",
    batch: batch,
  });
});

app.post("/deleteSection", (req, res) => {
  UsersData.find({ Batch: req.body.Batch }, (err, result) => {
    result.forEach((res) => {
      section.add(res.Section);
    });

    res.render("deleteSection_sec", {
      batch: req.body.Batch,
      name: req.body.value,
      success: " ",
      section: section,
    });
  });
});

app.post("/deleteSection_sec", (req, res) => {
  console.log(req.body);
  UsersData.find({ Batch: req.body.batch }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      docs.forEach((student) => {
        if (student.Section == req.body.Section) {
          UsersData.deleteOne({ Section: student.Section }, (err) => {
            !err;
            {
              res.render("deleteSection", {
                name: "DELETE SECTION",
                success: "Section Deleted Successfully",
                batch: batch,
              });
            }
          });
        }
      });
    }
  });
});

app.post("/deleteStudent", (req, res) => {
  UsersData.deleteOne({ UID: req.body.UID }, (err) => {
    if (!err) {
      res.render("search", {
        name: "DELETE STUDENT",
        success: "Student Deleted Successfully",
        batch: batch,
      });
    }
  });
});

app.get("/update", (req, res) => {
  res.render("search", { batch: batch, name: "UPDATE", success: " " });
});

app.post("/add", (req, res) => {
  const data = new UsersData({
    Name: req.body.Name,
    Section: req.body.Section,
    Batch: req.body.Batch,
    UID: req.body.UID,
    Placed: req.body.Placed,
    Leet: req.body.Leet,
    TPP: req.body.TPP,
    Cgpa: req.body.Cgpa,
    Clubs_Joined: req.body.Clubs_Joined,
    Sports_Enrolled: req.body.Sports_Enrolled,
    CR: req.body.CR,
    Internship: req.body.Internship,
    DOB: req.body.DOB,
    Gender: req.body.Gender,
    Phone_Number: req.body.Phone_Number,
    Father_Number: req.body.Father_Number,
    Father_Name: req.body.Father_Name,
    Address: req.body.Address,
    Tenth_Marks: req.body.Tenth_Marks,
    Twelveth_Marks: req.body.Twelveth_Marks,
    cumail: req.body.cumail,
    Mentor: req.body.Mentor,
  });
  data.save(data).then(() => console.log("saved"));

  res.render("add", { success: "Data Added Successfully" });
});

app.get("/home", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("home", { errormessage: "your message" });
  } else {
    res.redirect("/login");
  }
});
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  const user = new Users({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (!err) {
      passport.authenticate("local")(req, res, () => {
        res.redirect("/home");
      });
    }
  });
});

app.get("/cgpa", (req, res) => {
  res.render("cgpa", { name: "CGPA", batch: batch });
});

app.post("/cgpa", (req, res) => {
  UsersData.find({ Batch: req.body.Batch }, (err, result) => {
    result.forEach((res) => {
      section.add(res.Section);
    });
    res.render("cgpa_sec", {
      batch: req.body.Batch,
      name: req.body.value,
      success: " ",
      section: section,
    });
  });
});

app.post("/cgpa_sec", (req, res) => {
  console.log(req.body);
  const namess = req.body.value.toUpperCase();
  UsersData.find({ Batch: req.body.batch }, function (err, docs) {
    if (err) {
      console.log(err);
    } else {
      let value = docs.filter((x) => {
        if (req.body.CGPA <= 4) {
          return x.Section === req.body.Section && x.Cgpa <= req.body.CGPA;
        } else {
          return x.Section === req.body.Section && x.Cgpa >= req.body.CGPA;
        }
      });
      values = [...value];
      console.log(values.length);

      if (values.length == 0) {
        res.render("noData", { name: namess });
      } else {
        res.render("tabledata", {
          values: values,
          name: namess,
        });
      }
    }
  });
});

app.get("/logout1", (req, res) => {
  req.logout((err) => {});
  res.redirect("/login");
});

app.get("/add", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("add", { success: " " });
  } else {
    res.redirect("/login");
  }
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", (req, res) => {
  const user = new Users({
    username: req.body.username,
    password: req.body.password,
  });
  user.save(user);
  Users.register(
    { username: req.body.email },
    req.body.password,
    function (err, user) {
      if (err) {
        return res.render("/register");
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/", { name: "" });
        });
      }
    }
  );
});

app.get("/contact", (req, res) => {
  res.render("contactus", { success: "" });
});

app.post("/contact", (req, res) => {
  const data = new contactData({
    firstName: req.body.firstname,
    lastName: req.body.lastname,
    Country: req.body.country,
    Subject: req.body.subject,
    Email: req.body.email,
  });
  data.save(data).then(() => console.log("saved"));

  res.render("contactus", { success: "Query Raised Successfully" });
  // res.render("contactus");
});
app.get("/delete", (req, res) => {
  res.render("delete");
});

app.get("/deleteStudent", (req, res) => {
  res.render("search", { name: "DELETE STUDENT", success: " ", batch: batch });
});

app.post("/addcsv", (req, res) => {
  if (req.files) {
    file = req.files.file;
    filename = file.name;

    file.mv("./" + filename, function (err) {
      if (err) console.log(err);
    });
    res.redirect("/add");
  }
});

app.get("/:name", (req, res) => {
  section.clear();
  const namesss = req.params.name.toUpperCase();
  if (req.isAuthenticated()) {
    res.render("search", { name: namesss, success: " ", batch: batch });
  } else {
    res.redirect("/login");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
