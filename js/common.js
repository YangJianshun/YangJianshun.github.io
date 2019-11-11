function getStyle(element,attr){
    return window.getComputedStyle ? window.getComputedStyle(element,null)[attr] : element.currentStyle[attr];
}
function animate(element,json,fn){
    clearInterval(element.timeId);
    element.timeId = setInterval(function(){
        var flag = true;
        for(var attr in json){
            
            if(attr=="zIndex"){element.style[attr] = json[attr]}
            else if(attr=="opacity"){
                var current = getStyle(element,attr)*100;
                var target = json[attr]*100;
                var step = (target - current)/10;
                step = step>0?Math.ceil(step):Math.floor(step);
                current += step;
                element.style[attr] = current/100;                
            }else if(attr=="scale"){
                var current = parseFloat(getStyle(element,"transform").split(",")[0].split("(")[1]);
                current = current*100;
                var target = json[attr]*100;
                var step = (target - current)/10;
                step = step>0?Math.ceil(step):Math.floor(step);
                current += step;
                element.style["transform"] = "scale("+current/100+")";
            }
            else{
                var target = json[attr];
                var current = parseInt(getStyle(element,attr));
                if(isNaN(current)) current=0;
                var step = (target - current)/10;
                step = step>0?Math.ceil(step):Math.floor(step);
                current += step;
                element.style[attr] = current+"px";

            }
            if(current != target){
                flag=false;
            }
        // console.log(attr,target,current,step);
        }
        
        if(flag){
            clearInterval(element.timeId);
            // console.log("clear!");
            if(fn) fn()
        }
    },10);
}