        "use strict";
        var background = new Image();
        background.src = "back.png"; //background image
        var acanvas = document.getElementById('acanvas');
        var context = acanvas.getContext('2d');
        var Color = net.brehaut.Color;
        var mouseX,mouseY;

        const BALL_S = acanvas.width*acanvas.height/55555; //ball size
        const BALL_MOV = 8; //ball speed
        const COLLISION_OFFSET = 5; //compression on collision
        const FPS = 60; //redraw frequency
        const BALL_TRAIL = 6; //trail length
        const DEFLECTIONS = [1.4,1.3,1.2,1.1,1]
        var ball_movx = BALL_MOV;
        var ball_movy = BALL_MOV;
        var ballX = acanvas.width/2-BALL_S/2;
        var ballY = acanvas.height/2-BALL_S/2;
        var ball_comp = [
            // {color:'#51D6FF', arc_start:0, arc_end:360, rotation_speed:0, size_offset:0,rotaion:0},
            {color:'#E51A00', arc_start:0, arc_end:120, rotation_speed:3, size_offset:0,rotaion:0},
            {color:'#88FF51', arc_start:125, arc_end:240, rotation_speed:3, size_offset:0,rotaion:0},
            {color:'#51D6FF', arc_start:245, arc_end:360, rotation_speed:3, size_offset:0,rotaion:0},
        ];
        var ball_draw = true,ball_paint = true;//!draw-> stops movment !paint->stops paint

        const MISS_FOR = 3;
        var allMisses = [];

        const DASH_W = acanvas.width/1000;
        const DASH_H = acanvas.height/20;
        const DASH_GAP = acanvas.height/45;

        const BAR_WIDTH = acanvas.width/65;
        const BAR_HEIGHT = acanvas.height/4;
        const BAR_COLOR = Color('#FFFFFF').setAlpha(0.8);
        var lbarX=0, lbarY=-BAR_HEIGHT/2;
        var rbarX=acanvas.width - BAR_WIDTH, rbarY=-BAR_HEIGHT/2, rbar_movY=4;

        var lbar_speed = 1,rbar_speed = 1;

        var drawMiss = function(x, y) {
            var inst = this;
            inst.x = Number(x);
            inst.y = Number(y);
            setTimeout(function(){
                allMisses.splice(allMisses.indexOf(inst), 1);
            },1000*MISS_FOR);
        };


        window.onload = function() {
            bindEvents();            
            setInterval(function() {
                drawAll();
                updatePositons();
            },1000/FPS);
            var lbarY_old = lbarY;
            var rbarY_old = rbarY;
            setInterval(function(){
            lbar_speed = Math.round((lbarY_old-lbarY)/acanvas.height*10)/10;
            lbarY_old = lbarY;
            rbar_speed = Math.round((rbarY_old-rbarY)/acanvas.height*10)/10;
            rbarY_old = rbarY;
            },10000/FPS);
        }
        function bindEvents()  {
        acanvas.addEventListener('mousemove',function(event) {
            mouseX = event.clientX;
            mouseY = event.clientY;
        });
        }

        function updatePositons() {
            //LPlayer mouse input
            mouseY && (lbarY = mouseY - BAR_HEIGHT/2);
            //RPlayer logic call
            rbarY = cpuPlaysR();
            if(ball_draw) {
                //ball diflection from canvas edge
                if(ballY >= acanvas.height-BALL_S-COLLISION_OFFSET || ballY <= BALL_S+COLLISION_OFFSET) {
                    ball_movy = -ball_movy;
                }
                if(ballX >= acanvas.width-BALL_S-COLLISION_OFFSET || ballX <= BALL_S+COLLISION_OFFSET) {
                    ball_movx = -ball_movx;
                }
                //ball diflection from bars
                var lbarCF = 2*Math.abs(ballY-lbarY-BAR_HEIGHT/2)/BAR_HEIGHT;
                var rbarCF = 2*Math.abs(ballY-rbarY-BAR_HEIGHT/2)/BAR_HEIGHT;
                if ((ballX < lbarX+BAR_WIDTH+BALL_S+COLLISION_OFFSET && lbarCF <= 1)||
                    (ballX > rbarX-BALL_S-COLLISION_OFFSET && rbarCF <= 1)) {
                    var deflection = getDeflection(ballX < BAR_WIDTH+BALL_S+COLLISION_OFFSET? lbarCF: rbarCF, ballX < BAR_WIDTH+BALL_S+COLLISION_OFFSET? lbar_speed: rbar_speed);
                    ball_movx =  ball_movx*deflection.X;
                    ball_movy =  ball_movy*deflection.Y;
                    console.log(deflection);
                }
                //recenter ball on miss
                else if(ballX <= lbarX+BAR_WIDTH+BALL_S+COLLISION_OFFSET
                 || ballX >= rbarX-BALL_S-COLLISION_OFFSET
                 ) {
                    ball_draw = false;
                    ball_paint = false;
                    allMisses.push(new drawMiss(ballX+ball_movx, ballY+ball_movy));
                    setTimeout(resetBall,500);
                }
                ballX += ball_movx;
                ballY += ball_movy;
            }
            function getDeflection(barCF, speed) {
                var factor;
                var coefficent = Math.round(barCF*10)/10;
                switch (coefficent) {
                    case 0:
                        factor = DEFLECTIONS[4]; break;
                    case 1:
                        factor = DEFLECTIONS[0]; break;
                    case 0.9: case 0.8: case 0.7:
                        factor = DEFLECTIONS[1]; break;
                    case 0.6: case 0.5: case 0.4: case 0.3:
                        factor = DEFLECTIONS[2]; break;
                    default:
                        factor = DEFLECTIONS[3];
                }
                return {X:-1, Y:(factor+Math.abs(speed)) * ((Math.abs(ball_movy)/ball_movy)*(Math.abs(speed)/speed)> -1?-1:1)};
            }
            function cpuPlaysR() {
                if (rbarY+BAR_HEIGHT/2 > acanvas.height || rbarY < -BAR_HEIGHT/2)
                rbar_movY = -rbar_movY;
                return rbarY+rbar_movY;
            }
            function resetBall() {
                ballX = acanvas.width/2-BALL_S/2;
                ballY = acanvas.height/2-BALL_S/2;
                if(Math.abs(ball_movy)<2) // get random mov when movy too low.
                    ball_movy += (Math.floor(Math.random() * BALL_MOV*DEFLECTIONS[0]) -BALL_MOV*DEFLECTIONS[0])*(Math.abs(ball_movy)/ball_movy);
                ball_paint = true;
                setTimeout(function(){
                ball_movy = ball_movy/1.2;
                ball_draw = true;
                },500);
            }
        }

//All Draw logic goes below
        function drawAll() {
            // context.drawImage(background,0,0,background.width,background.height,0,0,acanvas.width,acanvas.height); 
            // context.fillStyle = Color('#FFFFFF').setAlpha(0.2);
            // context.fillRect(0,0,acanvas.width,acanvas.height);
            context.fillStyle = Color('#080219');
            context.fillRect(0,0,acanvas.width,acanvas.height);

            context.fillStyle = '#FFFFFF';
            for (var i=0;i<acanvas.height;i+=DASH_H+DASH_GAP)
            context.fillRect(acanvas.width/2-DASH_W,i,DASH_W,DASH_H);

            context.fillStyle = Color('#000000').setAlpha(0); //Color: setting draw over to 0 alpha.
            ball_paint && drawBall(Number(BALL_TRAIL));
            drawLBars();
            if(allMisses.length !=0) {
                allMisses.forEach(function(amiss){
                    amiss.draw();
                });
            }
        }

        function drawBall(ball_trail,x=0,y=0) {
            if(ball_trail != 0) {
                ball_trail--;
                var trail_index = (BALL_TRAIL-ball_trail)/2;
                drawBall(ball_trail,trail_index*ball_movx,trail_index*ball_movy);
            }
            ball_comp.forEach(function(arcObj)  {
                context.fillStyle = Color(arcObj.color).setAlpha(1/trail_index).setLightness(1/trail_index);
                context.beginPath();
                context.arc(ballX-x, ballY-y, BALL_S+arcObj.size_offset, (Math.PI*(arcObj.arc_start+arcObj.rotaion))/180, (Math.PI*(arcObj.arc_end+arcObj.rotaion))/180);
                context.lineTo(ballX-x, ballY-y);
                context.closePath();
                context.fill();
                if(trail_index == 1) {
                    arcObj.rotaion += arcObj.rotation_speed;
                }
            });
        }

        function drawLBars() {
            context.fillStyle = BAR_COLOR;
            context.fillRect(lbarX, lbarY, BAR_WIDTH,BAR_HEIGHT);
            context.fillRect(rbarX,rbarY,BAR_WIDTH,BAR_HEIGHT);
        }

        drawMiss.prototype.draw = function() {
            var inst = this;
            ball_comp.forEach(function(arcObj)  {
                context.fillStyle = Color('red').setAlpha(0.4).setLightness(0.8);
                context.beginPath();
                context.arc(inst.x, inst.y, 2*(BALL_S+arcObj.size_offset), (Math.PI*(arcObj.arc_start-10))/180, (Math.PI*(arcObj.arc_end+10))/180);
                context.lineTo(inst.x, inst.y);
                context.closePath();
                context.fill();
        });
    };