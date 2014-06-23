var fs = Npm.require("fs");
var popupHtml = fs.readFileSync("./popup.html", "utf-8");

// Patch OAuth._endOfLoginResponse to expose the credentialToken and
// credentialSecret in the url of the popup window.
OAuth._endOfLoginResponse = function (res, details) {

	// Set response headers
	res.writeHead(200, {
		"Content-Type": "text/html"
	});

	if (details.error) {
		var errorDetails = details.error instanceof Error ? details.error.message : details.error;
		Log.warn("Error in OAuth Server: " + errorDetails);
		res.end(popupHtml, "utf-8");
		return;
	}

	if ("close" in details.query) {
		// If we have a credentialSecret, report it back to the parent
		// window, with the corresponding credentialToken. The parent window
		// uses the credentialToken and credentialSecret to log in over DDP.
		if (details.credentials.token && details.credentials.secret) {
			popupHtml = popupHtml
				.replace("TOKEN", details.credentials.token)
				.replace("SECRET", details.credentials.secret);
		}
		res.end(popupHtml, "utf-8");
	} else {
		res.end("", "utf-8");
	}
};
