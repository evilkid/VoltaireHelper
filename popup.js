document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function(tabs) {
        _tabs = tabs;
        chrome.tabs.sendMessage(tabs[0].id, {
            state: "init"
        }, handleResponse);
    });
});

var _tabs;

function handleResponse(response) {

    var errorWords = [];

    $.ajax({
        url: 'http://syn-web01.synapse-fr.com/api/textchecker/correct_logged',
        contentType: 'application/xml; charset=utf-8',
        method: 'POST',
        data: "<RequestData><details>" + response.sentense + "</details><userlogin>undefined</userlogin></RequestData>",
        success: function(data) {


            var corrected = data.querySelector("corrected")
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(corrected.textContent, "text/xml");
            var sentences = xmlDoc.querySelector("sentences");
            if (sentences.getAttribute("nb") > 0) {
                var sentence = sentences.firstElementChild;
                x = sentence;
                var phrase = sentence.querySelector("inputText").textContent;

                var errors = Array.prototype.slice.call(x.querySelectorAll("error"), 0);

                errors.sort(function(error1, error2) {
                    return Number(error2.getAttribute("proba")) - Number(error1.getAttribute("proba"));
                }).forEach(function(error) {

                    var newDiv = $('<div></div>');
                    newDiv.append("type: " + error.getAttribute("type") + ", proba: " + error.getAttribute("proba") + "%");
                    newDiv.append("<br/>");
                    var newSpan = $("<span>" + phrase + "</span>");


                    var start = Number(error.getAttribute("start"));
                    var end = Number(error.getAttribute("end"));

                    highlight(newSpan[0], start, end);
                    newDiv.append(newSpan);
                    newDiv.append("<hr/>")

                    $("#div").append(newDiv);


                    var errorWord = phrase.substr(start, end - start);

                    errorWords.push(errorWord.trim().split(/'|\u2011| |-/g));

                });


                chrome.tabs.sendMessage(_tabs[0].id, {
                    data: errorWords
                }, function(response) {});
            } else {

                $("#div").append("no error were found");
                chrome.tabs.sendMessage(_tabs[0].id, {
                    state: "no_error_found"
                });
            }
        },
        error: function(resp) {
            console.log(resp);
        }
    });

}

function highlight(element, start, end) {
    var str = element.innerHTML;

    str = str.substr(0, start) +
        '<i style="border-bottom: 2px solid red;">' +
        str.substr(start, end - start + 1) +
        '</i>' +
        str.substr(end + 1);

    element.innerHTML = str;
}