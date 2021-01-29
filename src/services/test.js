

var sha1 = require('sha1');

let url = 'https://conference.walkerit.dev/bigbluebutton/api/join?meetingID=ama-v5k-hzm-sfp&fullName=aman&redirect=false&password=CJsmDa@0518';
let secret = '7GUvVoPfkA4FZ9ydCmv1O1gLffV4qbj7z6NfCKY';
let app = '/bigbluebutton/api/';


console.log("replace====",url.split(app))
let encryptData =  url.split(app)[1].replace("?","")+secret;
let checkum =  sha1(encryptData);
checkum = checkum.toLowerCase();


let newUrl;
if(url.indexOf("?")>0)
   newUrl= url + `&checksum=${checkum}`;
else
    newUrl= url + `?checksum=${checkum}`;

console.log("Checksum", checkum, '=====================',newUrl);

