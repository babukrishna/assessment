function SCOData() {
	var initDate = new Date();
	this.sessionTime = null;
	this.lessonLocation = null;
	this.lessonStatus = null;
	this.percentageComplete = null;
	this.suspendData = null;
	this.userName = "John Doe";
	this.userId = "000000";
	this.score = null;
	this.errorCode = 0;
	this.trackingMode = null;

	this.sessionTraceData = new Array();
	this.sessionTraceLineBreak = "\n-------------------------------------------------------------";
	var cookieText = "The course is currently storing user state in a cookie.";
	var SCORMText = "The course is currently storing user state using SCORM.";

	this.setValue = function (item, value) {
		switch (item) {
			case "sessionTime":
				this.sessionTime = value;
				break;
			case "lessonLocation":
				this.lessonLocation = value;
				break;
			case "lessonStatus":
				this.lessonStatus = value;
				break;
			case "suspendData":
				this.suspendData = value;
				break;
			case "score":
				this.score = value;
				break;
			case "percentageComplete":
				this.percentageComplete = value;
				break;
		}
	};

	this.getValue = function (item) {
		var value = null;
		switch (item) {
			case "sessionTime":
				value = this.sessionTime;
				break;
			case "lessonLocation":
				value = this.lessonLocation;
				break;
			case "lessonStatus":
				value = this.lessonStatus;
				break;
			case "suspendData":
				value = this.suspendData;
				break;
			case "score":
				value = this.score;
				break;
			case "name":
				value = this.userName;
				break;
			case "id":
				value = this.userId;
				break;
		}
		this.sessionTraceData.push("\nSending getValue");
		this.sessionTraceData.push("\n" + item + ": " + value);
		this.sessionTraceData.push(this.sessionTraceLineBreak);
		return value;
	};
	this.initialize = function () {
		this.sessionTraceData.push("Starting session");
		if (getAPI()) {
			this.trackingMode = isSCORM2004 ? "SCORM2004" : "SCORM1.2";
		} else {
			this.trackingMode = null;
		}
		this.updateDebugger();
		this.sessionTraceData.push("\nTracking Mode: " + this.trackingMode);
		this.sessionTraceData.push("\n" + initDate.toLocaleString());
		this.sessionTraceData.push(this.sessionTraceLineBreak);

		this.sessionTraceData.push("\nSending initialize");

		switch (this.trackingMode) {
			case "SCORM2004":
				initializeCommunication();
				this.errorCode = retrieveLastErrorCode();
				this.lessonLocation = retrieveDataValue("cmi.location");

				this.lessonStatus = retrieveDataValue("cmi.completion_status");
				this.suspendData = retrieveDataValue("cmi.suspend_data");
				this.score = retrieveDataValue("cmi.score.raw");
				this.userName = retrieveDataValue("cmi.learner_name");
				this.userId = retrieveDataValue("cmi.learner_id");
				break;
			case "SCORM1.2":
				doLMSInitialize();
				this.errorCode = ErrorHandler();
				this.sessionTime = doLMSGetValue("cmi.core.session_time"); // commented by PN on 11/7/2005 for removing warning messages in ADL Test Suite
				this.lessonLocation = doLMSGetValue("cmi.core.lesson_location");
				this.lessonStatus = doLMSGetValue("cmi.core.lesson_status");
				this.suspendData = doLMSGetValue("cmi.suspend_data");
				this.score = doLMSGetValue("cmi.core.score.raw");
				this.userName = doLMSGetValue("cmi.core.student_name");
				this.userId = doLMSGetValue("cmi.core.student_id");
				break;

			case "cookies":
				allData = ""; //readCookie(moduleId);
				if (allData != "") {
					allData = allData.split(firstLevelDelim);
					for (i = 0; i < allData.length; i++) {
						tempArr = allData[i].split(secondLevelDelim);
						switch (tempArr[0]) {
							case "sessionTime":
								this.sessionTime = tempArr[1];
								break;
							case "lessonStatus":
								this.lessonStatus = tempArr[1];
								break;
							case "lessonLocation":
								this.lessonLocation = tempArr[1];
								break;
							case "suspendData":
								this.suspendData = tempArr[1];
								break;
							case "score":
								this.score = tempArr[1];
								break;
							case "name":
								this.userName = tempArr[1];
								break;
							case "id":
								this.userId = tempArr[1];
								break;
						}
					}
				}
				break;
		}
		this.sessionTraceData.push("\nError code after initialize is: " + this.errorCode);
		this.sessionTraceData.push(this.sessionTraceLineBreak);
	};

	this.finish = function () {
		//alert(this.trackingMode)
		switch (this.trackingMode) {
			case "SCORM2004":
				this.commit();
				terminateCommunication();
				break;
			case "SCORM1.2":
				this.commit();
				doLMSFinish();
				break;
			case "cookies":
				break;
		}
	};
	this.commit = function () {
		var result = true;
		// console.log("lms commit called.............");
		//debugger;
		curDate = new Date();
		timeDiff = (curDate.getTime() - initDate.getTime()) / 1000;
		timeDiff = Math.round(timeDiff);

		this.sessionTime = this.secondsToHours(timeDiff);

		this.sessionTraceData.push("\nSending commit to save data");
		this.sessionTraceData.push(
			"\nStart Time: " +
				initDate.toLocaleTimeString() +
				"; Lesson_Status:" +
				this.lessonStatus +
				"; Lesson_Location: " +
				this.lessonLocation +
				"; score: " +
				this.score +
				"; Suspend_Data: " +
				this.suspendData +
				"; Session_Time:" +
				this.sessionTime
		);

		switch (this.trackingMode) {
			case "SCORM2004":
				if (this.lessonLocation != undefined && this.lessonLocation != "undefined") {
					storeDataValue("cmi.location", this.lessonLocation);
				}
				if (this.suspendData != undefined && this.suspendData != "undefined") {
					storeDataValue("cmi.suspend_data", this.suspendData);
				}

				storeDataValue("cmi.completion_status", this.lessonStatus);
				if (this.percentageComplete != undefined && this.suspendData != "undefined" && this.suspendData != null) {
					storeDataValue("cmi.progress_measure", this.percentageComplete);
				}

				if (parseInt(this.score) >= 0) {
					storeDataValue("cmi.score.min", 0);
					storeDataValue("cmi.score.max", 100);
					storeDataValue("cmi.score.raw", this.score);
					storeDataValue("cmi.score.scaled", this.score / 100);
				}

				arrTmp = this.sessionTime.split(":");
				this.sessionTime = "PT" + arrTmp[0] + "H" + arrTmp[1] + "M" + arrTmp[2] + "S";

				storeDataValue("cmi.session_time", this.sessionTime);
				storeDataValue("cmi.exit", "suspend");
				persistData();

				break;
			case "SCORM1.2":
				doLMSSetValue("cmi.core.lesson_location", this.lessonLocation);
				doLMSSetValue("cmi.core.lesson_status", this.lessonStatus);
				doLMSSetValue("cmi.core.score.min", 0);
				doLMSSetValue("cmi.core.score.max", 100);
				doLMSSetValue("cmi.core.score.raw", this.score);
				doLMSSetValue("cmi.suspend_data", this.suspendData);
				doLMSSetValue("cmi.core.session_time", this.sessionTime);
				doLMSSetValue("cmi.core.lesson_status", this.lessonStatus);
				result = doLMSCommit("");

				break;
			case "cookies":
				strData = "";
				strData += "sessionTime" + secondLevelDelim + this.sessionTime + firstLevelDelim;
				strData += "lessonLocation" + secondLevelDelim + this.lessonLocation + firstLevelDelim;
				strData += "lessonStatus" + secondLevelDelim + this.lessonStatus + firstLevelDelim;
				strData += "suspendData" + secondLevelDelim + this.suspendData + firstLevelDelim;
				strData += "score" + secondLevelDelim + this.score + firstLevelDelim;
				strData += "name" + secondLevelDelim + this.userName + firstLevelDelim;
				strData += "id" + secondLevelDelim + this.userId + firstLevelDelim;
				writeCookie(moduleId, strData, cookieExpireTime);
				break;
		}
		this.sessionTraceData.push("\nError code after commit is: " + this.errorCode);
		this.sessionTraceData.push(this.sessionTraceLineBreak);

		return result;
	};

	this.showSessionTrace = function () {
		var width = "430",
			height = "375";
		var title = "LMS Session Trace";
		var msg = '<p style="font: bold 10pt Arial;">LMS Session Trace</p>';
		msg += '<textarea id="trace" style="font: 8pt Arial; width: 420px; height: 290px;">';
		for (i = 0; i < this.sessionTraceData.length; i++) {
			msg += this.sessionTraceData[i];
		}
		msg += "</textarea>";
		var left = screen.width / 2 - width / 2;
		var top = screen.height / 2 - height / 2;
		var styleStr =
			"toolbar=no,location=no,directories=no,status=no,menubar=no,scrollbars=no,resizable=no,copyhistory=yes,width=" +
			width +
			",height=" +
			height +
			",left=" +
			left +
			",top=" +
			top +
			",screenX=" +
			left +
			",screenY=" +
			top;
		var msgWindow = window.open("", "msgWindow", styleStr);
		var head = "<head><title>" + title + "</title></head>";
		var body =
			"<body><form>" + msg + '<br><input type="button" value="   Close   " onClick="self.close()"></form></body>';
		msgWindow.document.write(head + body);
		msgWindow.focus();
	};
	this.showCurrentState = function () {
		curDate = new Date();
		timeDiff = (curDate.getTime() - initDate.getTime()) / 1000;
		timeDiff = Math.round(timeDiff);
		this.sessionTime = this.secondsToHours(timeDiff);

		var msg = "";
		msg += "Start Time: " + initDate.toLocaleString() + "\n";
		msg += "Lesson_Location: " + this.lessonLocation + "\n";
		msg += "Lesson_Status: " + this.lessonStatus + "\n";
		msg += "Score: " + this.score + "\n";
		msg += "Session_Time: " + this.sessionTime + "\n";
		msg += "Suspend_Data: " + this.suspendData + "\n";
		msg += "User_Name: " + this.userName + "\n";
		msg += "User_Id: " + this.userId + "\n";
		alert(msg);
	};

	this.updateDebugger = function () {
		return;
		if (
			frames["debug"].document.getElementById("trackingMode") == undefined ||
			frames["debug"].document.getElementById("trackingMode") == "undefined"
		) {
			return;
		}
		frames["debug"].document.getElementById("trackingMode").innerHTML = this.trackingMode;
		if (this.trackingMode == "SCORM1.2" || this.trackingMode == "SCORM2004") {
			frames["debug"].document.getElementById("trackingModeText").innerHTML = SCORMText;
		} else if (this.trackingMode == "cookies") {
			frames["debug"].document.getElementById("trackingModeText").innerHTML = cookieText;
		}
	};

	this.secondsToHours = function (sec) {
		var hrs = Math.floor(sec / 3600);
		var min = Math.floor((sec % 3600) / 60);
		sec = sec % 60;
		if (sec < 10) sec = "0" + sec;
		if (min < 10) min = "0" + min;
		if (hrs < 10) hrs = "0" + hrs;
		//hrs + ":" + min + ":" + sec;
		return hrs + ":" + min + ":" + sec;
	};

	this.secondsToHours1 = function (sec) {
		var hrs = Math.floor(sec / 3600);
		var min = Math.floor((sec % 3600) / 60);
		sec = sec % 60;
		if (sec < 10) sec = "0" + sec;
		if (min < 10) min = "0" + min;
		if (hrs < 10) hrs = "0" + hrs;
		//hrs + ":" + min + ":" + sec;
		return hrs + ":" + min + ":" + sec + ".0";
	};
}
