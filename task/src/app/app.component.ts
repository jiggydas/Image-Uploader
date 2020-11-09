import { Component } from '@angular/core';
import { UploadFileService } from './upload-file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'Image Uploader from Angular to AWS S3';
  selectedFiles: FileList;
  desc = "";
  showDescError = false;
  showImgError = false;
  successMessage=false;
  failureMessage=false;

  constructor(private uploadService: UploadFileService) {}

  ngOnInit() {
    if ((this.desc = '')) {
      this.showDescError = true;
    }
  }

  upload() {
    const file = this.selectedFiles.item(0);
    if (file.size < 500000 && this.desc!='') {
      this.uploadService.uploadfile(file).subscribe(response1=>{
        console.log(response1);
        this.showImgError=false;
        this.showDescError=false;
        this.failureMessage=false;
      });
      this.uploadService.uploadDesc(this.desc,file.size,file.type,file.name).subscribe(response2=>{
        console.log(response2);
        this.showImgError=false;
        this.showDescError=false;
        this.failureMessage=false;
        this.successMessage=true;
      });

    } else {
      if(file.size>500000)
      this.showImgError = true;
      if(this.desc==='')
      this.showDescError=true;
      this.failureMessage=true;
    }
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
  }
  changeDesc(desc: string) {
    this.desc = desc;
  }
}
