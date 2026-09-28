
load('webapps/whitefox/server/lib/SQLQueryToolDS_Subs.jss')

function SQLQueryToolDS(variables, session, response) { 

  var varValues = variables.split("&")
  //response.getWriter().write("<pre>" + varValues.join("\n") + "</pre>")
  //response.getWriter().flush()
  var webPageName = varValues[0].split("/")[1] // First array element has the web page name.
  var dataSourceOption = new Array("","")
  var dataSourceID = new Array("","")
  var dataSourceName = new Array("","")
  var dataSourceScript = new Array("","")
  var tableName = new Array("","")
  var validateConn = new Array("","")
  var queryToolDsHtml = ""
  
  //session="false" // completely delete session
  //myHtml += "<p> Session accessed-creation time:" + ((( session.getLastAccessedTime() - session.getCreationTime())/1000)/60) + "</p>"
  
  if( varValues.length > 1 ) { // Get variables values if they exists
    try {
      function myFunction(myVar, index, arr) {
        if(myVar.substr(0, 8) === "dsoption") dataSourceOption = arr[index].split("=")
        if(myVar.substr(0, 12) === "datasourceid") dataSourceID = arr[index].split("=")
        if(myVar.substr(0, 14) === "datasourcename") dataSourceName = arr[index].split("=")
        if(myVar.substr(0, 16) === "datasourcescript") dataSourceScript = arr[index].split("=")
        if(myVar.substr(0, 9) === "tablename") tableName = arr[index].split("=")
        if(myVar.substr(0, 12) === "validateconn") validateConn = arr[index].split("=")
      }
      varValues.forEach(myFunction)
    } finally {}
  }
  
  
  switch (dataSourceOption[1].trim()) {
    case '':
      queryToolDsHtml = DsMainScreen( dataSourceID[1].trim() )
      break
    case 'DBConnectionSave':
      queryToolDsHtml = DBConnectionSave( dataSourceID[1].trim(), dataSourceName[1].trim(), dataSourceScript[1], validateConn[1] )
      break
    case 'DBConnectionEdit':
      queryToolDsHtml = DsMainScreen( dataSourceID[1].trim())
      break
    case 'DBConnectionDelete':
      queryToolDsHtml = DBConnectionDelete( dataSourceID[1].trim() )
      break
    case 'DBConnectionTest':
      queryToolDsHtml = DBConnectionTest( dataSourceID[1].trim(), tableName[1].trim() )
      break
    default:
      queryToolDsHtml = DsMainScreen( dataSourceID[1].trim() )
  }


  return(queryToolDsHtml)
}







