

//******************************************************************************	
//* GENERAL FUNCTIONS	
//******************************************************************************

function updatepage( str, DivFieldToUpdate ) {
	document.getElementById(DivFieldToUpdate).innerHTML = str
}


//******************************************************************************	
//* AJAX FORM SUBMIT FUNCTIONS	
//******************************************************************************
	
function xmlhttpPostDsAction( urlToPost, dsOption, targetDivFieldId ) {
	var self = this
	var qstr = new URLSearchParams()
	var selectedIndexValue = 0
	var actionMessage = ""
	var dataSourceId = ""
	var validateConnection = "No"
	var dataSourceName = ""
	var dataSourceScript = ""
	var tableName = ""
	var errorMessage = ""
	var confirmMessage = ""
	var ajaxResponseArray = new Array("","")

	switch( dsOption ) {
		case 'DBConnectionSave':
			dataSourceId = document.getElementById("datasourceid").value
			dataSourceName = document.getElementById("datasourcename").value.trim()
			if( dataSourceName == "" ) errorMessage += "Data Source Name Must Have a Not Empty Value.<br>"
			//dataSourceScript = document.forms[0].datasourcescript.value // Other way to get the value.
			
			var valdataSourceScript = document.getElementById("datasourcescript").value.trim().replace(/^\s+|\s+$/g,'');
			if( valdataSourceScript == "" ) {
				errorMessage += "Data Source Name Must Have a Not Empty Value.<br>"
			} else {
				dataSourceScript = document.getElementById("datasourcescript").value
				dataSourceScript = dataSourceScript.replace(/=/g,"anequalchar")
				dataSourceScript = dataSourceScript.replace(/\+/g,"apluschar")
				dataSourceScript = dataSourceScript.replace(/\t/g,"  ")
			}
			
			if( document.getElementById("validateconn").checked ) validateConnection = "Yes"

			actionMessage = "Saving Database Connection Information."
			break
		case 'DBConnectionEdit':
			var select = document.getElementById('seldatasourceid')
			var optionSelected = select.children[select.selectedIndex]			
			selectedIndexValue = document.getElementById("seldatasourceid").selectedIndex
			dataSourceId = document.getElementById("seldatasourceid").value
			actionMessage = "Edit Database Connection Information For: " + optionSelected.textContent
			updatepage( actionMessage, "divdsadmin" )
			location.replace("/whitefox/server/index.jss?whitefoxop=QueryToolDS&datasourceid="+dataSourceId)
			break
		case 'DBConnectionDelete':
			var select = document.getElementById('seldatasourceid')
			var optionSelected = select.children[select.selectedIndex]

			selectedIndexValue = document.getElementById("seldatasourceid").selectedIndex
			dataSourceId = document.getElementById("seldatasourceid").value
			confirmMessage = "Do You Want to Delete Database Connection: " + optionSelected.textContent + ", Type YES to Confirm:"
			actionMessage = "Delete Database Connection Information: " + optionSelected.textContent
			if( dataSourceId.trim() == "" ) {
				errorMessage += "Select Data Source to Delete."
			} else {
				var confirm = prompt(confirmMessage, "NO")

				if( confirm == null || confirm.trim() != "YES" ) {
					return    
				}
			}
			break
		case 'DBConnectionTest':
			var select = document.getElementById('seldatasourceid')
			tableName = document.getElementById("tablename").value
			var optionSelected = select.children[select.selectedIndex]
			dataSourceId = document.getElementById("seldatasourceid").value
			if( dataSourceId.trim() == "" ) {
				errorMessage += "Select Data Source to be Tested.<br>"
			} else {
				if( tableName.trim() == "" ) {
					errorMessage += "Enter Table Name to Test The Connection.<br>"
				} else {
					actionMessage = "Testing Database Connection: " + optionSelected.textContent
				}
			}
			break
		default:
			return
	}
	
	if( errorMessage != "" ) {
		document.getElementById(targetDivFieldId).style.color = "red"
		updatepage( errorMessage, targetDivFieldId )
		document.getElementById(targetDivFieldId).style.color = "black"
		return    
	}

	// If action confirmed, execute it.
	TheTimeOut = setTimeout("document.body.style.cursor='wait'", 1)
	
	try {
		updatepage( actionMessage, targetDivFieldId )
		
		if (window.XMLHttpRequest) {
			self.xmlHttpReq = new XMLHttpRequest() // Mozilla/Safari/Chrome
		} else if (window.ActiveXObject) {
			self.xmlHttpReq = new ActiveXObject("Microsoft.XMLHTTP") // IE
		}
		
		self.xmlHttpReq.open('POST', urlToPost, true)
		self.xmlHttpReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
		self.xmlHttpReq.onreadystatechange = function() { // Once the server has responded to the request, do this
			if (self.xmlHttpReq.readyState == 4) { 
				var ajaxResponse = self.xmlHttpReq.responseText
				
				if( ajaxResponse.substr(0, 12) == "datasourceid" ) {
					ajaxResponseArray = ajaxResponse.split("|")
					ajaxResponse = ajaxResponseArray[1]
				}
				
				if( ajaxResponse.substr(0, 28) == "javax.script.ScriptException" || ajaxResponse.substr(0, 17) == "JES.Web.Exception" ) {
					ajaxResponse += "<form name=\"clear\"> <input type=\"button\" value=\"Clear\" onClick='JavaScript:updatepage(\"\",\"" + targetDivFieldId + "\")'></form>"
				}
				
				updatepage(ajaxResponse, targetDivFieldId)
				clearTimeout(TheTimeOut)
				
				if( dsOption == "DBConnectionDelete" && ajaxResponse.substr(0, 28) !== "javax.script.ScriptException" && ajaxResponse.substr(0, 17) != "JES.Web.Exception" ) {
					//setTimeout(function(){ location.reload() }, 3000)// Wait for 3 seconds before reloading web page
					setTimeout(function(){ location.replace("/whitefox/server/index.jss?whitefoxop=QueryToolDS") }, 3000)// Wait for 3 seconds before redirect to a clean web page
				} else if( dsOption == "DBConnectionSave" && dataSourceId == "" ) {
					//updatepage("Now we should redirect page.", targetDivFieldId)
					setTimeout(function(){ location.replace("/whitefox/server/index.jss?whitefoxop=QueryToolDS&"+ajaxResponseArray[0].trim()) }, 3000)// Wait for 3 seconds before redirecting web page
				}
				document.body.style.cursor = "default"
			}
		}
	
    qstr.append('whitefoxop', 'QueryToolDS');
    qstr.append('dsoption', dsOption);
    qstr.append('datasourceid', dataSourceId);
    qstr.append('datasourcename', dataSourceName);
    qstr.append('datasourcescript', dataSourceScript);
    qstr.append('validateconn', validateConnection);
    qstr.append('tablename', tableName);

		//alert("Variables:" + qstr)
		
		self.xmlHttpReq.send(qstr)
		
	} catch(err){clearTimeout(TheTimeOut); document.body.style.cursor='default';}
}

