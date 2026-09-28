
load('webapps/whitefox/config.jss')
load('webapps/whitefox/server/lib/Utils.jss')
load('webapps/whitefox/server/lib/SQLQueryTool_Subs.jss')


function ExportQueryResults(webPageParams) { 

  var webPageParamsArray = webPageParams.split("&")
  //response.getWriter().write("<pre>" + webPageParamsArray.join("\n") + "</pre>")
  //response.getWriter().flush()
  //return ""

  var webPageName = webPageParamsArray[0].split("/")[1] // First array element has the web page name.
  var webPagePath = "webapps/" + webPageName  
  var dataSourceID = new Array("","")
  var sqlScript = new Array("","")
  var fSeparator = new Array("","")
  var fEnclosed = new Array("","")
  var writeHeaderLine = new Array("","")
  var useXml = new Array("","")
  var useMsXls = new Array("","")
  var useLoXls = new Array("","")

  var javaSQLException = java.sql.SQLException
  var javaIOException = java.io.IOException
  var selectQuery = ""
  var dataSourceName = ""
  var dataSourceScript = ""
  var fileData = null

  if( webPageParamsArray.length > 1 ) { // Get variables values if they exists
    try {
      function myFunction(myVar, index, arr) {
        // Split only on the FIRST "=" (the key/value separator). A plain split("=") breaks any
        // value that itself contains "=" - which any real SQL WHERE/SET clause almost certainly does.
        var eqPos = myVar.indexOf("=")
        var key = myVar.substring(0, eqPos)
        var value = myVar.substring(eqPos + 1)
        if(key === "datasourceid") dataSourceID = value
        if(key === "sqlscript") sqlScript = value
        if(key === "fseparator") fSeparator = value
        if(key === "fenclosed") fEnclosed = value
        if(key === "writeheaderline") writeHeaderLine = value
        if(key === "usexml") useXml = value
        if(key === "usemsxls") useMsXls = value
        if(key === "useloxls") useLoXls = value
      }
      webPageParamsArray.forEach(myFunction)
    } finally {}
  }

//response.getWriter().write("<pre>" + sqlScript + "\n" + "</pre>")
//response.getWriter().flush()

  // Get Data Source Connection Information
  selectQuery = "SELECT DATASOURCENAME, DATASOURCESCRIPT FROM DATA_SOURCES WHERE DATASOURCEID = " + dataSourceID.trim()
  var dsConn = getConnection("sqlite") // Utils.getConnection
  try {
    var stmt = dsConn.prepareStatement(selectQuery)
    var resultSet = stmt.executeQuery()
    if (resultSet.next()) {
      dataSourceName = resultSet.getString(1)
      dataSourceScript = resultSet.getString(2)
    }
  } catch (javaSQLException) {
    throw "<p style=\"color:red\"><b>Problem Running Query to Get Data Source: " + selectQuery + "</b></p>"
  } finally {
    if (resultSet) try { resultSet.close() } catch(e) {}
    if (stmt) try { stmt.close()} catch (e) { print( e ) }
    if (dsConn) try { dsConn.close()} catch (e) { print( e ) }
  }

  // Getting Database Connection
  eval( dataSourceScript )
  var customConn = null
  try {
    customConn = GetCustomDSConnection()
  } catch( javaSQLException ) {
    throw "<p style=\"color:red\"><b>Data Source Connection Script Error, Verify Your Code:</b> " + dataSourceScript + "</p>"
  }

  // Get FileName
  try {    
    var now = new Date()
    var strDateTime = [now.getFullYear(), now.getMonth() + 1, now.getDate(),
                      now.getHours(), now.getMinutes(), now.getSeconds()].join("")
    var exportFileName = webPagePath + "/tmp/" + webPageParamsArray[0].split("/")[3] + strDateTime //+ useMsXls.trim()
    if( useXml.trim() == "Yes" ) {
      exportFileName += ".xml"
    } else if( useMsXls.trim() == "Yes" || useLoXls.trim() == "Yes" ) {
      exportFileName += ".xls"
    } else {
      exportFileName += ".csv"
    }

    var FileWriter = Java.type("java.io.FileWriter")
    fileData = new FileWriter(exportFileName, false) // true appends to file
  } catch (javaIOException) {
    throw "<p style=\"color:red\"><b>File Can Not be Created:</b> " + exportFileName + "</p>"
  }


  // If everything went well, execute sql script.
  try {
    var stmt = customConn.prepareStatement(sqlScript.trim())
    stmt.setFetchSize(10000)
    var resultSet = stmt.executeQuery()
    var resultSetMetaData = resultSet.getMetaData()
    var columnCount = resultSetMetaData.getColumnCount()
    // HTML Table will open and close when concatenating records(header + detail)
    var reportHeader = ""
    reportHeader += "<th class =\"sqlresults\">Seq.</th>\n"

    if( useXml.trim() == "Yes" ) { // XML file format *****

      fileData.write('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>')
      fileData.write('<data-set xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">')

      // Writing XML Query Result Records
      while ( resultSet.next() ) {
        fileData.write("<record>\n")
        var fieldsCount = 0
        for( fieldsCount = 1; fieldsCount <= columnCount; fieldsCount++ ) {
          var fieldValue = resultSet.getString(fieldsCount)
          if( fieldValue === null ) fieldValue = ""
          fieldValue = fieldValue.replaceAll("<", "&#60;")
          fieldValue = fieldValue.replaceAll(">", "&#62;")
          fieldValue = fieldValue.replaceAll("&", "&#38;")
          fieldValue = fieldValue.replaceAll("'", "&#39;")
          fieldValue = fieldValue.replaceAll("\"", "&#34;")

          fileData.write("<" + resultSetMetaData.getColumnName(fieldsCount) + ">" + fieldValue +  "</" + resultSetMetaData.getColumnName(fieldsCount) + ">\n" )
        }
        fileData.write("</record>\n")
      }
      fileData.write("</data-set>")

    } else if( useMsXls.trim() == "Yes" || useLoXls.trim() == "Yes" ) { // HTML table xls file format *****
      //WriteXlsHeader(fileData)
      // Writing Query Result xls Worksheet Header
      fileData.write('<table border="1">')
      if( writeHeaderLine.trim() == "Yes" ) {
        var i = 0
        fileData.write('<tr>') // Open Row
        for (i = 1; i <= columnCount; i++) {
          fileData.write('<th><b>' + resultSetMetaData.getColumnName(i) + '</b></th>' )
        }
        fileData.write("</tr>\n") // Close row
      }

      // Writing Query Result xls Worksheet Rows
      while ( resultSet.next() ) {
        var fieldsCount = 0
        fileData.write('<tr valign="top">\n') // Open Row
        for( fieldsCount = 1; fieldsCount <= columnCount; fieldsCount++ ) {
          var fieldValue = resultSet.getString(fieldsCount)
          if( fieldValue === null ) fieldValue = ""

          if( useLoXls[1].trim() == "Yes" ) {
            fieldValue = fieldValue.replaceAll("\r\n", "&#10;")
            fieldValue = fieldValue.replaceAll("\n", "&#10;")
          } else {
            fieldValue = fieldValue.replaceAll("\r\n", '<br style="mso-data-placement:same-cell;" />')
            fieldValue = fieldValue.replaceAll("\n", '<br style="mso-data-placement:same-cell;" />')
          }

          fileData.write('<td>' + fieldValue + '</td>\n' )
        }
        fileData.write("</tr>\n") // Close row
      }

      fileData.write("</Table>\n")
    
    } else { // if no specific file format, then export as a delimited file format *****

      // Writing Query Result Header????
      if( writeHeaderLine.trim() == "Yes" ) {
        var i = 0
        for (i = 1; i <= columnCount; i++) {
          fileData.write(fEnclosed.trim() + resultSetMetaData.getColumnName(i) + fEnclosed.trim() )
          if( i < columnCount ) fileData.write(fSeparator.trim())
        }
        fileData.write("\n") // End of line, very important
      }

      // Writing Query Result Records
      while ( resultSet.next() ) {
        var fieldsCount = 0
        for( fieldsCount = 1; fieldsCount <= columnCount; fieldsCount++ ) {
          var fieldValue = resultSet.getString(fieldsCount)
          if( fieldValue === null ) fieldValue = ""
          fieldValue = fieldValue.replaceAll("\r\n", "\n")
          fileData.write(fEnclosed.trim() + fieldValue + fEnclosed.trim() )
          if( fieldsCount < columnCount ) fileData.write(fSeparator.trim())
        }
        fileData.write("\n") // End of line, very important
      }
    }

  } catch (javaSQLException) {
    throw "<p style=\"color:red\"><b>Problem Running Query: " + sqlScript.trim() + "</b><br>Check your query an try again.</br></p>"
  } finally {
      if (resultSet) try { resultSet.close() } catch(e) {}
      if (stmt) try { stmt.close()} catch (e) { print( e ) }
      if (customConn) try { customConn.close()} catch (e) { print( e ) }
  }

  fileData.close()
 
  return(exportFileName)
}



function WriteXlsHeader(fileDataWriter){

  fileDataWriter.write('<?xml version="1.0" encoding="UTF-8"?>')
  fileDataWriter.write('<?mso-application progid="Excel.Sheet"?>')
  fileDataWriter.write('<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:c="urn:schemas-microsoft-com:office:component:spreadsheet" xmlns:html="http://www.w3.org/TR/REC-html40" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x2="http://schemas.microsoft.com/office/excel/2003/xml" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">')
  fileDataWriter.write('<OfficeDocumentSettings xmlns="urn:schemas-microsoft-com:office:office">')
/*
  fileDataWriter.write('<Colors>')
  fileDataWriter.write('<Color><Index>3</Index><RGB>#000000</RGB></Color>')
  fileDataWriter.write('<Color><Index>4</Index><RGB>#0000ee</RGB></Color>')
  fileDataWriter.write('<Color><Index>5</Index><RGB>#006600</RGB></Color>')
  fileDataWriter.write('<Color><Index>6</Index><RGB>#333333</RGB></Color>')
  fileDataWriter.write('<Color><Index>7</Index><RGB>#808080</RGB></Color>')
  fileDataWriter.write('<Color><Index>8</Index><RGB>#996600</RGB></Color>')
  fileDataWriter.write('<Color><Index>9</Index><RGB>#c0c0c0</RGB></Color>')
  fileDataWriter.write('<Color><Index>10</Index><RGB>#cc0000</RGB></Color>')
  fileDataWriter.write('<Color><Index>11</Index><RGB>#ccffcc</RGB></Color>')
  fileDataWriter.write('<Color><Index>12</Index><RGB>#dddddd</RGB></Color>')
  fileDataWriter.write('<Color><Index>13</Index><RGB>#ffcccc</RGB></Color>')
  fileDataWriter.write('<Color><Index>14</Index><RGB>#ffffcc</RGB></Color>')
  fileDataWriter.write('<Color><Index>15</Index><RGB>#ffffff</RGB></Color>')
  fileDataWriter.write('</Colors>')
  */
  fileDataWriter.write('</OfficeDocumentSettings>')
  fileDataWriter.write('<ExcelWorkbook xmlns="urn:schemas-microsoft-com:office:excel">')
  fileDataWriter.write('<WindowHeight>9000</WindowHeight>')
  fileDataWriter.write('<WindowWidth>13860</WindowWidth>')
  fileDataWriter.write('<WindowTopX>240</WindowTopX>')
  fileDataWriter.write('<WindowTopY>75</WindowTopY>')
  fileDataWriter.write('<ProtectStructure>False</ProtectStructure>')
  fileDataWriter.write('<ProtectWindows>False</ProtectWindows>')
  fileDataWriter.write('</ExcelWorkbook>')
  fileDataWriter.write('<Styles>')
  fileDataWriter.write('<Style ss:ID="Default" ss:Name="Default"/>')
  fileDataWriter.write('<Style ss:ID="Heading" ss:Name="Heading"><Font ss:Bold="1" ss:Color="#000000" ss:Size="24"/></Style>')
  fileDataWriter.write('<Style ss:ID="Heading_20_1" ss:Name="Heading 1"><Font ss:Bold="1" ss:Color="#000000" ss:Size="18"/></Style>')
  fileDataWriter.write('<Style ss:ID="Heading_20_2" ss:Name="Heading 2"><Font ss:Bold="1" ss:Color="#000000" ss:Size="12"/></Style>')
  fileDataWriter.write('<Style ss:ID="Text" ss:Name="Text"/>')
  fileDataWriter.write('<Style ss:ID="Note" ss:Name="Note">')
  fileDataWriter.write('<Borders>')
  fileDataWriter.write('<Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#808080"/>')
  fileDataWriter.write('<Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#808080"/>')
  fileDataWriter.write('<Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#808080"/>')
  fileDataWriter.write('<Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#808080"/>')
  fileDataWriter.write('</Borders>')
  fileDataWriter.write('<Font ss:Color="#333333" ss:Size="10"/><Interior ss:Color="#ffffcc" ss:Pattern="Solid"/></Style>')
  fileDataWriter.write('<Style ss:ID="Footnote" ss:Name="Footnote"><Font ss:Color="#808080" ss:Italic="1" ss:Size="10"/></Style>')
  fileDataWriter.write('<Style ss:ID="Hyperlink" ss:Name="Hyperlink"><Font ss:Color="#0000ee" ss:Size="10" ss:Underline="Single"/></Style>')
  fileDataWriter.write('<Style ss:ID="Status" ss:Name="Status"/>')
  fileDataWriter.write('<Style ss:ID="Good" ss:Name="Good"><Font ss:Color="#006600" ss:Size="10"/><Interior ss:Color="#ccffcc" ss:Pattern="Solid"/></Style>')
  fileDataWriter.write('<Style ss:ID="Neutral" ss:Name="Neutral"><Font ss:Color="#996600" ss:Size="10"/><Interior ss:Color="#ffffcc" ss:Pattern="Solid"/></Style>')
  fileDataWriter.write('<Style ss:ID="Bad" ss:Name="Bad"><Font ss:Color="#cc0000" ss:Size="10"/><Interior ss:Color="#ffcccc" ss:Pattern="Solid"/></Style>')
  fileDataWriter.write('<Style ss:ID="Warning" ss:Name="Warning"><Font ss:Color="#cc0000" ss:Size="10"/></Style>')
  fileDataWriter.write('<Style ss:ID="Error" ss:Name="Error"><Font ss:Bold="1" ss:Color="#ffffff" ss:Size="10"/><Interior ss:Color="#cc0000" ss:Pattern="Solid"/></Style>')
  fileDataWriter.write('<Style ss:ID="Accent" ss:Name="Accent"><Font ss:Bold="1" ss:Color="#000000" ss:Size="10"/></Style>')
  fileDataWriter.write('<Style ss:ID="Accent_20_1" ss:Name="Accent 1"><Font ss:Bold="1" ss:Color="#ffffff" ss:Size="10"/></Style>')
  fileDataWriter.write('<Style ss:ID="Accent_20_2" ss:Name="Accent 2"><Font ss:Bold="1" ss:Color="#ffffff" ss:Size="10"/></Style>')
  fileDataWriter.write('<Style ss:ID="Accent_20_3" ss:Name="Accent 3"><Font ss:Bold="1" ss:Color="#000000" ss:Size="10"/></Style>')
  fileDataWriter.write('<Style ss:ID="Result" ss:Name="Result"><Font ss:Bold="1" ss:Color="#000000" ss:Italic="1" ss:Size="10" ss:Underline="Single"/></Style>')
  fileDataWriter.write('<Style ss:ID="co1"/><Style ss:ID="ta1"/>')
  fileDataWriter.write('<Style ss:ID="ce1"><Alignment ss:WrapText="1"/></Style>')
  fileDataWriter.write('</Styles>')
  fileDataWriter.write('<ss:Worksheet ss:Name="Sheet1">')
  fileDataWriter.write('<Table ss:StyleID="ta1">')
  fileDataWriter.write('<Column ss:Span="1"/>')
  
}




ExportQueryResults(webPageParams)

