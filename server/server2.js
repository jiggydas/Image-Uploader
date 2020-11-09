var express = require('express'),
    aws = require('aws-sdk'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    multerS3 = require('multer-s3');
    fs = require('fs');
const mysql = require('mysql');
var elasticsearch = require('elasticsearch');

//Importing sensitive data from config.json
let rawdata = fs.readFileSync('../config.json');
let config = JSON.parse(rawdata);

//Creating a database and a table for our image description. Also, the migration from RDS to ElasticSearch is done here.
const con = mysql.createConnection({
    host: config.host,
    user: config.username,
    password: config.password
  });
  con.connect(function(err) {
    if (err) throw err;

    con.query('CREATE DATABASE IF NOT EXISTS Images;');
    con.query('USE Images;');
    //con.query('DROP TABLE UploadedImages', function(error,result,fields){
    con.query('CREATE TABLE IF NOT EXISTS UploadedImages(id varchar(255) NOT NULL, Description varchar(255), Size varchar(255), Type varchar(255), PRIMARY KEY(id));', function(error, result, fields) {
        console.log(result);
    });
    con.query(`SELECT * FROM Images.UploadedImages`, function(err, result, fields) {
        if (err) console.log(err);
        if (result) console.log(result);
        db = JSON.parse(JSON.stringify(result));
        const bulkIndex = function bulkIndex(index, type, data) {
            let bulkBody = [];
          
            data.forEach(item => {
              bulkBody.push({
                index: {
                  _index: index,
                  _type: type,
                  _id: item.id
                }
              });
          
              bulkBody.push(item);
            });
          
            client.bulk({body: bulkBody})
            .then(response => {
              console.log('here');
              let errorCount = 0;
              response.items.forEach(item => {
                if (item.index && item.index.error) {
                  console.log(++errorCount, item.index.error);
                }
              });
              console.log(
                `Successfully indexed ${data.length - errorCount}
                 out of ${data.length} items`
              );
            })
            .catch(console.err);
          };
          bulkIndex('library', 'image', db);
    });
    con.end();
});
var client = new elasticsearch.Client({
    hosts: [ 'http://localhost:9200']
    });
    
    client.ping({
    requestTimeout: 30000,
    }, function(error) {
    if (error) {
    console.error('Cannot connect to Elasticsearch.');
    } else {
    console.log('Connection to Elasticsearch was successful!');
    }
    });





//Feeding in the secret credentials
aws.config.update({
    secretAccessKey: config.secretAccessKey,
    accessKeyId: config.accessKeyId,
    region: 'ap-south-1'
});

var app = express(),
    s3 = new aws.S3();

app.all("/*", function(req, res, next){
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        next();
      });

app.use(bodyParser.json());

var upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'imgbucketjd',
        key: function (req, file, cb) {
            console.log(file);
            cb(null, "bucket-folder/"+file.originalname); 
        }
    })
});

//Uploading the incoming image to AWS S3
app.post('/ping', upload.array('file',1), function (req, res, next) {
    
    var resmsg = {"msg":'Uploaded!'};
    res.send(resmsg);
});

//Uploading the description, file size and type to AWS RDS Aurora database
app.post('/desc',function(req,res,next){
    var desc = req.body.desc;
    var size = req.body.size;
    var fulltype = req.body.type;
    var typearr = fulltype.split('/');
    var type = typearr[1];
    var name1 = req.body.name.split('.');
    var name2 = name1[0];
    var name = name2+req.body.desc;
    const con = mysql.createConnection({
      host: config.host,
      user: config.username,
      password: config.password
    });
    con.connect(function(err) {
      var sql = 'INSERT INTO Images.UploadedImages (Description, Size, Type, id) VALUES ?'
      var values = [[desc,size,type,name]];
      con.query(sql,[values], function(err, result, fields) {
          if (err) res.send(err);
          if (result) res.send({description: desc, size: size, type: type});
          if (fields) console.log(fields);
      });
  });
  
    console.log(desc+" "+size+" "+type);
});

//Get all images from ElasticSearch
app.get('/getImages', (req, res) => {
    var rows=[];
  const search = function search(index, body) {
    return client.search({index: index, body: body});
  };
  
  const test = function test() {
    let body = {
      size: 20,
      from: 0,
      query: {
        match_all: {}
      }
    };

    search('library', body)
    .then(results => {
      var x = results.hits.hits;
      for(var i =0;i<x.length;i++)
      {
          var rec={
              'id':x[i]._source.id,
              'desc':x[i]._source.Description,
              'size':x[i]._source.Size,
              'type':x[i]._source.Type
          }
          console.log(rec);
          rows.push(rec);
      }
      console.log(rows);
      res.send(rows);
    })
    .catch(console.error);
  };
  test();
  });

// Search for images using filters from ElasticSearch
app.post('/searchImages',(req,res)=>{
    
      var filter = req.body.filter;
      var searchtext = req.body.text;
      var rows=[];
      var bodyval;
      if(filter=='Description'){ 
          bodyval={
            size: 20,
            from: 0,
            query: {
              match: {
                Description: {
                  query: searchtext,
                  minimum_should_match:3
                }
              }
            }
          };      
      }
      else if(filter=='File Size'){ 
        bodyval={
          size: 20,
          from: 0,
          query: {
            match: {
              Size: {
                query: searchtext,
                minimum_should_match:3
              }
            }
          }
        };     
      }
      else if(filter=='File Type'){
          bodyval={
            size: 20,
            from: 0,
            query: {
              match: {
                Type: {
                  query: searchtext,
                  minimum_should_match:3
                }
              }
            }
          }           
        
      }
      const search = function search(index, body) {
        return client.search({index: index, body: body});
      };
      
      const test = function test(bodyval) {
        let body = bodyval;
    
        search('library', body)
        .then(results => {
          var x = results.hits.hits;
          if(x.length==0)
          {
            var rec={
              'responsecode':204
            }
            rows.push(rec);
          }
          else{

          
          for(var i =0;i<x.length;i++)
          {
              var rec={
                  'id':x[i]._source.id,
                  'desc':x[i]._source.Description,
                  'size':x[i]._source.Size,
                  'type':x[i]._source.Type,
                  'responsecode':200
              }
              console.log(rec);
              rows.push(rec);
          }
        }
          console.log(rows);
          res.send(rows);
        })
        .catch(res.send({"responsecode":500}));
      };
      test(bodyval);

});

app.listen(8080, function () {
    console.log('Image Uploader app listening on port 8080!');
});