module.exports = class Webhook extends require("./template.js") {
	constructor (config) {
		super("webhook", config);

		if (!this.url) {
			throw new app.Error({
				message: "No webhook URL provided"
			});
		}
	}

	connect () {}

	async send (message, options = {}) {
		if (typeof message !== "object") {
			throw new app.Error({
				message: "Provided message is not an object",
				args: {
					message: {
						type: typeof message,
						constructor: message?.constructor?.name ?? "N/A"
					}
				}
			});
		}

		// pick which webhook channel to route to
                let webhookURL = this.url;
                switch (options.channel) {
                    case "checkin":
			webhookURL = this.checkinsURL ?? this.url;
			break;
		    case "code":
			webhookURL = this.codesURL ?? this.url;
			break;
		}

		const res = await app.Got("API", {
			url: webhookURL,
			method: "POST",
			responseType: "json",
			throwHttpErrors: false,
			searchParams: {
				wait: true
			},
			json: {
				content: options.content ?? "",
				embeds: [message],
				username: options.author ?? "HoyoLab",
				avatar_url: options.icon ?? "https://i.ibb.co/nRqTkXv/image.png"
			}
		});

		if (res.statusCode !== 200) {
			throw new app.Error({
				message: "Failed to send webhook message",
				args: {
					statusCode: res.statusCode,
					statusMessage: res.statusMessage
				}
			});
		}

		return true;
	}

	async handleMessage (messageData, options = {}) {
		if (!this.active) {
			return;
		}

		const messages = this.prepareMessage(messageData, options);
		if (messages) {
			return messages;
		}
	}

	createUserMention (userData) {
		if (!userData || typeof userData !== "object") {
			return null;
		}

		const userId = userData?.userId;
		if (!userId || userId === null) {
			return null;
		}

		return `<@${String(userId)}>`;
	}
};
