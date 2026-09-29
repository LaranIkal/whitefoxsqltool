

function DsMainScreen( dataSourceID ) {
  var dataSourceName = ""
  var dataSourceScript = ""
  var conn = getConnection("sqlite") // Utils.getConnection
  var qtHtml = QueryToolHeader("DataSource")

  qtHtml += "<body bgcolor=\"#ecf9f2\">" + OpenTable()

  if( dataSourceID != "" ) {    
    selectQuery = "SELECT DATASOURCENAME, DATASOURCESCRIPT FROM DATA_SOURCES WHERE DATASOURCEID = " + dataSourceID 
    try {
      var stmt = conn.prepareStatement(selectQuery)
      var resultSet = stmt.executeQuery()
      if( resultSet.next() ) {
        dataSourceName = resultSet.getString(1)
        dataSourceScript = resultSet.getString(2)
      }
    } finally {
      closeQuietly( resultSet, stmt )
    }
  }

  qtHtml += "<b><center><big>DataBase Connections Maintenance.</big></center></b><br><table width=\"100%\" border=\"0\">\n\
            <form action=\"jescc\" method=\"POST\" id=\"formdsmain\">\n\
            <input type=\"hidden\" name=\"whitefoxop\" id=\"whitefoxop\" value=\"QueryToolDS\">\n\
            <input type=\"hidden\" name=\"datasourceid\" id=\"datasourceid\" value=\"" + dataSourceID + "\">\n\
            <tr align=\"left\"><td>Connection Name:\
            <input type=\"text\" name=\"datasourcename\" id=\"datasourcename\"  value=\"" + dataSourceName + "\" size=\"50\" maxlength=\"100\"> \n\
            <a href=\"/whitefox/server/index.jss?whitefoxop=QueryToolDS\">New Connection</a>\n\
            </td></tr>\n\
            </table><table width=\"100%\" border=\"0\"><tr align=\"left\">\n\
            <td><b>Database Connection Script:<br></b>\n\
            \
            <textarea id=\"datasourcescript\" name=\"datasourcescript\">\n"

  if( dataSourceScript == "" ) {
    qtHtml += "function GetCustomDSConnection() {\n"
    qtHtml += "  var Properties = Java.type(\"java.util.Properties\")\n"
    qtHtml += "  var properties = new Properties()\n"
    qtHtml += "  var conn = null\n"
    qtHtml += "  var Driver = Java.type(\"org.sqlite.JDBC\")\n"
    qtHtml += "  var driver = new Driver()\n"
    qtHtml += "  var dburl = \"jdbc:sqlite:data/mydb.sqlite\"\n\n"
    qtHtml += "  try {\n"
    qtHtml += "    conn = driver.connect(dburl, properties)\n"
    qtHtml += "  } catch (e) { print( e ) }\n\n"
    qtHtml += "  return(conn)\n"
    qtHtml += "}\n"
  } else {
    qtHtml += dataSourceScript
  }

  qtHtml += "</textarea>\n"

  qtHtml += "<script>\n\
              var jseditor = CodeMirror.fromTextArea(document.getElementById(\"datasourcescript\"), {\n\
                width: '100%',\n\
                height: '100%',\n\
                tabSize: 2,\n\
                matchBrackets: true,\n\
                lineNumbers: true,\n\
                textWrapping: true,});\n\
                jseditor.on(\"blur\", function(){\n\
                jseditor.save();\n\
             });\n\
            </script>\n"              
     
  qtHtml += "</td></tr></table><table width=\"100%\" border=\"0\">\n\
            <tr align=\"left\"><td><input name=\"dsoptionsave\" value=\"Save Data Base Connection\" type=\"button\" onClick='JavaScript:xmlhttpPostDsAction(\"/whitefox/server/index.jss\", \"DBConnectionSave\", \"divdsadmin\")'>\n\
            <input type=\"checkbox\" id=\"validateconn\" name=\"validateconn\" value=\"Yes\">When Saving, Test if Connects.\n\
            </td><td><td>&nbsp;</td></tr></table>\n\
            </form><br><div id=\"divdsadmin\"></div>\n"
  
  // Form to edit data sources
  qtHtml += "<form action=\"/whitefox/server/index.jss\" method=\"POST\" id=\"formdsaction\">\n\
            <table width=\"100%\" border=\"0\">\n\
            <tr align=\"left\"><td>\
            <select name=\"datasourceid\" id=\"seldatasourceid\">\
            <option selected value=\"\">Select Data Connection To Edit/Delete/Test</option>\n"

  selectQuery = "SELECT DATASOURCEID, DATASOURCENAME FROM DATA_SOURCES WHERE 1 ORDER BY DATASOURCENAME"
  try {
    var stmt = conn.prepareStatement(selectQuery)
    var resultSet = stmt.executeQuery()

    while( resultSet.next() ) {
      qtHtml += "<option value=\"" + resultSet.getString(1) + "\">" + resultSet.getString(1) + " - " + resultSet.getString(2) + "</option>\n"
    }
  } finally {
    closeQuietly( resultSet, stmt, conn )
  }

  qtHtml += "</select>\n\
	            <input name=\"dsoptionedit\" value= \"Edit DB Connection\" type=\"button\" onClick='JavaScript:xmlhttpPostDsAction(\"/whitefox/server/index.jss\", \"DBConnectionEdit\", \"divdsadmin\")'>\n\
	            <input name=\"dsoptiondelete\" value= \"Delete DB Connection\" type=\"button\" onClick='JavaScript:xmlhttpPostDsAction(\"/whitefox/server/index.jss\", \"DBConnectionDelete\", \"divdsadmin\")'>\n\
	            Enter Table Name To Test DB Connection: <input type=\"text\" name=\"tablename\" id=\"tablename\" size=\"30\" maxlength=\"100\">\n\
              <input name=\"dsoptiontest\" value= \"Test DB Connection\" type=\"button\" onClick='JavaScript:xmlhttpPostDsAction(\"/whitefox/server/index.jss\", \"DBConnectionTest\", \"divdsadmin\")'>\n\
	          </form></td></tr></table>\n"
//<input name=\"dsoption\" value= \"Test DB Connection\" type=\"submit\" target=\"_blank\">\n\
  qtHtml += CloseTable()

  qtHtml += "<br></td></tr></table></body></html>"

  return( qtHtml )
}


function DBConnectionSave( dataSourceID, dataSourceName, dataSourceScript, validateConn) {
  var error = ""
  var numRows = 0
  var dbConnSaveMsg = ""
  var selectQuery = ""
  if( dataSourceName == "" ) error += "Enter Data Source Name.<br>"
  var connSave = getConnection("sqlite") // Utils.getConnection

  if( dataSourceID == "" && error == "" ) {
    selectQuery = "SELECT COUNT(*) FROM DATA_SOURCES WHERE TRIM(DATASOURCENAME) = '" + dataSourceName + "'"
    try {
      var stmt = connSave.prepareStatement(selectQuery)
      var resultSet = stmt.executeQuery()
      if( resultSet.next() ) numRows = resultSet.getInt(1)
    } finally {
      closeQuietly( resultSet, stmt )
    }
  
    if( numRows > 0 ) error += "Data Source Name Already Exists, Please Enter a Different Name.<br>"
  }

  if( dataSourceScript == "" ) error += "Enter Connection Javascript Code For Data Source.<br>"

  if( error == "" ) {
    dataSourceScript = dataSourceScript.replaceAll("anequalchar", "=")
    dataSourceScript = dataSourceScript.replaceAll("apluschar", "+")

    if( validateConn == "Yes" ) {
      eval( dataSourceScript )
      try {
        var customConn = GetCustomDSConnection()
      } catch( javaSQLException ) {
        //error += "Data Source Connection Script Error, Verify Your Code."
        closeQuietly( connSave )
        let exception = "Data Source Connection Script Error, Verify Your Code.\n\n" + javaSQLException
        return exception
      } finally {
        closeQuietly( customConn )
      }
    }
  }


  if( error == "" ) {    
    var dataSourceScriptFixed = dataSourceScript.replaceAll("'", "''")    
    var dtsInsertQuery = ""

    if( dataSourceID == "" ) {      
      dtsInsertQuery = "INSERT INTO DATA_SOURCES VALUES (NULL,'" + dataSourceName + "', '" + dataSourceScriptFixed + "')"
    } else {
      dtsInsertQuery = "UPDATE DATA_SOURCES SET DATASOURCENAME='" + dataSourceName + "', DATASOURCESCRIPT='" + dataSourceScriptFixed + "' WHERE DATASOURCEID=" + dataSourceID
    }

    try {
      var stmt = connSave.prepareStatement(dtsInsertQuery)
      stmt.executeUpdate()
    } catch( javaSQLException ) {
      closeQuietly( connSave )
      let exception = "<p style=\"color:red\"><b>Problem Running Query When Creating/Updating Data Source: " + dtsInsertQuery + "</b></p>\n\n" + javaSQLException
      return exception
    } finally {
      closeQuietly( stmt )
    }

    dbConnSaveMsg = "DB Connection Saved, " // Initialize return message.

    // If dataSourceID NOT provided, it means it was just created, we need to get the id created.
    if( dataSourceID == "" ) {
      selectQuery = "SELECT DATASOURCEID FROM DATA_SOURCES WHERE TRIM(DATASOURCENAME) = '" + dataSourceName + "'"
      try {
        var stmt = connSave.prepareStatement(selectQuery)
        var resultSet = stmt.executeQuery()
        if( resultSet.next() ) dataSourceID = resultSet.getString(1)
      } finally {
        closeQuietly( resultSet, stmt )
      }      
      dbConnSaveMsg = "datasourceid="+ dataSourceID + "|" + dbConnSaveMsg + "Reloading Connections List, "
    }
    dbConnSaveMsg += "Date/Time: " + GetDateTime() // Utils.GetDateTime

  } else {
    dbConnSaveMsg = error + "Date/Time: " + GetDateTime() // Utils.GetDateTime
  }

  closeQuietly( connSave )

  return(dbConnSaveMsg)
}



function DBConnectionDelete( dataSourceID ) {
  var dbConnDeleteMsg = ""
  
  if( dataSourceID == "" ) { 
    dbConnDeleteMsg += "Select Data Source to Delete."
  } else {
    var dtsDeleteQuery = "DELETE FROM DATA_SOURCES WHERE DATASOURCEID = " + dataSourceID
    var connDelete = getConnection("sqlite") // Utils.getConnection
    try {
      var stmt = connDelete.prepareStatement(dtsDeleteQuery)
      stmt.executeUpdate()
    } catch( javaSQLException ) {
      closeQuietly( stmt, connDelete )
      let exception = "<p style=\"color:red\"><b>Problem Running Query to Delete Data Source: " + dtsDeleteQuery + "</b></p>\n\n" + javaSQLException
      return exception
    } finally {
      closeQuietly( stmt, connDelete )
    }

    dbConnDeleteMsg = "DB Connection Deleted, Reloading Page, Date/Time: " + GetDateTime() // Utils.GetDateTime
  }

  return( dbConnDeleteMsg )
}



function DBConnectionTest( dataSourceID, tableName ) {
  var dbConnTestMsg = ""
  var selectQuery = ""
  var dataSourceName = ""
  var dataSourceScript = ""

  if( dataSourceID == "" ) { 
    dbConnTestMsg += "Select Data Source to Test.<br>"
  } else {
    if( tableName == "" ) dbConnTestMsg += "Enter Table Name to Test The Connection.<br>"
  } 
    
  if( dbConnTestMsg == "" ) {

    // Get Data Source Connection Information
    selectQuery = "SELECT DATASOURCENAME, DATASOURCESCRIPT FROM DATA_SOURCES WHERE DATASOURCEID = " + dataSourceID
    var dsConn = getConnection("sqlite") // Utils.getConnection
    try {
      var stmt = dsConn.prepareStatement(selectQuery)
      var resultSet = stmt.executeQuery()
      if (resultSet.next()) {
        dataSourceName = resultSet.getString(1)
        dataSourceScript = resultSet.getString(2)
      }
    } catch( javaSQLException ) {
      closeQuietly( resultSet, stmt, dsConn )
      let exception = "<p style=\"color:red\"><b>Problem Running Query to Get Data Source: " + selectQuery + "</b></p>\n\n" + javaSQLException
      return exception
    } finally {
      closeQuietly( resultSet, stmt, dsConn )
    }

    // Testing the DataSource Connection
    eval( dataSourceScript )
    try {
      var customConn = GetCustomDSConnection()
      selectQuery = "SELECT COUNT(*) FROM " + tableName + " WHERE 1 = 1"
      try {
        var stmt = customConn.prepareStatement(selectQuery)
        var resultSet = stmt.executeQuery()
        if (resultSet.next()) dbConnTestMsg = "DB Connection Test ok, Table Test Count Result: " + resultSet.getInt(1)
      } catch( javaSQLException ) {
        closeQuietly( resultSet, stmt, customConn )
        let exception = "<p style=\"color:red\"><b>Problem Running Query to Test Data Source: " + selectQuery + "</b></p>\n\n" + javaSQLException
        return exception
      } finally {
        closeQuietly( resultSet, stmt, customConn )
      }
    } catch( javaSQLException ) {
      let exception = "<p style=\"color:red\"><b>Data Source Connection Script Error, Verify Your Code.</b></p>\n\n" + javaSQLException
      return exception
    }
  } // if( dbConnTestMsg == "" ) {



  return( dbConnTestMsg )
}