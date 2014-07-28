Package.describe({
	summary: "Configure Meteor to be used with Asteroid"
});

Package.on_use(function (api) {
	api.use(["webapp", "logging", "oauth"], "server");
	api.add_files("asteroid.js", "server");
	api.add_files("asteroid_oauth_popup.html", "server", {isAsset: true});
});
