2
===>>> What is WhiteFox:
  - A web sql query tool that is based on JSWEBSERVER(https://github.com/LaranIkal/jswebserver) 

===>>> WhiteFox install:

  1.- Download and install GraalVM Java JDK 25:

    1.1.- Go to https://www.graalvm.org/downloads/
    1.2.- Select your OS, Windows or Linux from the list.
    1.3.- Download the latest Java JDK 25 version in a ZIP file, normally if you click on the Download button, it will download the ZIP file.
    1.4.- Using the filemanager, navigate to the folder where you downloaded the ZIP file.
    1.5.- Right-click the ZIP file and select Extract All… (or use a tool like 7-Zip/WinRAR).
          You will have a folder similar to this folder name: graalvm-community-25.3.4.1+1.1
          To keep the path short, rename folder to:graalvmjdk25

    1.6.- Move the folder to a short location, like this: C:\Apps\graalvmjdk25

Set Environment Variables on Windows

    Press Win + R, type sysdm.cpl, and press Enter.
    Go to the Advanced tab and click Environment Variables.
    Under System variables, find Path and click Edit.
    Click New and add the path to the GraalVM bin directory.
        Example: C:\Apps\graalvmjdk25\bin
    Click OK on all windows to save.


  2.- Uncompress whitefoxsqltool directory to any directory of your choice.

  3.- Download the latest version of JDBC Drivers: Sample, Go to the download page and download the latest version of the driver. 
    At the time of this writing, the latest version for SQLite is:
    https://repo1.maven.org/maven2/org/xerial/sqlite-jdbc/3.34.0/sqlite-jdbc-3.34.0.jar

    * Store the sqlite jdbc jar into whitefoxsqltool/jarlib directory.

  Note. When you download a new JDBC driver, it is needed to restart jswebserver in order to WhiteFox be able to use it.

===>>> starting jswebserver:
  Windows:
    - Open the file manager, go to the whitefoxsqltool directory
    ***- Open jswebserver-start.vbs and search for javaHome = "C:\Apps\graalvmjdk25" and set the correct value according your system.
    - Start WhiteFoxSQLTool: Double click jswebserver-start.vbs
    ** Stop WhiteFoxSQLTool: Double click jswebserver-stop.vbs

  * To check computer resources used, open the task manager, go to Details and look for javaw.exe
  We have seen that javaw.exe plus the web browser, WhiteFoxSQLTool is using 370 MB RAM, vs Dbeaver 670 MB RAM, vs sqldeveloper 870 MB RAM   

  Linux:
    - Open the file manager, go to the whitefoxsqltool directory
    - Start WhiteFoxSQLTool: Right-Click on the file manager window and open terminal, the run: ./jswebserver.sh start
    ** Stop WhiteFoxSQLTool: in the whitefoxsqltool directory, Right-Click on the file manager window and open terminal, the run: ./jswebserver.sh stop

  
*** NEVER DELETE the .pid file from whitefoxsqltool directory, it ise used to stop jswebserver.


