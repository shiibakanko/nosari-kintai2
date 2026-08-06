/* ===================================

   のさり勤怠 Ver.3.0

   service-worker.js

   PWA Offline

=================================== */


const CACHE_NAME =

"nosari-kintai-v3";



const FILES = [

    "./",

    "./index.html",

    "./style.css",

    "./app.js",

    "./manifest.json"

];




// ===================================
// インストール
// ===================================

self.addEventListener(

"install",

event=>{


    event.waitUntil(


        caches.open(

            CACHE_NAME

        )

        .then(cache=>{


            return cache.addAll(

                FILES

            );


        })


    );


    self.skipWaiting();


});





// ===================================
// 起動
// ===================================

self.addEventListener(

"activate",

event=>{


    event.waitUntil(


        caches.keys()

        .then(keys=>{


            return Promise.all(

                keys.map(key=>{


                    if(

                    key !== CACHE_NAME

                    ){


                        return caches.delete(

                            key

                        );


                    }


                })

            );


        })


    );


    self.clients.claim();


});





// ===================================
// キャッシュ取得
// ===================================

self.addEventListener(

"fetch",

event=>{


    event.respondWith(


        caches.match(

            event.request

        )

        .then(response=>{


            return response ||

            fetch(

                event.request

            );


        })


    );


});