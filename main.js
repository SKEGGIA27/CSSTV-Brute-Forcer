
//function used to retrieve the answers of the quiz inside the page
function getRisposte() {

    var source = document.documentElement.outerHTML;
    var parser = new DOMParser();
    var doc = parser.parseFromString(source, 'text/html');
    const elementiRisposta = doc.querySelectorAll('input[type="radio"][name="answerid"]');
    const idRisposte = [];

    elementiRisposta.forEach(elemento => {
        
        const idRisposta = elemento.value;
        idRisposte.push(idRisposta);
    });

    return idRisposte;

}

//function used to retrieve the sesskey from the page, used to make the POST request
function getSessKey(){

    var source = document.documentElement.outerHTML;
    const startIndex = source.indexOf('sesskey=') + 'sesskey='.length;
    const endIndex = source.indexOf('"', startIndex);
    const sesskey = source.substring(startIndex, endIndex);

    return sesskey;
}

//function used to retrieve the instance id from the page, used to identify the quiz along with the page id
function getInstanceId(){

    var url = document.URL;
    const startIndex = url.indexOf('id=') + 'id='.length;
    const endIndex = url.indexOf('&', startIndex);
    const instanceId = url.substring(startIndex, endIndex);

    return instanceId;

}

//function used to retrieve the page id from the page, used to identify the quiz along with the instance id
function getPageId(){

    var url = document.URL;
    const startIndex = url.indexOf('&pageid=') + '&pageid='.length;
    const endIndex = url.length;
    const pageId = url.substring(startIndex, endIndex);
    
    return pageId;
}

//function used to retrieve the session cookie that identifies the session of the user
function getSessionCookie(){

    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${"MoodleSession"}=`);
    if (parts.length === 2) return "MoodleSession=" + parts.pop().split(';').shift();
  
}

//function used to retrieve the answer by its id
function getAnswerById(answerId) {

    const parser = new DOMParser();
    const doc = parser.parseFromString(document.documentElement.outerHTML, 'text/html');
    const divs = doc.querySelectorAll('.answeroption');

    divs.forEach(div => {

        const inputRadio = div.querySelector(`input[type="radio"]`);

        if (inputRadio && inputRadio.id === `id_answerid_${answerId}`) {
            
            const paragrafo = div.querySelector('p');
            if (paragrafo) {
                
                alert("Correct answer -> " + paragrafo.innerText);
            }
        }
    });
}

//function used to submit and validate an answer through the validation endpoint, using the answer id
async function submitAnswer(answerId){

    const myHeaders = new Headers();
    myHeaders.append("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7");
    myHeaders.append("Accept-Language", "it-IT,it;q=0.9,en-US;q=0.8,en;q=0.7");
    myHeaders.append("Cache-Control", "no-cache");
    myHeaders.append("Connection", "keep-alive");
    myHeaders.append("Content-Type", "application/x-www-form-urlencoded");
    myHeaders.append("Cookie", getSessionCookie());
    myHeaders.append("Origin", "https://domain.it");
    myHeaders.append("Pragma", "no-cache");
    myHeaders.append("Sec-Fetch-Dest", "document");
    myHeaders.append("Sec-Fetch-Mode", "navigate");
    myHeaders.append("Sec-Fetch-Site", "same-origin");
    myHeaders.append("Sec-Fetch-User", "?1");
    myHeaders.append("Upgrade-Insecure-Requests", "1");
    myHeaders.append("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36");
    myHeaders.append("dnt", "1");
    myHeaders.append("sec-ch-ua", "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("sec-ch-ua-platform", "\"macOS\"");

    const urlencoded = new URLSearchParams();
    urlencoded.append("id", getInstanceId());
    urlencoded.append("pageid", getPageId());
    urlencoded.append("sesskey", getSessKey());
    urlencoded.append("_qf__lesson_display_answer_form_multichoice_singleanswer", "1");
    urlencoded.append("answerid", answerId);
    urlencoded.append("submitbutton", "Invia");

    const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
    redirect: "follow"
    };

    fetch("https://domain.it/mod/lesson/continue.php", requestOptions)
    .then((response) => response.text())
    .then((result) => {

        //cheking the response to see if the answer is correct
        if (result.includes("è esatta")) {

          getAnswerById(answerId);
          return true;
        } else {
          console.log("Incorrect answer found:", answerId);
            return false;
        }
      })
    .catch((error) => console.error(error));

}

//function used to brute force the answers
//the answer validation endpoint is used to check which is the correct one
async function bruteForce() {

    const risposte = getRisposte();

    for (const risposta of risposte) {
        
        const isCorrect = await submitAnswer(risposta);
        if (isCorrect) {
            break;
        }
    }
}

bruteForce();
