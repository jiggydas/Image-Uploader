# Image Uploader
Hello!
This project was created by Jigyansoo Das
I have used Angular for front-end, Node.js for back-end and AWS S3 and RDS Aurora Database for storing the uploaded images and their descriptions.
To run the scripts, use the following commands:
  i) To start the Angular script:
    a) Go to the directory of the app: cd task
    b) Run the command: ng serve task --open
  ii) To run the Node.js script:
    a) Open another terminal
    b) Go to the directory of the server: cd server
    c) Run the command: node server.js
  iii) Use config.json to pass your credentials into the node.js script.
Now that your project is running, you can go ahead and upload some images.
To see the images, go to the AWS S3 console and look inside the specified folder
To see the descriptions in the RDS table, query the table and go to localhost:8080/users to see the entered details.

 
