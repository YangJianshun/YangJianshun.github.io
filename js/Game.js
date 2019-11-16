(function(){

    var map = document.getElementById("map");   
    window.snakeBodyArea = []; // 用来存放蛇身体的区域的坐标
    window.foodArea = {}; //用来存放食物所在区域的坐标以及对应的div元素(用于删除元素)
    function Game(map){
        this.map = map;
        this.food = new Food(map);
        this.snake = new Snake(map);
        this.keyLock = false;
        this.manualPlayTimeId = null;
        this.controlHiddenTimeId = null;
        this.intervalTime = 150;
        this.foodNum = 3;
    }
    Game.prototype.ready = function(){
        this.snake.init();
        this.food.init(this.foodNum);
        this.directionQueue = [];//为了避免某些同学手速过快，解决在蛇的一个move周期内内触发两个键导致假死的bug，决定采用将direction的改变操作改为队列的形式
        this.bindKey();
    };
    Game.prototype.manualPlay = function(){
        this.manualPlayTimeId = setInterval(function(){
            // console.log(this.directionQueue);
            if(this.directionQueue.length > 0){
                this.snake.direction = this.directionQueue.shift();
            }
            var moveState = this.snake.move();
            switch(moveState){
                case -1:
                    //挂掉了
                    clearInterval(this.manualPlayTimeId);
                    this.manualPlayTimeId=null;
                    clearTimeout(this.controlHiddenTimeId);
                    this.controlHiddenTimeId =  setTimeout(function(){
                        animate(this.controlDiv,{"opacity":1});
                    }.bind(this),1000);
                    this.btnPause.style.display="none";
                    this.isDead=true;
                    this.gameOverDiv.style.display="block";
                    break;
                case 1:
                    if(Object.keys(foodArea).length<this.foodNum) this.food.generate();
                    break;
                case 0:
                    break;
            }
        }.bind(this),this.intervalTime);
    };
    Game.prototype.newGame = function(){
        this.keyLock = false;
        clearInterval(this.manualPlayTimeId);
        for(var key in foodArea){
            map.removeChild(foodArea[key]);
        }
        window.foodArea = {};
        window.snakeBodyArea.length=0;
        this.directionQueue.length=0;
        this.snake = new Snake(map);
        this.snake.init();
        this.food.init(this.foodNum);
        this.manualPlay();
    };
    
    Game.prototype.pasue = function(){
        // console.log("调用暂停函数",this.manualPlayTimeId);
        if(this.manualPlayTimeId){
            clearInterval(this.manualPlayTimeId);
            this.manualPlayTimeId=null;
            this.keyLock = true;
            this.btnPause.innerHTML = '<span>继续</span><i class="iconfont icon-jixu"></i>';

            clearTimeout(this.controlHiddenTimeId);
            // console.log(this.controlHiddenTimeId);
            animate(this.controlDiv,{"opacity":1});

        }else{
            this.keyLock = false;
            this.manualPlay();
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
                    if( (! this.keyLock) && preDirection != "down" && preDirection != "up"  ){
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
                    if( (! this.keyLock) && preDirection != "up" && preDirection != "down" ){
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
                    if( (! this.keyLock) && preDirection != "right" && preDirection != "left" ){
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
                    if( (! this.keyLock) && preDirection != "left" && preDirection != "right" ){
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

                        this.btnStart.onmouseup();

                        this.btnPause.onmouseup();

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
                this.manualPlay();
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
        this.btnSetting.onclick = function(){
            this.settingDiv.style.display="block";
        }.bind(this);

        this.settingCloseBtn.onclick = function(){        
            this.settingDiv.style.display="none";
        }.bind(this);
        this.btnStart.onmousedown = function(){
            this.btnStart.className = "start mousedown";
        }.bind(this);
        this.btnStart.onmouseup = function(){
            this.btnStart.className = "start";
        }.bind(this);
        this.btnPause.onmousedown = function(){
            this.btnPause.className = "pause mousedown";
        }.bind(this);
        this.btnPause.onmouseup = function(){
            this.btnPause.className = "pause";
        }.bind(this);
        this.btnSetting.onmousedown = function(){
            this.btnSetting.className = "setting mousedown";
        }.bind(this);
        this.btnSetting.onmouseup = function(){
            this.btnSetting.className = "setting";
        }.bind(this);
        this.controlDiv.onmouseover = function(){
            clearTimeout(this.controlHiddenTimeId);
            animate(this.controlDiv,{"opacity":1});
        }.bind(this);
        this.controlDiv.onmouseout = function(){
            if(this.manualPlayTimeId != null){
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

        }

    var game = new Game(map);
    game.init();

    
}());