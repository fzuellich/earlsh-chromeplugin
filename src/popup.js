function focus_shorturl_result() {
	var element = window.document.getElementById('shorturl_result');
	element.setSelectionRange(0, element.value.length);
}

window.onload = function() {
	chrome.tabs.query({'active': true, 'currentWindow': true}, function(tabs) {
		var tab = tabs[0];
		window.document.getElementById('shorturl_result').value = tab.url;
		focus_shorturl_result();
	});
};
