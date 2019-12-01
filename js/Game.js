(function(){

    var map = document.getElementById("map");   
    window.snakeBodyArea = []; // 用来存放蛇身体的区域的坐标
    window.foodArea = []; //用来存放食物所在区域的坐标
    function Game(map){
        this.map = map;
        this.food = new Food(map);
        this.snake = new Snake(map);
        this.keyLock = false;
        this.playTimeId = null;
        this.controlHiddenTimeId = null;
        this.mode = "manual";
        this.mapHeight = this.map.offsetHeight/this.snake.height;
        this.mapWidth = this.map.offsetWidth/this.snake.width;
        this.autoBehavior = [];
        this.score = 0;
        this.rank = [];
    }
    Game.prototype.ready = function(){
        var snakeSettingItem=null;
        if(localStorage){   
            snakeSettingItem = localStorage.getItem("snakeSettingItem");
        }
        //MARK IE 兼容
        if(snakeSettingItem===null){
            this.intervalTime = 150;        
            this.foodNum = 3;
        }else{
            snakeSettingItem=JSON.parse(snakeSettingItem);
            this.intervalTime = snakeSettingItem.intervalTime;        
            this.foodNum = snakeSettingItem.foodNum;
            this.settingDiv.querySelector("input[name='speed'][value='slow']").checked=false;
            this.settingDiv.querySelector("input[name='speed'][value='medium']").checked=false;
            this.settingDiv.querySelector("input[name='speed'][value='fast']").checked=false;
            this.settingDiv.querySelector("input[name='speed'][value='veryFast']").checked=false;

            if(snakeSettingItem.intervalTime===220){
                this.settingDiv.querySelector("input[name='speed'][value='slow']").checked=true;
            }else if(snakeSettingItem.intervalTime===150){
                this.settingDiv.querySelector("input[name='speed'][value='medium']").checked=true;
            }else if(snakeSettingItem.intervalTime===80){
                this.settingDiv.querySelector("input[name='speed'][value='fast']").checked=true;
            }else if(snakeSettingItem.intervalTime===5){
                this.settingDiv.querySelector("input[name='speed'][value='veryFast']").checked=true;
            }
            this.foodNumInput.value = snakeSettingItem.foodNum;

        }

        this.snake.init();
        this.food.init(this.foodNum);
        this.directionQueue = [];//为了避免某些同学手速过快，解决在蛇的一个move周期内内触发两个键导致假死的bug，决定采用将direction的改变操作改为队列的形式
        this.bindKey();
    };
   
    Game.prototype.play = function(){
        var stepNum = 0;
        this.status="moving";
        this.scoreBoardPullUp.style.display="none";
        animate(this.scoreBoard,{"top":-40});
        this.btnSave.style.display="none";
        var offsetLst = [[0,-1],[0,1],[-1,0],[1,0]];
        this.playTimeId = setInterval(function(){
            var moveState;
            if(this.mode == "manual"){
                if(this.directionQueue.length > 0){
                    this.snake.direction = this.directionQueue.shift();
                }
                moveState = this.snake.move();
            }else if(this.mode == "auto"){
                    if(this.score>=795){this.btnPause.click();this.btnAuto.click();}//吃到这里，程序不知道怎么走，会陷入程序的死循环，因此，暂停并取消托管模式
                    var snakeHeadCoor = snakeBodyArea[0];
                    var snakeTailCoor = snakeBodyArea[snakeBodyArea.length-1];
                    
                    var path = getPathByBFS(snakeHeadCoor,foodArea,this.mapWidth,this.mapHeight,obstacle=snakeBodyArea);
                   
                    
                    //或吃不到，或者吃完过后找不到尾巴,就先绕着走，但是绕到的那个点必须能找到尾巴
                    
                    var around=false;
                    if(path.length==0 || (! catchUpTail(path,snakeBodyArea,this.mapWidth,this.mapHeight)) ){around=true;}
                    else if(snakeBodyArea.length>550 && path.length>1){around=true;}
                    else if(snakeBodyArea.length>400 && path.length>7){around=true;}
                    else if(snakeBodyArea.length>300 && path.length>10){around=true;}
                    else if(snakeBodyArea.length>200 && path.length>15){around=true;}
                    else if(snakeBodyArea.length>50 && path.length>25){around=true;}
                    
                    
                    
                    
                    if(stepNum>800){//陷入死循环
                        stepNum=0;
                        // offsetLst = [[0,-1],[0,1],[-1,0],[1,0]];
                        offsetLst = [offsetLst[2],offsetLst[3],offsetLst[0],offsetLst[1]];
                    }

                    if(around){                        
                        var nextCoor;
                        
                        var distanceNextCoor=-1;
                        for(var i=0;i<offsetLst.length;i++){
                            offset = offsetLst[i];
                            var nextCoorTmp = [snakeHeadCoor[0]+offset[0], snakeHeadCoor[1]+offset[1]];
                            if(snakeBodyArea.containCoor(nextCoorTmp)){continue;}
                            // 到了这个格子后，还能找到自己的尾巴 也就是说，找不到自己尾巴的pass掉
                            if(!catchUpTail([snakeHeadCoor,nextCoorTmp],snakeBodyArea,this.mapWidth,this.mapHeight)){continue;}
                            //找离食物距离最远的格子
                            // var pathTmp = getPathByBFS(nextCoorTmp,foodArea,this.mapWidth,this.mapHeight,obstacle=[nextCoorTmp].concat(snakeBodyArea.slice(0,snakeBodyArea.length-1)));
                            //找距离蛇尾最远的格子
                            var pathTmp = getPathByBFS(nextCoorTmp,[snakeBodyArea[snakeBodyArea.length-1]],this.mapWidth,this.mapHeight,obstacle=[nextCoorTmp].concat(snakeBodyArea.slice(0,snakeBodyArea.length-1)));
                            // var pathTmp = getPathByBFS(nextCoorTmp,snakeBodyArea.slice(-3),this.mapWidth,this.mapHeight,obstacle=[nextCoorTmp].concat(snakeBodyArea.slice(0,snakeBodyArea.length-1)));
                           
                            
                            // console.log(pathTmp.length);
                            if(pathTmp.length>distanceNextCoor){
                                distanceNextCoor=pathTmp.length;
                                nextCoor = nextCoorTmp;
                            }
                        }
                        if(nextCoor == undefined){
                            //进到这里肯定gg，至于为什么，有待探究
                            // this.btnPause.click();
                            path = getPathByBFS(snakeHeadCoor,[snakeTailCoor],this.mapWidth,this.mapHeight,obstacle=snakeBodyArea.slice(0,snakeBodyArea.length-1));

                        }else{
                            path = [snakeHeadCoor,nextCoor]; 
                        }
                           
                    }
                    //============================================================================

                   
                    
                    this.autoBehavior = path2behavior(path);
                    // console.log(this.autoBehavior);
                

                //然后按照最短路径走
                this.snake.direction = this.autoBehavior.shift();
                moveState = this.snake.move();
                
                
            }
            stepNum+=1;
            switch(moveState){
                case -1:
                    //挂掉了
                    clearInterval(this.playTimeId);
                    this.playTimeId=null;
                    clearTimeout(this.controlHiddenTimeId);
                    this.controlHiddenTimeId =  setTimeout(function(){
                        animate(this.controlDiv,{"opacity":1});
                    }.bind(this),1000);
                    this.btnPause.style.display="none";
                    this.isDead=true;
                    this.gameOverDiv.style.display="block";
                    this.btnSave.style.display="block";
                    this.status="stopping";
                    break;
                case 1:
                    stepNum=0;
                    if(foodArea.length<this.foodNum) this.food.generate();
                    this.score++;
                    this.loadScore();
                    break;
                case 0:
                    break;
            }
        }.bind(this),this.intervalTime);//MARK1
        // }.bind(this),2);
    };
    Game.prototype.newGame = function(){
        this.keyLock = false;
        clearInterval(this.playTimeId);
        this.playTimeId=null;
        this.autoBehavior.length=0;
        
        var foodDivLst = map.getElementsByClassName("food");
        while(foodDivLst.length > 0){
            map.removeChild(foodDivLst[0]);
        }
        
        window.foodArea = [];
        window.snakeBodyArea.length=0;
        this.directionQueue.length=0;
        this.snake = new Snake(map);
        this.snake.init();
        this.food.init(this.foodNum);
        this.play();
    };
    
    Game.prototype.pasue = function(){
        // console.log("调用暂停函数",this.playTimeId);
        if(this.playTimeId){
            clearInterval(this.playTimeId);
            this.playTimeId=null;
            this.keyLock = true;
            this.btnPause.innerHTML = '<span>继续</span><i class="iconfont icon-jixu"></i>';
            this.status = "stopping";
            clearTimeout(this.controlHiddenTimeId);
            animate(this.controlDiv,{"opacity":1});

        }else{
            this.keyLock = false;
            this.play();
            this.btnPause.innerHTML = '<span>暂停</span><i class="iconfont icon-zanting"></i>';
            clearTimeout(this.controlHiddenTimeId);
            this.controlHiddenTimeId = setTimeout(function(){
                animate(this.controlDiv,{"opacity":0});
            }.bind(this),1000);
            this.status = "moving";
        }
        
    };
    Game.prototype.loadScore = function(){
        var spanDivLst = this.scoreBoard.getElementsByTagName("span");
        var nums = this.score.toString().padStart(6,"0").split("");
        nums = nums.splice(-6);
        for(var i=0;i<=5;i++){
            spanDivLst[i].innerHTML=nums[i];
        }
        
    };
    Game.prototype.loadRank = function(){
        //MARK 加载英雄榜
        if(localStorage){
            this.rank=localStorage.getItem("rank");
            if(this.rank==null){
                this.rank=[];
            }else{
                this.rank = JSON.parse(this.rank);
            }
        }
        //排序后加载到ul中
        function sortRank(a,b){
        return b.score - a.score;
        }
        this.rank.sort(sortRank);
        var showRank = this.rank;
        if(showRank.length>10){
            showRank.splice(10);
        }
        this.rankBoard.style.height = 90+26*showRank.length+5+"px";
        this.rankBoardRight.style.height = 90+26*showRank.length+5+"px";
        var ulObj = this.rankBoard.getElementsByTagName("ul")[0];
        ulObj.innerHTML="";
        for(var i=0;i<showRank.length;i++){
            ulObj.innerHTML += "<li><span>"+(i+1)+"</span><span>"+showRank[i].score+"</span><span>"+showRank[i].playerName+"</span></li>";
        }
    };
    Game.prototype.bindKey = function(){

        keyListener = function(e){
            var preDirection = this.snake.direction;
            if(this.directionQueue.length>0){
                preDirection=this.directionQueue[this.directionQueue.length-1];
            }
            switch(e.keyCode){
                case 38:
                case 87:
                    // console.log("上")
                    if( (! this.keyLock) && (this.mode=="manual") && preDirection != "down" && preDirection != "up"  ){
                        if(this.directionQueue.length<=2){
                            this.directionQueue.push("up");
                        }else{
                            this.directionQueue.length=0;
                            this.snake.direction = "up";
                        }
                    }
                    break;
                case 40:
                case 83:
                    if( (! this.keyLock) && (this.mode=="manual") && preDirection != "up" && preDirection != "down" ){
                        if(this.directionQueue.length<=2){
                            this.directionQueue.push("down");
                        }else{
                            this.directionQueue.length=0;
                            this.snake.direction = "down";
                        }
                    }
                    break;
                case 37:
                case 65:
                    // console.log("左")
                    if( (! this.keyLock) && (this.mode=="manual") && preDirection != "right" && preDirection != "left" ){
                        if(this.directionQueue.length<=2){
                            this.directionQueue.push("left");
                        }else{
                            this.directionQueue.length=0;
                            this.snake.direction = "left";
                        }
                    }
                    break;
                case 39:
                case 68:
                    if( (! this.keyLock) && (this.mode=="manual") && preDirection != "left" && preDirection != "right" ){
                        if(this.directionQueue.length<=2){
                            this.directionQueue.push("right");
                        }else{
                            this.directionQueue.length=0;
                            this.snake.direction = "right";
                        }
                    }
                    break;
                case 32:
                    if(this.isFirstGame || this.isDead){
                        this.btnStart.click();
                        this.btnStart.onmousedown();
                    }else{
                        this.btnPause.click();
                        this.btnPause.onmousedown();
                    }
                    break;

            }
        }.bind(this);
        keyUpListener = function(e){
            switch(e.keyCode){
                case 32:

                        document.onmouseup();


                    break;

            }
        }.bind(this);
        if(document.addEventListener){
            document.addEventListener("keydown",keyListener,false);
            document.addEventListener("keyup",keyUpListener,false);
        }else{
            document.attachEvent("onkeydown",keyListener)
            document.attachEvent("onkeyup",keyUpListener)            
        }
    };
    Game.prototype.init = function(){
        this.controlDiv = document.getElementById("control");
        this.btnStart = this.controlDiv.getElementsByClassName("start")[0];
        this.btnPause = this.controlDiv.getElementsByClassName("pause")[0];
        this.btnAuto = this.controlDiv.getElementsByClassName("auto")[0];
        this.btnSave= this.controlDiv.getElementsByClassName("save")[0];
        this.btnSetting = this.controlDiv.getElementsByClassName("setting")[0];
        this.gameOverDiv = document.getElementById("gameOverDiv");
        this.saveDiv = document.getElementById("saveDiv");
        this.saveCloseBtn = this.saveDiv.getElementsByClassName("close")[0];
        this.cancelBtn = this.saveDiv.getElementsByClassName("cancel")[0];
        this.saveBtn = this.saveDiv.getElementsByClassName("saveData")[0];
        this.settingDiv = document.getElementById("settingDiv");
        this.settingCloseBtn =  this.settingDiv.getElementsByClassName("close")[0];
        this.defaultBtn = this.settingDiv.getElementsByClassName("default")[0];
        this.confirmBtn = this.settingDiv.getElementsByClassName("confirm")[0];
        this.foodNumInput = this.settingDiv.getElementsByClassName("foodNum")[0];
        this.mediumInput = this.settingDiv.querySelector("input[value='medium']");
        this.hostingModeDiv = document.getElementById("hostingModeDiv");
        this.scoreBoard = document.getElementById("scoreBoard");
        this.scoreBoardDropDown = this.scoreBoard.getElementsByTagName("div")[0];
        this.scoreBoardPullUp = this.scoreBoard.getElementsByTagName("div")[1];
        this.rankBoard = document.getElementById("rankBoard");
        this.rankBoardLeft = this.rankBoard.getElementsByTagName("div")[0];
        this.rankBoardRight = this.rankBoard.getElementsByTagName("div")[1];

        this.status="stopping";
        this.isFirstGame = true;
        this.isDead = false;
        
        this.ready();
        this.loadRank();
        this.btnStart.onclick = function(){
            this.score=0;
            this.loadScore();
            if(this.isFirstGame){
                this.play();
                this.isFirstGame=false;
            }else{
                this.btnPause.innerHTML = '<span>暂停</span><i class="iconfont icon-zanting"></i>';
                this.newGame();
            }
            //点了开局，过段时间就把controlDiv给隐藏起来
            clearTimeout(this.controlHiddenTimeId);
                this.controlHiddenTimeId =  setTimeout(function(){
                    animate(this.controlDiv,{"opacity":0});
                }.bind(this),1000);
            this.isDead=false;
            this.gameOverDiv.style.display="none";
            this.btnPause.style.display = "block";
        }.bind(this);
        this.btnPause.onclick = function(){
            this.pasue();
        }.bind(this);

        this.btnAuto.onclick = function(){
            if(this.btnAuto.innerHTML.indexOf("<span>托管</span>")!=-1){
                this.btnAuto.innerHTML = '<span class="fourWords">取消托管&nbsp;&nbsp;</span><i class="iconfont icon-quxiao"></i>';
                this.mode = "auto";

                this.intervalTime = this.intervalTime;
                if(this.playTimeId){
                    clearInterval(this.playTimeId);
                    this.playTimeId=null;
                    this.play();
                }
                this.hostingModeDiv.style.display="block";
            }else{
                this.btnAuto.innerHTML = '<span>托管</span><i class="iconfont icon-zidong"></i>';
                this.mode = "manual";
                this.autoBehavior.length=0;
                if(this.playTimeId){
                    clearInterval(this.playTimeId);
                    this.playTimeId=null;
                    this.play();
                }
                this.hostingModeDiv.style.display="none";
            }
            
        }.bind(this);

        this.btnSave.onclick = function(){
            this.saveDiv.style.display = "block";
            this.btnSave.style.display="none";
            var span = this.saveDiv.getElementsByClassName("score")[0];
            var spanHtml = this.score.toString().padStart(6," ");
            spanHtml = spanHtml.replace(/ /g,"&nbsp;")
            span.innerHTML = spanHtml;
        }.bind(this);
        this.saveCloseBtn.onclick = function(){
            this.saveDiv.style.display = "none";
        }.bind(this);
        this.cancelBtn.onclick = function(){
            this.saveDiv.style.display = "none";
        }.bind(this);
        this.saveBtn.onclick = function(){
            this.saveDiv.style.display = "none";
            var playerName = this.saveDiv.getElementsByTagName("input")[0].value;
            if(playerName===""){playerName="游客";}
            var rankTmp = null;
            if(localStorage){
                rankTmp = localStorage.getItem("rank");
            }
            if(rankTmp===null){
                rankTmp = [];
            }else{
                rankTmp = JSON.parse(rankTmp);
            }
            rankTmp.push({playerName: playerName, score: this.score});
            if(localStorage){
                localStorage.setItem("rank",JSON.stringify(rankTmp));
            }else{
                this.rank.push({playerName: playerName, score: this.score});
            }
            this.loadRank();
            this.rankBoardRight.onclick();
        }.bind(this);
        this.btnSetting.onclick = function(){
            this.settingDiv.style.display="block";
            clearInterval(this.playTimeId);
        }.bind(this);

        this.settingCloseBtn.onclick = function(){        
            this.settingDiv.style.display="none";
            if(this.status==="moving"){
                clearInterval(this.playTimeId);
                this.play();
            }
        }.bind(this);
        this.btnStart.onmousedown = function(){
            this.btnStart.className = "start mousedown";
        }.bind(this);
        
        this.btnPause.onmousedown = function(){
            this.btnPause.className = "pause mousedown";
        }.bind(this);
        
        this.btnAuto.onmousedown = function(){
            this.btnAuto.className = "auto mousedown";
        }.bind(this);
        this.btnSave.onmousedown = function(){
            this.btnSave.className = "save mousedown";
        }.bind(this);
        this.btnSetting.onmousedown = function(){
            this.btnSetting.className = "setting mousedown";
        }.bind(this);
        
        document.onmouseup = function(){
            this.btnStart.className = "start";
            this.btnPause.className = "pause";
            this.btnSave.className = "save";
            this.btnSetting.className = "setting";
            this.btnAuto.className = "auto";
        }.bind(this);
        this.controlDiv.onmouseover = function(){
            clearTimeout(this.controlHiddenTimeId);
            animate(this.controlDiv,{"opacity":1});
        }.bind(this);
        this.controlDiv.onmouseout = function(){
            if(this.playTimeId != null){
                clearTimeout(this.controlHiddenTimeId);
                animate(this.controlDiv,{"opacity":0});
            }
        }.bind(this);
        this.defaultBtn.onclick = function(){
            this.foodNumInput.value = "3";
            this.mediumInput.checked="checked";
        }.bind(this);
        this.foodNumInput.onchange = function(){
            if(parseInt(this.foodNumInput.value)>500){
                this.foodNumInput.value=500;
            }
            if(parseInt(this.foodNumInput.value)<=0){
                this.foodNumInput.value=1;
            }
        }.bind(this);
        this.confirmBtn.onclick = function(){
            var speed = this.settingDiv.querySelector("input[name='speed']:checked").value;
            switch(speed){
                case "veryFast":
                    this.intervalTime = 5;
                    break;
                case "fast":
                    this.intervalTime = 80;
                    break;
                case "medium":
                    this.intervalTime = 150;
                    break;
                case "slow":
                    this.intervalTime = 220;
                    break;

            }
            var tmpFoodNum = this.foodNumInput.value - this.foodNum;
            if(tmpFoodNum>0){
                for(var i=0;i<tmpFoodNum;i++){
                this.food.generate();
                }
            }
            this.foodNum = parseInt(this.foodNumInput.value);
            var snakeSettingItem = {foodNum:this.foodNum, intervalTime:this.intervalTime};
            if(localStorage){
                localStorage.setItem("snakeSettingItem",JSON.stringify(snakeSettingItem));
            }
            this.settingDiv.style.display="none";
            if(this.status==="moving"){
                clearInterval(this.playTimeId);
                this.play();
            }
        }.bind(this);
        this.hostingModeDiv.onmouseenter = function(){
            this.hostingModeDiv.innerHTML="<i class='iconfont icon-quxiao'></i>&nbsp;关闭托管模式";
            this.hostingModeDiv.className="mouseover";
        }.bind(this);
        this.hostingModeDiv.onmouseleave = function(){
            this.hostingModeDiv.innerHTML="<span class='still'>A</span><i class='iconfont icon-zidong spin'></i>&nbsp;托管模式开启";
            this.hostingModeDiv.className="normal";
        }.bind(this);
        this.hostingModeDiv.onclick = function(){
            this.btnAuto.onclick();
        }.bind(this);
        this.scoreBoard.onmouseenter = function(){
            this.scoreBoardDropDown.style.display="block";
        }.bind(this);
        this.scoreBoard.onmouseleave = function(){
            this.scoreBoardDropDown.style.display="none";
        }.bind(this);
        this.scoreBoardDropDown.onclick = function(){
            animate(this.scoreBoard,{"top":0},function(){
                this.scoreBoardPullUp.style.display="block";
            }.bind(this));
        }.bind(this);
        this.scoreBoardPullUp.onclick = function(){
            this.scoreBoardPullUp.style.display="none";
            animate(this.scoreBoard,{"top":-40});
        }.bind(this);
        this.rankBoard.onmouseenter = function(){
            this.rankBoardLeft.style.display="block";
        }.bind(this);
        this.rankBoard.onmouseleave = function(){
            this.rankBoardLeft.style.display="none";
        }.bind(this);
        this.rankBoardLeft.onclick = function(){
            animate(this.rankBoard,{"margin-right":-400},function(){
                this.rankBoardRight.style.display = "block";
            }.bind(this));
        }.bind(this);
        this.rankBoardRight.onclick = function(){
            this.rankBoardRight.style.display="none";
            animate(this.rankBoard,{"margin-right":-600});
            this.loadRank();
        }.bind(this);
    };

    var game = new Game(map);
    game.init();

    // start=[0,3];
    // endLst=[[2,0],[2,1]];
    // var path = getPathByBFS(start,endLst,4,4,[[0,1],[1,2],[2,2]]);
    // var behavior = path2behavior(path);
    // console.log(behavior);
    // game.score = 128;
    // game.loadScore();
}());