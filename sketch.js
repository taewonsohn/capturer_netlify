const searchButton = document.getElementById('searchButton'); //동영상 검색하기
const puppeteerButton = document.getElementById('Puppeteer'); //구글 이미지 검색 버튼

const API_ip = '';

let userID = generateId(10);
let folderID = generateId(6);
let start = false;
let links = [];

searchButton.addEventListener('click', function(event){
    event.preventDefault();
    const link = document.getElementById('link');
    if (!link.value) {  
        alert('Please enter a YouTube URL.');
        return;
    }
    const fileInput = document.getElementById('folder');
    if(fileInput.value){
        folderID = fileInput.value;
    }
    const userIDInput = document.getElementById('userID');
    if(userIDInput.value){
        userID = userIDInput.value;
    }
    triggerDownload(link.value,userID);
});

puppeteerButton.addEventListener('click',function(event){
    for(i in links){
        console.log(i,": ",links[i]);
        window.open(links[i]);
    }
});

let mode = "mouse";
let video;
let Playing = 1;
let playSpeed = 1;
let boxX, boxY, videoWidth, videoHeight;
let Mclicked = false;

let cnv;
function setup() {
    createCanvasAsync(200, 200, function (createdCnv) {
      cnv = createdCnv;
      const cnvdiv = document.getElementById('canvasDiv');
      cnvdiv.appendChild(cnv.elt);
      // Now that the canvas is fully initialized, you can proceed with other operations
    });
    
  }
function createCanvasAsync(width, height, callback) {
    const createdCnv = createCanvas(width, height);
    // Ensure that the canvas is fully initialized before calling the callback
    requestAnimationFrame(() => callback(createdCnv));
  }
function draw(){
    background(250,250,250,100);

    if(start){
        video.position(cnv.position().x,cnv.position().y);

        image(video,0,0,videoWidth,videoHeight);

        if(mode=="capture"){
            if (mouseIsPressed) {
                if(mouseX<videoWidth&&mouseY<videoHeight){
                    if (!Mclicked) {
                        boxX = mouseX;
                        boxY = mouseY;
                    } else {
                        noFill();
                        stroke(0);
                        strokeWeight(2);
                        rect(boxX, boxY, mouseX - boxX, mouseY - boxY);
                        noStroke();
                    }
                }
                
                Mclicked = true;
            }
            else{
                if (Mclicked&&(mouseX!=boxX||mouseY!=boxY)&&mouseX<videoWidth&&mouseY<videoHeight&&boxY<videoHeight&&boxX<videoWidth) {
                    let graphics = createGraphics(mouseX - boxX, mouseY - boxY);
                    graphics.image(get(boxX, boxY, mouseX - boxX, mouseY - boxY), 0, 0);
                    const imageDataURL = graphics.canvas.toDataURL('image/png');
                    const data = {
                        image: imageDataURL
                    };
                    const fileID= floor(random(1000000));
                    const ip = "https://u0kjvink1k.execute-api.ap-northeast-2.amazonaws.com/default/sam-imageupload-ImageUploadFunction-8BpUza7Q3lZC";
                    fetch(ip+`?imagename=${fileID}&userID=${userID}&foldername=${folderID}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                          },
                        body: JSON.stringify(data),
                        mode: 'no-cors',
                    }).then((response) =>{
                        const Link = `https://lens.google.com/uploadbyurl?url=https%3A%2F%2Ftaewons3.s3.ap-northeast-2.amazonaws.com%2F${userID}%2F${folderID}%2F${fileID}.png`;
                        console.log(Link);
                        links.push(Link);
                    });   
                        
                    
                }
                Mclicked = false;
            }
        }
        let tPlay = "PLAYING";
        if (Playing == -1) tPlay = "PAUSED"
        fill(0);
        textSize(15);
        text("재생속도: " + playSpeed, width - 130, height - 25);
        text(toMin(video.time()) + '/' + toMin(video.duration()) + "    " + tPlay, 30, height - 25);
        showBar(height - 65);
        video.speed(playSpeed);
    }
}
function keyReleased() {
    if (start) {
        if (keyCode == 32) {
            Playing *= -1;

            if (Playing == 1) {
                video.play();
                console.log("play");
            }

            if (Playing == -1) {
                video.pause();
                console.log("pause");
            }
        }
        if (keyCode == UP_ARROW) {
            playSpeed += 0.1;
        }
        if (keyCode == DOWN_ARROW) {
            playSpeed -= 0.1;
        }
        playSpeed = abs(playSpeed);
        playSpeed = round(playSpeed, 2);

        if (keyCode == LEFT_ARROW) {
            video.time(video.time() - 5);
        }
        if (keyCode == RIGHT_ARROW) {
            video.time(video.time() + 5);
        }
        if (keyCode == 77) {
            if (mode == "mouse") mode = "capture";
            else mode = "mouse";

            console.log("mode: " + mode);
        }
    }

}
function showBar(y) {
    strokeWeight(4);
    stroke(120);
    line(0, y, width, y);
    let Length = video.duration().toFixed(2);
    let Current = video.time().toFixed(2);
    let CurrentX = map(Current, 0, Length, 0, width);
    stroke(255, 0, 0);
    line(0, y, CurrentX, y);
    noStroke();
    fill(255, 0, 0);
    ellipse(CurrentX, y, 8, 8);
    fill(0);


    if (mouseIsPressed && mouseY > video.size().height && mouseY > y - 10 && mouseY < y + 10) {
        CurrentX = mouseX;
        let time = map(CurrentX, 0, width, 0, Length);
        video.time(time);
    }

}

function toMin(sec) {
    let Min = floor(sec / 60);
    let Sec = floor(sec % 60);
    Min = Min.toString().padStart(2, '0');
    Sec = Sec.toString().padStart(2, '0');
    return Min + ':' + Sec;
}
function mouseReleased() {
    if (start && mode == "mouse") {
        var vx = 0;
        var vw = videoWidth;
        var vy = 0;
        var vh = videoHeight;

        if (mouseX > vx && mouseX < vx + vw && mouseY > vy && mouseY < vy + vh && start) {


            Playing *= -1;

            if (Playing == 1) {
                video.play();
                console.log("play");
            }

            if (Playing == -1) {
                video.pause();
                console.log("pause");
            }
        }
    }

}
function triggerDownload(url,name){
    const encoded = encodeURIComponent(url);
    fetch('https://mv7b03ynge.execute-api.ap-northeast-2.amazonaws.com/default/sam-ytdl-YTDLFunction-QLEz7J3HSLis'+`?videoUrl=${encoded}&name=${name}`)
        .then(response => {
            console.log(response);
            if(response.ok){
                const link = `https://taewons3.s3.ap-northeast-2.amazonaws.com/${name}.mp4`;
                startLoad(link);
            }
        })
        .catch(error => console.error("Error: ",error));
}

function startLoad(url){
    video = createVideo(url, videoLoaded);
}

function videoLoaded(){
    console.log('Video Loaded');
    video.position(cnv.position().x, cnv.position().y);
    video.loop();
    video.show();
    videoHeight = video.height;
    videoWidth = video.width;
    let ratio = videoWidth / videoHeight;
    if(ratio>1.2){
        videoWidth = 800;
        videoHeight = 800/ratio;
    }
    else{
        videoHeight = 650;
        videoWidth = 650*ratio;
    }
    resizeCanvas(videoWidth, videoHeight + 80);
    start = true;
    video.hide();
    video.onended(CONsole);
}
function CONsole(){
    console.log('xxx');
    console.log(video.time());
}

function generateId(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random()*characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
}