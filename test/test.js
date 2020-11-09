let chai = require('chai');
let chaiHttp = require('chai-http');
var should = chai.should();
chai.use(chaiHttp);
let server = require('../server2');
const {expect} = chai;
describe('Test Image Uploader and Searcher', () => {

//Testing for simple upload
  describe('/POST Upload Image to S3', () => {
    it('it should GET a message', (done) => {
    chai.request(server)
        .post('/ping')
        .end((err, res) => {
            console.log("Res1: ",res.body);
              expect(res.body.responsecode).to.deep.equals(200);
              (res.body).should.be.a('object');
              done();
           });
        });
    });

//Testing for simple description upload
    describe('/POST Upload Image desc to RDS', () => {
      it('it should GET a message', (done) => {
        let data={
          "desc":"My fourteenth picture",
          "type":"image/jpeg",
          "size":10400,
          "name":"My fourteenth picture"
        }
      chai.request(server)
          .post('/desc')
          .send(data)
          .end((err, res) => {
            console.log("Res2: ",res.body);
            expect(res.body.responsecode).to.equals(200);
                (res.body).should.be.a('object');
                done();
             });
          });
      }); 
      
//Testing for uploading similar details(Duplicate primary key error should come)
describe('/POST Upload Image desc to RDS', () => {
  it('it should GET a message', (done) => {
    let data={
      "desc":"My tenth picture",
      "type":"image/jpeg",
      "size":10400,
      "name":"My tenth picture"
    }
  chai.request(server)
      .post('/desc')
      .send(data)
      .end((err, res) => {
        console.log("Res3: ",res.body);
        expect(res.body.responsecode).to.equals(500);
            (res.body).should.be.a('object');
            done();
         });
      });
  }); 

//Testing for getting images from elasticsearch  
  describe('/GET Images', () => {
    it('it should GET a message', (done) => {
    chai.request(server)
        .get('/getImages')
        .end((err, res) => {
          console.log("Res4: ",res.body);
          expect(res.body[0].type).to.equals('jpeg');
              (res.body).should.be.a('array');
              done();
           });
        });
    });
 
//Testing for searching for images with a particular filter    
    describe('/POST Search Images', () => {
      it('it should GET a message', (done) => {
        let data={
          "filter":"Description",
          "text":"My first picture"
        };
      chai.request(server)
          .post('/searchImages')
          .send(data)
          .end((err, res) => {
            console.log("Res5: ",res.body);
            expect(res.body[0].desc).to.equals('My first Picture');
                (res.body).should.be.a('array');
                done();
             });
          });
      });

//Testing for Search Images function when the record is not in elasticsearch database      
      describe('/POST Search Images', () => {
        it('it should GET a message', (done) => {
          let data={
            "filter":"Description",
            "text":"My fifteenth picture"
          };
        chai.request(server)
            .post('/searchImages')
            .send(data)
            .end((err, res) => {
              console.log("Res6: ",res.body);
              expect(res.body[0].responsecode).to.equals(204);
                  (res.body).should.be.a('array');
                  done();
               });
            });
        });



});
