/* ===================================
   のさり勤怠 Ver.3.0
   app.js
   シンプル・軽量版
=================================== */

// ===================================
// アプリ設定
// ===================================

const APP_CONFIG = {

    appName: "のさり勤怠",

    version: "3.0",

    adminPIN: "1234",

    storageKey: {

        staff: "nosari_staff",

        attendance: "nosari_attendance",

        settings: "nosari_settings"

    },

    defaultStaff: [

        "Aさん",

        "Bさん",

        "Cさん"

    ]

};

// ===================================
// DOM取得
// ===================================

const staffSelect =
document.getElementById("staffSelect");

const clockInBtn =
document.getElementById("clockInBtn");

const clockOutBtn =
document.getElementById("clockOutBtn");

const message =
document.getElementById("message");

const todayList =
document.getElementById("todayList");

const todayDisplay =
document.getElementById("todayDisplay");

const csvBtn =
document.getElementById("csvBtn");

const backupBtn =
document.getElementById("backupBtn");

const restoreBtn =
document.getElementById("restoreBtn");

const adminBtn =
document.getElementById("adminBtn");

const adminArea =
document.getElementById("adminArea");

// ===================================
// 起動
// ===================================

window.addEventListener(

    "DOMContentLoaded",

    () => {

        initialize();

    }

);

// ===================================
// 初期化
// ===================================

function initialize() {

    createDefaultData();

    loadStaff();

    loadToday();

    updateClock();

    setInterval(updateClock,1000);

}
// ===================================
// 初期データ
// ===================================

function createDefaultData(){

    if(!localStorage.getItem(APP_CONFIG.storageKey.staff)){

        saveStaff(APP_CONFIG.defaultStaff);

    }

    if(!localStorage.getItem(APP_CONFIG.storageKey.attendance)){

        saveAttendance([]);

    }

    if(!localStorage.getItem(APP_CONFIG.storageKey.settings)){

        localStorage.setItem(

            APP_CONFIG.storageKey.settings,

            JSON.stringify({

                pin:APP_CONFIG.adminPIN

            })

        );

    }

}
// ===================================
// LocalStorage
// ===================================

function getStaff(){

    try{

        return JSON.parse(

            localStorage.getItem(

                APP_CONFIG.storageKey.staff

            )

        ) || [];

    }

    catch{

        return [];

    }

}

function saveStaff(data){

    localStorage.setItem(

        APP_CONFIG.storageKey.staff,

        JSON.stringify(data)

    );

}

function getAttendance(){

    try{

        return JSON.parse(

            localStorage.getItem(

                APP_CONFIG.storageKey.attendance

            )

        ) || [];

    }

    catch{

        return [];

    }

}

function saveAttendance(data){

    localStorage.setItem(

        APP_CONFIG.storageKey.attendance,

        JSON.stringify(data)

    );

}
// ===================================
// 時計表示
// ===================================

function updateClock(){

    const now = new Date();

    todayDisplay.textContent =
        now.toLocaleString(
            "ja-JP",
            {
                year:"numeric",
                month:"long",
                day:"numeric",
                weekday:"short",
                hour:"2-digit",
                minute:"2-digit",
                second:"2-digit"
            }
        );

}

// ===================================
// 日付・時刻取得
// ===================================

function getDate(){

    return new Date().toLocaleDateString(
        "ja-JP"
    );

}

function getTime(){

    return new Date().toLocaleTimeString(
        "ja-JP",
        {
            hour:"2-digit",
            minute:"2-digit"
        }
    );

}

// ===================================
// メッセージ表示
// ===================================

function showMessage(text){

    message.textContent = text;

    clearTimeout(message.timer);

    message.timer = setTimeout(()=>{

        message.textContent="";

    },3000);

}

// ===================================
// 設定取得
// ===================================

function getSettings(){

    try{

        return JSON.parse(

            localStorage.getItem(

                APP_CONFIG.storageKey.settings

            )

        );

    }

    catch{

        return {

            pin:APP_CONFIG.adminPIN

        };

    }

}

function saveSettings(data){

    localStorage.setItem(

        APP_CONFIG.storageKey.settings,

        JSON.stringify(data)

    );

}
// ===================================
// 管理者PIN認証
// ===================================

function adminLogin(){

    const settings = getSettings();

    const input = prompt(

        "管理者PINを入力してください"

    );

    if(input===null){

        return false;

    }

    if(input!==settings.pin){

        alert("PINが違います");

        return false;

    }

    return true;

}

// ===================================
// 管理画面表示切替
// ===================================

if(adminBtn){

    adminBtn.onclick = function(){

        if(!adminLogin()){

            return;

        }

        if(adminArea.style.display==="block"){

            adminArea.style.display="none";

            return;

        }

        adminArea.style.display="block";

    };

}
// ===================================
// スタッフ一覧読込
// ===================================

function loadStaff(){

    const staff = getStaff();

    staffSelect.innerHTML="";

    staff.forEach(name=>{

        const option =

        document.createElement("option");

        option.value=name;

        option.textContent=name;

        staffSelect.appendChild(option);

    });

}

// ===================================
// 本日一覧（土台）
// ===================================

function loadToday(){

    todayList.innerHTML="";

}
// ===================================
// 出勤
// ===================================

clockInBtn.onclick = function(){

    const staff = staffSelect.value;

    if(!staff){

        showMessage("スタッフを選択してください");

        return;

    }

    let attendance = getAttendance();

    // 今日の未退勤データ確認
    const working = attendance.find(row =>

        row.staff === staff &&
        row.date === getDate() &&
        row.end === ""

    );

    if(working){

        showMessage("すでに出勤しています");

        return;

    }

attendance.push({

    id: Date.now(),

    staff: staff,

    date: getDate(),

    start: getTime(),

    end: "",

    type: ""

});

    saveAttendance(attendance);

    loadToday();

    showMessage(staff + " 出勤しました");

};
// ===================================
// 退勤
// ===================================

clockOutBtn.onclick = function(){

    const staff = staffSelect.value;

    let attendance = getAttendance();

    const target = [...attendance]

        .reverse()

        .find(row =>

            row.staff === staff &&
            row.date === getDate() &&
            row.end === ""

        );

    if(!target){

        showMessage("出勤記録がありません");

        return;

    }

    target.end = getTime();

    target.type = judgeWorkType(
        target.start,
        target.end
    );

    saveAttendance(attendance);

    loadToday();

    showMessage(staff + " 退勤しました");

};
// ===================================
// 勤務区分自動判定
// ===================================

function judgeWorkType(start,end){

    const s = toMinute(start);

    const e = toMinute(end);

    if(s <= 11*60 && e <= 16*60){

        return "ランチ";

    }

    if(s >= 16*60){

        return "ディナー";

    }

    return "フル";

}
// ===================================
// 時刻→分
// ===================================

function toMinute(time){

    const t = time.split(":");

    return Number(t[0]) * 60 +

           Number(t[1]);

}
// ===================================
// 本日の勤務一覧
// ===================================

function loadToday(){

    todayList.innerHTML = "";

    const attendance = getAttendance().filter(row=>

        row.date === getDate()

    );

    if(attendance.length===0){

        todayList.innerHTML =

        "<p>本日の勤務はありません</p>";

        return;

    }

    attendance.forEach(row=>{

        const div =

        document.createElement("div");

        div.className="work-row";

        div.innerHTML=`

            <div class="work-name">

                ${row.staff}

            </div>

            <div class="work-time">

                ${row.start}

                ～

                ${row.end || "勤務中"}

            </div>

            <div class="work-type">

                ${row.end ? row.type : ""}

            </div>

        `;

        todayList.appendChild(div);

    });

}
// ===================================
// スタッフ追加
// ===================================

function addStaff(name){

    name = name.trim();

    if(name===""){

        showMessage("名前を入力してください");

        return;

    }

    const staff = getStaff();

    if(staff.includes(name)){

        showMessage("登録済みです");

        return;

    }

    staff.push(name);

    saveStaff(staff);

    loadStaff();

    showMessage(name+" を追加しました");

}
// ===================================
// スタッフ削除
// ===================================

function deleteStaff(name){

    if(!confirm(

        name+" を削除しますか？"

    )){

        return;

    }

    let staff = getStaff();

    staff = staff.filter(

        item=>item!==name

    );

    saveStaff(staff);

    loadStaff();

    showMessage(

        name+" を削除しました"

    );

}
// ===================================
// 管理画面スタッフ一覧
// ===================================

function loadStaffList(){

    const list =

    document.getElementById(

        "staffList"

    );

    if(!list){

        return;

    }

    list.innerHTML="";

    getStaff().forEach(name=>{

        const li =

        document.createElement("li");

        const span =

        document.createElement("span");

        span.textContent=name;

        const btn =

        document.createElement("button");

        btn.textContent="削除";

        btn.onclick=()=>{

            deleteStaff(name);

            loadStaffList();

        };

        li.appendChild(span);

        li.appendChild(btn);

        list.appendChild(li);

    });

}
// ===================================
// 勤怠履歴表示
// ===================================

function getAttendanceList(){

    return getAttendance()

    .sort((a,b)=>{

        return b.id-a.id;

    });

}
// ===================================
// 履歴一覧
// ===================================

function loadAttendanceList(){

    const list =

    document.getElementById(

        "attendanceList"

    );

    if(!list){

        return;

    }

    list.innerHTML="";

    getAttendanceList()

    .forEach(row=>{

        const div=

        document.createElement("div");

        div.className="attendance-row";

        div.innerHTML=`

        <div>

            ${row.date}

        </div>

        <div>

            ${row.staff}

        </div>

        <div>

            ${row.start}

            ～ ${row.end}

        </div>

        <div>

            ${row.type}

        </div>

        `;

        list.appendChild(div);

    });

}
// ===================================
// 日付検索
// ===================================

function searchByDate(date){

    return getAttendance()

    .filter(row=>{

        return row.date===date;

    });

}
// ===================================
// スタッフ検索
// ===================================

function searchByStaff(name){

    return getAttendance()

    .filter(row=>{

        return row.staff===name;

    });

}
// ===================================
// ID検索
// ===================================

function findAttendance(id){

    return getAttendance()

    .find(row=>{

        return row.id===id;

    });

}
// ===================================
// 勤怠編集
// ===================================

function editAttendance(id){

    const data = getAttendance();

    const target = data.find(row =>

        row.id === id

    );


    if(!target){

        showMessage(
            "データが見つかりません"
        );

        return;

    }


    const start = prompt(

        "出勤時間",

        target.start

    );


    if(start===null){

        return;

    }


    const end = prompt(

        "退勤時間",

        target.end

    );


    if(end===null){

        return;

    }


    target.start = start;

    target.end = end;


    if(end){

        target.type = judgeWorkType(

            start,

            end

        );

    }


    saveAttendance(data);


    loadToday();


    loadAttendanceList();


    showMessage(

        "修正しました"

    );

}
// ===================================
// 勤怠削除
// ===================================

function deleteAttendance(id){


    if(!confirm(

        "この勤怠を削除しますか？"

    )){

        return;

    }


    let data = getAttendance();


    data = data.filter(row =>

        row.id !== id

    );


    saveAttendance(data);


    loadToday();


    loadAttendanceList();


    showMessage(

        "削除しました"

    );

}
// ===================================
// 履歴一覧（編集削除付き）
// ===================================

function loadAttendanceList(){

    const list =

    document.getElementById(

        "attendanceList"

    );


    if(!list){

        return;

    }


    list.innerHTML="";


    getAttendanceList()

    .forEach(row=>{


        const div =

        document.createElement(

            "div"

        );


        div.className =

        "attendance-row";


        div.innerHTML = `

        <div>

        ${row.date}

        </div>


        <div>

        ${row.staff}

        </div>


        <div>

        ${row.start}

        -

        ${row.end || "勤務中"}

        </div>


        <div>

        ${row.type || ""}

        </div>


        <button>

        編集

        </button>


        <button>

        削除

        </button>

        `;


        const buttons =

        div.querySelectorAll(

            "button"

        );


        buttons[0].onclick = ()=>{

            editAttendance(

                row.id

            );

        };


        buttons[1].onclick = ()=>{

            deleteAttendance(

                row.id

            );

        };


        list.appendChild(div);


    });

}
if(adminBtn){

    adminBtn.onclick=function(){


        if(!adminLogin()){

            return;

        }


        if(adminArea.style.display==="block"){


            adminArea.style.display="none";


            return;


        }


        adminArea.style.display="block";


        loadStaffList();


        loadAttendanceList();


    };

}
// ===================================
// CSV出力
// ===================================

function exportCSV(){

    const data = getAttendance();


    if(data.length===0){

        showMessage(
            "勤怠データがありません"
        );

        return;

    }


    let csv =

    "スタッフ,日付,出勤,退勤,区分\n";


    data.forEach(row=>{


        csv +=

        `${row.staff},` +

        `${row.date},` +

        `${row.start},` +

        `${row.end},` +

        `${row.type}\n`;


    });


    const blob =

    new Blob(

        [csv],

        {

            type:"text/csv"

        }

    );


    const url =

    URL.createObjectURL(blob);


    const a =

    document.createElement("a");


    a.href=url;


    a.download=

    "nosari_kintai.csv";


    a.click();


    URL.revokeObjectURL(url);


}
// ===================================
// CSVボタン
// ===================================

if(csvBtn){

    csvBtn.onclick=function(){

        if(!adminLogin()){

            return;

        }


        exportCSV();

    };

}
// ===================================
// バックアップ
// ===================================

function backupData(){


    const backup = {


        app:

        APP_CONFIG.appName,


        version:

        APP_CONFIG.version,


        created:

        new Date().toISOString(),


        staff:

        getStaff(),


        attendance:

        getAttendance()


    };


    const json =

    JSON.stringify(

        backup,

        null,

        2

    );


    const blob =

    new Blob(

        [json],

        {

            type:"application/json"

        }

    );


    const url =

    URL.createObjectURL(blob);


    const a =

    document.createElement("a");


    a.href=url;


    a.download=

    "nosari_backup.json";


    a.click();


    URL.revokeObjectURL(url);


    showMessage(

        "バックアップしました"

    );


}
// ===================================
// バックアップボタン
// ===================================

if(backupBtn){

    backupBtn.onclick=function(){


        if(!adminLogin()){

            return;

        }


        backupData();


    };

}
// ===================================
// 復元
// ===================================

function restoreData(file){


    const reader =

    new FileReader();


    reader.onload=function(e){


        try{


            const data =

            JSON.parse(

                e.target.result

            );


            if(

                !data.staff ||

                !data.attendance

            ){

                alert(

                    "正しいバックアップではありません"

                );

                return;

            }



            saveStaff(

                data.staff

            );


            saveAttendance(

                data.attendance

            );


            loadStaff();


            loadToday();


            loadStaffList();


            loadAttendanceList();



            showMessage(

                "復元しました"

            );


        }

        catch{


            alert(

                "復元に失敗しました"

            );


        }


    };


    reader.readAsText(file);


}
// ===================================
// 復元ファイル選択
// ===================================

const restoreFile =

document.getElementById(

    "restoreFile"

);


if(restoreFile){

    restoreFile.onchange=function(e){


        const file =

        e.target.files[0];


        if(file){

            restoreData(file);

        }


    };

}
// ===================================
// 全勤怠削除
// ===================================

function clearAttendance(){


    if(!confirm(

        "勤怠データを全て削除しますか？"

    )){


        return;

    }


    saveAttendance([]);


    loadToday();


    loadAttendanceList();


    showMessage(

        "勤怠データを削除しました"

    );


}
// ===================================
// 全削除ボタン
// ===================================

const clearBtn =

document.getElementById(

    "clearBtn"

);


if(clearBtn){

    clearBtn.onclick=function(){


        if(!adminLogin()){

            return;

        }


        clearAttendance();


    };

}
// ===================================
// PIN変更
// ===================================

function changePIN(){


    const current =

    getSettings();


    const newPIN =

    prompt(

        "新しいPINを入力してください"

    );


    if(!newPIN){

        return;

    }


    current.pin = newPIN;


    saveSettings(current);


    showMessage(

        "PINを変更しました"

    );


}
// ===================================
// PIN変更ボタン
// ===================================

const changePinBtn =

document.getElementById(

    "changePinBtn"

);


if(changePinBtn){

    changePinBtn.onclick=function(){


        if(!adminLogin()){

            return;

        }


        changePIN();


    };

}
// ===================================
// データ補正
// ===================================

function repairAttendanceData(){

    let data = getAttendance();

    let changed = false;


    data.forEach(row=>{


        // IDがない古いデータ
        if(!row.id){

            row.id = Date.now();

            changed = true;

        }


        // typeがない場合
        if(
            row.end &&
            !row.type
        ){

            row.type = judgeWorkType(

                row.start,

                row.end

            );

            changed = true;

        }


    });


    if(changed){

        saveAttendance(data);

    }

}
// ===================================
// スタッフ補正
// ===================================

function repairStaffData(){

    let staff = getStaff();


    if(
        !Array.isArray(staff) ||
        staff.length===0
    ){

        saveStaff(

            APP_CONFIG.defaultStaff

        );

    }

}
// ===================================
// 初期化 Ver3
// ===================================

function initialize(){

    createDefaultData();


    repairStaffData();


    repairAttendanceData();


    loadStaff();


    loadToday();


    updateClock();


    setInterval(

        updateClock,

        1000

    );

}

// ===================================
// PWA
// ===================================

if(

window.location.protocol==="https:" ||

window.location.hostname==="localhost"

){


    if(

    "serviceWorker" in navigator

    ){


        navigator.serviceWorker.register(

            "./service-worker.js"

        )

        .then(()=>{


            console.log(

                "PWA ready"

            );


        })


        .catch(err=>{


            console.log(err);


        });


    }


}
// ===================================
// アプリ情報
// ===================================

console.log(

    APP_CONFIG.appName +

    " Ver." +

    APP_CONFIG.version +

    " 起動"

);