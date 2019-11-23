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
        this.intervalTime = 150;
        this.autoTime = 5;
        this.foodNum = 3;
        this.mode = "manual";
        this.mapHeight = this.map.offsetHeight/this.snake.height;
        this.mapWidth = this.map.offsetWidth/this.snake.width;
        this.autoBehavior = [];
    }
    Game.prototype.ready = function(){
        this.snake.init();
        this.food.init(this.foodNum);
        this.directionQueue = [];//为了避免某些同学手速过快，解决在蛇的一个move周期内内触发两个键导致假死的bug，决定采用将direction的改变操作改为队列的形式
        this.bindKey();
    };
    Game.prototype.play = function(){
        
        this.playTimeId = setInterval(function(){
            var moveState;
            if(this.mode == "manual"){
                if(this.directionQueue.length > 0){
                    this.snake.direction = this.directionQueue.shift();
                }
                moveState = this.snake.move();
            }else if(this.mode == "auto"){
                    
                    var snakeHeadCoor = snakeBodyArea[0];
                    var snakeTailCoor = snakeBodyArea[snakeBodyArea.length-1];
                    
                    var path = getPathByBFS(snakeHeadCoor,foodArea,this.mapWidth,this.mapHeight,obstacle=snakeBodyArea);
                   
                    
                    //吃不到，或者吃完过后找不到尾巴,就先绕着走，但是绕到的那个点必须能找到尾巴
                    if( path.length==0 || (! catchUpTail(path,snakeBodyArea,this.mapWidth,this.mapHeight)) ){
                        
                        var nextCoor;
                        var offsetLst = [[0,-1],[0,1],[-1,0],[1,0]];
                        var distanceNextCoor=-1;
                        for(var i=0;i<offsetLst.length;i++){
                            offset = offsetLst[i];
                            var nextCoorTmp = [snakeHeadCoor[0]+offset[0], snakeHeadCoor[1]+offset[1]];
                            if(snakeBodyArea.containCoor(nextCoorTmp)){continue;}
                            // 到了这个格子后，还能找到自己的尾巴 也就是说，找不到自己尾巴的pass掉
                            if(!catchUpTail([snakeHeadCoor,nextCoorTmp],snakeBodyArea,this.mapWidth,this.mapHeight)){continue;}
                            //找离食物距离最远的格子
                            var pathTmp = getPathByBFS(nextCoorTmp,foodArea,this.mapWidth,this.mapHeight,obstacle=[nextCoorTmp].concat(snakeBodyArea.slice(0,snakeBodyArea.length-1)));
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
                    break;
                case 1:
                    if(foodArea.length<this.foodNum) this.food.generate();
                    break;
                case 0:
                    break;
            }
        }.bind(this),this.intervalTime);
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
        this.btnSetting = this.controlDiv.getElementsByClassName("setting")[0];
        this.gameOverDiv = document.getElementById("gameOverDiv");
        this.settingDiv = document.getElementById("settingDiv");
        this.settingCloseBtn =  this.settingDiv.getElementsByClassName("close")[0];
        this.defaultBtn = this.settingDiv.getElementsByClassName("default")[0];
        this.confirmBtn = this.settingDiv.getElementsByClassName("confirm")[0];
        this.foodNumInput = this.settingDiv.getElementsByClassName("foodNum")[0];
        this.mediumInput = this.settingDiv.querySelector("input[value='medium']");
    
        this.isFirstGame = true;
        this.isDead = false;
        
        this.ready();
        this.btnStart.onclick = function(){
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
            if(this.btnAuto.innerHTML.indexOf("托管")!=-1){
                this.btnAuto.innerHTML = '<span>手动</span><i class="iconfont icon-shoudong"></i>';
                this.mode = "auto";

                this.intervalTime = this.autoTime;
                if(this.playTimeId){
                    clearInterval(this.playTimeId);
                    this.playTimeId=null;
                    this.play();
                }
            }else{
                this.btnAuto.innerHTML = '<span>托管</span><i class="iconfont icon-zidong"></i>';
                this.mode = "manual";
                this.autoBehavior.length=0;
                this.confirmBtn.click();
                if(this.playTimeId){
                    clearInterval(this.playTimeId);
                    this.playTimeId=null;
                    this.play();
                }
            }
            
        }.bind(this);
        this.btnSetting.onclick = function(){
            this.settingDiv.style.display="block";
        }.bind(this);

        this.settingCloseBtn.onclick = function(){        
            this.settingDiv.style.display="none";
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

        this.btnSetting.onmousedown = function(){
            this.btnSetting.className = "setting mousedown";
        }.bind(this);
        
        document.onmouseup = function(){
            this.btnStart.className = "start";
            this.btnPause.className = "pause";
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
        this.confirmBtn.onclick = function(){
            var speed = this.settingDiv.querySelector("input[name='speed']:checked").value;
            switch(speed){
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
            this.settingDiv.style.display="none";
        }.bind(this);

    };

    var game = new Game(map);
    game.init();

    // start=[0,3];
    // endLst=[[2,0],[2,1]];
    // var path = getPathByBFS(start,endLst,4,4,[[0,1],[1,2],[2,2]]);
    // var behavior = path2behavior(path);
    // console.log(behavior);
    
}());