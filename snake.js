if(!window.App) {
	App = {};
}
if(!App.game){
	App.game = {};
}

$(function() {

	let snakeApp = new App.game.Snake();

	snakeApp.init();

});

/**
 * @brief 스네이크 게임 ( 프로젝트2팀 자바스크립트 스터디 결과물 )
 * @author : jsbeak
 * @date : 2022-06-21
 * @version : 0.1
 */
App.game.Snake = function() {

	let self,countUp,direction;

    const canvas = document.getElementById('snake')
    const ctx = canvas.getContext('2d') // 렌더링 컨텍스트를 다룰 수 있게 해준다.
    const blockSize = 25, gameSize = 17

    // 뱀 이미지
    const snakeImg = new Image();
    snakeImg.src = 'snake-graphics.png';

    // 뱀 이미지 크롭 사이즈 
    let tx = 0;
    let ty = 0;

    // 소리
    let soundEffect = new Audio('sound.mp3');

    const appleColor = '#FF6464'
    const snakeColor = '#EEEEEE'

    // 위치를 저장하는 변수
    let snakeX=snakeY=2 // 뱀위치 
    let appleX=appleY=0
    let interval ;
    let newApply = true ; // 사과를 먹어서 새로운 사과가 필요한지
    let eatAppleCnt = 1; // 먹은 사과 개수   

    let snakeHistory // 뱀 이동 좌표 
    let snakeHead // 뱁머리 좌표



    let playBtn = document.getElementById('play-btn');


    return {

        init : function(){

            self = this;
            
            //----------------------------------------
            // 점수 계산
            //----------------------------------------
            self.initCountUp();

            //----------------------------------------
            // 게임 시작 버튼 클릭 시 
            //----------------------------------------
            playBtn.addEventListener('click' , (e) => {            
                self.initGame() // 게임 초기세팅 / 초기화
            });    

        },

        /**
         * @brief countUp 플러그인 초기화
         */
        initCountUp : function(){
            countUp = new CountUp('total-count', 0, 0)
            countUp.start()
        },

        /**
         * @brief 초기 설정값 셋팅
         */
        initGame : function(){
            
            snakeX=snakeY=2 // 뱀위치 
            appleX=appleY=0
            newApply = true ; // 사과를 먹어서 새로운 사과가 필요한지
            eatAppleCnt = 1; // 먹은 사과 개수   
            
            snakeHistory = [{
                x  : 2, 
                y  : 2
            }];
            direction = 'R' ; 

            //----------------------------------------
            // 방향키 이벤트리스너
            //----------------------------------------
            document.addEventListener("keydown", self.keyControll )
                
            //----------------------------------------
            // 1초에 10번 인터벌 설정   ( 1000ms 가 1초 )
            //----------------------------------------
            interval = setInterval(self.gameStart , 1000 / 10 ) 

        },

        /**
         * @brief 게임 화면(canvas)을 초기화 - 인터벌 셋팅된 시간마다(프레임이 자연스럽게 보임)
         */
        clearScreen : function(){
            
            ctx.clearRect( 0,0,canvas.width,canvas.height )

        },


        /**
         * @brief 게임 시작
         */
        gameStart : function(){
            
            //----------------------------------------
            // canvas 화면 초기화
            //----------------------------------------
            self.clearScreen();

            //----------------------------------------
            // 사과 그리기
            //----------------------------------------
            self.drawApple();   

            //----------------------------------------
            // 뱀 그리기 
            //----------------------------------------
            self.drawSnake()

            //----------------------------------------
            // 뱀의 머리가 몸통에 닿으면 게임 오버 
            //----------------------------------------
            if( snakeX < 0 || snakeX > ( gameSize -1 ) || snakeY < 0 || snakeY > ( gameSize - 1 ) ){   
                self.gameOver();
            }
        },

        /**
         * @brief 화면에 사과 생성
         */
        drawApple : function(){
            
            //----------------------------------------
            // 사과를 먹으면 새로운 사과를 생성
            //----------------------------------------
             if(  ( appleX== 0 && appleY == 0 ) || self.eatAppleYn() ){
                
                self.getRandomApple();
                if( appleX ==0 && appleY == 0 ){
                    // 시작시 겹치지 않게
                    self.drawApple();
                }
            }

            ctx.drawImage(snakeImg, 
                            0 * 64,
                            3 * 64,
                            64,
                            64,
                            appleX * blockSize , appleY * blockSize , blockSize , blockSize );


        },

        /**
         * @brief 화면에 뱀 그리기/ 뱀이 지나가고 있는 좌표에 뱀을 그려준다.
         */
        drawSnake : function(){

            // 뱀이 한 방향으로 자동으로 움직이게
            self.snakeAutoMove()

            snakeHistory.push({
                x : snakeX , 
                y : snakeY  
            })

            while( snakeHistory.length >  ( eatAppleCnt   + 1 ) ){    
                snakeHistory.shift()
            }

            // 뱀머리 좌표
            snakeHead = snakeHistory[0]
            ctx.fillStyle = snakeColor


            //----------------------------------------
            // 뱀 이미지파일 적용 
            //----------------------------------------
            for( let i =0; i< snakeHistory.length; i++ ){
                
                // 뱀의 머리가 몸통을 지나갈 수 없게
                if( i != 0 &&  snakeHead.x == snakeHistory[i].x && snakeHead.y == snakeHistory[i].y  ){
                    self.gameOver();
                }    

                var segment = snakeHistory[i];
                var segx = segment.x;
                var segy = segment.y;    
                var tx = 0;
                var ty = 0;
 
                if (i == 0) {
                    //----------------------------------------
                    // 뱀 머리
                    //----------------------------------------
                    var pseg = snakeHistory[i+1]; // Next segment
                    if( pseg == null  ){
                        pseg = snakeHistory[i];    
                    }
                    
                    if (pseg.y < segy) {
                        // Up
                        tx = 3; ty = 2;
                    } else if (pseg.x > segx) {
                        // Right
                        tx = 4; ty = 2;
                    } else if (pseg.y > segy) {
                        // Down
                        tx = 4; ty = 3;
                    } else if (pseg.x < segx) {
                        // Left
                        tx = 3; ty = 3;
                    }

                } else if (i == snakeHistory.length-1) {
                    //----------------------------------------
                    // 뱀 꼬리
                    //----------------------------------------
                    var nseg = snakeHistory[i-1]; // Prev segment
                    
                    if (segy < nseg.y) {
                        // Up
                        tx = 3; ty = 0;
                    } else if (segx > nseg.x) {
                        // Right
                        tx = 4; ty = 0;
                    } else if (segy > nseg.y) {
                        // Down
                        tx = 4; ty = 1;
                    } else if (segx < nseg.x) {
                        // Left
                        tx = 3; ty = 1;
                    }

                } else {
                    //----------------------------------------
                    // 뱀 몸통
                    //----------------------------------------
                    var pseg = snakeHistory[i-1]; // Previous segment
                    var nseg = snakeHistory[i+1]; // Next segment
                    if (pseg.x < segx && nseg.x > segx || nseg.x < segx && pseg.x > segx) {
                        // Horizontal Left-Right
                        tx = 1; ty = 0;
                    } else if (pseg.x < segx && nseg.y > segy || nseg.x < segx && pseg.y > segy) {
                        // Angle Left-Down
                        tx = 2; ty = 0;
                    } else if (pseg.y < segy && nseg.y > segy || nseg.y < segy && pseg.y > segy) {
                        // Vertical Up-Down
                        tx = 2; ty = 1;
                    } else if (pseg.y < segy && nseg.x < segx || nseg.y < segy && pseg.x < segx) {
                        // Angle Top-Left
                        tx = 2; ty = 2;
                    } else if (pseg.x > segx && nseg.y < segy || nseg.x > segx && pseg.y < segy) {
                        // Angle Right-Up
                        tx = 0; ty = 1;
                    } else if (pseg.y > segy && nseg.x > segx || nseg.y > segy && pseg.x > segx) {
                        // Angle Down-Right
                        tx = 0; ty = 0;
                    }
                }

                ctx.drawImage(snakeImg, 
                            tx *64,
                            ty*64,
                            64,
                            64,
                            snakeHistory[i].x * blockSize , snakeHistory[i].y * blockSize , blockSize , blockSize );
            }
            
        },


        /**
         * @brief 한 방향으로 뱀이 자동이동하도록 뱀의 x,y좌표값을 설정
         * 
         */
        snakeAutoMove : function(){

            // --------------------------------------------------------
            // 방향 ( 처음 시작방향은 오른쪽 )
            // 'R' : 오른쪽 
            // 'L' : 왼쪽
            // 'U' : 위로
            // 'D' : 아래로
            // --------------------------------------------------------
            switch(direction){
                // 왼쪽
                case 'L':    
                    snakeX -= 1
                    snakeY += 0
                    break;
                // 위    
                case 'U':
                    snakeX += 0
                    snakeY -= 1
                    break;    
                // 오른쪽    
                case 'R':
                    snakeX += 1
                    snakeY += 0
                    break;    
                // 아래     
                case 'D':
                    snakeX += 0
                    snakeY += 1
                    break;    
            }   
        },


        /**
         * @brief 뱀이 사과를 먹었는지 체크
         * @return true/false
         */
        eatAppleYn : function(){

            if( snakeX == appleX && snakeY == appleY ) {
                // 비얌이 사과를 먹었으면 
                // 먹은 사과 개수 + 1
                soundEffect.play(); 
                eatAppleCnt += 1;
                 
                self.score( eatAppleCnt );
 
                return true;      
             }
             return false;

        },

        /**
         * @brief 게임사이즈 안에서 숫자 랜덤 생성
         */
        getRandom : function(){
            return Math.floor( Math.random() * gameSize )
        },

        /**
         * @brief 사과를 먹을경우 토탈 점수 
         * @param {*} eatCount 
         */
        score : function(eatCount){
            countUp.update( 100 * eatCount );
        },

        /**
         * @brief 사괴위치를 랜덤으로 생성
         */
        getRandomApple : function(){

            appleX = self.getRandom()
            appleY = self.getRandom()
            
            snakeHistory.forEach( snake => function(){
                // 뱀이 이동하고 있는 길에 사과가 생성되면 사과 좌표 다시 생성
                if( snake.x == appleX && snake.y == appleY ){
                   self.getRandomApple()
                }     
            })

        },

        /**
         * 키보드 조작시
         * @param {*} event 
         */
        keyControll : function(event){

            switch(event.keyCode){
                
                case 37:            // 왼쪽
                    if( direction != 'R'){
                        direction = 'L' 
                    }
                    break;
                
                case 38: // 위    
                    if( direction != 'D'){
                        direction = 'U' 
                    }
                    break;    
                
                case 39: // 오른쪽    
                    if( direction != 'L'){
                        direction = 'R' 
                    }
                    break;    
                
                case 40: // 아래     
                    if( direction != 'U'){    
                        direction = 'D' 
                    }    
                    break;    
            }
        },


        /**
        * @brief 게임종료
        */
        gameOver : function(){
            alert('G A M E O V E R !! ')
            clearInterval(interval)
            return;
        }

    }

}