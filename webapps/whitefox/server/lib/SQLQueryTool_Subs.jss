



function QueryMainScreen(sqlQueryID, dataSourceID, fSeparator, fEnclosed, sqlScript, saveQueryMessage) {
  var sqlQueryName = ""
  if( sqlScript == "" ) sqlScript = "\n\n\n"
  var defaultDataSource = 0  
  var qtHtml = QueryToolHeader("Query")

  qtHtml += "<body bgcolor=\"#b8d9ff\">" + OpenTable()
  qtHtml += "<table align=\"left\"><tr>\n\
    <td><b><big>WhiteFox SQL Query Tool.&nbsp;&nbsp; - &nbsp;&nbsp;</big></b></td>\n\
    <td><table><tr><td><form name=\"MaintainQuery\" action=\"/whitefox/server/index.jss\" method=\"post\">\n\
    <input type=\"hidden\" id=\"whitefoxop\" name=\"whitefoxop\" value=\"QueryTool\">\n\
    <div id=\"QueryList\"><select id=\"sqlqueryid\" name=\"sqlqueryid\">\n"

  if( sqlQueryID === "" ) {
    qtHtml += "<option selected value=\"\">Select SQL Query</option>\n"
  } else {
    qtHtml += "<option value=\"\">Select SQL Query</option>\n"
  }

  // Get connection information from system environment.
  var conn = getConnection("sqlite") // Utils.getConnection
  var selectQuery = "SELECT SQLQUERYID, DEFAULTDATASOURCE, SQLQUERYNAME, SQLQUERY FROM SQLQUERIES ORDER BY SQLQUERYNAME"
  try {
    var stmt = conn.prepareStatement(selectQuery)
    var resultSet = stmt.executeQuery()

    while (resultSet.next()) {
      var sel = " "
      if( sqlQueryID === resultSet.getString(1) ) { 
        sel = " selected "
        defaultDataSource = resultSet.getString(2)
        sqlQueryName = resultSet.getString(3)
        sqlScript = resultSet.getString(4)        
      }
      qtHtml += "<option" + sel + "value=\"" + resultSet.getString(1) + "\">" + resultSet.getString(3) + "</option>\n"           
    }

  } finally {
    if( resultSet ) try { resultSet.close() } catch(e) {}
    if( stmt ) try { stmt.close()} catch (e) { print( e ) }
  }
  
  qtHtml += "</select></div></td><td>\n\
    <input type=\"submit\" name=\"queryoption\" VALUE=\"Display\"></td>\n\
    <td>&nbsp;<input type=\"button\" value=\"Delete\" "
  qtHtml += "onclick='JavaScript:xmlhttpPostScriptData(\"/whitefox/server/index.jss\",this.form,\"ResultsPane\",\"Delete\", \"0\")'></td></tr></table>\n\
    </form></td><td>\n"

  if( dataSourceID === "" ) dataSourceID = defaultDataSource

  qtHtml += "<form id=\"MainQuery\" name=\"EditQuery\" action=\"/whitefox/server/index.jss\" method=\"post\">\n\
    <input type=\"hidden\" name=\"option\" value=\"execquery\">\n\
    <input type=\"hidden\" id=\"validationresult\" name=\"validationresult\" value=\"\">\n\
    <input type=\"hidden\" id=\"queryoption\" name=\"queryoption\" value=\"Export Query Results\">\n\
    <input type=\"hidden\" id=\"sqlqueryidex\" name=\"sqlqueryid\" value=\"" + sqlQueryID + "\">\n\
    <input type=\"hidden\" id=\"writeheaderline\" name=\"writeheaderline\" value=\"Yes\">\n\
    Query Name: <input type=\"text\" id=\"sqlqueryname\" name=\"sqlqueryname\" value=\"" + sqlQueryName + "\" size=\"50\">\n\
    &nbsp;&nbsp;<input type=\"button\" VALUE=\"Save Query\" "
  qtHtml += "onclick='JavaScript:xmlhttpPostScriptData(\"/whitefox/server/index.jss\",this.form,\"ResultsPane\",\"Save Query\", \"0\")'><br>\n\
    </td></tr></table><br><br><br>\n"

  qtHtml += "<table width=\"100%\"><tr><td>\n\
            Data Source:<select id=\"datasourceid\" name=\"datasourceid\">\n"
					
  if( dataSourceID === 0 ) {
    qtHtml += "<option selected value=\"0\"> - Select Data Source</option>\n"
  } else {
    qtHtml += "<option value=\"0\"> - Select Data Source</option>\n"
  }


  selectQuery = "SELECT DATASOURCEID, DATASOURCENAME FROM DATA_SOURCES WHERE 1 ORDER BY DATASOURCENAME"
  try {
    var stmt = conn.prepareStatement(selectQuery)
    var resultSet = stmt.executeQuery()

    while( resultSet.next() ) {
      var sel = " "
      if( dataSourceID === resultSet.getString(1) ) sel = " selected "
      qtHtml += "<option" + sel + "value=\"" + resultSet.getString(1) + "\">" + resultSet.getString(1) + " - " + resultSet.getString(2) + "</option>\n"           
    }
  } finally {
    if( resultSet ) try { resultSet.close() } catch(e) {}
    if( stmt ) try { stmt.close()} catch (e) { print( e ) }
    if( conn ) try { conn.close() } catch (e) { print( e ) } // Close connection in the last query.
  }
  

  qtHtml += "</select>\
    <a href=\"/whitefox/server/index.jss?whitefoxop=QueryToolDS\" target=\"_blank\" style=\"text-decoration: none\">Admin</a>\
    <b><big><big>||</big></big></b> \
    <input type=\"checkbox\" id=\"showrecordscount\" name=\"showrecordscount\">Rows Count.\
    <select id=\"queryinstruction\" name=\"queryinstruction\">\
    <option selected value=\"1\">Execute Query</option>\n\
    <option value=\"2\">Execute Script</option>\n\
    </select>\n\
    <input type=\"button\" VALUE=\"Go\" \
    onclick='JavaScript:xmlhttpPostScriptData(\"/whitefox/server/index.jss\",this.form,\"ResultsPane\",\"Execute Query\", \"0\")'>\n"
          
  qtHtml += " <b><big><big>||</big></big></b> Fields:<b><big><big>[</big></big></b>Separator: <input type=\"text\" id=\"fseparator\" name=\"fseparator\" value=\""
  
  if( fSeparator === "" ) {
    qtHtml += ","
  } else {
    qtHtml += fSeparator
  }
  qtHtml +="\" size=\"1\">\n"
  
  qtHtml += "Enclosed By: <input type=\"text\" id=\"fenclosed\" name=\"fenclosed\" value='"
  if( fEnclosed === "" ) {
    qtHtml += '"'
  } else {
    qtHtml += fEnclosed
  }

  qtHtml += "' size=\"1\"> <b><big><big>]</big></big></b>\n"

  qtHtml += "<input type=\"checkbox\" id=\"headerline\" name=\"headerline\" checked>Header Line.\n\
    <input type=\"checkbox\" id=\"xmlformat\" name=\"xmlformat\" onclick=\"UpdtFileFormat()\">XML\n\
    <input type=\"checkbox\" id=\"xlsformat\" name=\"xlsformat\" onclick=\"UpdtFileFormat()\">HTML Table xls\n\
    <input type=\"checkbox\" id=\"xlsformatlo\" name=\"xlsformatlo\" onclick=\"UpdtFileFormat()\">HTML Table xls - Libre Office\n\
    <input type=\"hidden\" id=\"usexml\" name=\"usexml\" value=\"No\">\n\
    <input type=\"hidden\" id=\"usemsxls\" name=\"usemsxls\" value=\"No\">\n\
    <input type=\"hidden\" id=\"useloxls\" name=\"useloxls\" value=\"No\">\n\
    <input type=\"button\" value=\"Export Results\" \
    onclick='JavaScript:xmlhttpPostScriptData(\"/whitefox/server/download/ExportQueryResults.jss\",this.form,\"ResultsPane\",\"Export Query Results\", \"0\")'>\n\
    </td></tr></table>\
    <div style=\"max-height:420px;overflow:auto;\">\
    <table width=\"100%\"><tr><td>\
    <textarea id=\"sqlscript\" name=\"sqlscript\">" + sqlScript + "</textarea>\n"

  qtHtml += "<script>\n\
    var sqleditor = CodeMirror.fromTextArea(document.getElementById(\"sqlscript\"), {\n\
      width: '100%',\n\
      height: '100%',\n\
      mode: \"text/x-mysql\",\n\
      tabSize: 2,\n\
      matchBrackets: true,\n\
      lineNumbers: true,\n\
      textWrapping: true,});\n\
      sqleditor.on(\"blur\", function(){ \n\
      sqleditor.save();\n\
    });\n\
    </script>\n"

  qtHtml += "</td></tr></table></div></form>\n"

  qtHtml += CloseTable()	

  qtHtml += "<br>"
  qtHtml += OpenTable()

  qtHtml += "<fieldset><legend>Results Pane</legend><div id=\"ResultsPane\">" + saveQueryMessage + "</div></fieldset>\n"
  qtHtml += CloseTable()

  qtHtml += "<br></td></tr></table><p align=\"center\"><a href=\"https://sourceforge.net/projects/jswebserver/\" target=\"_blank\">Powered by JSWEBSERVER</a></p></body></html>"

  return(qtHtml)
}



function ExecuteQuery( dataSourceID, sqlScript, showRecordsCount, minRecordNum, queryInstruction ) {
  var execQueryMsg = ""
  var javaSQLException = java.sql.SQLException
  var selectQuery = ""
  var dataSourceName = ""
  var dataSourceScript = ""
  var recordsByScreen = 50
  var startTime = new Date().getTime()

  if( minRecordNum == "" ) {
    minRecordNum = 0
  } else {
    minRecordNum = parseInt(minRecordNum)
  }

  var maxRecordNum = minRecordNum + recordsByScreen

  if( dataSourceID == "" ) { 
    execQueryMsg += "Select Data Source.<br>"
  } else {
    if( sqlScript == "" ) execQueryMsg += "Enter SQL Script to Execute.<br>"
  } 
  
  
  if( execQueryMsg == "" ) {
    sqlScript = sqlScript.replaceAll("anequalchar", "=")
    sqlScript = sqlScript.replaceAll("apluschar", "+")

    // Get Data Source Connection Information
    selectQuery = "SELECT DATASOURCENAME, DATASOURCESCRIPT FROM DATA_SOURCES WHERE DATASOURCEID = " + dataSourceID
    var dsConn = getConnection("sqlite") // Utils.getConnection
    try {
      var stmt = dsConn.prepareStatement(selectQuery)
      stmt.setFetchSize(10000)
      var resultSet = stmt.executeQuery()
      if (resultSet.next()) {
        dataSourceName = resultSet.getString(1)
        dataSourceScript = resultSet.getString(2)
      }
    } catch( javaSQLException ) {
      let exception = "<p style=\"color:red\"><b>Problem Running Query to Get Data Source: " + selectQuery + "</b></p>\n\n" + javaSQLException
      return exception
    } finally {
      if( resultSet ) try { resultSet.close() } catch(e) {}
      if( stmt ) try { stmt.close() } catch (e) { print( e ) }
      if( dsConn ) try { dsConn.close() } catch (e) { print( e ) }
    }

    // Getting Database Connection
    eval( dataSourceScript )
    var customConn = null
    try {
      customConn = GetCustomDSConnection()
    } catch( javaSQLException ) {
      let exception = "<p style=\"color:red\"><b>Data Source Connection Script Error, Verify Your Code:</b> " + dataSourceScript + "</p>\n\n" + javaSQLException
      return exception
    }
    
    if( queryInstruction == "2" ) {
      try {
        var stmt = customConn.createStatement()
        stmt.execute(sqlScript)
      } catch( javaSQLException ) {
        let exception = "<p style=\"color:red\"><b>Problem Running Query: " + sqlScript + "</b><br>Check your query an try again.</br></p>\n\n" + javaSQLException
        return exception
      } finally {
        if (stmt) try { stmt.close() } catch (e) { throw( e ) }
        if (customConn) try { customConn.close() } catch (e) { throw( e ) }             
      }
      //sqlScript = sqlScript.replace(/\n/g, "<br>")
      var now = new Date().getTime()
      var queryTime =  ( now - startTime ) / 1000 //Query Time in Seconds      
      execQueryMsg = "<p style=\"color:blue\"><b><u>Query Executed in " + queryTime

      if( queryTime === 1 ) {
        execQueryMsg += " Second.</p>"
      } else {
        execQueryMsg += " Seconds.</p>"
      }
      execQueryMsg += "</u></b></p>"
      return(execQueryMsg)

    } else {
      // If everything went well, execute sql script.
      try {
        //return(sqlScript) // For debug purposes.
        var stmt = customConn.prepareStatement(sqlScript)
        stmt.setFetchSize(10000)
        var resultSet = stmt.executeQuery()
        var resultSetMetaData = resultSet.getMetaData()
        var columnCount = resultSetMetaData.getColumnCount()
        // HTML Table will open and close when concatenating records(header + detail)
        var reportHeader = "<tr class =\"sqlresults\">\n"
        reportHeader += "<th class =\"sqlresults\">Seq.</th>\n"

        // Writing Query Result Header
        var i = 0
        for (i = 1; i <= columnCount; i++) {
          reportHeader += "<th class =\"sqlresults\">" + resultSetMetaData.getColumnName(i) + "</th>\n"
        }
        reportHeader += "</tr>\n"

        // Writing Query Result Records
        var recordsCount = 1
        var reportRecords = ""
        var fieldValue = ""
        while (resultSet.next() && recordsCount <= maxRecordNum) {
          if( recordsCount > minRecordNum ) {
            if( recordsCount % 2 == 0 ) {
              reportRecords += "<tr class=\"evensqlresults\"><td class=\"evensqlresults\">" + recordsCount + "</td>"
            } else {
              reportRecords += "<tr class=\"oddsqlresults\"><td class=\"oddsqlresults\">" + recordsCount + "</td>"
            }

            var fieldsCount = 0
            for( fieldsCount = 1; fieldsCount <= columnCount; fieldsCount++ ) {
              fieldValue = resultSet.getString(fieldsCount)
              if( fieldValue === null ) {
                fieldValue = ""
              } else {
                fieldValue = fieldValue.replaceAll("\r\n", "<br>")
                fieldValue = fieldValue.replaceAll("\n", "<br>")                
                fieldValue = fieldValue.replaceAll(" ","&nbsp")
              }
              
              if( recordsCount % 2 == 0 ) {
                reportRecords += "<td class=\"evensqlresults\">"
              } else {
                reportRecords += "<td class=\"oddsqlresults\">"
              }
              reportRecords += fieldValue + "</td>"
            }
            reportRecords += "</tr>\n"

          }
          recordsCount += 1
        }

        var now = new Date().getTime()
        var queryTime =  ( now - startTime ) / 1000 //Query Time in Seconds
        execQueryMsg = "<table class =\"sqlresults\">\n" + reportHeader + reportRecords + "</table>"

        // If there are more records to display, show prev and/or next buttons
        execQueryMsg += "<table align=\"left\" border=\"0\"><tr>"
        if( ( recordsCount - 1 ) > recordsByScreen ) {
          var prev = recordsCount - ( recordsByScreen * 2 ) - 1
          if( prev < 0 ) prev = 0
          execQueryMsg += "<td><left><form name=\"FormPreviousMatches\" action=\"/whitefox/server/index.jss\" method=\"post\">\n"
          execQueryMsg += "<input type=\"button\" Name=\"process\" VALUE=\"Previous\""
          execQueryMsg += " OnClick='JavaScript:xmlhttpPostScriptData(\"/whitefox/server/index.jss\",this.form,\"ResultsPane\",\"Execute Query\",\"" + prev + "\")'></form>"
          execQueryMsg += "</left></td>"
        }

        if( recordsCount > ( minRecordNum + recordsByScreen ) ) {
          execQueryMsg += "<td><left><form name=\"FormNextMatches\" action=\"/whitefox/server/index.jss\" method=\"post\">\n"
          execQueryMsg += "<input type=\"button\" Name=\"process\" VALUE=\"Next\""
          execQueryMsg += " OnClick='JavaScript:xmlhttpPostScriptData(\"/whitefox/server/index.jss\",this.form,\"ResultsPane\",\"Execute Query\",\"" + maxRecordNum + "\")'></form>"
          execQueryMsg += "</left></td>"          
        }
        execQueryMsg += "</tr></table><br>"

        execQueryMsg += "<p><b>Time To Execute Query:</b> " + queryTime
        if( queryTime === 1 ) {
          execQueryMsg += " Second.</p>"
        } else {
          execQueryMsg += " Seconds.</p>"
        }

        if( showRecordsCount == "Yes" ) {
          var countQuery = "SELECT COUNT(*) FROM (\n" + sqlScript + "\n) QueryForCounting"
          var cstmt = customConn.prepareStatement(countQuery)
          var cresultSet = cstmt.executeQuery()
          if (cresultSet.next()) execQueryMsg += "<p><b>Records found:</b> " + cresultSet.getInt(1) + "</p>"
        }

      } catch( javaSQLException ) {
        let exception = "<p style=\"color:red\"><b>Problem Running Query: " + sqlScript + "</b><br>Check your query an try again.</br></p>\n\n" + javaSQLException
        return exception
      } finally {
        if( resultSet ) try { resultSet.close() } catch(e) {}
        if( stmt ) try { stmt.close()} catch (e) { print( e ) }
        if( customConn ) try { customConn.close()} catch (e) { print( e ) }
      }
    }
    
  }


  return( execQueryMsg )
}







function SaveQuery( sqlQueryID, dataSourceID, sqlQueryName, sqlScript) {
  var error = ""
  var numRows = 0
  var myDSFunctionName = ""
  var sqlQuerySaveMsg = ""
  var myDSConnection = null
  var selectQuery = ""
  if( sqlQueryName == "" ) error += "Enter SQL Query Name.<br>"
  var connSave = getConnection("sqlite") // Utils.getConnection

  if( sqlQueryID == "" && error == "" ) {
    selectQuery = "SELECT COUNT(*) FROM sqlqueries WHERE TRIM(SQLQueryName) = '" + sqlQueryName + "'"
    try {
      var stmt = connSave.prepareStatement(selectQuery)
      var resultSet = stmt.executeQuery()
      if( resultSet.next() ) numRows = resultSet.getInt(1)
    } finally {
      if( resultSet ) try { resultSet.close() } catch(e) {}
      if( stmt ) try { stmt.close()} catch (e) { print( e ) }
    }
    if( numRows > 0 ) error += "SQL Script Name Already Exists, Please Enter a Different Name.<br>"
  }

  var javaSQLException = java.sql.SQLException

  if( error == "" ) {
    sqlScript = sqlScript.replaceAll("anequalchar", "=")
    sqlScript = sqlScript.replaceAll("apluschar", "+")    
    var sqlScriptFixed = sqlScript.replaceAll("'", "''")    
    var sqlInsertQuery = ""

    if( sqlQueryID == "" ) {      
      sqlInsertQuery = "INSERT INTO sqlqueries VALUES (NULL,'" + sqlQueryName + "', '" + sqlScriptFixed + "'," + dataSourceID + ")"
    } else {
      sqlInsertQuery = "UPDATE sqlqueries SET SQLQueryName='" + sqlQueryName + "', SQLQuery='" + sqlScriptFixed + "', DefaultDataSource=" + dataSourceID + " WHERE SQLQueryID=" + sqlQueryID
    }

    try {
      var stmt = connSave.prepareStatement(sqlInsertQuery)
      stmt.executeUpdate()
    } catch( javaSQLException ) {
      if( connSave ) try { connSave.close() } catch (e) { print( e ) } // Close db connection
      let exception = "<p style=\"color:red\"><b>Problem Running Query When Creating/Updating SQL Script: " + sqlInsertQuery + "</b></p>\n\n" + javaSQLException
      return exception
    } finally {      
      if( stmt ) try { stmt.close() } catch (e) { print( e ) }        
    }

    sqlQuerySaveMsg = "SQL Query Saved, " // Initialize return message.

    // If sqlQueryID NOT provided, it means it was just created, we need to get the new id created.
    if( sqlQueryID == "" ) {
      selectQuery = "SELECT SQLQueryID FROM sqlqueries WHERE TRIM(SQLQueryName) = '" + sqlQueryName + "'"
      try {
        var stmt = connSave.prepareStatement(selectQuery)
        var resultSet = stmt.executeQuery()
        if( resultSet.next() ) sqlQueryID = resultSet.getString(1)
      } finally {
          if( resultSet ) try { resultSet.close() } catch(e) {}
          if( stmt ) try { stmt.close() } catch (e) { print( e ) }
      }      
      
    }
    sqlQuerySaveMsg = "sqlqueryid="+ sqlQueryID + "|" + sqlQuerySaveMsg + "Reloading SQL Queries List, "
    sqlQuerySaveMsg += "Date/Time: " + GetDateTime() // Utils.GetDateTime

  } else {
    sqlQuerySaveMsg = error + "Date/Time: " + GetDateTime() // Utils.GetDateTime
  }

  if( connSave ) try { connSave.close() } catch (e) { print( e ) } // Close db connection

  return( sqlQuerySaveMsg )
}




function RefreshQueryList(sqlQueryID) {
  var qtHtml = "<select id=\"sqlqueryid\" name=\"sqlqueryid\">\n"

  if( sqlQueryID === "" ) {
    qtHtml += "<option selected value=\"\">Select SQL Query</option>\n"
  } else {
    qtHtml += "<option value=\"\">Select SQL Query</option>\n"
  }

  var conn = getConnection("sqlite") // Utils.getConnection
  var selectQuery = "SELECT SQLQUERYID, SQLQUERYNAME FROM SQLQUERIES ORDER BY SQLQUERYNAME"
  try {
    var stmt = conn.prepareStatement(selectQuery)
    var resultSet = stmt.executeQuery()

    while( resultSet.next() ) {
      var sel = " "
      if( sqlQueryID === resultSet.getString(1) ) sel = " selected "
      qtHtml += "<option" + sel + "value=\"" + resultSet.getString(1) + "\">" + resultSet.getString(2) + "</option>\n"           
    }
  } finally {
    if( resultSet ) try { resultSet.close() } catch(e) {}
    if( stmt ) try { stmt.close() } catch (e) { print( e ) }
  }

  qtHtml += "</select>\n"

  return( qtHtml )
}




function DeleteQuery(sqlQueryID) {
  var connDelete = getConnection("sqlite") // Utils.getConnection
  var sqlDeleteQuery = "DELETE FROM SQLQUERIES WHERE SQLQUERYID = " + sqlQueryID
  var javaSQLException = java.sql.SQLException
  
  try {
    var stmt = connDelete.prepareStatement(sqlDeleteQuery)
    stmt.executeUpdate()
  } catch( javaSQLException ) {
    let exception = "<p style=\"color:red\"><b>Problem Deleting SQL Script: " + sqlQueryID + "</b></p>\n\n" + javaSQLException
    return exception
  } finally {
    if( stmt ) try { stmt.close() } catch (e) { print( e ) } 
    if( connDelete ) try { connDelete.close() } catch (e) { print( e ) } // Close db connection
  }

}



