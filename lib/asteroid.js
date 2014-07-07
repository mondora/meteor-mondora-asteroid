var fs = Npm.require("fs");
var popupHtmlTemplate = fs.readFileSync("./assets/packages/mondora-asteroid/lib/popup.html", "utf8");

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
		popupHtml = popupHtmlTemplate
			.replace("ERROR", errorDetails)
			.replace("ALLOWED_ORIGIN", process.env.ALLOWED_ORIGIN);
		res.end(popupHtml, "utf-8");
		return;
	}

	if ("close" in details.query) {
		// If we have a credentialSecret, report it back to the parent
		// window, with the corresponding credentialToken. The parent window
		// uses the credentialToken and credentialSecret to log in over DDP.
		if (details.credentials.token && details.credentials.secret) {
			popupHtml = popupHtmlTemplate
				.replace("TOKEN", details.credentials.token)
				.replace("SECRET", details.credentials.secret)
				.replace("ALLOWED_ORIGIN", process.env.ALLOWED_ORIGIN);
		}
		res.end(popupHtml, "utf-8");
	} else {
		res.end("", "utf-8");
	}
};

Meteor.startup(function () {
	var allowedOrigin = process.env.ALLOWED_ORIGIN || Meteor.settings.allowedOrigin;
	if (!allowedOrigin) {
		console.warn("You have not specified any allowed origin.");
		console.warn("For ease of development, this will make any origin allowed, making the app insecure.");
		console.warn("In production, remember to specify the origin.");
		console.warn("If you wish not to allow any origin, set it to NONE.");
		allowedOrigin = "*";
	}
	if (allowedOrigin === "NONE") {
		allowedOrigin = Meteor.absoluteUrl();
		return;
	}
	WebApp.connectHandlers.use(function (req, res, next) {
		res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
		return next();
	});
});
