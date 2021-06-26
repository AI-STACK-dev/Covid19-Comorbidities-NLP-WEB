var express = require('express')
var router = express.Router()
var path = require('path')
var fs = require("fs")
var sanitizeHtml= require('sanitize-html')
let {PythonShell} = require('python-shell')



router.post('/submit', (req, res) => {
    var post = req.body;
    console.log(post);
    var options = {
      mode: 'text',
      pythonPath: '',
      pythonOptions: ['-u'],
      scriptPath: '',
      args: post.RiskFactor
    };
    
    PythonShell.run('exec.py', options, function (err, results) {
      if (err) throw err;
      console.log('results: %j', results);
      fs.writeFile(`data/Results`, results, "utf8", function (err) {
        console.log("redirect");
        res.redirect(`/topic/Results`);
      });
    });
  })
  
  
  router.get('/:pageId', (req, res, next) => {
          var filteredId = path.parse(req.params.pageId).base;
          fs.readFile(`data/${filteredId}`,"utf8",
            function (err, description) {
              if(err){
                next(err);
              } else{
              var title = req.params.pageId;
                res.render('template', {
                    title: title,
                    body: description
                })
            }
          });
  })

  module.exports=router;