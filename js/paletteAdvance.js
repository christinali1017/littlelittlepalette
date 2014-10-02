var canvas,
		ctx,
		canvasTemp,
		ctxTemp,
		mouseState = false, //初始化鼠标是否按下和坐标点位置, true为按下
	    oldX = 0,
		oldY = 0,
		pencilX = 0,
		pencilY = 0,
		lineColor = "black",
		lineWeight = 1,
		canvasTop,
		canvasLeft,
		canvasWidth = 700,
		canvasHeight = 550,
		cancelTimes = 0, //撤销次数
		imageHistoryList = new Array(); //存储图片绘制历史信息
		
	
	onLoad(function(){
		init(); //初始化canvas
		
		//颜色和线宽绑定点击事件
		var colorDiv = document.getElementById("color");
		var lineDiv = document.getElementById("lineWeight");
		colorDiv.addEventListener("click", chosen);
		lineDiv.addEventListener("click", chosen);
		
		document.getElementById("pencil").click(); //未选择图形时默认为铅笔
		document.getElementById("blackBtn").click(); //默认黑色
		document.getElementById("line1").click(); //默认线宽2px
	});
	
	var chosen = function(event){
		var parentNode = event.target.parentNode;
		for(var i=0; i<parentNode.childNodes.length; i++){
			parentNode.childNodes[i].className = "";
		}
		event.target.className = "chosen";
	};
	
	var init = function(){
		//初始化canvas
		canvas = document.getElementById("canvas");
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		//判断是否支持canvas
		if(!canvas || !canvas.getContext){
			return false;
		}
		ctx = canvas.getContext("2d");
		
		//初始化画图区域白色背景
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, 700, 550);
		
		//初始化canvasTemp
		canvasTemp = document.getElementById("canvasTemp");
		canvasTemp.width = canvasWidth;
		canvasTemp.height = canvasHeight;
		ctxTemp = canvasTemp.getContext("2d");
		
		canvasTop = canvas.offsetTop,
		canvasLeft = canvas.offsetLeft;
		
		//初始化撤销和重做按钮状态
		document.getElementById("undoImage").src="./images/undoDis.png";
		document.getElementById("redoImage").src="./images/redoDis.png";

	};

	//绘制picture
	var drawPicture = function(type, obj){
		var down, //鼠标按下事件
			up, //鼠标弹起事件
			move, //鼠标移动事件
			out, //鼠标离开区域
			chosen, //图形选中
			clearContext; //清除canvas环境
		
		down = function(event){
			mouseState = true;
			event = event || window.event;
			
			oldX =  event.clientX - canvasLeft;
			pencilX =  event.clientX - canvasLeft;
			oldY = event.clientY - canvasTop;
			pencilY = event.clientY - canvasTop;
			
			ctxTemp.strokeStyle = lineColor;
			ctxTemp.lineWidth = lineWeight;
			ctxTemp.lineCap = "round";
			
			clearContext();
			
			ctxTemp.moveTo(oldX, oldY);
			
			if(type === "rubber"){
				//ctx.clearRect(oldX-lineWeight*10, oldY-lineWeight*10, lineWeight*20, lineWeight*20);
				//重新填充白色背景，否则擦出后是颜色背景
				ctx.fillStyle = "white";
				ctx.fillRect(oldX-lineWeight*10, oldY-lineWeight*10, lineWeight*20, lineWeight*20);
			}
		};
	
		up = function(event){
			//更改鼠标状态
			mouseState = false;
			event = event || window.event;
			
			//将canvasTemp中graph添加到canvas中
			var image = new Image();
			if(type !== "rubber"){
				image.src = canvasTemp.toDataURL();
				image.onload = function(){
					ctx.drawImage(image, 0, 0, image.width, image.height);
					clearContext();
					
					//保存历史记录，撤销时使用
					saveImageHistory();
					
				};
			}
			
		};
	
		chosen = function(obj){
			var shape = document.getElementById("shape");
			for(var i=0; i<shape.childNodes.length; i++){
				shape.childNodes[i].className = "";
			}
			if(type !== "rubber"){
				document.getElementById("rubber").className = "";
			}
			obj.className = "chosen";
		};
		
		//鼠标按下，拖动画图
		move = function(event){
			var newX = event.clientX - canvasLeft;
			var newY = event.clientY - canvasTop;
			if(type === "pencil"){
				if(mouseState === true){
					ctxTemp.beginPath();
					ctxTemp.moveTo(pencilX, pencilY);
					ctxTemp.lineTo(newX, newY);
					ctxTemp.stroke();
					pencilX = newX;
					pencilY = newY;
				}
			}else if(type === "rec"){
				clearContext();
				if(mouseState === true){
					ctxTemp.beginPath();
					ctxTemp.moveTo(oldX, oldY);
					ctxTemp.lineTo(newX, oldY);
					ctxTemp.lineTo(newX, newY);
					ctxTemp.lineTo(oldX, newY);
					ctxTemp.lineTo(oldX, oldY);
					ctxTemp.stroke();
				}else{
					//鼠标移动时出现矩形
					ctxTemp.beginPath();	
					ctxTemp.moveTo(newX - 10 ,  newY - 10 );						
					ctxTemp.lineTo(newX + 10  , newY - 10 );
					ctxTemp.lineTo(newX + 10  , newY + 10 );
					ctxTemp.lineTo(newX - 10  , newY + 10 );
					ctxTemp.lineTo(newX- 10  , newY - 10 );	
					ctxTemp.stroke();
				}
			}else if(type === "line"){
				if(mouseState === true){
					ctxTemp.beginPath();
					clearContext();
					ctxTemp.moveTo(oldX, oldY);
					ctxTemp.lineTo(newX, newY);
					ctxTemp.stroke();
				}
			}else if(type === "circle"){
				clearContext();
				if(mouseState === true){
					ctxTemp.beginPath();
					var radius = Math.sqrt((oldX - newX) *  (oldX - newX)  + (oldY - newY) * (oldY - newY));
					ctxTemp.arc(oldX,oldY,radius,0,Math.PI * 2,false);									
					ctxTemp.stroke();
				}else{
					//鼠标没有按下时出现小圆
					ctxTemp.beginPath();
					//ctxTemp.strokeStyle ='#9F35FF';	
					ctxTemp.arc(newX,newY,10 ,0, Math.PI * 2,false);
					ctxTemp.stroke();
				}
			}else if(type === "roundRec"){
				clearContext();
				if(mouseState === true){
					ctxTemp.beginPath();
					ctxTemp.moveTo(oldX, oldY);
					ctxTemp.lineTo(newX, oldY);
					ctxTemp.arcTo(newX+20,oldY, newX+20, oldY+20, 20);
					ctxTemp.lineTo(newX+20, newY);
					ctxTemp.arcTo(newX+20,newY+20, newX, newY+20, 20);
					ctxTemp.lineTo(oldX, newY+20);
					ctxTemp.arcTo(oldX-20,newY+20, oldX-20, newY, 20);
					ctxTemp.lineTo(oldX-20, oldY+20);
					ctxTemp.arcTo(oldX-20,oldY, oldX, oldY, 20);
					ctxTemp.stroke();
				}else{
					//鼠标没有按下时出现小的圆角矩形
					ctxTemp.beginPath();
					//ctxTemp.strokeStyle ='#9F35FF';	
					ctxTemp.moveTo(newX - 10 ,  newY - 10);
					ctxTemp.lineTo(newX, newY - 10);
					ctxTemp.arcTo(newX + 10,newY - 10, newX + 10, newY, 10);
					ctxTemp.lineTo(newX + 10, newY + 10);
					ctxTemp.arcTo(newX + 10, newY + 20, newX, newY + 20, 10);
					ctxTemp.lineTo(newX - 10, newY + 20);
					ctxTemp.arcTo(newX - 20,newY + 20, newX - 20,newY + 10,10);
					ctxTemp.lineTo(newX - 20,newY);
					ctxTemp.arcTo(newX - 20,newY - 10, newX - 10,newY - 10, 10);
					ctxTemp.stroke();
				}
			}else if(type === "rubber"){
				//鼠标没有按下时出现橡皮擦图标
				ctxTemp.beginPath();
				clearContext();
				ctxTemp.strokeStyle =  '#000000';						
				ctxTemp.moveTo(newX - lineWeight * 10 ,  newY - lineWeight * 10 );						
				ctxTemp.lineTo(newX + lineWeight * 10  , newY - lineWeight * 10 );
				ctxTemp.lineTo(newX + lineWeight * 10  , newY + lineWeight * 10 );
				ctxTemp.lineTo(newX - lineWeight * 10  , newY + lineWeight * 10 );
				ctxTemp.lineTo(newX- lineWeight * 10  , newY - lineWeight * 10 );	
				ctxTemp.stroke();	
				if(mouseState === true){
					//ctx.clearRect(newX - lineWeight * 10 ,  newY - lineWeight * 10 , lineWeight * 20 , lineWeight * 20);
					//重新填充白色背景，否则擦出后是颜色背景
					ctx.fillStyle = "white";
					ctx.fillRect(newX - lineWeight * 10 ,  newY - lineWeight * 10 , lineWeight * 20 , lineWeight * 20);

					
				}
			}
			
		};
		
		out = function(){
			clearContext();
		};
		clearContext = function(){
			ctxTemp.clearRect(0,0,canvas.width,canvas.height);
		};
		
		//将选中的形状置为选中状态
		chosen(obj);
		
		//canvas添加鼠标事件, 鼠标移动、鼠标按下和鼠标弹起
		/*
		canvasTemp.addEventListener("mousemove", move);
		canvasTemp.addEventListener("mousedown", down);
		canvasTemp.addEventListener("mouseup", up);
		canvasTemp.addEventListener("mouseout", out);
		*/
		
		/*
		 * 本来尝试使用原生js来写，但是在上面的事件解绑中遇到问题
		 * 尝试了removeEventListener和最原始的将绑定事件置为null，但是没起作用，没找到解决方法因而使用了jQuery的unbind
		 * 
		 */
		
		$(canvasTemp).unbind();
		$(canvasTemp).bind('mousedown',down);
		$(canvasTemp).bind('mousemove',move);
		$(canvasTemp).bind('mouseup',up);
		$(canvasTemp).bind('mouseout',out);
	};
	
	
	/*
	 * 保存picture历史记录
	 */
	function saveImageHistory(){
		cancelTimes = 0;
		imageHistoryList.push(canvas.toDataURL());
		if(imageHistoryList.length > 0){
			document.getElementById("undoImage").src="./images/undo.png";
		}
	}
	
	var  exportImage = function(event){
			var imgSrc = canvas.toDataURL("image/png");
			document.getElementById("image").src = imgSrc;
		};
	
	/*
	 * undo 撤销一次
	 */
	var undo = function(){
		cancelTimes++;
		if(cancelTimes >= imageHistoryList.length+1){
			cancelTimes--;
			return;
		}else if(cancelTimes == imageHistoryList.length){
			document.getElementById("redoImage").src="./images/redo.png";
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			document.getElementById("undoImage").src="./images/undoDis.png";
		}else{
			document.getElementById("redoImage").src="./images/redo.png";
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			var image = new Image();
			image.src = imageHistoryList[imageHistoryList.length-1-cancelTimes];
			image.onload = function(){
				ctx.drawImage(image, 0, 0, image.width, image.height);
			};
		}
	};
	
	/*
	 * redo，重做上一次操作
	 */
	var redo = function(){
		cancelTimes--;
		if(cancelTimes < 0){
		 cancelTimes++;
			return;
		}else{
			if(cancelTimes == 0){
				document.getElementById("redoImage").src="./images/redoDis.png";
				document.getElementById("undoImage").src="./images/undo.png";
			}
			ctx.clearRect(0, 0, canvasWidth, canvasHeight);
			var image = new Image();
			image.src = imageHistoryList[imageHistoryList.length-1-cancelTimes];
			image.onload = function(){
				ctx.drawImage(image, 0, 0, image.width, image.height);
			};
		}
	};
	
	/**
	 *清屏 
	 */
	function clearScreen(){
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);
	}
	

    /**
    * 工具函数onLoad，当文档载入完成时调用一个函数
    */
    function onLoad(f){
        if(onLoad.loaded){
            window.setTimeout(f,0);
        }else if(window.addEventListener){
            window.addEventListener("load",f,false);
        }else if(window.attachEvent){
            window.attachEvent("onload",f);
        }
    }
    onLoad.loaded = false;
    onLoad(function(){
        onLoad.loaded = true;
    });
    