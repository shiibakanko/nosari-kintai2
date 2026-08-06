/* ===================================

   のさり勤怠 Ver.2.0

   app.js

   PWA公開版

=================================== */



// ===================================
// 設定
// ===================================


const APP_CONFIG = {


    shopName:"のさり",


    version:"2.0",


    storageKey:{


        staff:"nosari_staff",


        attendance:"nosari_attendance"


    },


    defaultStaff:[

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


const newStaffName =
document.getElementById("newStaffName");


const addStaffBtn =
document.getElementById("addStaffBtn");


const staffList =
document.getElementById("staffList");


const csvBtn =
document.getElementById("csvBtn");


const clearBtn =
document.getElementById("clearBtn");








// ===================================
// 起動処理
// ===================================


window.addEventListener(

"DOMContentLoaded",

()=>{


    initialize();


});







function initialize(){



    createDefaultData();



    loadStaff();



    loadToday();



    updateClock();



    setInterval(

        updateClock,

        1000

    );



}







// ===================================
// 初期データ作成
// ===================================


function createDefaultData(){



    let staff =

    localStorage.getItem(

        APP_CONFIG.storageKey.staff

    );



    if(!staff){



        saveStaff(

            APP_CONFIG.defaultStaff

        );


    }





    let attendance =

    localStorage.getItem(

        APP_CONFIG.storageKey.attendance

    );



    if(!attendance){



        saveAttendance([]);



    }



}








// ===================================
// 時計
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
// スタッフ読み込み
// ===================================


function loadStaff(){



    let staff = getStaff();




    staffSelect.innerHTML="";




    staff.forEach(

        name=>{


            const option =

            document.createElement("option");



            option.value=name;



            option.textContent=name;



            staffSelect.appendChild(option);



        }

    );




    staffList.innerHTML="";



    staff.forEach(

        name=>{


            const li =

            document.createElement("li");



            li.textContent=name;



            staffList.appendChild(li);



        }

    );



}








function getStaff(){


    try{


        const data =

        JSON.parse(

            localStorage.getItem(

                APP_CONFIG.storageKey.staff

            )

        );



        if(Array.isArray(data)){


            return data;


        }



    }catch(e){}





    saveStaff(

        APP_CONFIG.defaultStaff

    );



    return APP_CONFIG.defaultStaff;


}








function saveStaff(data){



    localStorage.setItem(

        APP_CONFIG.storageKey.staff,

        JSON.stringify(data)

    );


}








// ===================================
// スタッフ追加
// ===================================


addStaffBtn.onclick=function(){



    const name =

    newStaffName.value.trim();



    if(!name){



        showMessage(

            "名前を入力してください"

        );


        return;

    }




    let staff=getStaff();



    if(staff.includes(name)){



        showMessage(

            "登録済みです"

        );


        return;

    }




    staff.push(name);



    saveStaff(staff);



    newStaffName.value="";



    loadStaff();



    showMessage(

        name+"を追加しました"

    );


};









// ===================================
// 出勤
// ===================================


clockInBtn.onclick=function(){



    const staff =

    staffSelect.value;



    if(!staff)return;




    let data=

    getAttendance();




    data.push({


        staff:staff,


        date:getDate(),


        start:getTime(),


        end:""


    });



    saveAttendance(data);



    loadToday();



    showMessage(

        staff+" 出勤しました"

    );


};









// ===================================
// 退勤
// ===================================


clockOutBtn.onclick=function(){



    const staff =

    staffSelect.value;



    let data=

    getAttendance();




    const target =



    [...data]

    .reverse()

    .find(

        row=>


        row.staff===staff &&

        row.date===getDate() &&

        row.end===""



    );





    if(!target){



        showMessage(

            "出勤記録がありません"

        );


        return;


    }





    target.end=getTime();



    saveAttendance(data);



    loadToday();



    showMessage(

        staff+" 退勤しました"

    );


};









// ===================================
// 勤怠データ
// ===================================


function getAttendance(){



    try{


        return JSON.parse(

            localStorage.getItem(

                APP_CONFIG.storageKey.attendance

            )

        ) || [];


    }catch(e){


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
// 今日表示
// ===================================


function loadToday(){



    todayList.innerHTML="";



    const data=

    getAttendance()

    .filter(

        row=>

        row.date===getDate()

    );




    if(data.length===0){



        todayList.textContent=

        "本日の記録はありません";



        return;


    }




    data.forEach(

        row=>{


            const div=

            document.createElement("div");



            div.className=

            "work-row";



            div.innerHTML=


            `

            <span>

            ${row.staff}

            </span>


            <span>

            ${row.start}

            -

            ${row.end || "勤務中"}

            </span>

            `;



            todayList.appendChild(div);



        }

    );


}









// ===================================
// CSV
// ===================================


csvBtn.onclick=function(){



    const data=

    getAttendance();



    if(data.length===0)return;




    let csv=

    "スタッフ,日付,出勤,退勤\n";




    data.forEach(row=>{


        csv+=

        `${row.staff},${row.date},${row.start},${row.end}\n`;


    });





    const blob=

    new Blob(

        [csv],

        {

            type:"text/csv"

        }

    );



    const url=

    URL.createObjectURL(blob);



    const a=

    document.createElement("a");



    a.href=url;



    a.download=

    "nosari_kintai.csv";



    a.click();


};








// ===================================
// 削除
// ===================================


clearBtn.onclick=function(){



    if(confirm("勤怠データを削除しますか？")){


        saveAttendance([]);



        loadToday();


    }


};








// ===================================
// 共通
// ===================================


function getDate(){


    return new Date()

    .toLocaleDateString(

        "ja-JP"

    );


}





function getTime(){



    return new Date()

    .toLocaleTimeString(

        "ja-JP",

        {

            hour:"2-digit",

            minute:"2-digit"

        }

    );


}




function showMessage(text){



    message.textContent=text;



    setTimeout(

        ()=>{


            message.textContent="";


        },

        3000

    );


}








// ===================================
// PWA Service Worker登録
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

        .then(

            ()=>console.log(

                "Service Worker登録完了"

            )

        )

        .catch(

            err=>console.log(err)

        );


    }


}