RTA.clients.floodAdder = function(server, torrentdata) {
	var dir = server.flooddirectory;
	var paused = server.floodaddpaused;

	var apiUrl = (server.hostsecure ? "https://" : "http://") + server.host + addPort(server);
	
	fetch(apiUrl + "/auth/authenticate", {
		method: 'POST',
		headers: {
			"Content-Type": "application/json; charset=UTF-8"
		},
		body: JSON.stringify({"username": server.login, "password": server.password})
	})
	.then(RTA.handleFetchError)
	.then(response => response.json())
	.then(json => {
		if(!json.success) {
			RTA.displayResponse("Failure", "Login to " + server.name + "'s WebUI failed.", true);
		} else {
			var fetchOpts = {
				method: 'POST'
			};
			if(torrentdata.substring(0,7) == "magnet:") {
				apiUrl += "/api/client/add";
				fetchOpts.headers = { "Content-Type": "application/json; charset=UTF-8" };
				fetchOpts.body = JSON.stringify({ "urls": [ torrentdata ], "start": !paused, "destination": (!!dir ? dir: undefined) });
			} else {
				const dataBlob = RTA.convertToBlob(torrentdata, "application/x-bittorrent");

				apiUrl += "/api/client/add-files";

				fetchOpts.body = new FormData();
				fetchOpts.body.append("torrents", dataBlob, "file.torrent");
				fetchOpts.body.append("tags", "");
				if(dir != undefined && dir.length > 0) {
					fetchOpts.body.append("destination", dir);
				}
				fetchOpts.body.append("start", !paused);
			}

			fetch(apiUrl, fetchOpts)
			.then(RTA.handleFetchError)
			.then(response => response.text())
			.then(text => {
				if(text == '[["0"]]') {
					RTA.displayResponse("Success", "Torrent added successfully.");
				} else {
					RTA.displayResponse("Failure", "Torrent not added successfully:\n" + text);
				}
			})
			.catch(error => {
				RTA.displayResponse("Failure", "Could not contact " + server.name + "\nError: " + error.message, true);
			});
		}
	})
	.catch(error => {
		RTA.displayResponse("Failure", "Could not contact " + server.name + "\nError: " + error.message, true);
	});

};
