/* ===================================

   のさり勤怠 Ver.2.0

   service-worker.js

   PWA公開版

=================================== */



const CACHE_NAME =

"nosari-kintai-v2.0";





const CACHE_FILES = [


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

        .then(

            cache=>{


                return cache.addAll(

                    CACHE_FILES

                );


            }

        )


    );


}

);








// ===================================
// 通信処理
// ===================================


self.addEventListener(

"fetch",

event=>{


    event.respondWith(


        caches.match(

            event.request

        )

        .then(

            response=>{


                return response ||

                fetch(

                    event.request

                );


            }

        )


    );


}

);








// ===================================
// 更新処理
// ===================================


self.addEventListener(

"activate",

event=>{


    event.waitUntil(


        caches.keys()

        .then(

            keys=>{


                return Promise.all(


                    keys.map(

                        key=>{


                            if(

                            key !== CACHE_NAME

                            ){


                                return caches.delete(

                                    key

                                );


                            }


                        }

                    )


                );


            }

        )


    );


}

);