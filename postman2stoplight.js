/**
This function converts a list of Postman environments into a single .stoplight environment file
inputEnvs must be an array of JSON strings
*/
function convertPostmanEnv2Stoplight(inputEnvs) {

	var stoplightEnvironment = {
		"stoplight": "1.0",
		"environments": {}
	};

	var unorderedEnvs = {};
	for (var i = 0; i < inputEnvs.length; ++i) {
		try {
			var postmanEnv = JSON.parse(inputEnvs[i]);
			var env = {};
			for (var j in postmanEnv.values) {
				env[postmanEnv.values[j].key] = postmanEnv.values[j].value;
			}
			// Store
			unorderedEnvs[postmanEnv.name] = env;

		} catch {
			console.log("This input is not JSON well-formed.");
		}

		// Sort environments by key name
		var orderedEnvs = {};
		Object.keys(unorderedEnvs).sort().forEach(function(key) {
			orderedEnvs[key] = unorderedEnvs[key];
		});
		stoplightEnvironment.environments = orderedEnvs;
	}


	return stoplightEnvironment;
}


/**
This function converts a Postman collection into a Stoplight collection
The inmut parameter "postmanCollection" must be a JSON object
*/
function convertPostman2Stoplight(postmanCollection) {

	// Check that the Postman collection is at the 2.1 format
	var expectedSchema = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";
	if (!postmanCollection.hasOwnProperty('info') ||
		!postmanCollection.info.hasOwnProperty('schema') ||
		postmanCollection.info.schema != expectedSchema
	) {
		return {
			"error": "The input Postman collection must be at the 2.1 format.",
			"expectedSchema": expectedSchema
		};
	}
	var stoplightCollection = {
		"scenarioVersion": "1.1",
		"name": postmanCollection.info.name,
		"description": postmanCollection.info.description,
		"settings": {
			"testing": {
				"oas2": []
			}
		},
		"before": {},
		"after": {},
		"scenarios": {},
		"utilities": {}
	};

	// Recursive function
	function threatItem(currentObject, prefix) {
		if (currentObject.item !== null) {
			var scen = {
				"name": prefix + currentObject.name,
				"steps": []
			};

			// Dirty fixes
			if (scen.name.includes('undefined > ')) {
				scen.name = scen.name.substring(12);
			}
			if (scen.name.endsWith('undefined')) {
				scen.name = scen.name.substring(0, scen.name.indexOf('undefined'));
			}

			var later = [];
			for (var i in currentObject.item) {
				if (typeof currentObject.item[i].request === 'object' && currentObject.item[i].request !== null) {
					// This is a step
					scen.steps.push(extractStep(currentObject.item[i]));
				} else {
					// This is a subfolder
					// Push to threat later in order to preserve the folders' order
					later.push(currentObject.item[i]);
				}
			}

			// At the end : put in the scenario if it's not empty
			if (scen.steps.length > 0) {
				stoplightCollection.scenarios[generatePrefix()] = scen;
			}

			// Post-treatment of subfolders
			for (var i in later) {
				// Recursion
				threatItem(later[i], currentObject.name + ' > ');
			}
		}
	}

	// Begin to treat
	threatItem(postmanCollection, postmanCollection.info.name);

	return stoplightCollection;
}

function encodeEnvVars(str) {
	if (str) {
		return str.replace(/{{/g, '{$$$$.env.').replace(/}}/g, '}');
	} else {
		return str;
	}
}

function generatePrefix() {
	var d = new Date().getTime();
	return 'xxxxx'.replace(/[x]/g, function(c) {
		var r = (d + Math.random() * 36) % 36 | 0;
		d = Math.floor(d / 36);
		return r.toString(36);
	});
}

function extractStep(currentStepObject) {
	var step = {
		"type": "http",
		"name": currentStepObject.name,
		"description": currentStepObject.request.description,
		"input": {
			"headers": {},
			"query": {}
		},
		"after": {
			"assertions": [],
			"transforms": []
		}
	};

	// HTTP Verb
	step.input.method = currentStepObject.request.method.toLowerCase();

	// Headers
	for (var i in currentStepObject.request.header) {
		var h = currentStepObject.request.header[i];
		step.input.headers[h.key] = encodeEnvVars(h.value);
	}

	// Query params
	for (var i in currentStepObject.request.url.query) {
		var q = currentStepObject.request.url.query[i];
		step.input.query[q.key] = encodeEnvVars(q.value);
	}

	// URL
	step.input.url = encodeEnvVars(
		currentStepObject.request.url.host.join("/") +
		"/" +
		currentStepObject.request.url.path.join("/"));

	// Body
	var body = currentStepObject.request.body.raw;
	if (body && body.includes('{')) {
		step.input.body = JSON.parse(encodeEnvVars(body));
	} else {
		step.input.body = encodeEnvVars(body);
	}

	// Try to detect common assertions in Postman script
	if (currentStepObject.hasOwnProperty('event') &&
		currentStepObject.event.length > 0 &&
		currentStepObject.event[0].hasOwnProperty('script') &&
		currentStepObject.event[0].script.hasOwnProperty('exec')) {

		var postmanScript = currentStepObject.event[0].script.exec;

		// Regex based on the Postman snippets
		var statusCodeRegex = /.*responseCode\.code\s*===\s*(\d{3})\s*;.*/g;
		var responseTimeRegex = /.*pm\.expect\(pm\.response\.responseTime\)\.to\.be\.below\((\d{3})\)\s*;.*/g;

		var commentedScript = "// This script has been retrieve from your Postman collection\n";
		commentedScript += "// All lines are obviously commented out due to incompatibily\n";
		commentedScript += "//\n\n";

		for (i in postmanScript) {

			commentedScript += "// " + postmanScript[i] + "\n";

			// Status code :
			var match = statusCodeRegex.exec(postmanScript[i]);
			if (match != null && match.length > 0) {
				step.after.assertions.push({
					"target": "output.status",
					"op": "eq",
					"expected": 1 * match[1] // Cheat to keep numeric format
				});
			}

			// Response time :
			match = responseTimeRegex.exec(postmanScript[i]);
			if (match != null && match.length > 0) {
				step.after.assertions.push({
					"target": "output.time",
					"op": "lt",
					"expected": 1 * match[1] // Cheat to keep numeric format
				});
			}

			// Captures
			// Too complicated. In a next life.

		}

		// Full script
		step.after.script = commentedScript;
	}

	return step;
}
