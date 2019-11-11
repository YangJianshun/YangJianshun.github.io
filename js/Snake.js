(function(){
    var map = document.getElementById("map");
    var tmpDivLst = [];
    function Snake(map,direction,height,width){
        this.map = map;
        this.direction = direction||"right";
        this.height = height||20;
        this.width = width||20;
        this.body = [
            {"x":3, "y":2, "color":"red"},
            {"x":2, "y":2, "color":"orange"},
            {"x":1, "y":2, "color":"orange"}
        ];
    }
    Snake.prototype.init = function(){
        remove();
        snakeBodyArea = this.body.map(function(div){return div.x+","+div.y}); 
        
        for(var i=0;i<this.body.length;i++){
            div = document.createElement("div");
            div.style.position="absolute";
            div.style.width = this.width + "px";
            div.style.height = this.height + "px";
            div.style.backgroundColor = this.body[i].color;
            div.style.left = this.body[i].x * this.width + "px";
            div.style.top = this.body[i].y * this.height + "px";
            map.appendChild(div);
            tmpDivLst.push(div);       
        }
    };
    Snake.prototype.move = function(){
        for(var i=this.body.length-1;i>0;i--){
            this.body[i].x = this.body[i-1].x;
            this.body[i].y = this.body[i-1].y;
            // console.log(this.body[i]);
        }
        var headOffset = [0,0];
        // console.log(this.direction);
        switch(this.direction){
            case "right":
                headOffset = [1,0]
                break;
            case "left":
                headOffset = [-1,0]
                break;
            case "up":
                headOffset = [0,-1]
                break;
            case "down":
                headOffset = [0,1]
                break;                    
        }
        xPost = this.body[0].x + headOffset[0]
        yPost = this.body[0].y + headOffset[1]
        
        //如果撞墙
        if(xPost > map.offsetWidth/this.width-1 || xPost < 0 || yPost > map.offsetHeight/this.height-1 || yPost < 0){
            return -1;
        }
        //如果吃到自己身体
        if(snakeBodyArea.indexOf(xPost +","+yPost)>=0){
            return -1;
        }
        //如果没有遇到致命危险就改变自己的坐标
        this.body[0].x = xPost
        this.body[0].y = yPost
        
        //如果吃到食物

        remove()        
        this.init();

        if(Object.keys(foodArea).indexOf(xPost +","+yPost)>=0){

            var last = this.body[this.body.length-1]
            this.body.push({"x": last.x,"y": last.y,"color": last.color});
            map.removeChild(foodArea[xPost+","+yPost])
            delete foodArea[xPost+","+yPost]
            return 1;
            
            

            // console.log(this.body);
            // console.log("========");
        }

        return 0;
    };
    function remove(){
        while(tmpDivLst.length>0){
            tmpDiv = tmpDivLst.pop();
            map.removeChild(tmpDiv);
        }
        snakeBodyArea.length = 0;
    };

    window.Snake = Snake;
    // snake = new Snake(map);
    // snake.init();


}());