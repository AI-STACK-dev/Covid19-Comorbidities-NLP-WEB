var express = require('express')
var router = express.Router()
var path = require('path');
var fs = require("fs");
var sanitizeHtml= require('sanitize-html');
var template =require('../lib/template.js');
// parse application/json
// app.use(bodyParser.json())

router.get('/create',(req, res) => {
    var title = "WEB - create";
    var list = template.list(req.list);
    var html = template.HTML(
      title,
      list,
      `<form action="/topic/create"
    method="post">
      <p><input type="text" name="title" placeholder="title"></p>
      <p>
        <textarea name="description" placeholder="description"></textarea>
      </p>
      <p>
        <input type="submit" />
      </p>
    </form>`,
      ""
    );
    res.send(html);
  })
  
  router.post('/create', (req, res) => {
    var post = req.body;
    var title = post.title;
    var description = post.description;
    fs.writeFile(`data/${title}`, description, "utf8", function (err) {
      res.redirect(`/topic/${title}`);
    });
  })
  
  router.get('/update/:pageId',(req, res, next) => {
      var filteredId = path.parse(req.params.pageId).base;
      fs.readFile(`data/${filteredId}`, "utf8", function (err, description) {
        if(err){
          next(err);
        } else{
          var title = req.params.pageId;
          var list = template.list(req.list);
          var html = template.HTML(
            title,
            list,
            `
              <form action="/topic/update" method="post">
              <input type="hidden" name="id" value="${title}">
          <p><input type="text" name="title" placeholder="title" value="${title}"></p>
          <p>
            <textarea name="description" placeholder="description">${description}</textarea>
          </p>
          <p>
            <input type="submit" />
          </p>
        </form>
              `,
            `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`
          );
          res.send(html);
        }
      });
  })
  
  router.post('/update',(req, res) => {
        var post = req.body;
        var id= post.id;
        var title = post.title;
        var description = post.description;
        fs.rename(`data/${id}`,`data/${title}`, function(error){
          fs.writeFile(`data/${title}`, description, "utf8", function (err) {
            res.redirect(`/topic/${title}`);
        });
      });
  })
  
  router.post('/delete',(req, res) => {
    var post = req.body;
    var id= post.id;
    var filteredId = path.parse(id).base;
    fs.unlink(`data/${filteredId}`, function(error){
      res.redirect('/');
    });
  })
  
  router.get('/:pageId', (req, res, next) => {
    console.log(req.list);
          var filteredId = path.parse(req.params.pageId).base;
          fs.readFile(`data/${filteredId}`,"utf8",
            function (err, description) {
              if(err){
                next(err);
              } else{
              var title = req.params.pageId;
              var sanitizedTitle = sanitizeHtml(title);
              var sanitizedDescription = sanitizeHtml(description,{
                allowedTags:['h1']
              });
              var list = template.list(req.list);
              var html = template.HTML(sanitizedTitle,list,
                `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
                `<a href="/topic/create">create</a> 
                 <a href="/topic/update/${sanitizedTitle}">update</a>
                 <form action="/topic/delete" method="post">
                 <input type="hidden" name="id" value="${sanitizedTitle}">
                 <input type="submit" value="delete">
                 </form>`
              );
              res.send(html);
            }
          });
  })

  module.exports=router;