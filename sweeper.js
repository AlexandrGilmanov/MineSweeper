
var board;
 
//���� 
 
var Board = function(w, h, m, canvas) {
    var settings = {
	"width": w,
	"height": h, 
	"mines": m,
	"overlay": true,
	"canvas": canvas
    };
    
    Board.prototype.construct = function() {
	this.firstMove = true;
	
	
	this.OUT_OF_BOUNDS = -99;

	
	this.HIDDEN = 0;
	this.VISIBLE = 1;
	this.FLAG = 2;
	
	
	this.MINE = -1;
	this.CLEAR = 0;
	
	if(this.getCtx() === null) {	    
	    console.debug("'" + settings.canvas + "'" + 
			  " isn't a valid canvas element");
	    return;
	}
	
	bindEvents(settings.canvas);
	this.newGame();
    };


// ������    

    /**
     * ������ ����
     */
    Board.prototype.newGame = function() {
	firstMove = true;
	this.generateBoard();
	this.generateOverlay();
	this.findAdjacents();

	this.redraw();
    };

    /**
     * ���������
     */
    Board.prototype.generateOverlay = function() {
	var o = [];
	for(var i = 0; i < settings.height; i++) {
	    o[i] = [];
	    for(var j = 0; j < settings.width; j++) {
		o[i][j] = this.HIDDEN;
	    }
	}

	this.overlay = o;
    };

    /**
     * �������� ���� ���
     */ 
    Board.prototype.generateBoard = function() {
	var blocks = [];
	var board = [];
	var m = settings.mines;

	for(var i = 0; 
	    i < settings.width * settings.height; i++) {
	    if(m > 0) {
		blocks.push(this.MINE);
	    } else {
		blocks.push(this.CLEAR);
	    }
	    m--;
	}


	for(i = 0; i < settings.height; i++) {
	    board[i] = [];
	    for(var j = 0; j < settings.width; j++) {
		board[i][j] = 
		    blocks.splice(Math.random() * blocks.length, 1)[0];
	    }
	}
	this.board = board;
    };

 
    Board.prototype.findAdjacents = function() {
	for(var i = 0; i < this.board.length; i++) {
	    for(var j = 0; j < this.board[i].length; j++) {

		if(this.board[i][j] >= 0) {
		    var as = adjacent(i,j);
		    for(var k in as) {
			if(this.board[as[k].x][as[k].y] === this.MINE) {
			    this.board[i][j]++;
			}
		    }
		}
	    }
	}
    };

    /**
     * ������ ����
     */ 
    Board.prototype.printBoard = function() {
	var b = [];
	for(var i in this.board) {
	    b[i] = [];
	    for (var j in this.board[i]) {
		if(this.board[i][j] === this.MINE) {
		    b[i][j] = "*";
		} else {
		    b[i][j] = this.board[i][j];
		}
		
	    }
	    b[i] = b[i].join(" ");
	}
    };

    /**
     * ������ ���������
     */
    Board.prototype.printOverlay = function () {
	var b = [];
	for(var i in this.overlay) {
	    b[i] = [];
	    for (var j in this.overlay[i]) {
		switch(this.overlay[i][j]) {
		case this.HIDDEN:
		    b[i][j] = "#";
		    break;

		case this.VISIBLE: 
		    b[i][j] = " ";
		    break;
		    
		case this.FLAG:
		    b[i][j] = "F";
		    break;
		    
		}
	    }
	    b[i] = b[i].join(" ");
	}
    };

    /**
     * ���������� true ���� ������
     */ 
    Board.prototype.winCondition = function() {
	if(this.loseCondition()) {
	    return false;
	}
	
	for(var i = 0; i < this.overlay.length; i++) {
	    for(var j = 0; j < this.overlay[i].length; j++) {
		if(this.overlay[i][j] === this.HIDDEN && 
		   this.board[i][j] >= 0) {
		    return false;
		}
	    }
	}
	return true;
    };

    /** 
     * ���������� true ���� ���������
     */ 
    Board.prototype.loseCondition = function() {
	for(var i = 0; i < settings.height; i++) {
	    for(var j = 0; j < settings.width; j++) {
		if(this.overlay[i][j] === this.VISIBLE && 
		   this.board[i][j] === this.MINE) {
		    return true;
		}
	    }
	}
	return false;
    };
    
    /**
     * ����� 
     */
    Board.prototype.flag = function(x,y) {
	if(this.overlay[x][y] === this.HIDDEN) {
	    this.overlay[x][y] = this.FLAG;
	} else if(this.overlay[x][y] === this.FLAG) {
	    this.overlay[x][y] = this.HIDDEN;
	}

	this.redraw();
    };
    
    Board.prototype.solve = function() {
	for(var i = 0; i < settings.height; i++) {
	    for(var j = 0; j < settings.width; j++) {
		this.overlay[i][j] = 
		    this.board[i][j] === this.MINE ? this.FLAG : this.VISIBLE;
		
	    }
	}

	this.redraw();
    };

    Board.prototype.gameRules = function() {
	if(this.loseCondition()) {
	    alert("YOU LOSE!");
	    this.newGame();

	} else if (this.winCondition()) {
	    alert("YOU WON! CONGRATULATIONS!");
	    this.newGame();
	}
    };

    Board.prototype.flipVisible  = function (x,y) {
	var as = adjacent(x,y);
	var nearFlags = 0;
	for(var i in as) {
	    if(this.overlay[as[i].x][as[i].y] === this.FLAG) {
		nearFlags++;
	    }
	}
	
	if(nearFlags === this.board[x][y]) {
	    for(i in as) {
		if(this.overlay[as[i].x][as[i].y] === this.HIDDEN) {
		    this.flip(as[i].x, as[i].y);
		}
	    }
	}
    };

    /**
     * �� ������������
     */
    Board.prototype.flipHidden = function(x,y) {
	var p = {"x": x, "y": y};
	var as = [];
	while(p !== undefined) {
	    if(this.board[p.x][p.y] === this.CLEAR && 
	       this.overlay[p.x][p.y] === this.HIDDEN) {
		var newAs = adjacent(p.x, p.y);
		
		for(var pos = newAs.pop(); pos !== undefined; 
		    pos = newAs.pop()) {
		    if(this.overlay[pos.x][pos.y] === this.HIDDEN) {
			as.push(pos);
		    }
		}
	    }

	    this.overlay[p.x][p.y] = this.VISIBLE;
	    p = as.pop();
	}
    };

    /**
     * ���������� �����
     */ 
    Board.prototype.flip = function (x,y) {
	if(this.board[x][y] === this.MINE && this.firstMove) {
	    this.newGame();
	    return this.flip(x,y);

	} else {
	    this.firstMove = false;
	}

	if(this.overlay[x][y] === this.FLAG) {
	    return;
	}
	
	if(this.overlay[x][y] === this.VISIBLE) {
	    this.flipVisible(x,y);
	} else if(this.overlay[x][y] === this.HIDDEN) {
	    this.flipHidden(x,y);
	}
	
	this.redraw();
	this.gameRules();
    };

    /**
     * ����������� �������� ��������� ������
     */ 
    Board.prototype.getCtx = function(){
	var canvas = document.getElementById(settings.canvas);
	if(canvas === null || canvas.getContext === undefined) {
	    return null;
	} 
	return canvas.getContext("2d");
    };


    /**
     * �������������� ��� �����
     */ 
    Board.prototype.redraw = function (){
	var c = this.getCtx();
	c.clearRect(0, 0, settings.width*20, settings.height*20);
	this.drawGrid();
	this.drawBoxes();
    };

    /**
     * ������ �����
     */
    Board.prototype.drawGrid = function(){
	var c = this.getCtx();
	var line = function(x,y, x2,y2) {
	    c.moveTo(x,y);
	    c.lineTo(x2,y2);
	};

	
	c.strokeStyle = "black";
	c.lineWidth = 2;
	c.beginPath();
	
	for(var i = 0; i <= settings.height; i++) {
	    line(0, i*20, settings.width*20, i*20);
	}

	for(i = 0; i <= settings.width; i++) {
	    line(i * 20, 0, i * 20, settings.height * 20);
	}
	
	c.closePath();
	c.stroke();
    };
    
    /**
     * ������ ����� �� �����
     */
    Board.prototype.drawBoxes = function (hideOverlay){
	var c = this.getCtx();
	for(var i = 0; i < settings.height; i++) {
	    for(var j = 0; j < settings.width; j++) {
		c.fillStyle = "rgba(0,0,255, 0.3)";
		c.font = "bold 20px verdana";
		
		if(this.overlay[i][j] !== this.VISIBLE) {
	    	    c.fillRect(j*20 + 1, i*20 + 1, 19, 19);
		    if(this.overlay[i][j] === this.FLAG) {
			c.fillStyle = "red";
			c.fillText("F", j*20 + 3, i*20 + 17, 15);
		    }

		} else if(this.board[i][j] === this.MINE) {
		    c.fillStyle = "black";
		    c.fillText("#", j*20 + 3, i*20 + 17, 15);

		} else if (this.board[i][j] > 0){
		    switch(this.board[i][j]) {
		    case 1: c.fillStyle = "blue"; break;
		    case 2: c.fillStyle = "green"; break;
		    case 3: c.fillStyle = "red"; break;
		    case 4: c.fillStyle = "purple"; break;
		    case 5: c.fillStyle = "maroon"; break;
		    case 6: c.fillStyle = "turquoise"; break;
		    case 7: c.fillStyle = "black"; break;
		    case 8: c.fillStyle = "gray"; break;
		    }
		    c.fillText(this.board[i][j], j*20 + 3, i*20 + 17, 15);
		}
	    }
	}
    };

    // ��������� 
	
    var exists = function() {
	if(arguments.length == 1) {
	    x = arguments[0].x;
	    y = arguments[0].y;

	} else if(arguments.length == 2) {
	    x = arguments[0];
	    y = arguments[1];

	} else {
	    return false;
	}

	return y >= 0 && y < settings.width && 
	    x >= 0 && x < settings.height;
    };
    
    /**
     * ��������� ��������� ���� � ������� ���������
     */
    var getMousePos = function (e) {
	return {
	    y: Math.floor((e.pageX - e.target.offsetLeft) / 20), 
	    x: Math.floor((e.pageY - e.target.offsetTop) / 20)
	};
    };
    
    
    var pos = function(x,y) {return {'x':x, 'y':y};};

    /**
     * ������� ��� ������ ������� ������, �� �� ������� (x, y)
     */
    var adjacent = function (x,y) {
	var existing = [];
	var ps = [{x: x-1, y: y-1}, {x: x-1, y: y}, {x: x-1, y: y+1},
		{x: x,   y: y-1}, {x: x,   y: y+1},
		{x: x+1, y: y-1}, {x: x+1, y: y}, {x: x+1, y: y+1}];

	for(var i in ps) {
	    if(exists(ps[i])) {
		existing.push(ps[i]);
	    } 
	}

	return existing;
    };

    // �������
    var events = {
	mouseout: function (e) {
	    var p = getMousePos(e);
	},
	mousemove: function (e){
	    var p = getMousePos(e);
	},
	click: function(e) {
	    var p = getMousePos(e);
	    switch (event.button) {
	    case 2: 
		p = getMousePos(e);
		board.flag(p.x, p.y);
		break;
	    case 0:
		e.preventDefault();
		board.flip(p.x, p.y);
		break;
	    } 
	}
    };
	
    bindEvents = function(canvas){
	var c = document.getElementById(canvas);
	c.oncontextmenu = function() {return false;};
	c.onmousedown = events.click;
	c.onmousemove = events.mousemove;
	c.onmouseout = events.mouseout;   

    };

    this.construct();
};


// main ----------------------------------------------------------------------

window.onload = function() {
    board = new Board(30, 16, 99, "canvas");
};