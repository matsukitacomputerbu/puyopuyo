const SCREEN_W = 240;
const SCREEN_H = 480;

const GAMEOVER = false;

const PLUS =true;
const MINUS =false;

// CreateSphere用配列番号
// ctx,color,x,y,size
const CTX = 0;
const COLOR = 1;
const X = 2;
const Y = 3;
const SIZE = 4;

const MATH_X = 0;
const MATH_Y = 1;
const MATH_STATUS = 2;
const MATH_COLOR = 3;

const MATH_CHECK = 4;
const MATH_LOST_FLG = 5;

let count = 0;

let COLOR_ARRAY = [];

const BLUE_COLOR_SET = ["aqua","aquamarine","aliceblue"];
const GREEN_COLOR_SET = ["chartreuse","aquamarine","aliceblue"];
const RED_COLOR_SET = ["crimson","indianred","aliceblue"];
const YELLOW_COLOR_SET = ["yellow","palegoldenrod","aliceblue"];

const BLUE = 0;
const GREEN = 1;
const RED = 2;
const YELLOW = 3;

COLOR_ARRAY.push(BLUE_COLOR_SET,GREEN_COLOR_SET,RED_COLOR_SET,YELLOW_COLOR_SET);

let i;
let j;


let ctx;
let run = true;

// 開発時デバッグ用フラグ
let debug = false;

let fall_count = 0;
let fall_timing = 50;

let py_size = 17;

let py_array_1 = [];
let py_array_2 = [];

let py_list = [];
let fall_flg = false;
let fall_one = false;
let load_flag = true;

let math_list=[];
let color_code = 0;

let under_key_flg = false;
let r_rotate_possible_1 = false;
let r_rotate_possible_2 = false;
let l_rotate_possible_1 = false;
let l_rotate_possible_2 = false;

let r_move_flg = false;
let l_move_flg = false;

// 横
let py_beside = false;
// 縦
let py_vertical = false;

let left_end = false;
let right_end = false;

let adjacent_check = false;
let py_lost_flg = false;


let random_number;

for(i=SCREEN_H-20;i>=20;i=i-40){
    for(j=20;j<=20+40*5;j=j+40){
        math_list.push([j,i,false,color_code,adjacent_check,py_lost_flg]);
    }
}


//---------------------
// 画面起動時
//---------------------

window.addEventListener("DOMContentLoaded", function MainSystem(){
    
    if(debug){

        let test;
        // エレメント関連（index.html Pタグ取得）
        test = document.getElementById('info');
        // HTMLを更新
        // Pタグ内の要素へ反映
        test.innerHTML = "py_beside";

    } 

    // htmlの要素取り込み
    let mainscreen = document.getElementById('mainscreen');
    mainscreen.width = SCREEN_W;
    mainscreen.height = SCREEN_H;

    // コンテキスト取得
    ctx = mainscreen.getContext('2d');        

    if(py_list.length != 0){
        fall_count++;
    }


    // 新規落ちぷよ作成
    if(load_flag){
                    
        random_number = Math.floor( Math.random() * 4 );   
        py_array_1.push([ctx,COLOR_ARRAY[random_number][0],100,20,py_size]);
        py_array_1.push([ctx,COLOR_ARRAY[random_number][1],100-py_size/3,20-py_size/3,py_size/3]);
        py_array_1.push([ctx,COLOR_ARRAY[random_number][2],100-py_size/3,20-py_size/3,py_size/5]);
        py_list.push(new ArrayManagement(py_array_1,true,true,random_number));
                        
        random_number = Math.floor( Math.random() * 4 );   
        py_array_2.push([ctx,COLOR_ARRAY[random_number][0],100,60,py_size]);
        py_array_2.push([ctx,COLOR_ARRAY[random_number][1],100-py_size/3,60-py_size/3,py_size/3]);
        py_array_2.push([ctx,COLOR_ARRAY[random_number][2],100-py_size/3,60-py_size/3,py_size/5]);
        py_list.push(new ArrayManagement(py_array_2,true,true,random_number));

        load_flag = false;

    }

    if(fall_count != 0 && fall_count % fall_timing == 0){
        fall_flg = true;
    }

    if(py_list.length == 2){

        // 縦横判定
        if(py_list[0].array[0][Y] == py_list[1].array[0][Y]){
            py_beside = true;
            py_vertical = false;
            
        }else if(py_list[0].array[0][X] == py_list[1].array[0][X]){
            py_beside = false;
            py_vertical = true;

        }

        // 両サイド判定
        if(py_beside){
            if(py_list[0].array[0][X] <= 0 + 20 || py_list[1].array[0][X] <= 0 + 20){
                left_end = true;
                
            }else if(py_list[0].array[0][X] >= SCREEN_W - 20 || py_list[1].array[0][X] >= SCREEN_W - 20){
                right_end = true;
                
            }else{
                left_end = false;
                right_end = false;

            }            

        }else if(py_vertical){
            
            if(py_list[0].array[0][X] <= 0 + 20 && py_list[1].array[0][X] <= 0 + 20){
                left_end = true;
                
            }else if(py_list[0].array[0][X] >= SCREEN_W - 20 && py_list[1].array[0][X] >= SCREEN_W - 20){
                right_end = true;
                
            }else{
                left_end = false;
                right_end = false;
            }            
        }
    }



    for(i=0;i<py_list.length;i++){

        // 落下先に障害物あり（底 or ぷよ）
        if(py_list[i].array[0][Y] >= SCREEN_H - 20 || MathStatus(py_list[i].array[0][X],py_list[i].array[0][Y] + 40)){
            py_list[i].fall = false;
            MathPuyoSet(py_list[i].array[0][X],py_list[i].array[0][Y],true,py_list[i].color);

            // 落下済みの要素を配列から消す
            py_list[i].array.splice( 0, py_list[i].array.length );
            py_list.splice( i, 1 );

        // 落下先に障害物なし
        }else{

            // 落ちフラグON
            if(py_list[i].fall){
            
                // 落ちタイミングON
                if(fall_flg){

                    // 下へ数値分移動
                    MoveTo40(i,Y,PLUS);

                    if(i==1){
                        fall_flg = false;
                    }   
                }
            }    

            for(j=0;j<py_list[i].array.length;j++){
                CreateSphere(py_list[i].array[j][CTX],py_list[i].array[j][COLOR],py_list[i].array[j][X],py_list[i].array[j][Y],py_list[i].array[j][SIZE]);
            }
        }
    }
    
    
    // 落ちぷよがすべて落下
    if(py_list.length == 0){
        lostCheck();
        count++;
        if(count > 20 && count < 25){
            MathLost();                    
        }else if(count >= 25){
            lostFall();
            count = 0;
            lostCheck();
            if(!MathLostFlag()){
                // gameOver();

                if(math_list[68][MATH_STATUS]){
                    run = GAMEOVER;
                }

                fall_one = false;
                load_flag = true;

            }   
        }                
    }

    // 片ぷよ落状態でない
    if(py_list.length == 2){

        // 落ちぷよ横移動判定
        // 横移動処理
        // 左壁判定 and 左ぷよ判定
        if(!left_end){
            
            if(l_move_flg){
                if(py_vertical){
                    if(py_list[0].array[0][Y] > py_list[1].array[0][Y]){
                        if(!MathStatus(py_list[0].array[0][X] - 40,py_list[0].array[0][Y])){

                            // 下へ数値分移動
                            MoveTo40(0,X,MINUS);
                            MoveTo40(1,X,MINUS);
                            
                        }
                    }else if(py_list[0].array[0][Y] < py_list[1].array[0][Y]){
                        if(!MathStatus(py_list[1].array[0][X] - 40,py_list[1].array[0][Y])){

                            // 下へ数値分移動
                            MoveTo40(0,X,MINUS);
                            MoveTo40(1,X,MINUS);


                        }   
                    }

                }else if(py_beside){
                    if(py_list[0].array[0][X] <= py_list[1].array[0][X]){
                        if(!MathStatus(py_list[0].array[0][X] - 40,py_list[0].array[0][Y])){

                            // 下へ数値分移動
                            MoveTo40(0,X,MINUS);
                            MoveTo40(1,X,MINUS);

                        }
                    }else if(py_list[0].array[0][X] >= py_list[1].array[0][X]){
                        if(!MathStatus(py_list[1].array[0][X] - 40,py_list[1].array[0][Y])){

                            // 下へ数値分移動
                            MoveTo40(0,X,MINUS);
                            MoveTo40(1,X,MINUS);
                            
                        }   
                    }
                }
            }
        }


        if(!right_end){
            if(r_move_flg){

                if(py_vertical){
                    if(py_list[0].array[0][Y] > py_list[1].array[0][Y]){
                        if(!MathStatus(py_list[0].array[0][X] + 40,py_list[0].array[0][Y])){

                            // 下へ数値分移動
                            MoveTo40(0,X,PLUS);
                            MoveTo40(1,X,PLUS);
                        }
                    }else if(py_list[0].array[0][Y] < py_list[1].array[0][Y]){
                        if(!MathStatus(py_list[1].array[0][X] + 40,py_list[1].array[0][Y])){

                            // 下へ数値分移動
                            MoveTo40(0,X,PLUS);
                            MoveTo40(1,X,PLUS);
                        }   
                    }
                }else if(py_beside){
                    if(py_list[0].array[0][X] >= py_list[1].array[0][X]){
                        if(!MathStatus(py_list[0].array[0][X] + 40,py_list[0].array[0][Y])){

                            // 下へ数値分移動
                            MoveTo40(0,X,PLUS);
                            MoveTo40(1,X,PLUS);
                        }
                    }else if(py_list[0].array[0][X] <= py_list[1].array[0][X]){
                        if(!MathStatus(py_list[1].array[0][X] + 40,py_list[1].array[0][Y])){

                            // 下へ数値分移動
                            MoveTo40(0,X,PLUS);
                            MoveTo40(1,X,PLUS);
                        }   
                    }
                }
            }
        }

        // 回転判定処理
        // 回転可能フラグON

        // 左壁判定 and 左ぷよ判定
        if(r_rotate_possible_1 && !MathStatus(py_list[0].array[0][X] + 40,py_list[0].array[0][Y] + 40)){
            for(j=0;j<py_list[0].array.length;j++){
                py_list[0].array[j][X] += 40;
                py_list[0].array[j][Y] += 40;
            }
        }
        if(r_rotate_possible_2 && !MathStatus(py_list[0].array[0][X] - 40,py_list[0].array[0][Y] + 40)){
            for(j=0;j<py_list[0].array.length;j++){
                py_list[0].array[j][X] -= 40;
                py_list[0].array[j][Y] += 40;
            }
            
        }
        
        // 右壁判定 and 右ぷよ判定
        if(l_rotate_possible_1 && !MathStatus(py_list[0].array[0][X] - 40,py_list[0].array[0][Y] - 40)){
            for(j=0;j<py_list[0].array.length;j++){
                py_list[0].array[j][X] -= 40;
                py_list[0].array[j][Y] -= 40;
            }
        }
        if(l_rotate_possible_2 && !MathStatus(py_list[0].array[0][X] + 40,py_list[0].array[0][Y] - 40)){
            for(j=0;j<py_list[0].array.length;j++){
                py_list[0].array[j][X] += 40;
                py_list[0].array[j][Y] -= 40;
            }    
        }
    }
        
    r_rotate_possible_1 = false;
    r_rotate_possible_2 = false;
    l_rotate_possible_1 = false;
    l_rotate_possible_2 = false;

    l_move_flg = false;
    r_move_flg = false;

    if(fall_one){
        fall_timing = 5; 

    }else if(under_key_flg){
        fall_timing = 5; 

    }else{
        fall_timing = 50;

    }

    // ステータスがONのぷよを常に表示
    MathPuyo();

    //イベントリスナ作成
    window.addEventListener('keydown', keyDown, true);
    window.addEventListener('keyup', keyUp, true);


    if(run){
        window.requestAnimationFrame(MainSystem);
    }else{
        let test;
        test = document.getElementById('info');
        test.innerHTML = "ばたんきゅ～";
    }

});


function MoveTo40(number,xy,code){
    // プラスはtrue,マイナスがfalse
    if(code){
        for(j=0;j<py_list[number].array.length;j++){
            py_list[number].array[j][xy]+=40;
        }
        
    }else if(!code){
        for(j=0;j<py_list[number].array.length;j++){
            py_list[number].array[j][xy]-=40;
        }

    }
}


function MathLost(){
    // alert(math_list);
    const LOST_X =0;
    const LOST_Y =1;

    let lost_array = [];

    for(let k=0;k<math_list.length;k++){
        if(math_list[k][MATH_LOST_FLG]){
            
            // lost_array.push([math_list[k][MATH_X],math_list[k][MATH_Y]]);
            math_list[k][MATH_STATUS] = false;
            // lostAnimation(math_list[k][MATH_X],math_list[k][MATH_Y]);

            math_list[k][MATH_LOST_FLG] = false;

        }
    }   
}

function MathPuyo(){

    for(let k=0;k<math_list.length;k++){
        if(math_list[k][MATH_STATUS]){
            if(math_list[k][MATH_COLOR] == BLUE){
                CreateSphere(ctx,COLOR_ARRAY[BLUE][0],math_list[k][MATH_X],math_list[k][MATH_Y],py_size);
                CreateSphere(ctx,COLOR_ARRAY[BLUE][1],math_list[k][MATH_X]-py_size/3,math_list[k][MATH_Y]-py_size/3,py_size/3);
                CreateSphere(ctx,COLOR_ARRAY[BLUE][2],math_list[k][MATH_X]-py_size/3,math_list[k][MATH_Y]-py_size/3,py_size/5);
            }
            if(math_list[k][MATH_COLOR] == GREEN){
                CreateSphere(ctx,COLOR_ARRAY[GREEN][0],math_list[k][MATH_X],math_list[k][MATH_Y],py_size);
                CreateSphere(ctx,COLOR_ARRAY[GREEN][1],math_list[k][MATH_X]-py_size/3,math_list[k][MATH_Y]-py_size/3,py_size/3);
                CreateSphere(ctx,COLOR_ARRAY[GREEN][2],math_list[k][MATH_X]-py_size/3,math_list[k][MATH_Y]-py_size/3,py_size/5);
            }
            if(math_list[k][MATH_COLOR] == RED){
                CreateSphere(ctx,COLOR_ARRAY[RED][0],math_list[k][MATH_X],math_list[k][MATH_Y],py_size);
                CreateSphere(ctx,COLOR_ARRAY[RED][1],math_list[k][MATH_X]-py_size/3,math_list[k][MATH_Y]-py_size/3,py_size/3);
                CreateSphere(ctx,COLOR_ARRAY[RED][2],math_list[k][MATH_X]-py_size/3,math_list[k][MATH_Y]-py_size/3,py_size/5);
            }
            if(math_list[k][MATH_COLOR] == YELLOW){
                CreateSphere(ctx,COLOR_ARRAY[YELLOW][0],math_list[k][MATH_X],math_list[k][MATH_Y],py_size);
                CreateSphere(ctx,COLOR_ARRAY[YELLOW][1],math_list[k][MATH_X]-py_size/3,math_list[k][MATH_Y]-py_size/3,py_size/3);
                CreateSphere(ctx,COLOR_ARRAY[YELLOW][2],math_list[k][MATH_X]-py_size/3,math_list[k][MATH_Y]-py_size/3,py_size/5);
            }
        }
    }   
}
function MathPuyoSet(py_x,py_y,status,color_code){

    for(let k=0;k<math_list.length;k++){
        if(math_list[k][MATH_X] == py_x && math_list[k][MATH_Y] == py_y){
            math_list[k][MATH_STATUS] = status;
            math_list[k][MATH_COLOR] = color_code;
        }
    }   
}
function MathStatus(py_x,py_y){

    for(let k=0;k<math_list.length;k++){
        if(math_list[k][MATH_X] == py_x && math_list[k][MATH_Y] == py_y){
            return math_list[k][MATH_STATUS];
        }
    }   
}

function MathLostFlag(){

    for(let k=0;k<math_list.length;k++){
        if(math_list[k][MATH_LOST_FLG]){
            return math_list[k][MATH_LOST_FLG];
        }
    }   
}




// 弾描画
function CreateSphere(ctx,color,x,y,radius){

    if(radius<0){
        radius = 0;
    }

    ctx.beginPath();
    ctx.fillStyle = color;                
    ctx.arc( x, y, radius, 0 * Math.PI / 180, 360 * Math.PI / 180, false ) ;
    ctx.fill();
}

// キーボード押下時
function keyDown(event){
    // キーコードを取得
    let ck = event.keyCode;
    // Escキーが押されていたらフラグを降ろす
    if(ck == 27){run = false; }
    if(ck == 38){

        if(py_list.length == 2){

            // 軸の中心が右端でない
            if(py_list[1].array[0][X] != SCREEN_W - 20){

                if(py_list[0].array[0][Y] < py_list[1].array[0][Y]){
                    r_rotate_possible_1 = true;   
                }else if(py_list[0].array[0][X] > py_list[1].array[0][X]){
                    r_rotate_possible_2 = true;
                }

            }

            // 軸の中心が左端でない
            if(py_list[1].array[0][X] != 20){

                if(py_list[0].array[0][Y] > py_list[1].array[0][Y]){
                    l_rotate_possible_1 = true;   
                }else if(py_list[0].array[0][X] < py_list[1].array[0][X]){
                    l_rotate_possible_2 = true;

                }
            }
        }    
    }

    if(ck == 40){under_key_flg = true;}
    if(ck == 39){r_move_flg = true;l_move_flg = false;}
    if(ck == 37){l_move_flg = true;r_move_flg = false;}

}

// キーボード押下時
function keyUp(event){
    // キーコードを取得
    let ck = event.keyCode;
    if(ck == 40){under_key_flg = false;}
    if(ck == 39){r_move_flg = false;}
    if(ck == 37){l_move_flg = false;}

}


function lostFall(){
    
    // 全ぷよ左下から右上の順で
    for(let k=0;k<math_list.length;k++){
        // ロスト起点ぷよ
        // ぷよ不在確認 and ロスト未チェック
        if(!math_list[k][MATH_STATUS]){
            
            // 一番上でない場合
            if(k < 66){
                
                if(math_list[k+6][MATH_STATUS]){
                    // alert();
                    
                    math_list[k+6][MATH_STATUS] = false;
                    math_list[k][MATH_STATUS] = true;
                    math_list[k][MATH_COLOR] = math_list[k+6][MATH_COLOR];

                }else{
                    lostFallSub(k+6);    
                }

            }

            function lostFallSub(k){

                if(!math_list[k][MATH_STATUS]){
                    
                    // 一番上でない
                    if(k < 66){
                        
                        if(math_list[k+6][MATH_STATUS]){
                            let fall_color = math_list[k+6][MATH_COLOR];
                            math_list[k+6][MATH_STATUS] = false;

                            if(k>=6){
                                while(!math_list[k-6][MATH_STATUS]){
                                    k=k-6;
                                    if(k<6){
                                        break;
                                    }   
                                }
                            }
                            math_list[k][MATH_STATUS] = true;
                            math_list[k][MATH_COLOR] = fall_color;
        
                        }else{
                            lostFallSub(k+6);
            
                        }
                    }
                }
            }   
        }    
    }
}

function lostCheck(){

    
    let target_color;

    //同色で隣り合っている数
    let adjacent_count = 0;

    // alert(math_list.length);

    // 全ぷよ左下から右上の順で
    for(let k=0;k<math_list.length;k++){
        // ロスト起点ぷよ
        // ぷよ存在確認 and ロスト未チェック
        if(math_list[k][MATH_STATUS] && !math_list[k][MATH_CHECK]){
            target_color = math_list[k][MATH_COLOR];
            adjacent_count++;
            math_list[k][MATH_CHECK] = true;

            lostCheckSub(k);

            function lostCheckSub(k){

                // 左下
                if( k==0 ){

                    // 右チェック
                    if(math_list[k+1][MATH_STATUS] && math_list[k+1][MATH_COLOR] == target_color && !math_list[k+1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+1][MATH_CHECK] = true;
                        lostCheckSub(k+1);
                        
                    }
                    // 上チェック
                    if(math_list[k+6][MATH_STATUS] && math_list[k+6][MATH_COLOR] == target_color && !math_list[k+6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+6][MATH_CHECK] = true;
                        lostCheckSub(k+6);

                    }

                // 左上
                }else if( k==66){

                    // 右チェック
                    if(math_list[k+1][MATH_STATUS] && math_list[k+1][MATH_COLOR] == target_color && !math_list[k+1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+1][MATH_CHECK] = true;
                        lostCheckSub(k+1);
                        
                    }
                    // 下チェック
                    if(math_list[k-6][MATH_STATUS] && math_list[k-6][MATH_COLOR] == target_color && !math_list[k-6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-6][MATH_CHECK] = true;
                        lostCheckSub(k-6);

                    }
                
                // 右下
                }else if( k==5){

                    // 左チェック
                    if(math_list[k-1][MATH_STATUS] && math_list[k-1][MATH_COLOR] == target_color && !math_list[k-1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-1][MATH_CHECK] = true;
                        lostCheckSub(k-1);
                        
                    }
                    // 上チェック
                    if(math_list[k+6][MATH_STATUS] && math_list[k+6][MATH_COLOR] == target_color && !math_list[k+6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+6][MATH_CHECK] = true;
                        lostCheckSub(k+6);

                    }
                
                // 右上
                }else if( k==71){
                    alert();
                    // 左チェック
                    if(math_list[k-1][MATH_STATUS] && math_list[k-1][MATH_COLOR] == target_color && !math_list[k-1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-1][MATH_CHECK] = true;
                        lostCheckSub(k-1);
                        
                    }
                    // 下チェック
                    if(math_list[k-6][MATH_STATUS] && math_list[k-6][MATH_COLOR] == target_color && !math_list[k-6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-6][MATH_CHECK] = true;
                        lostCheckSub(k-6);

                    }

                
                // 左辺中
                // }else if( k%6==0 && k!=66){
                }else if( k==6||k==12||k==18||k==24||k==30||k==36||k==42||k==48||k==54||k==60 ){

                    // 右チェック
                    if(math_list[k+1][MATH_STATUS] && math_list[k+1][MATH_COLOR] == target_color && !math_list[k+1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+1][MATH_CHECK] = true;
                        lostCheckSub(k+1);
                        // alert(adjacent_count);
                        
                    }
                    // 上チェック
                    if(math_list[k+6][MATH_STATUS] && math_list[k+6][MATH_COLOR] == target_color && !math_list[k+6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+6][MATH_CHECK] = true;
                        lostCheckSub(k+6);

                    }
                    // 下チェック
                    if(math_list[k-6][MATH_STATUS] && math_list[k-6][MATH_COLOR] == target_color && !math_list[k-6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-6][MATH_CHECK] = true;
                        lostCheckSub(k-6);

                    }


                // 下辺中 
                }else if(k==1||k==2||k==3||k==4){

                    // 左チェック
                    if(math_list[k-1][MATH_STATUS] && math_list[k-1][MATH_COLOR] == target_color && !math_list[k-1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-1][MATH_CHECK] = true;
                        lostCheckSub(k-1);
                        
                    }
                    // 右チェック
                    if(math_list[k+1][MATH_STATUS] && math_list[k+1][MATH_COLOR] == target_color && !math_list[k+1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+1][MATH_CHECK] = true;
                        lostCheckSub(k+1);
                        
                    }
                    // 上チェック
                    if(math_list[k+6][MATH_STATUS] && math_list[k+6][MATH_COLOR] == target_color && !math_list[k+6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+6][MATH_CHECK] = true;
                        lostCheckSub(k+6);

                    }
                
                // 右辺中
                // }else if( k%6==1 && k!=71){
                }else if( k==5||k==11||k==17||k==23||k==29||k==35||k==41||k==47||k==53||k==59||k==65 ){

                    // 左チェック
                    if(math_list[k-1][MATH_STATUS] && math_list[k-1][MATH_COLOR] == target_color && !math_list[k-1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-1][MATH_CHECK] = true;
                        lostCheckSub(k-1);
                        
                    }
                    // 上チェック
                    if(math_list[k+6][MATH_STATUS] && math_list[k+6][MATH_COLOR] == target_color && !math_list[k+6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+6][MATH_CHECK] = true;
                        lostCheckSub(k+6);

                    }
                    // 下チェック
                    if(math_list[k-6][MATH_STATUS] && math_list[k-6][MATH_COLOR] == target_color && !math_list[k-6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-6][MATH_CHECK] = true;
                        lostCheckSub(k-6);

                    }

                
                // 上辺中 
                }else if(k==67||k==68||k==69||k==70){

                    // 左チェック
                    if(math_list[k-1][MATH_STATUS] && math_list[k-1][MATH_COLOR] == target_color && !math_list[k-1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-1][MATH_CHECK] = true;
                        lostCheckSub(k-1);
                        
                    }
                    // 右チェック
                    if(math_list[k+1][MATH_STATUS] && math_list[k+1][MATH_COLOR] == target_color && !math_list[k+1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+1][MATH_CHECK] = true;
                        lostCheckSub(k+1);
                        
                    }
                    // 下チェック
                    if(math_list[k-6][MATH_STATUS] && math_list[k-6][MATH_COLOR] == target_color && !math_list[k-6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-6][MATH_CHECK] = true;
                        lostCheckSub(k-6);

                    }
                    
                // 中(全方位チェック)
                }else{

                    // 左チェック
                    if(math_list[k-1][MATH_STATUS] && math_list[k-1][MATH_COLOR] == target_color && !math_list[k-1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-1][MATH_CHECK] = true;
                        lostCheckSub(k-1);
                        
                    }
                    // 右チェック
                    if(math_list[k+1][MATH_STATUS] && math_list[k+1][MATH_COLOR] == target_color && !math_list[k+1][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+1][MATH_CHECK] = true;
                        lostCheckSub(k+1);
                        
                    }
                    // 上チェック
                    if(math_list[k+6][MATH_STATUS] && math_list[k+6][MATH_COLOR] == target_color && !math_list[k+6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k+6][MATH_CHECK] = true;
                        lostCheckSub(k+6);

                    }
                    // 下チェック
                    if(math_list[k-6][MATH_STATUS] && math_list[k-6][MATH_COLOR] == target_color && !math_list[k-6][MATH_CHECK]){
                        adjacent_count++;
                        math_list[k-6][MATH_CHECK] = true;
                        lostCheckSub(k-6);
                    }
                }
            }
            
            // 起点絡みのチェック完了後
            // 隣り合うぷよの同色が4以上の場合ロストフラグ立てる
            if(adjacent_count>=4){
                // チェック済みぷよの全てのロストフラグをON
                for(let k=0;k<math_list.length;k++){
                    if(math_list[k][MATH_CHECK]){
                        math_list[k][MATH_LOST_FLG] = true;
                    }                
                }
            }            
            adjacent_count=0;
            
            for(let k=0;k<math_list.length;k++){
                // 全チェックをリセット
                math_list[k][MATH_CHECK] = false;
            }
        }
    }
}