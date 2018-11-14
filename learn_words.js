console.log();

function ViewModel() {

	var self = this;

	var questionCtr = 0;
	var goodAnswerCtr = 0;
	var expectedAnswer;
	var askedWordIndex;

	this.title = ko.observable("");
	this.results = ko.observable("");
	this.theQuestion = ko.observable("");
	this.theAnswer = ko.observable("");
	this.feedback = ko.observable("");
	this.buttonText = ko.observable("Start learning");

	this.state = ko.observable("init");

	fillUp();

	this.onNext = function() {
		if(self.state() === "init") {
			//fillUp();
			choose();
		} else if(self.state()==="asking") {
			evaluate();
		} else if(self.state()==="practice") {
			check();
		} else if(self.state()==="next") {
			choose();
		}
	};

	this.onKeyPress = function(d, e) {
		if (e.keyCode == 13) {
			self.onNext();
		}
		return true;
	};

	var words = [];

	function fillUp() {
		$.get("https://spreadsheets.google.com/feeds/list/" + window.location.hash.substring(1) + "/od6/public/basic?alt=json", function(data, status){
			self.title(data.feed.title.$t);
			for(var i=0;i<data.feed.entry.length;i++) {
				var row = data.feed.entry[i];
				var content = row.content.$t;
				words.push({
					question: row.title.$t,
					answer: content.substring(content.indexOf(" ") + 1),
					stats: []
				});
			}
		});
	}
	
	function choose() {
		askedWordIndex = Math.floor(Math.random() * words.length);
		self.theQuestion(words[askedWordIndex].question);
		expectedAnswer = words[askedWordIndex].answer;
		self.feedback("Type the answer.");
		self.theAnswer("");
		$("#theAnswer").focus();
		self.state("asking");
		self.buttonText("Submit");
	}

	function evaluate() {
		questionCtr++;
		if(expectedAnswer.toLowerCase() == self.theAnswer().toLowerCase()) {
			goodAnswerCtr++;
			self.feedback("Good answer.");
			self.results("All:" + questionCtr + " Good:" + goodAnswerCtr);
			self.buttonText("Next word");
			self.state("next");
			updateStats(true);
		} else {
			self.feedback("The good answer would be: <b>" + expectedAnswer + "</b>. Type it.");
			self.results("All:" + questionCtr + " Good:" + goodAnswerCtr);
			self.theAnswer("");
			$("#theAnswer").focus();
			self.state("practice");
			updateStats(false);
		}
	}
	
	function updateStats(isGood) {
		words[askedWordIndex].stats.push([questionCtr, isGood]);
	}

	function check() {
		if(expectedAnswer.toLowerCase() == self.theAnswer().toLowerCase()) {
			choose();
		} else {

		}
	}
};

ko.applyBindings(new ViewModel());
