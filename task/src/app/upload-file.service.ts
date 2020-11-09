import { Injectable } from "@angular/core";
import * as AWS from "aws-sdk/global";
import * as S3 from "aws-sdk/clients/s3";
import config from '../../../config.json';
import {HttpClient, HttpHeaders} from '@angular/common/http'

@Injectable()
export class UploadFileService {
  FOLDER = "bucket-folder/";

  constructor(
    private http: HttpClient
  ) {}
    statusCode='';
    fd = new FormData();
    data={
      'desc':'',
      'size':'',
      'type':'',
      'name':''
    };

  uploadfile(file) {
    const headers = new HttpHeaders()
    .set('Authorization', 'my-auth-token');
    this.fd.append('file',file,file.name);
    this.http.post('http://127.0.0.1:8080/ping', this.fd, {
      headers: headers
    })
    .subscribe(data => {
      console.log(data);
    });
  }
  uploadDesc(desc,size,type,name){
    const headers = new HttpHeaders()
    .set('Authorization', 'my-auth-token');
    this.data={
      'desc':desc,
      'size':size,
      'type':type,
      'name':name
    };
    this.http.post('http://127.0.0.1:8080/desc',this.data,{
      headers: headers
    })
    .subscribe(data =>{
      console.log(data);
    });
  }
}
