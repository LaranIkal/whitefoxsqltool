

// Connect to database functions for internal whitefox usage
// also may be used as sample db connection code.
var getConnection = function(dbType) {

  // Import Java Libraries
  const DriverManager = Java.type('java.sql.DriverManager')
  var Properties = Java.type("java.util.Properties")
  var properties = new Properties()  
  var System = Java.type("java.lang.System") // Prepare system environment variable.
  
  // It is assumed you are configuring your database connection 
  // in the environment.
  switch (dbType) {

    case 'Oracle': {
      var cServer = System.getenv("ORADBSERVER").toString()
      var cPortNumber = System.getenv("ORADBPORT").toString()
      var cDbName = System.getenv("ORADBNAME").toString()        
      var cUserName = System.getenv("ORADBUSER").toString()
      var cPassw = System.getenv("ORADBPASS").toString()
      properties.setProperty("user", cUserName)
      properties.setProperty("password", cPassw)
      const dburl = 'jdbc:oracle:thin:@' + cServer + ':' + cPortNumber + "/" + cDbName   

      try {
        return DriverManager.getConnection(dburl, properties)
      } finally {

      }
    }

    case 'PostgreSQL': {
      var cServer = System.getenv("PSQLDBSERVER").toString()
      var cPortNumber = System.getenv("PSQLDBPORT").toString()
      var cDbName = System.getenv("PSQLDBNAME").toString()        
      var cUserName = System.getenv("PSQLDBUSER").toString()
      var cPassw = System.getenv("PSQLDBPASS").toString()
      properties.setProperty("user", cUserName)
      properties.setProperty("password", cPassw)
      const dburl = "jdbc:postgresql://" + cServer + ":" + cPortNumber + "/" + cDbName
      try {
        return DriverManager.getConnection(url, properties)
      } finally {

      }
    }

    case 'ApacheDerby': {
      var cServer = System.getenv("DERBYDBSERVER").toString()
      var cPortNumber = System.getenv("DERBYDBPORT").toString()
      var cDbName = System.getenv("DERBYDBNAME").toString()        
      //var cUserName = System.getenv("DERBYDBUSER").toString()
      //var cPassw = System.getenv("DERBYDBPASS").toString()
      const dburl = "jdbc:derby://" + cServer + ":" + cPortNumber + "/" + cDbName + ";create=false"
      try {
        return DriverManager.getConnection(dburl, properties)
      } finally {

      }   
    }

    case 'sqlite': {
      // Create SQLite Connection and return it
      const dburl = 'jdbc:sqlite:' + config.SQLITEDB
      try {
        return DriverManager.getConnection(dburl, properties)
      } finally {

      }   
    }
     
    default:
      return('Invalid DB Type: ' + dbType)
  }

}




function QueryToolMeta() {
  //var qtMeta = "<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=ISO-8859-1\">\n"
  var qtMeta = "<META HTTP-EQUIV=\"Content-Type\" CONTENT=\"text/html; charset=ISO-8859-1\">\n"
  qtMeta += "<META HTTP-EQUIV=\"EXPIRES\" CONTENT=\"0\">\n"
  qtMeta += "<META NAME=\"RESOURCE-TYPE\" CONTENT=\"DOCUMENT\">\n"
  qtMeta += "<META NAME=\"DISTRIBUTION\" CONTENT=\"GLOBAL\">\n"
  qtMeta += "<META NAME=\"KEYWORDS\" CONTENT=\"WHITEFOX, JSWEBSERVER\">\n"
  qtMeta += "<META NAME=\"ROBOTS\" CONTENT=\"INDEX, FOLLOW\">\n"
  qtMeta += "<META NAME=\"REVISIT-AFTER\" CONTENT=\"1 DAYS\">\n"
  qtMeta += "<META NAME=\"RATING\" CONTENT=\"GENERAL\">\n"
  qtMeta += "<META NAME=\"TITLE\" CONTENT=\"WhiteFox SQL Query Tool\">\n"
  qtMeta += "<META NAME=\"DESCRIPTION\" CONTENT=\"WhiteFox SQL Query ToolL\">\n"
  qtMeta += "<link rel=\"icon\" href=\"/whitefox/client/img/icefox_blue.png\">\n"

  return(qtMeta)
}


function QueryToolHeader(pageType) {
  var qtHeader = "<!DOCTYPE html>\n"
  qtHeader += "<html><head><title>WhiteFox SQL Query Tool</title>\n"

  qtHeader += QueryToolMeta()

  qtHeader += "<link rel=\"stylesheet\" href=\"/whitefox/client/css/QueryToolStyle.css\">\n"
  qtHeader += "<style>\n"
  qtHeader += ".hidden {display:none;}\n"
  qtHeader += ".unhidden {display:block;}\n"
  qtHeader += "</style>\n"

  if( pageType == "Query" ) {
    qtHeader += "<script type=\"text/javascript\" charset=\"ISO-8859-1\" src=\"/whitefox/client/js/ajax/ExecQuery.jss\"></script>\n"
  } else if( pageType == "DataSource" ) {
    qtHeader += "<script type=\"text/javascript\" charset=\"ISO-8859-1\" src=\"/whitefox/client/js/ajax/SQLQueryToolDSAjax.jss\"></script>\n"
  }

  qtHeader += "<link rel=\"StyleSheet\" HREF=\"/whitefox/client/js/CodeMirror/lib/codemirror.css\" TYPE=\"text/css\">\n"
  qtHeader += "<script type=\"text/javascript\" src=\"/whitefox/client/js/CodeMirror/lib/codemirror.jss\"></script>\n"

  if( pageType == "Query" ) {
    qtHeader += "<script type=\"text/javascript\" src=\"/whitefox/client/js/CodeMirror/mode/sql/sql.jss\"></script>\n"
  } else if( pageType == "DataSource" ) {
    qtHeader += "<script type=\"text/javascript\" src=\"/whitefox/client/js/CodeMirror/mode/javascript/javascript.jss\"></script>\n"
  }
  
  qtHeader += "<style>.CodeMirror {height: auto; border-top: 1px solid black;border-left: 1px solid black;"
  qtHeader += "border-right: 1px solid black; border-bottom: 1px solid black;</style>\n"
  qtHeader += "<style>.CodeMirror-gutters { background: #3366CC; border-right: 3px solid #3E7087; min-width:1em; }</style>\n"
  qtHeader += "<style>.CodeMirror-linenumber { color: white; }</style>\n"
  qtHeader += "</head>\n"

  return(qtHeader)
}



function OpenTable() {
  return( "<table width=\"100%\" border=\"0\" cellspacing=\"1\" cellpadding=\"0\" bgcolor=\"#FFB933\"><tr><td>\n\
          <table width=\"100%\" border=\"0\" cellspacing=\"1\" cellpadding=\"8\" bgcolor=\"#F9F9FC\"><tr><td>\n" )
}

function CloseTable() {
  return( "</td></tr></table></td></tr></table>\n" )
}


//Pad given value to the left with "0"
function AddZero(num) {
  return (num >= 0 && num < 10) ? "0" + num : num + ""
}

function GetDateTime() {
  var now = new Date()
  var strDateTime = [[AddZero(now.getDate()), 
      AddZero(now.getMonth() + 1), 
      now.getFullYear()].join("/"), 
      [AddZero(now.getHours()), 
      AddZero(now.getMinutes())].join(":"), 
      now.getHours() >= 12 ? "PM" : "AM"].join(" ")
  return(strDateTime)
}


// Closes any number of JDBC resources (Connection, Statement, ResultSet)
function closeQuietly() {
  for( var i = 0; i < arguments.length; i++ ) {
    var resource = arguments[i]
    if( resource ) {
      try { resource.close() } catch( error ) { print( "Error closing resource: " + error ) }
    }
  }
}



function exceptionMsg( exception ) {
  exception += '\n\n<button onclick="history.back()">Go Back To WhiteFox</button>'
  response.getWriter().write("<pre>" + exception + "</pre>")
  response.getWriter().flush()
}






