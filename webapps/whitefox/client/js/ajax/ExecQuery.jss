
function UpdtFileFormat() {
  if (document.getElementById("xmlformat").checked == true){
    document.getElementById("usexml").value = "Yes"
  } else {
    document.getElementById("usexml").value = "No"
  }

  if (document.getElementById("xlsformat").checked == true){
    document.getElementById("usemsxls").value = "Yes"
  } else {
    document.getElementById("usemsxls").value = "No"
  }

  if (document.getElementById("xlsformatlo").checked == true){
    document.getElementById("useloxls").value = "Yes"
  } else {
    document.getElementById("useloxls").value = "No"
  }
}

function updatepage(str,DivFieldToUpdate) {		
	document.getElementById(DivFieldToUpdate).innerHTML = str
}

function xmlhttpPostScriptData(strURL,formRef,DivField,theQueryOption, minRecNum) {
	var xmlHttpReq = false
	var self = this
  var qstr = new URLSearchParams()
	var qstr1 = ""
	// Getting form data
	var queryOption = theQueryOption
	var thereIsError = ""
	var validationResult = ""
	var ajaxResponseArray = new Array("","")
	var sqlQueryIdexArray = new Array("","")

	var sqlScript = document.getElementById('sqlscript').value
	var sqlScriptValidation = document.getElementById('sqlscript').value.replace(/^\s+|\s+$/g,'')
	var sqlQueryName = document.getElementById('sqlqueryname').value.replace(/^\s+|\s+$/g,'')
	sqlQueryName = sqlQueryName.replace(/ /g,'_')
	var dataSourceID = document.getElementById("datasourceid").options[document.getElementById("datasourceid").selectedIndex].value
	
	if( DivField.trim() == "ResultsPane" ) {
		var sqlQueryID = document.getElementById("sqlqueryid").options[document.getElementById("sqlqueryid").selectedIndex].value
		document.getElementById('sqlqueryidex').value = sqlQueryID
	} else {
		sqlQueryID = document.getElementById('sqlqueryidex').value // Assign sqlQueryID of sql query saved.
	}

	if( queryOption == "Save Query" ) {
		if( sqlQueryName == "" ) thereIsError += "Enter SQL Query Name."
		//if( sqlScriptValidation.trim() == "" ) thereIsError += "<br>Enter SQL Script."
	}
  
	var queryInstruction = document.getElementById("queryinstruction").options[document.getElementById("queryinstruction").selectedIndex].value
		
	// Convert chars that may cause problems.
	sqlScript = sqlScript.replace(/\+/g,"apluschar")
	sqlScript = sqlScript.replace(/=/g,"anequalchar")
       
  var showRecordsCount = "No"
	if( document.forms[1].showrecordscount.checked ) showRecordsCount = "Yes"
        
	if( queryOption == "Export Query Results" || queryOption == "Execute Query" ) {
		if( sqlScriptValidation.trim() == "" ) thereIsError += "<br>Enter a SQL Command."		
		if( dataSourceID == "0" ) thereIsError += "<br>Select Data Source."
	}
//document.getElementById("sqlqueryid").value
	if( queryOption == "Delete" ) {		
		var deleteMessage = "<b><font color=\"red\">Do you want to delete query: <b>"
		deleteMessage += document.getElementById("sqlqueryid").options[document.getElementById("sqlqueryid").selectedIndex].text + "?</b>\n"
		deleteMessage += " <a href=\"/whitefox/server/index.jss?whitefoxop=QueryTool&amp;sqlqueryid=" + sqlQueryID + "&amp;queryoption=Delete\">Yes</a>"
		deleteMessage += "&nbsp;&nbsp;<a href=\"javascript:updatepage('','ResultsPane');\">No</a></font></b>"
		updatepage(deleteMessage,'ResultsPane')
		return
	}


	if( thereIsError == "" ) { // If no errors, continue
		if( queryOption == "Export Query Results" ) {

			var fileFormatsSelected = 0
			if( document.getElementById("xmlformat").checked == true ) {
				fileFormatsSelected += 1
			}

			if( document.getElementById("xlsformat").checked == true ) {
				fileFormatsSelected += 1
			}

			if( document.getElementById("xlsformatlo").checked == true ) {
				fileFormatsSelected += 1
			}

			if( fileFormatsSelected > 1 ) {
				document.getElementById("usexml").value = "No"
				document.getElementById("usemsxls").value = "No"
				document.getElementById("useloxls").value = "No"
				alert("Only one file format can be selected.")
				return
			}

			updatepage("Executing Query, please wait...",DivField)
			document.getElementById("queryoption").value = queryOption
			document.getElementById("MainQuery").action = strURL //  set form action to /downloadfile/whitefox/ExportQueryResults

			if( document.getElementById("headerline").checked == true ) {
				document.getElementById("writeheaderline").value = "Yes"
			} else {
				document.getElementById("writeheaderline").value = "No"
			}

      document.getElementById('sqlscript').value = sqlScript
      
			document.getElementById("MainQuery").submit()
			//formRef.submit()
			updatepage("Query To Export Data Submitted.",DivField)
		} else {
			TheTimeOut = setTimeout("document.body.style.cursor='wait'", 1)
			try {		
				if( queryOption == "Execute Query" ) {
					updatepage("Executing Query, please wait...",DivField)
				} else {
					updatepage("Processing, please wait...",DivField)
				}
				
				if (window.XMLHttpRequest) { // Mozilla/Safari/Chrome
						self.xmlHttpReq = new XMLHttpRequest()
				} else if (window.ActiveXObject){ // IE
					self.xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP")
				}

				self.xmlHttpReq.open('POST', strURL, true);
				self.xmlHttpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
				//~ self.xmlHttpReq.setRequestHeader("Content-Type", "text/html; charset=iso-8859-1");
				self.xmlHttpReq.onreadystatechange = function() {
					if( self.xmlHttpReq.readyState == 4 ) {
						var ajaxResponse = self.xmlHttpReq.responseText						

						if( ajaxResponse.substr(0, 10).trim() === "sqlqueryid" ) {
							ajaxResponseArray = ajaxResponse.split("|")
							ajaxResponse = ajaxResponseArray[1]
						}

						updatepage(ajaxResponse,DivField)
						clearTimeout(TheTimeOut)

						if( DivField == "ResultsPane" && ( queryOption == "Save Query" || queryOption == "Delete Query" ) ) {
							sqlQueryIdexArray = ajaxResponseArray[0].split("=")
							document.getElementById('sqlqueryidex').value = sqlQueryIdexArray[1].trim()
							xmlhttpPostScriptData(strURL,formRef,"QueryList","RefreshQueryList", minRecNum)
						}
						document.body.style.cursor='default'
					}
				}

        qstr.append('whitefoxop', 'QueryTool');
        qstr.append('queryoption', queryOption);
        qstr.append('datasourceid', dataSourceID);
        qstr.append('sqlscript', sqlScript);
        qstr.append('showrecordscount', showRecordsCount);
        qstr.append('queryinstruction', queryInstruction);
        qstr.append('sqlqueryname', sqlQueryName);
        qstr.append('sqlqueryid', sqlQueryID);
        qstr.append('minrecordnum', minRecNum);
        qstr.append('validationresult', validationResult);
				//alert(qstr)
				//return
				self.xmlHttpReq.send(qstr);


			} catch(err){clearTimeout(TheTimeOut); document.body.style.cursor='default';}
		} // if( queryOption == "Export Query Results" ) {
	} else { 
		updatepage("<p><b><font color=\"red\">"+thereIsError+"</font></b></p>",DivField)
	}// if( thereIsError == "" ) {
}
	

