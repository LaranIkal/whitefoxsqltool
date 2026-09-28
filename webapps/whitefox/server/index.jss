
load('webapps/whitefox/config.jss')
load('webapps/whitefox/server/lib/Utils.jss')

function whitefoxMain(variables, session, response) { 
    
  var myHtml = "No valid whitefox option selected."
  var varValues = variables.split("&")
  var whitefoxOption = new Array("","")
    
  if( varValues.length > 1 ) { // Get variables values if they exists
    try { 
      function varsFunction(webVar, index, arr) {
        if(webVar.substr(0, 10) === "whitefoxop") whitefoxOption = arr[index].split("=") // change for variable name in html form.
      }                
      varValues.forEach(varsFunction)
    } finally {}
  }    

  /*
  myHtml += "<p>" + whitefoxOption[0] + " = " + whitefoxOption[1] + "</p>"
  myHtml += "<p>varValues = " + variables + "</p>"
  return(myHtml)
*/

  // Check and execute option
  if( whitefoxOption[1].trim() == "" ) {
    response.sendRedirect("/whitefox/server/index.jss?whitefoxop=QueryTool")
  } else if( whitefoxOption[1].trim() == "QueryTool" ) {
    load('webapps/whitefox/server/SQLQueryTool.jss')
    myHtml = SQLQueryTool(variables, session, response)
  } else if( whitefoxOption[1].trim() == "QueryToolDS" ) {
    load('webapps/whitefox/server/SQLQueryToolDS.jss')
    myHtml = SQLQueryToolDS(variables, session, response)
  } else {
    response.sendRedirect("/whitefox/server/index.jss?whitefoxop=QueryTool")
  }
  
  return(myHtml)
} 

whitefoxMain(webPageParams, session, response)




