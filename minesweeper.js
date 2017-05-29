
window.onload = function(){
	var boardHeight;
	var boardWidth;
	var notLost = true;
	var groundToSweep = 0;

	$("#customBoard").submit(function(event){
		event.preventDefault();
		var thisRow;
		notLost = true;
		
		boardHeight = $("#boardHeight").val() || 20;
		boardWidth = $("#boardWidth").val() || 20;

		var numMines = $("#numMines").val();
		var squareCount = 0;

		

		var totalSquares = boardHeight * boardWidth;
		groundToSweep = totalSquares - numMines;

		
		if(totalSquares < numMines){
			$("#message").html("Слишком много мин.");
			
		} else {
			
			$("#board").html("");
			squareArray = [];
			
			for(var i=0; i < boardHeight; i++){
				thisRow = "";
				for (var j = 0; j < boardWidth; j++) {
					
					thisRow  += "<td id='s" + squareCount + "' class='box'></td>";
					squareCount += 1;
				};
				
				$("#board").append( "<tr>" + thisRow + "</tr>" );
				
			};
			placeMines(numMines, totalSquares);
		}
	});

	
	var squareArray = [];
	var placeMines = function(numMines, totalSquares){
		$($square).click(sweep);

		for (var i = 0; i < totalSquares; i++) {
			if (i < numMines){
				
				var squareObj = {"id": null, "isMine": true, "clickedStatus" : "notClicked"};
			} else {
				var squareObj = {"id": null, "isMine": false, "clickedStatus" : "notClicked"};
				
			}
			squareArray.push(squareObj);

		}

		squareArray = shuffle(squareArray);
		console.log("square Array :: ", squareArray);
		var count = 0;
		for(var i = 0; i < totalSquares; i++){
			squareArray[i].id = "#s" + count;
			count +=1;
		}
	};

	
	var shuffle = function(array){
	  for (var i = array.length - 1; i > 0; i--) {
	      var j = Math.floor(Math.random() * (i + 1));
	      var temp = array[i];
	      array[i] = array[j];
	      array[j] = temp;
	  }
	  return array;
	}

	var $square = $('#board');
	


	var sweep = function(){

		console.log("yo from sweep");
		var $x = $(event.target);
		
		if ($x.html() != "X"){
			var squareId = event.target.id;
			
			var squareIdNum = Number(squareId.slice(1));
			reveal(squareIdNum);
		}
	}

	var reveal = function(squareIdNum){
		console.log("Revealing! ", squareIdNum);

		
		if (squareArray[squareIdNum].clickedStatus != "clicked"){
				squareArray[squareIdNum].clickedStatus = "clicked";
				console.log("Really revealing! ", squareIdNum);
				var x = squareArray[squareIdNum].id;
				console.log("reveal x", x);

			if(squareArray[squareIdNum].isMine && notLost){
				 
					lose();
			} else{
				console.log("not mine");
				groundToSweep -= 1;
				$(x).css("background-color","#ecf0f1");
				$(x).css("border-style","inset");
				console.log($(x));
				if(groundToSweep === 0){
					win();
					return;
				}

				var totalTouching = calcTouching(squareIdNum, boardWidth);
				if (totalTouching !=0){
					$(x).html(totalTouching);
				} else if (totalTouching === 0) {
						$(x).html("");
						determinePosition(squareIdNum);
						if(!top && squareArray[squareIdNum-boardWidth].clickedStatus != "clicked"){
							reveal(squareIdNum-boardWidth); //check up
						}
						determinePosition(squareIdNum);
						if(!top && !left && squareArray[squareIdNum-(Number(boardWidth)+1)].clickedStatus != "clicked"){

							reveal(squareIdNum-(Number(boardWidth)+1));
						}
						determinePosition(squareIdNum);
						if(!top && !right && squareArray[squareIdNum-(Number(boardWidth)-1)].clickedStatus != "clicked"){
							reveal(squareIdNum-(Number(boardWidth)-1));

						}
						determinePosition(squareIdNum);
						if(!right && squareArray[squareIdNum+1].clickedStatus != "clicked"){
							reveal(squareIdNum+1);

						}
						determinePosition(squareIdNum);
						if(!left && squareArray[squareIdNum-1].clickedStatus != "clicked"){
							reveal(squareIdNum-1);

						}
						determinePosition(squareIdNum);
						if(!bottom && !left && squareArray[squareIdNum+(Number(boardWidth)-1)].clickedStatus != "clicked"){
							reveal(squareIdNum+(Number(boardWidth)-1));

						}
						determinePosition(squareIdNum);
						if(!bottom && !right && squareArray[squareIdNum+(Number(boardWidth)+1)].clickedStatus != "clicked"){
							reveal(squareIdNum+(Number(boardWidth)+1));
						}
						determinePosition(squareIdNum);
						if(!bottom && squareArray[Number(squareIdNum)+Number(boardWidth)].clickedStatus != "clicked"){
							reveal(Number(squareIdNum)+Number(boardWidth));
						}
				}
			}
		}
	}

	var lose = function(){
		notLost = false;
		console.log("you lose");
		$("#loseExplosion").css("display","block");
			var allSquares = Number(boardWidth) * Number(boardHeight);

		for(var i = 0; i < allSquares; i++){
			if(squareArray[i].isMine){
				var x = squareArray[i].id;
				$(x).css("background-color","red");
				$(x).css("border-style","inset");
			}
		}
		setTimeout(function(){
			$("#loseExplosion").css("display","none");
		}, 3000);

		$("#board").off('click');
	}

	var win = function(){
		$("#board").off('click');
		console.log("YOU WIN!");
		$("#win").css("display","block");
		setTimeout(function(){
			$("#win").css("display","none");
		}, 2500);
	}

	var top = false;
	var left = false;
	var right = false;
	var bottom = false;

	var determinePosition = function(index){
		top = false;
		left = false;
		right = false;
		bottom = false;

		if(index < boardWidth){
			top = true; 
		}
		if(index%boardWidth === 0 || index === 0){
			left = true;
		}
		if((index+1)%boardWidth === 0){
			right = true;
		}
		
		if(index >= (boardWidth*(boardHeight-1))){
			bottom = true;
		}
	}

	
	var calcTouching = function(index){
		determinePosition(index);
		var touchCount=0;

		if(!left && squareArray[index-1].isMine){ 
			console.log("left");
			touchCount += 1;
		}
		if(!right && squareArray[index+1].isMine){ 
			console.log("Right");
			touchCount += 1;
		}

		if(!left && !top && squareArray[index - (Number(boardWidth)+1)].isMine){ 
			console.log("Up left");
			touchCount += 1;
		}
		if(!top && squareArray[index - Number(boardWidth)].isMine){ 
			console.log("up mid");
			touchCount += 1;
		}
		if(!top && !right && squareArray[index - (Number(boardWidth)-1)].isMine){ 
			touchCount += 1;
			console.log("up right");
		}
		if(!bottom && !right && squareArray[index + (Number(boardWidth)+1)].isMine){ 
			touchCount += 1;
			console.log("lower right");
		}
		if(!bottom && squareArray[index + Number(boardWidth)].isMine){ 
			touchCount += 1;
			console.log("lower mid");
		}
		if(!bottom && !left && squareArray[index + (Number(boardWidth)-1)].isMine){ 
			touchCount += 1;
			console.log("lower left");
		}
		return touchCount;
	}





	$('#board').bind("contextmenu",function(e){
   	var x = event.target;
   	var rClickSquareId = x.id;
   	var rClickSquareId = Number(rClickSquareId.slice(1));

   	if(squareArray[rClickSquareId].clickedStatus != "clicked"){
   		if($(x).html() === ""){
   			$(x).html("X");
   		} else if($(x).html() === "X"){
   			$(x).html("?");
   		} else if ($(x).html() === "?"){
				$(x).html("");
   		}
 		}
   	return false;
	});



}