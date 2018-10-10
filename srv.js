const http = require('http');
const fs = require('fs');
const path = require('path');
const server = http.createServer(handler);
const io = require('socket.io')(server);

// const myIp = "192.168.1.20";
const myIp = "192.168.43.51";
//const myIp = "localhost";
const myPort = 8000;

const GAME = []; 
const bullets = [];

let state = {
    killed: 0,
    lose: false,
    wave: 1
};

let interv;

const monstres = [];
const numMonstre = {
    a: 4000,
    b: 7000,
    loop: 0
};

let playing = false;

function entierAleatoire(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handler(request, response) {
    // console.log('request ', request.url);

    if (/id=/.test(request.url)) {
        let arr = request.url.split(",");
        let id = parseInt(arr[0].match(/(?<=id=).*/)[0]);
        let accelX = parseInt(arr[1].match(/(?<=accelX=).*/)[0]);
        let accelY = parseInt(arr[2].match(/(?<=accelY=).*/)[0]);
        let color = arr[3].match(/(?<=color=).*/)[0];

        let bullet = arr[4].match(/(?<=bullet=).*/)[0];

        let whoAmI = -42;
        for (let i = 0; i < GAME.length; i++) {
            if (GAME[i].id === id) {
                whoAmI = i;
            }
        }
        if (whoAmI === -42) {
            if (!playing) {
                playing = true;
            }
            GAME.push({
                id: id,
                posX: 475,
                posY: 225,
                color: color,
                activity: Date.now()
            });
        } else {
            // la personne  <whoAmI> est active
            GAME[whoAmI].activity = Date.now();

            if (GAME[whoAmI].posX > 0 && accelX < 0) {
                GAME[whoAmI].posX += accelX*2;
            } else if (GAME[whoAmI].posX < 950 && accelX > 0) {
                GAME[whoAmI].posX += accelX*2;
            }
            if (GAME[whoAmI].posY > 0 && accelY < 0) {
                GAME[whoAmI].posY += accelY*2;
            } else if (GAME[whoAmI].posY < 450 && accelY > 0) {
                GAME[whoAmI].posY += accelY*2;
            }
        }
        if (bullet.length !== 0) {
            let arrBullet = bullet.split("!");
            const nX = arrBullet[0];
            const nY = arrBullet[1];
            if (GAME[whoAmI].hasOwnProperty("posX") && GAME[whoAmI].hasOwnProperty("posY")) {
                bullets.push({
                    vx: nX,
                    vy: nY,
                    x: GAME[whoAmI].posX+25,
                    y: GAME[whoAmI].posY+25,
                    color: GAME[whoAmI].color
                });
            }
        }
        response.writeHead(200, {
            "Content-Type": "application/json"
        });

        let txtRes = state.killed+",";
        txtRes += state.wave+",";
        if (state.lose) {
            txtRes += "vibre,"; 
        }

        response.end(txtRes,  "utf-8");
    } else {
        fs.readFile('./index.html', function(error, content) {
            response.writeHead(200, {
                'Content-Type': "text/html"
            });
            response.end(content, 'utf-8');
        });
    }
}

server.listen(myPort, myIp);

function mkInter() {

    interv = setInterval(() => {
        let x1 = entierAleatoire(0, 1000);
        let y1 = 0;
        let x2 = entierAleatoire(0, 900);
        let y2 = 500;

        vec1 = {
            x: x2 - x1,
            y: y2 - y1
        };

        const coeff = (vec1.x * vec1.x) + (vec1.y * vec1.y);

        let vx = Math.sqrt((vec1.x * vec1.x)/coeff);
        let vy = Math.sqrt((vec1.y * vec1.y)/coeff);

        if (vec1.x < 0) {
            vx *= -1;
        }
        if (vec1.y < 0) {
            vy *= -1;
        }
        if (playing) {
            monstres.push({
                x: x1,
                y: 0,
                vx: vx*(4+state.wave),
                vy: vy*(4+state.wave),
                width: 100,
                height: 100,
                color: "purple"
            });
        }
        function upgrade() {
            state.wave++;
            clearInterval(interv);
            mkInter();
        }
        if (state.killed > 10 && state.wave === 1) {
            upgrade();
        } else if (state.killed > 20 && state.wave === 2) {
            upgrade();
        } else if (state.killed > 30 && state.wave === 3) {
            upgrade();
        } else if (state.killed > 40 && state.wave === 4) {
            upgrade();
        } else if (state.killed > 50 && state.wave === 5) {
            upgrade();
        } else if (state.killed > 60 && state.wave === 6) {
            upgrade();
        } else if (state.killed > 70 && state.wave === 7) {
            upgrade();
        } else if (state.killed > 80 && state.wave === 8) {
            upgrade();
        } else if (state.killed > 90 && state.wave === 9) {
            upgrade();
        } else if (state.killed > 100 && state.wave === 10) {
            upgrade();
        } else if (state.killed > 110 && state.wave === 11) {
            upgrade();
        } else if (state.killed > 120 && state.wave === 12) {
            upgrade();
        } else if (state.killed > 130 && state.wave === 13) {
            upgrade();
        } else if (state.killed > 140 && state.wave === 14) {
            upgrade();
        }

    }, 3200-(state.wave*200));

}

mkInter();

setInterval(()=>{
    for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].x < 0 || bullets[i].x > 1000 || bullets[i].y < 0 || bullets[i].y > 500) {
            bullets.splice(i, 1);
        }
    }
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].x += bullets[i].vx*10;
        bullets[i].y += bullets[i].vy*10;
    }
    for (let i = 0; i < monstres.length; i++) {
        if (monstres[i].y > 500 && state.lose == false) {
            state.lose = true;
            setTimeout(()=>{
                state.lose = false;
                playing = false;
                GAME.length = 0;
                monstres.length = 0;
                bullets.length = 0;
                state.wave = 1;
                state.killed = 0;
                clearInterval(interv);
                mkInter();
            }, 3000);
        }
    }
    for (let i = 0; i < monstres.length; i++) {
        monstres[i].x += monstres[i].vx;
        monstres[i].y += monstres[i].vy;
    }

    let delB = [];
    let delM = [];
    for (let i = 0; i < monstres.length; i++) {
        for (let j = 0; j < bullets.length; j++) {
            if (bullets[j].x > monstres[i].x && bullets[j].x < monstres[i].x+monstres[i].width) {
                if (bullets[j].y > monstres[i].y && bullets[j].y < monstres[i].y+monstres[i].height) {
                    delM.push(i);
                    delB.push(j);
                }
            }
        }
    }
    for (let i = 0; i < delM.length; i++) {
        monstres.splice(delM[i], 1);
        state.killed++;
    }
    for (let i = 0; i < delB.length; i++) {
        bullets.splice(delB[i], 1);
    }

    for (let i = 0; i < GAME.length; i++) {
        if ((Date.now() - GAME[i].activity) > 1000) {
            GAME.splice(i, 1);
        }
    }

}, 50);


io.on('connection', function(socket) {
    setInterval(()=>{
        // socket.emit("dev", numMonstre);
        socket.emit("GAME", GAME);
        socket.emit("bullets", bullets);
        socket.emit("monstres", monstres);
        socket.emit("state", state);
    },50);

    socket.on("dev", (e)=>{
        socket.broadcast.emit("dev", e);
    })
});

