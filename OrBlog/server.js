const express = require("express");
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const oneDay = 1000 * 60 * 60 * 24;


require("dotenv").config();
const admin_username = process.env.ADMIN_USERNAME;
const admin_password = process.env.ADMIN_PASSWORD;
var session;

const bodyParser = require("body-parser");
const app = express();
const Post = require("./models/post");
const moment = require("moment");
app.set("view engine", "ejs");

app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));


//session middleware
app.use(sessions({
    secret: "orkuniloveu",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false
}));

app.use(cookieParser());

app.get("/",  async function (req, res) {
  const all_posts = await Post.getAllPosts();
  const visible_blogs = all_posts.filter((blog) => !blog.hidden);
  console.log(visible_blogs);
  res.render("index", {
    blogs: visible_blogs,
  });
});

//moment().format('MMMM Do YYYY, h:mm:ss a'); // April 20th 2022, 4:25:12 pm
app.get("/blog/:id", async function  (req, res) {
  var id = req.params.id;
  var foundBlog = await Post.getPostById(id);
  if (foundBlog != null && foundBlog.hidden == 0) {
    res.render("blog", {
      title: foundBlog.title,
      dateUploaded: foundBlog.createdAt,
      content: foundBlog.body,
    });
  } else {
    res.render("error", {msg: "Couldn't find a none hidden blog with that id "});
  }
});

app.get("/blog-admin/:id", async function (req, res) {
  var id = req.params.id;
  var foundBlog = await Post.getPostById(id);
  if (foundBlog != null) {
    res.render("blog", {
      title: foundBlog.title,
      dateUploaded: foundBlog.createdAt,
      content: foundBlog.content,
    });
  } else {
    res.render("error", {msg: "Couldn't find a blog with that id"});
  }
});
app.get("/admin-page", (req, res) => {
  session=req.session;

  if(session.userid){
    res.render("admin-page");
  }else{
    res.redirect("/login");
  } 
});

app.get("/create-blog", (req, res) => {

  session=req.session;

  if(session.userid){
    res.render("create-blog");
  }else{
    res.redirect("/login");
  } 
});

app.get("/login", (req, res) => {
  res.render("login", {msg: ""});
})
app.post("/login", (req, res) => {

  if(req.body.username == admin_username && req.body.password == admin_password){
      session=req.session;
      session.userid=req.body.username;
      res.redirect("/admin-page");
  }
  else{
      res.render("login", {msg: "Wrong username or password!"})
  }

 
})
app.post("/create-blog", (req, res) => {
  let post_title = req.body.btitle;
  let post_desc = req.body.bdesc;
  let post_content = req.body.bcontent;
  let post_hidden = req.body.bhidden == "on";
  addBlog(post_title, post_desc, post_content, post_hidden);
  console.log(req.body);
  res.render("admin-page");
});

app.get("/edit-blog", async (req, res) => {
  session=req.session;

  if(session.userid){
    res.render("edit-blog", {
      blogs: await Post.getAllPosts(),
    });
  
  }else{
    res.redirect("/login");
  } 
  
});

app.get("/edit-blog/:id",async  (req, res) => {
  var id = req.params.id;
  var foundBlog = await Post.getPostById(id);
  if (foundBlog != null) {
    foundBlog.hidden_value = foundBlog.hidden == true ? "checked" : "";
    res.render("edit-blog-page", foundBlog);
  } else {
    res.render("error", {msg: "Couldn't find a blog with that id"});
  }
});

app.post("/edit-blog/:id", async(req, res) => {
  var id = req.params.id;
  var foundBlog = await Post.getPostById(id);
  if (foundBlog != null) {
    foundBlog.title = req.body.title;
    foundBlog.desc = req.body.desc;
    foundBlog.body = req.body.content;
    foundBlog.hidden = req.body.hidden == "on";

    console.log(foundBlog);

    Post.updatePost(id, foundBlog);

    res.render("admin-page");
  } else {
    res.render("error", {msg: "Couldn't find a blog with that id"});
  }
});
app.listen(3000, function () {
  console.log("The server is ready");
});



async function generateId() {
  const all_blogs = await Post.getAllPosts();
  if (all_blogs == null) all_blogs = [];
  let generatedId = Math.random().toString(36).replace("0.", "");
  if (all_blogs.find((blog) => blog.id == generatedId) == undefined) {
    return generatedId;
  }
  return generateId();
}

async function addBlog(btitle, bdesc, bcontent, bhidden) {

  let newBlog = new Post(
    await generateId(),
    btitle,
    bdesc,
    bcontent,
    moment().format("MMMM Do YYYY, h:mm:ss a"),
    bhidden,
  );
  newBlog.save();
}
