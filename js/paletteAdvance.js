var canvas,
		ctx,
		canvasTemp,
		ctxTemp,
		mouseState = false, //��ʼ������Ƿ��º������λ��, trueΪ����
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
		cancelTimes = 0, //��������
		imageHistoryList = new Array(); //�洢ͼƬ������ʷ��Ϣ
		
	
	onLoad(function(){
		init(); //��ʼ��canvas
		
		//��ɫ���߿�󶨵���¼�
		var colorDiv = document.getElementById("color");
		var lineDiv = document.getElementById("lineWeight");
		colorDiv.addEventListener("click", chosen);
		lineDiv.addEventListener("click", chosen);
		
		document.getElementById("pencil").click(); //δѡ��ͼ��ʱĬ��ΪǦ��
		document.getElementById("blackBtn").click(); //Ĭ�Ϻ�ɫ
		document.getElementById("line1").click(); //Ĭ���߿�2px
	});
	
	var chosen = function(event){
		var parentNode = event.target.parentNode;
		for(var i=0; i<parentNode.childNodes.length; i++){
			parentNode.childNodes[i].className = "";
		}
		event.target.className = "chosen";
	};
	
	var init = function(){
		//��ʼ��canvas
		canvas = document.getElementById("canvas");
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;
		//�ж��Ƿ�֧��canvas
		if(!canvas || !canvas.getContext){
			return false;
		}
		ctx = canvas.getContext("2d");
		
		//��ʼ����ͼ�����ɫ����
		ctx.fillStyle = "white";
		ctx.fillRect(0, 0, 700, 550);
		
		//��ʼ��canvasTemp
		canvasTemp = document.getElementById("canvasTemp");
		canvasTemp.width = canvasWidth;
		canvasTemp.height = canvasHeight;
		ctxTemp = canvasTemp.getContext("2d");
		
		canvasTop = canvas.offsetTop,
		canvasLeft = canvas.offsetLeft;
		
		//��ʼ��������������ť״̬
		document.getElementById("undoImage").src="./images/undoDis.png";
		document.getElementById("redoImage").src="./images/redoDis.png";

	};

	//����picture
	var drawPicture = function(type, obj){
		var down, //��갴���¼�
			up, //��굯���¼�
			move, //����ƶ��¼�
			out, //����뿪����
			chosen, //ͼ��ѡ��
			clearContext; //���canvas����
		
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
				//��������ɫ�������������������ɫ����
				ctx.fillStyle = "white";
				ctx.fillRect(oldX-lineWeight*10, oldY-lineWeight*10, lineWeight*20, lineWeight*20);
			}
		};
	
		up = function(event){
			//�������״̬
			mouseState = false;
			event = event || window.event;
			
			//��canvasTemp��graph��ӵ�canvas��
			var image = new Image();
			if(type !== "rubber"){
				image.src = canvasTemp.toDataURL();
				image.onload = function(){
					ctx.drawImage(image, 0, 0, image.width, image.height);
					clearContext();
					
					//������ʷ��¼������ʱʹ��
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
		
		//��갴�£��϶���ͼ
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
					//����ƶ�ʱ���־���
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
					//���û�а���ʱ����СԲ
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
					//���û�а���ʱ����С��Բ�Ǿ���
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
				//���û�а���ʱ������Ƥ��ͼ��
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
					//��������ɫ�������������������ɫ����
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
		
		//��ѡ�е���״��Ϊѡ��״̬
		chosen(obj);
		
		//canvas�������¼�, ����ƶ�����갴�º���굯��
		/*
		canvasTemp.addEventListener("mousemove", move);
		canvasTemp.addEventListener("mousedown", down);
		canvasTemp.addEventListener("mouseup", up);
		canvasTemp.addEventListener("mouseout", out);
		*/
		
		/*
		 * ��������ʹ��ԭ��js��д��������������¼��������������
		 * ������removeEventListener����ԭʼ�Ľ����¼���Ϊnull������û�����ã�û�ҵ�����������ʹ����jQuery��unbind
		 * 
		 */
		
		$(canvasTemp).unbind();
		$(canvasTemp).bind('mousedown',down);
		$(canvasTemp).bind('mousemove',move);
		$(canvasTemp).bind('mouseup',up);
		$(canvasTemp).bind('mouseout',out);
	};
	
	
	/*
	 * ����picture��ʷ��¼
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
	 * undo ����һ��
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
	 * redo��������һ�β���
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
	 *���� 
	 */
	function clearScreen(){
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		ctxTemp.clearRect(0, 0, canvasWidth, canvasHeight);
	}
	

    /**
    * ���ߺ���onLoad�����ĵ��������ʱ����һ������
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
    