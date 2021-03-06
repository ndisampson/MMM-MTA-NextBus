/* Magic Mirror
 * Node Helper: MMM-MTA-NextBus
 *
 * By 
 * MIT Licensed.
 */

var NodeHelper = require("node_helper");
var http = require('http');

module.exports = NodeHelper.create({

	// Override socketNotificationReceived method.

	/* socketNotificationReceived(notification, payload)
	 * This method is called when a socket notification arrives.
	 *
	 * argument notification string - The identifier of the noitication.
	 * argument payload mixed - The payload of the notification.
	 */
	socketNotificationReceived: function(notification, payload) {
		var self = this;
		
		if (notification === "CONFIG") {
			self.config = payload;
			self.getData();

			setInterval(function() {
				self.getData();
			}, self.config.updateInterval);
		} else if (notification === "GET_DATA") {
			self.getData();
		}
	},

	

	/* scheduleUpdate()
	 * Schedule next update.
	 *
	 * argument delay number - Milliseconds before next update.
	 *  If empty, this.config.updateInterval is used.
	 */
	/*scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		nextLoad = nextLoad ;
		var self = this;
		setTimeout(function() {
			self.getData();
		}, nextLoad);
	},*/

	/*
	 * getData
	 * function example return data and show it in the module wrapper
	 * get a URL request
	 *
	 */
	getData: function() {
		var self = this;

		var urlApi = "http://bustime.mta.info/api/siri/stop-monitoring.json?key=" + 
			self.config.apiKey + "&version=2&OperatorRef=MTA&MonitoringRef=" + 
			self.config.busStopCode;
		
		//var retry = true;

		http.get(urlApi, function(res) {
			var responseString = "";

			if (res.statusCode === 401) {
				self.sendSocketNotification("ERROR", this.status);
				console.log(self.name, this.status);
				//retry = false;
			} else if (res.statusCode != 200) {
				console.log(self.name, "Could not load data.");
				//self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
			} 

			res.on('data', function(data) {
				responseString += data;
			});
			
			res.on('end', function() {
				self.sendSocketNotification("DATA", JSON.parse(responseString));
			});

		}).on('error', function(e) {
			console.log("Communications error:", e.message);
			//self.scheduleUpdate((self.loaded) ? -1 : self.config.retryDelay);
		});
	}

});
