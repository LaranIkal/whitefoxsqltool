
load('webapps/whitefox/server/lib/SQLQueryTool_Subs.jss')

function SQLQueryTool(variables, session, response) { 

  var varValues = variables.split("&")
  var webPageName = varValues[0].split("/")[1] // First array element has the web page name.
  var queryOption = new Array("","")
  var queryInstruction = new Array("","")
  var validationResult = new Array("","")
  var sqlQueryName = new Array("","")
  var sqlQueryID = new Array("","")
  var dataSourceID = new Array("","")
  var fSeparator = new Array("","")
  var fEnclosed = new Array("","")
  var sqlScript = new Array("","")
  var showRecordsCount = new Array("","")
  var minRecordNum = new Array("","")
  var saveQueryMessage = ""
  var queryToolHtml = ""

  if( varValues.length > 1 ) { // Get variables values if they exists
    try {
      function varsFunction(webVar, index, arr) {
        if(webVar.substr(0, 11) === "queryoption") queryOption = arr[index].split("=")
        if(webVar.substr(0, 16) === "queryinstruction") queryInstruction = arr[index].split("=")
        if(webVar.substr(0, 16) === "validationresult") validationResult = arr[index].split("=")
        if(webVar.substr(0, 12) === "sqlqueryname") sqlQueryName = arr[index].split("=")
        if(webVar.substr(0, 10) === "sqlqueryid") sqlQueryID = arr[index].split("=")
        if(webVar.substr(0, 12) === "datasourceid") dataSourceID = arr[index].split("=")
        if(webVar.substr(0, 10) === "fseparator") fSeparator = arr[index].split("=")
        if(webVar.substr(0, 9) === "fenclosed") fEnclosed = arr[index].split("=")
        if(webVar.substr(0, 9) === "sqlscript") sqlScript = arr[index].split("=")
        if(webVar.substr(0, 16) === "showrecordscount") showRecordsCount = arr[index].split("=")
        if(webVar.substr(0, 12) === "minrecordnum") minRecordNum = arr[index].split("=")
      }
      varValues.forEach(varsFunction)
    } finally {}
  }
  
  //var myHtml = "Variables<br>"
  //myHtml += "<p>" + sqlScript[0] + " = " + sqlScript[1] + "</p>"
  //myHtml += "<p>varValues = " + variables + "</p>"
  //return(myHtml)

  switch (queryOption[1].trim()) {
    case '':
      queryToolHtml = QueryMainScreen(sqlQueryID[1].trim(), dataSourceID[1].trim(), fSeparator[1].trim(), fEnclosed[1].trim(), sqlScript[1].trim(), saveQueryMessage)
      break
    case 'Execute Query':
      queryToolHtml = ExecuteQuery(dataSourceID[1].trim(), sqlScript[1].trim(), showRecordsCount[1].trim(), minRecordNum[1].trim(), queryInstruction[1].trim())
      break
     case 'Export Query Results':
      queryToolHtml = ExportQuery(dataSourceID[1].trim(), sqlScript[1].trim(), fSeparator[1].trim(), fEnclosed[1].trim())
      break      
    case 'Save Query':
      queryToolHtml = SaveQuery(sqlQueryID[1].trim(), dataSourceID[1].trim(), sqlQueryName[1].trim(), sqlScript[1].trim())
      break
    case 'RefreshQueryList':
      queryToolHtml = RefreshQueryList(sqlQueryID[1].trim())
      break
    case 'Display':
      queryToolHtml = QueryMainScreen(sqlQueryID[1].trim(), dataSourceID[1].trim(), fSeparator[1].trim(), fEnclosed[1].trim(), sqlScript[1].trim(), saveQueryMessage)
      break
    case 'Delete':
      DeleteQuery(sqlQueryID[1].trim())
      queryToolHtml = QueryMainScreen("", dataSourceID[1].trim(), fSeparator[1].trim(), fEnclosed[1].trim(), sqlScript[1].trim(), saveQueryMessage)
      break
    default:
      queryToolHtml = QueryMainScreen(sqlQueryID[1].trim(), dataSourceID[1].trim(), fSeparator[1].trim(), fEnclosed[1].trim(), sqlScript[1].trim(), saveQueryMessage)
  }


  return(queryToolHtml)
}







