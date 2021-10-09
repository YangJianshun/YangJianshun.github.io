(function(){
    
    Array.prototype.containCoor = function(coordinate){
        x=coordinate[0];
        y=coordinate[1];
        for(var i=0;i<this.length;i++){
            if(x==this[i][0] && y==this[i][1]){
                return true;
            }
        }
        return false;
    };
    Array.prototype.removeCoor = function(coordinate){
        x=coordinate[0];
        y=coordinate[1];
        for(var i=0;i<this.length;i++){
            if(x==this[i][0] && y==this[i][1]){
                this.splice(i,1);
                return true;
            }
        }
        return false;
    }
    /**
     * @msg: 此函数使用广度优先搜索寻找两点(点集合)之间的最短路径
     * @param start {object Array} 起点坐标，一般为蛇头坐标
     * @param endLst {object Array} 终点坐标集合，一般为多个食物的坐标(或蛇尾坐标，判断是否安全时)
     * @param width {number} 地图的宽
     * @param height {number} 地图的高
     * @param obstacle {object Array} 障碍物坐标的集合，一般为蛇身坐标
     * @return: 返回最短路径，一个数组，每个元素为最短路径上的坐标
     */
    function getPathByBFS(start,endLst,width,height,obstacle){
        var queue=[start];
        var passed=[];
        var path=[];
        if(! obstacle){obstacle=[];}

        while(queue.length>0){
            var start = queue.shift();
            var xStart=start[0],yStart = start[1];
            //向上下左右分别遍历
            var offsetLst = [[0,-1],[0,1],[-1,0],[1,0]]
            for(var i=0;i<offsetLst.length;i++){
                var offset = offsetLst[i];
                var xStartNew = xStart+offset[0];
                var yStartNew = yStart+offset[1];
                if(xStartNew<0 || yStartNew<0 || xStartNew>width-1 || yStartNew>height-1){continue;}
                startNew = [xStartNew,yStartNew];
                if(obstacle.containCoor(startNew)){continue;}
                if(passed.containCoor(startNew)){continue;}
                startNew.before = start;
                // console.log(startNew);
                // if(startNew[0]==end[0] && startNew[1]==end[1]){
                if(endLst.containCoor(startNew)){
                    // console.log("找到了！");
                    path.unshift(startNew);
                    before = startNew.before;

                    while(before){
                        path.unshift(before);
                        // console.log(before);
                        before = before.before;
                    }

                    queue.length = 0;
                    break;
                    // continue;
                }
                queue.push(startNew);
                passed.push(startNew);
                // console.log(startNew);
            }
        }
        // console.log(path);
        return path;
    }
    function path2behavior(path){
        behavior = [];
        for(var i=0;i<path.length-1;i++){
            x1 = path[i][0];
            y1 = path[i][1];
            x2 = path[i+1][0];
            y2 = path[i+1][1];
            if(y2-y1 == -1){
                behavior.push("up");
            }else if(y2-y1 == 1){
                behavior.push("down");
            }else if(x2-x1 == 1){
                behavior.push("right");
            }else if(x2-x1 == -1){
                behavior.push("left");
            }else{
                return false;
            }
        }
        return behavior;
    }
    catchUpTail = function (path,snakeBodyCoorLst,width,height){
        var snakeAndPathCoor = path.slice();
        snakeAndPathCoor.reverse();
        
        snakeAndPathCoor = snakeAndPathCoor.concat(snakeBodyCoorLst);
        var newSnakeHeadCoor = snakeAndPathCoor[0];
        var newSnakeTailCoor = snakeAndPathCoor[snakeBodyCoorLst.length-1];
        var newSnakeBodyArea = snakeAndPathCoor.splice(0,snakeBodyCoorLst.length);
        
        //由于吃掉食物后，蛇的身体长度会增加，所以，应该追踪尾巴周围的空位
        var offsetLst = [[0,-1],[0,1],[-1,0],[1,0]];
        var targetLst = [];
        for(var i=0;i<offsetLst.length;i++){
            var offset = offsetLst[i];
            var target = [newSnakeTailCoor[0]+offset[0], newSnakeTailCoor[1]+offset[1]];
            if(target[0]<0 || target[1]<0 || target[0]>width-1 || target[1]>height-1){continue;}
            if(! newSnakeBodyArea.containCoor(target)){targetLst.push(target);}
        }
        // console.log(newSnakeBodyArea);
        // console.log(newSnakeTailCoor);
        // console.log(targetLst);
        var path2newSnakeTail = getPathByBFS(newSnakeHeadCoor,targetLst,width,height,obstacle=newSnakeBodyArea);
        // console.log("新距离",path2newSnakeTail);
        if(path2newSnakeTail.length > 2){
            return true;
        }
        return false;
    };
    // console.log( catchUpTail([[4,3],[4,2],[4,1],[5,1],[6,1]], [[3,3],[2,3],[2,4],[2,5],[1,5]]) );
    // console.log( catchUpTail(  [[2,2],[2,3]], [[3,2],[3,3],[3,4],[2,4],[1,4],[1,3],[1,2]] ,5,5) );

    // console.log(getPathByBFS([29,17],[[37,19]],40,20))
    window.getPathByBFS = getPathByBFS;
    window.path2behavior = path2behavior;
    window.catchUpTail = catchUpTail;
    

}());