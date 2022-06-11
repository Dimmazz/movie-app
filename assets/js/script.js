const APIKEY = "movieappopen"
const APIURL = `http://api.anidb.net:9001/httpapi?client=${APIKEY}&clientver=1&protover=1&request=`
const APIVER = "1"
const APIURLIMAGE = "https://cdn-eu.anidb.net/images/main/"


const requestDataAnime = (animeID) => {
    console.log("RequestDataAnime, ID: ", animeID);
    let request = new XMLHttpRequest();

    request.open('GET', `http://api.anidb.net:9001/httpapi?request=anime&client=${APIKEY}&clientver=${APIVER}&protover=1&aid=${animeID}`);
    request.responseType = "text";

    request.onload = function () {
        let dataXML = request.response;
        if (parserXML(dataXML).querySelector("error") !== undefined) {
            localStorage.setItem("anime-" + animeID, dataXML)
        }
        // console.log(dataXML);
    };


    request.send();

    viewHTML()
}

const requestDataMainList = () => {
    console.log("RequestDataMainList");
    let request = new XMLHttpRequest();

    request.open('GET', `http://api.anidb.net:9001/httpapi?request=main&client=${APIKEY}&clientver=${APIVER}&protover=1`);
    request.responseType = "text";

    request.onload = function () {
        let dataXML = request.response;
        localStorage.setItem("animeMainList", dataXML)
        localStorage.setItem("animeMainListTime", Date.now())
    };

    request.send();

    viewHTML()
}

const loadDataAnime = (animeID) => {
    let animeObject = localStorage.getItem("anime-" + animeID)

    if (animeObject !== null) {
        return parserXML(animeObject).documentElement
    }
    if (animeObject == null) {
        return parserXML(requestDataAnime(animeID))
    }
    return
}

const loadDataMainList = () => {
    let animeObject = localStorage.getItem("animeMainList")
    let animeTime = localStorage.getItem("animeMainListTime")

    if (animeObject !== null) {
        return parserXML(animeObject).documentElement
    }
    if (animeObject == null |
        (Date.now() - Number(animeTime)) >= 86400000) {
        return parserXML(requestDataMainList())
    }
    return
}

const parserXML = (animeObject) => {
    parser = new DOMParser();
    return parser.parseFromString(animeObject, "text/xml");
}

const animeList = (animeID) => {

    // List (in HTML create) & in list items (here create)


    if (animeID == undefined) {
        let htmlRecommendation = '';
        let htmlHot = '';

        let titleRecommendation = '<h2 class="anime-list__title">Recommendation anime</h2>'
        let titleHot = '<h2 class="anime-list__title">Hot anime</h2>'

        let animeObject = loadDataMainList()

        const htmlAnimeLists = document.createElement("div")

        const htmlAnimeListHot = document.createElement("div")
        const htmlAnimeListRecommendation = document.createElement("div")

        const htmlAnimeListHotInner = document.createElement("div")
        const htmlAnimeListRecommendationInner = document.createElement("div")

        htmlAnimeListHot.classList.add("js-anime-list")
        htmlAnimeListRecommendation.classList.add("js-anime-list")

        htmlAnimeListHotInner.classList.add("js-anime-list__inner")
        htmlAnimeListRecommendationInner.classList.add("js-anime-list__inner")

        htmlAnimeListHot.innerHTML += titleHot
        htmlAnimeListRecommendation.innerHTML += titleRecommendation

        let n = animeObject.querySelector("randomsimilar").children.length;
        for (let index = 0; index < n; index++) {
            const anime = animeObject.querySelector("hotanime").children[index];

            let animeListInfo = {
                id: anime.id,
                img: anime.querySelector("picture").textContent,
                title: anime.querySelector("title").textContent,
                rating: anime.querySelector("ratings permanent").textContent,
            }
            htmlRecommendation += `
                <div class="anime-list__anime" data-anime-id=${animeListInfo.id}>
                    <div class="anime__icon">
                        <img class="anime__image" src=${APIURLIMAGE + animeListInfo.img} alt=${animeListInfo.img}>
                    </div>
                    <div class="anime__text">
                        <h2 class="anime__title" title="${animeListInfo.title}">${animeListInfo.title}
                        </h2>
                        <div class="anime__rating">
                            ${animeListInfo.rating}
                        </div>
                    </div>
                </div>
            `
        }

        htmlAnimeListRecommendationInner.innerHTML += htmlRecommendation
        htmlAnimeListRecommendation.appendChild(htmlAnimeListRecommendationInner)
        htmlAnimeLists.appendChild(htmlAnimeListRecommendation)

        n = animeObject.querySelector("randomrecommendation").children.length;
        for (let index = 0; index < n; index++) {
            const anime = animeObject.querySelector("randomrecommendation").children[index];

            let animeListInfo = {
                id: anime.querySelector("anime").id,
                img: anime.querySelector("picture").textContent,
                title: anime.querySelector("title").textContent,
                rating: Number(anime.querySelector("ratings permanent").textContent) / 100,
            }
            htmlHot += `
                <div class="anime-list__anime" data-anime-id=${animeListInfo.id}>
                    <div class="anime__icon">
                        <img class="anime__image" src=${APIURLIMAGE + animeListInfo.img} alt=${animeListInfo.img}>
                    </div>
                    <div class="anime__text">
                        <h2 class="anime__title" title="${animeListInfo.title}">${animeListInfo.title}
                        </h2>
                        <div class="anime__rating">
                            ${animeListInfo.rating}
                        </div>
                    </div>
                </div>
            `
        }

        htmlAnimeListHotInner.innerHTML += htmlHot
        htmlAnimeListHot.appendChild(htmlAnimeListHotInner)
        htmlAnimeLists.appendChild(htmlAnimeListHot)

        return htmlAnimeLists

    }

    if (animeID !== undefined) {
        let animeBlock = loadDataAnime(animeID)
        let htmlCharacters = '';  
        console.log(animeBlock);

        try {
            let animeInfo = {
                title: animeBlock.querySelector("title").textContent,
                img: animeBlock.querySelector("picture").textContent,
                desc: animeBlock.querySelector("description").textContent,
                rating: animeBlock.querySelector("ratings permanent").textContent,
                ratingCount: animeBlock.querySelector("ratings permanent").attributes.count.textContent,
                dateStart: animeBlock.querySelector("startdate").textContent,
                dateEnd: animeBlock.querySelector("enddate").textContent,
                episodeCount: animeBlock.querySelector("episodecount").textContent,
            }

            console.log("In in animeList", 
                animeInfo.title,
                " | ",
                animeInfo.img,
                " | ",
                animeInfo.desc,
                " | ",
                animeInfo.rating,
                " | ",
                animeInfo.ratingCount,
                " | ",
                animeInfo.dateStart,
                " | ",
                animeInfo.dateEnd,
                " | ",
                animeInfo.episodeCount,
                " | ",
            );

            let characters = {
                name: animeBlock.querySelectorAll("character name"),
                gender: animeBlock.querySelectorAll("character gender"),
                img: animeBlock.querySelectorAll("character picture")
            }

            for (let index = 0; index < characters.name.length; index++) {
                const characterName = characters.name[index].textContent;
                const characterGender = characters.gender[index].textContent;
                let characterImg = characters.img[index]; // Может не быть изображения

                if (characterImg !== undefined) {
                    characterImg = characterImg.textContent
                }
                console.log("In for characters", characterName, characterGender , characterImg);

                htmlCharacters += 
                `
                    <li class="characters__character">
                        <div class="character__img" style="background: url(${APIURLIMAGE + characterImg}) no-repeat;" title=${characterImg}>
                        </div>
                        <div class="character__name">
                            ${characterName}
                        </div>
                        <div class="character__gender">
                            ${characterGender}
                        </div>
                    </li>
                `
            }

            let html =
                `
                    <div class="view-anime">
                        <div class="view-anime__inner">
                            <div class="view-anime__preview">
                                <div class="view-anime__image">
                                    <img src=${APIURLIMAGE + animeInfo.img} alt=${animeInfo.img}>
                                </div>
                                <div class="view-anime__info">
                                    <div class="view-anime__rating">
                                        <span class="rating__index">${animeInfo.rating}</span>
                                        &bull;
                                        <span class="rating__count">${animeInfo.ratingCount}</span>
                                    </div>
                                    <div class="view-anime__title">
                                        ${animeInfo.title}
                                    </div>
                                    <div class="view-anime__date">
                                        ${animeInfo.dateStart} &mdash;
                                        ${animeInfo.dateEnd}
                                    </div>
                                    <div class="view-anime__episodes">
                                        Episodes: ${animeInfo.episodeCount} 
                                    </div>
                                    <div class="view-anime__desc">
                                        ${animeInfo.desc}
                                    </div>
                                </div>
                            </div>
                            <ul class="view-anime__characters">
                                ${htmlCharacters}
                            </ul>
                        </div>
                    </div>
                `;
            return html
        } catch (error) {
            console.log(error);
            // return "Вы делаете слишком много запросов\n" + error
        }

        
    }
}


function viewHTML() {
    const containerBlock = document.querySelector(".main")
    htmlAnimeList = animeList()

    containerBlock.appendChild(htmlAnimeList.children[1])
    containerBlock.appendChild(htmlAnimeList.children[0])

    // for (let index = 0; index < htmlAnimeList.children.length; index++) {
    //     const element = htmlAnimeList.children[index];
    //     console.log(element, index);
    //     containerBlock.appendChild(element)
    // }
}

// main           // ВЕРНЁТ hotanime, randomrecommendation, randomsimilar
// hotanime                                       // ВОЗВРАЩАЕТ ОДНУ АНИМЕШКУ
// randomrecommendation                 // ВОЗВРАЩАЕТ ОДНУ АНИМЕШКУ
// img for anime (animeID)
// anime (animeID)

viewHTML()




// EVENTS

const animeBlocks = document.querySelectorAll(".anime-list__anime")

function searchParent(anime) {

    const animePath = anime.path; 

    for (let index = 0; index < animePath.length; index++) {

        const animeBlock = animePath[index];

        if (animeBlock.classList.contains("anime-list__anime")) {
            const animeID = animeBlock.dataset.animeId
            return animeID
        }
    }
    return
}

animeBlocks.forEach((animeBlock, index) => {
    
    animeBlock.addEventListener("click", (anime) => {

        const animeID = searchParent(anime);

        if (animeID !== undefined) {
            const containerBlock = document.querySelector(".main")
            containerBlock.innerHTML = animeList(animeID)

        }
    })
})

// const animeID = "5638";

// if (animeID !== undefined) {
//     const containerBlock = document.querySelector(".main")
//     containerBlock.innerHTML = animeList(animeID)
// }