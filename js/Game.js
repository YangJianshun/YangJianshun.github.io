(function(){

    var map = document.getElementById("map");   
    window.snakeBodyArea = []; // 用来存放蛇身体的区域的坐标
    window.foodArea = {}; //用来存放食物所在区域的坐标以及对应的div元素(用于删除元素)
    var that = null; //用于存储Game的实例对象
    function Game(map){
        this.map = map;
        this.food = new Food(map);
        this.snake = new Snake(map);
        this.keyLock = false;
        this.manualPlayTimeId = null;
        this.controlHiddenTimeId = null;
        this.intervalTime = 150;
        this.foodNum = 3;
        that = this;
    }
    Game.prototype.init = function(){
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
                    clearTimeout(game.controlHiddenTimeId);
                    game.controlHiddenTimeId =  setTimeout(function(){
                        animate(controlDiv,{"opacity":1});
                    },1000);
                    btnPause.style.display="none";
                    isDead=true;
                    gameOverDiv.style.display="block";
                    break;
                case 1:
                    this.food.generate();
                    break;
                case 0:
                    break;
            }
        }.bind(that),this.intervalTime);
    };
    Game.prototype.newGame = function(){
        game.keyLock = false;
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
            btnPause.innerHTML = '<span>继续</span><i class="iconfont icon-jixu"></i>';

            clearTimeout(this.controlHiddenTimeId);
            console.log(this.controlHiddenTimeId);
            animate(controlDiv,{"opacity":1});

        }else{
            this.keyLock = false;
            this.manualPlay();
            btnPause.innerHTML = '<span>暂停</span><i class="iconfont icon-zanting"></i>';
            clearTimeout(this.controlHiddenTimeId);
            this.controlHiddenTimeId = setTimeout(function(){
                animate(controlDiv,{"opacity":0});
            },1000);
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
                    if(isFirstGame || isDead){
                        btnStart.click();
                        btnStart.onmousedown();
                    }else{
                        btnPause.click();
                        btnPause.onmousedown();
                    }
                    break;

            }
        }.bind(that);
        keyUpListener = function(e){
            switch(e.keyCode){
                case 32:

                        btnStart.onmouseup();

                        btnPause.onmouseup();

                    break;

            }
        }.bind(that);
        if(document.addEventListener){
            document.addEventListener("keydown",keyListener,false);
            document.addEventListener("keyup",keyUpListener,false);
        }else{
            document.attachEvent("onkeydown",keyListener)
            document.attachEvent("onkeyup",keyUpListener)            
        }
    };

    
    var controlDiv = document.getElementById("control");
    var btnStart = controlDiv.getElementsByClassName("start")[0];
    var btnPause = controlDiv.getElementsByClassName("pause")[0];
    var btnSetting = controlDiv.getElementsByClassName("setting")[0];
    var gameOverDiv = document.getElementById("gameOverDiv");
    var settingDiv = document.getElementById("settingDiv");
    var settingCloseBtn =  settingDiv.getElementsByClassName("close")[0];
    var defaultBtn = settingDiv.getElementsByClassName("default")[0];
    var confirmBtn = settingDiv.getElementsByClassName("confirm")[0];
    var foodNumInput = settingDiv.getElementsByClassName("foodNum")[0];
    var mediumInput = settingDiv.querySelector("input[value='medium']");
    
    

    var isFirstGame = true;
    var isDead = false;
    var game = new Game(map);
    game.init();
    btnStart.onclick = function(){
        if(isFirstGame){
            game.manualPlay();
            isFirstGame=false;
        }else{
            btnPause.innerHTML = '<span>暂停</span><i class="iconfont icon-zanting"></i>';
            game.newGame();
        }
        //点了开局，过段时间就把controlDiv给隐藏起来
        clearTimeout(game.controlHiddenTimeId);
        game.controlHiddenTimeId =  setTimeout(function(){
            animate(controlDiv,{"opacity":0});
        },1000);
        isDead=false;
        gameOverDiv.style.display="none";
        btnPause.style.display = "block";
    };
    btnPause.onclick = function(){
        game.pasue();
    };
    btnSetting.onclick = function(){
        settingDiv.style.display="block";
    };
    
    settingCloseBtn.onclick = function(){        
        settingDiv.style.display="none";
    };
    btnStart.onmousedown = function(){
        this.className = "start mousedown";
    };
    btnStart.onmouseup = function(){
        this.className = "start";
    };
    btnPause.onmousedown = function(){
        this.className = "pause mousedown";
    };
    btnPause.onmouseup = function(){
        this.className = "pause";
    };
    btnSetting.onmousedown = function(){
        this.className = "setting mousedown";
    };
    btnSetting.onmouseup = function(){
        this.className = "setting";
    };
    controlDiv.onmouseover = function(){
        clearTimeout(game.controlHiddenTimeId);
        animate(controlDiv,{"opacity":1});
    };
    controlDiv.onmouseout = function(){
        if(game.manualPlayTimeId != null){
            clearTimeout(game.controlHiddenTimeId);
            animate(controlDiv,{"opacity":0});
        }
    };
    defaultBtn.onclick = function(){
        foodNumInput.value = "3";
        mediumInput.checked="checked";
    }
    confirmBtn.onclick = function(){
        var speed = settingDiv.querySelector("input[name='speed']:checked").value;
        switch(speed){
            case "fast":
                game.intervalTime = 80;
                break;
            case "medium":
                game.intervalTime = 150;
                break;
            case "slow":
                game.intervalTime = 220;
                break;

        }
        game.foodNum = parseInt(foodNumInput.value);
        settingDiv.style.display="none";
    }

}());