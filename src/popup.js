var UIHandler = {};

UIHandler.init = function() {
	this.set_display('block', 'none');
	this.set_loading_status('Loading...');
}

UIHandler.set_display = function(loading, result) {
	var loading_section = document.getElementById('loading');
	var result_section = document.getElementById('result');

	result_section.style.display = result;
	loading_section.style.display = loading;
}

UIHandler.set_loading_status = function(status) {
	document.getElementById('loading-status').innerText = status;
}

UIHandler.set_error_state = function(user_info, response_text) {
	this.set_display('none', 'none');

	document.getElementById('error').style.display = 'block';
	document.getElementById('user-info').innerText = user_info;
	document.getElementById('error-message').innerText = response_text;
}

UIHandler.set_token_result = function(status, response) {
	if (status === 200) {
		UIHandler.set_loading_status('Request successful');
		UIHandler.set_display('none', 'block');

		document.getElementById('shorturl-result').value = response;
		UIHandler.focus_shorturl_result();
	} else {
		UIHandler.set_error_state('An error occured:', response);
	}
}

UIHandler.focus_shorturl_result = function() {
	var element = window.document.getElementById('shorturl-result');
	element.setSelectionRange(0, element.value.length);
}


var EarlshAPI = function(endpoint, token) {
	this.endpoint = endpoint;
	this.token = token;
}

EarlshAPI.prototype._shorten_endpoint = function() {
	return this.endpoint + '/url/create?apikey=' + this.token;
}

EarlshAPI.prototype._resolve_url = function(token) {
	var base = this.endpoint.split('/api')[0];
	return base + '/r/' + token;
}

/**
 * Send a request to shorten the given url. Callback function is
 * called with the resulting token.
 * @param {string} url_to_shorten URL as string to shorten.
 * @param {function} callback Callback function receiving token as string argument.
 */
EarlshAPI.prototype.request_shorturl_token = function(url_to_shorten, successful, error, progress) {
	var request_data = JSON.stringify({
		"url": url_to_shorten
	});

	var xhr = new XMLHttpRequest();
	var that = this;
	xhr.addEventListener('progress', progress);
	xhr.addEventListener('load', function() {
		if (xhr.status === 200) {
			var token = JSON.parse(xhr.responseText).token;
			var result = that._resolve_url(token);
			successful(xhr.status, result);
		} else {
			error(xhr.responseText);
		}
	});

	xhr.addEventListener('error', function() {
		error(xhr.responseText)
	});

	xhr.onreadystatechange = function(event) {}

	var endpoint = this._shorten_endpoint();
	xhr.open('POST', endpoint, true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(request_data);
};


window.onload = function() {
	chrome.tabs.query({
		'active': true,
		'currentWindow': true
	}, function(tabs) {
		UIHandler.init();
		UIHandler.set_loading_status('Fetching API properties...');

		chrome.storage.sync.get(['endpoint', 'apikey'], function(items) {
			var api = new EarlshAPI(items['endpoint'], items['apikey']);

			var tab = tabs[0];

			api.request_shorturl_token(tab.url, UIHandler.set_token_result,
				function(error_message) {
					UIHandler.set_error_state('Error:', error_message);
				},
				function() {
					UIHandler.set_loading_status('Loading...');
				});
		});

	});
};