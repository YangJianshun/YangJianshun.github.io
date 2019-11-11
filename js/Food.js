(function (){
    var map = document.getElementById("map");

    function Food(map,width,height,color){
        this.map = map;        
        this.width = width||20;
        this.height = height||20;
        this.color = color||"green";    
    }
    function remove(){
        foodArea={};
    }
    Food.prototype.init = function(foodNum){
        remove();
        for(var i=0;i<foodNum;i++){
            this.generate();
        }    
    }
    Food.prototype.generate = function(){
        var map = this.map;
        //保证生成的食物不会掉落在蛇身体上或者其它食物上
        do{
            this.x = Math.floor(Math.random()*map.offsetWidth/this.width) 
            this.y = Math.floor(Math.random()*map.offsetHeight/this.height)
        }while(snakeBodyArea.indexOf(this.x +","+this.y)>=0 || Object.keys(foodArea).indexOf(this.x +","+this.y)>=0)
        div = document.createElement("div");
        div.style.width = this.width + "px";
        div.style.height = this.height + "px";
        div.style.left = this.x * this.width + "px";
        div.style.top = this.y * this.height + "px";

        div.style.backgroundColor = this.color;
        div.style.position = "absolute";

        map.appendChild(div);
        foodArea[this.x+","+this.y] = div;

    }
    window.Food = Food;
    // var food = new Food(map);
    // food.init(1);
}());
