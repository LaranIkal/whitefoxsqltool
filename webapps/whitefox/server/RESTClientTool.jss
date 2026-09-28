
load('webapps/whitefox/server/lib/RESTClientTool_Subs.jss')

function RESTClientTool(variables, session, response) {

  var varValues = variables.split("&")
  var webPageName = varValues[0] // First array element has the web page name.
  var restClientOption = new Array("","")
  var dataSourceID = new Array("","")
  var dataSourceName = new Array("","")
  var dataSourceScript = new Array("","")
  var tableName = new Array("","")
  var validateConn = new Array("","")
  var htmlResult = ""
  
  //session="false" // completely delete session
  //myHtml += "<p> Session accessed-creation time:" + ((( session.getLastAccessedTime() - session.getCreationTime())/1000)/60) + "</p>"
  
  if( varValues.length > 1 ) { // Get variables values if they exists
    try {
      function myFunction(myVar, index, arr) {
        if(myVar.substr(0, 8) === "dsoption") restClientOption = arr[index].split("=")
        if(myVar.substr(0, 12) === "datasourceid") dataSourceID = arr[index].split("=")
        if(myVar.substr(0, 14) === "datasourcename") dataSourceName = arr[index].split("=")
        if(myVar.substr(0, 16) === "datasourcescript") dataSourceScript = arr[index].split("=")
        if(myVar.substr(0, 9) === "tablename") tableName = arr[index].split("=")
        if(myVar.substr(0, 12) === "validateconn") validateConn = arr[index].split("=")
      }
      varValues.forEach(myFunction)
    } finally {}
  }
  
  
  switch (restClientOption[1].trim()) {
    case '':
      htmlResult = MainScreen( dataSourceID[1].trim() )
      break
    case 'SaveData':
      htmlResult = SaveData( dataSourceID[1].trim(), dataSourceName[1].trim(), dataSourceScript[1], validateConn[1] )
      break
    case 'EditData':
      htmlResult = MainScreen( dataSourceID[1].trim())
      break
    case 'DeleteData':
      htmlResult = DeleteData( dataSourceID[1].trim() )
      break
    case 'RestTest':
      htmlResult = RestTest( dataSourceID[1].trim(), tableName[1].trim() )
      break
    default:
      htmlResult = MainScreen( dataSourceID[1].trim() )
  }


  return(htmlResult)
}







