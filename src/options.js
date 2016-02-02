// Code taken from: https://developer.chrome.com/extensions/optionsV2

// Saves options to chrome.storage.sync.
function save_options(event) {
	event.preventDefault();

	var apikey = document.getElementById('apikey').value;
	var endpoint = document.getElementById('endpoint').value;

	chrome.storage.sync.set({
		apikey: apikey,
		endpoint: endpoint
	}, function() {
		// Update status to let user know options were saved.
		var status = document.getElementById('status');
		status.textContent = 'Options saved.';
		setTimeout(function() {
			status.textContent = '';
		}, 750);
	});
}

function restore_options() {
	chrome.storage.sync.get({
		apikey: '',
		endpoint: 'http://'
	}, function(items) {
		document.getElementById('apikey').value = items.apikey;
		document.getElementById('endpoint').value = items.endpoint;
	});
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('options-form').addEventListener('submit',
		save_options);