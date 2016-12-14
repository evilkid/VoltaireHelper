var colors = ["2px 3px 0px rgba(255, 0, 0, 0.10)", 
				"2px 3px 0px rgba(0, 255, 0, 0.10)", 
				"2px 3px 0px rgba(0, 0, 255, 0.10)", 
				"2px 3px 0px rgba(255, 255, 0, 0.10)",
				"2px 3px 0px rgba(0, 255, 255, 0.10)"];
var currentColor = 0; 

function getCurrentColor(){
	if(currentColor > 5){
		currentColor = 0;
	}else{
		return colors[currentColor++];
	}
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.state == "init") {

            var sentense = document.getElementsByClassName("sentence")[0].innerText;
            if (sentense.indexOf(". (") > 0) {
                sentense = sentense.substr(0, sentense.indexOf(". (") + 1)
            }
            console.log(typeof sentense);
			sentense = sentense.replace("œ", "oe");




            sendResponse({
                sentense: sentense
            });
		}else if(request.state == "no_error_found"){
			$(".appFooterLabel").css("color", "green"); 
			setTimeout(function(){$(".appFooterLabel").css("color", "black"); }, 3000)
        }else{
			console.log("words from background: " + request.data);
			var pageWords = $(".pointAndClickSpan").filter(function(index, word){return word.innerText != " " && word.innerText != "'";});
			
			if(request.data){
				request.data.forEach(function(words){
					pageWords.each(function(index, pageWord){
							
							if(pageWord.innerText && words[0] == pageWord.innerText){
								
								if(words.length > 1){
									var change = true;
									
									for(var i = 1; i < words.length; i++){
										console.log(pageWords.get(index + i).innerText);
										if(pageWords.get(index + i).innerText != words[i]){
											change = false;
											continue;
										}
									}
									
									if(change){
										for(var i = 0; i < words.length; i++){
											pageWords.get(index + i).style.cssText = "text-shadow : " + getCurrentColor();
										}
									}
									
								}else if(words.length == 1){
									pageWord.style.cssText = "text-shadow : " + getCurrentColor();
								}
							}

							
						});
				});
				
				currentColor = 0; 
			}
		}
    });
	


