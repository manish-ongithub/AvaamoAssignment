var MAX_WORDS_TO_FETCH = 10;
var TEXT_FILE_URL = "file://E://avaamo//bigText.txt";


//this function loads local text file into the textarea
function fetchLocalFile(url) {
  document.getElementById("divWordCount").innerHTML = "Please wait ... Loading file ...";
    var xhr = new XMLHttpRequest
    
    xhr.onreadystatechange = function() {
      if (this.readyState == 4 /*&& this.status == 200*/) {
       document.getElementById("txtBigText").innerHTML = this.responseText;
       document.getElementById("divWordCount").innerHTML = "";
      }
    };
    xhr.onerror = function() {
      console.log("Local request failed");
      document.getElementById("divWordCount").innerHTML = "";
    }
    xhr.open('GET', url)
    xhr.send(null);
  
}
//Load text document in the text area
function loadDoc() {
  
  let url = TEXT_FILE_URL;
  
  fetchLocalFile(url);
}

//This function count words from the text loaded in text area
function CountWords() {
  var text = document.getElementById("txtBigText").value;
  
  if (text.length == 0) {
    alert("invalid text");
    console.log("invalid text");
    return;
  }

  let str = text.replace(/[\t\n\r\.\?\!]/gm, " "); //replace whitespaces and puntuactions with space
  //let str = text.split(/\s+/);
  let wordArray = str.split(" ");

  let wd_map = {};
  wordArray.forEach(function(word) {
    if (word.length > 0) {
      if (wd_map.hasOwnProperty(word)) {
        wd_map[word]++;
      } else {
        wd_map[word] = 1;
      }
    }
  });

  let sortedArray = [];
  let wordStats = "";

  sortedArray = Object.keys(wd_map).map(function(w) {
    return {
      name: w,
      total: wd_map[w]
    };
  });

  sortedArray.sort(function(a, b) {
    return b.total - a.total;
  });
  document.getElementById("divWordCount").innerHTML =
    "Word Count : " + sortedArray.length;

  // for (var i = 0; i < sortedArray.length; ++i) {
  //   wordStats += sortedArray[i].name + ":" + sortedArray[i].total + "\n";
  // }
  // document.getElementById("txtWordStat").value = wordStats;

  for (let i = 0; i < MAX_WORDS_TO_FETCH; ++i) {
    getWordAnalysis(sortedArray[i].name, sortedArray[i].total);
  }
}

//this function asynchronously fetches the analysis data of each word
function getWordAnalysis(word, wordCount) {
  console.log("fetch word : " + word);
  var key =
    "dict.1.1.20170610T055246Z.0f11bdc42e7b693a.eefbde961e10106a4efa7d852287caa49ecc68cf";
  var url =
    "https://dictionary.yandex.net/api/v1/dicservice.json/lookup?key=" +
    key +
    "&lang=en-en&text=" +
    word;
  let myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const myInit = {
    headers: myHeaders
  };
  let myRequest = new Request(url);

  fetch(myRequest)
    .then(function(response) {
      if (!response.ok) {
        throw new Error("HTTP error, status = " + response.status);
      }
      return response.json();
    })
    .then(function(myJson) {
      //Append dummy record to myJson object
      if (myJson.def.length == 0) {
        let wr = word;
        let obj = {
          text: wr,
          pos: "none",
          tr: []
        };
        myJson.def.push(obj);
      }

      let t_word = myJson.def[0].text;
      let partsofspeech = myJson.def[0].pos;
      let synonyms = "";
      let syn_arr = [];
      for (let i = 0; i < myJson.def[0].tr.length; ++i) {
        if (myJson.def[0].tr[i].syn != undefined) {
          for (let j = 0; j < myJson.def[0].tr[i].syn.length; ++j) {
            synonyms += myJson.def[0].tr[i].syn[j].text + ", ";
            syn_arr.push(myJson.def[0].tr[i].syn[j].text);
          }
        }
      }
      // let txt = "WORD : " + t_word + "\n";
      // txt += "COUNT : " + wordCount;
      // txt += "POS : " + partsofspeech + "\n";
      // txt += "SYNONYMS : " + synonyms + "\n\n";
      // document.getElementById("txtWordAnalysis").value += "\n" + txt;

      var wordObj = {
        word: t_word,
        output: {
          count: wordCount,
          pos: partsofspeech,
          synonyms: syn_arr
        }
      };
      updateWordList(wordObj);
    });
}

//This functions appends each word json into ul html element
function updateWordList(wordJson) {
  let jsonText = JSON.stringify(wordJson);

  let ul = document.getElementById("wordList");
  let li = document.createElement("li");
  li.setAttribute("class", "item");
  ul.appendChild(li);
  li.innerHTML = li.innerHTML + jsonText;
}
